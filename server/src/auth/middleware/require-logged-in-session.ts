import { createMiddleware } from 'hono/factory';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyResult, type ResolvedKey } from 'jose';
import z from 'zod';

import type { HonoContext, HonoVariables } from '../../context';
import type { SessionResponse } from '../schemas/responses';
import { getLogger } from '../../context/logging';
import env from '../../env';
import { JWKS_URL } from '../better-auth';
import { Unauthorized } from '../../exceptions';
import { toISO8601String } from '../../utils/dates';
import { SessionNotFound } from '../exceptions';
import { getSession } from '../../context/session';
import { getAuth } from '../../context/auth';
import { unsafeCast } from '../../utils/typing';

type SupportedLocales = typeof SUPPORTED_LOCALES;
type SupportedLocale = SupportedLocales[number];

const { BETTER_AUTH_URL } = env;
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const;
const JWKS = createRemoteJWKSet(JWKS_URL);

const BetterAuthJWTPayloadSchema = z
  .object({ sub: z.string(), email: z.email(), name: z.string(), emailVerified: z.boolean() })
  .loose();

function requireLoggedInSession() {
  return createMiddleware<{ Variables: HonoVariables }>(async (c, next) => {
    if (getSession(c) != null) {
      await next();
      return;
    }

    const sessionResponse = await getUserSession(c);

    c.set('session', sessionResponse);
    await next();
  });
}

async function getUserSession(c: HonoContext): Promise<SessionResponse> {
  const jwtSessionResponse = await verifyJwt(c);
  if (jwtSessionResponse != null) return jwtSessionResponse;

  return verifySession(c);
}

function getSessionLocale(c: HonoContext): SupportedLocale {
  const headers = c.req.header();
  const requestLanguage = headers['accept-language']?.split(';')[0]?.split('-')[0];
  if (requestLanguage == null) {
    return DEFAULT_LOCALE;
  }

  if (!unsafeCast<string>(SUPPORTED_LOCALES).includes(requestLanguage)) {
    return DEFAULT_LOCALE;
  }

  return unsafeCast<SupportedLocale>(requestLanguage);
}

async function verifySession(c: HonoContext): Promise<SessionResponse> {
  const sessionResponse = await getAuth(c).api.getSession({ headers: c.req.raw.headers });
  if (!sessionResponse) {
    throw new SessionNotFound(c);
  }

  const response: SessionResponse = {
    session: {
      expires_at: toISO8601String(sessionResponse.session.expiresAt),
      created_at: toISO8601String(sessionResponse.session.createdAt),
      updated_at: toISO8601String(sessionResponse.session.updatedAt),
    },
    user: {
      name: sessionResponse.user.name,
      email: sessionResponse.user.email,
      email_verified: sessionResponse.user.emailVerified,
      created_at: toISO8601String(sessionResponse.user.createdAt),
      locale: getSessionLocale(c),
    },
  };

  return response;
}

async function verifyJwt(c: HonoContext): Promise<SessionResponse | null> {
  const authHeader = c.req.header('Authorization');
  if (authHeader == null) return null;
  if (!authHeader.startsWith('Bearer ')) return null;

  getLogger(c).info(`[AUTH] JWT token found, verifying with JWKS...`);

  const token = authHeader.slice(7);
  let verificationResult: JWTVerifyResult<JWTPayload> & ResolvedKey;
  try {
    verificationResult = await jwtVerify(token, JWKS, {
      issuer: BETTER_AUTH_URL,
      audience: BETTER_AUTH_URL,
    });
  } catch (error) {
    getLogger(c).error('[AUTH] ❌ JWT verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }

  const payload = verificationResult.payload;
  const zResult = BetterAuthJWTPayloadSchema.safeParse(payload);
  if (!zResult.success) {
    getLogger(c).error('[AUTH] ❌ JWT payload validation failed', { error: zResult.error.message });
    throw new Unauthorized(c, { message: 'Invalid JWT payload' });
  }

  const jwtPayload = zResult.data;

  return {
    session: {
      expires_at: toISO8601String(new Date((payload.exp ?? 0) * 1000)),
      created_at: toISO8601String(new Date((payload.iat ?? 0) * 1000)),
      updated_at: toISO8601String(new Date()),
    },
    user: {
      name: jwtPayload.name,
      email: jwtPayload.email,
      email_verified: jwtPayload.emailVerified,
      created_at: toISO8601String(new Date((payload.iat ?? 0) * 1000)),
      locale: getSessionLocale(c),
    },
  };
}

export default requireLoggedInSession;
