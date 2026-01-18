import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyResult, type ResolvedKey } from 'jose';
import z from 'zod';
import { getCookie } from 'hono/cookie';

import type { HonoContext } from '../../context';
import { getLogger } from '../../context/logging';
import type { SessionResponse } from '../schemas/responses';
import env from '../../env';
import { getAuth } from '../../context/auth';
import { SessionNotFound } from '../exceptions';
import { toISO8601String } from '../../utils/dates';
import { JWKS_URL } from '../better-auth';
import { Unauthorized } from '../../exceptions';
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

export async function getUserSession(c: HonoContext): Promise<SessionResponse> {
  const jwtSessionResponse = await verifyJwt(c);
  if (jwtSessionResponse != null) return jwtSessionResponse;

  const cookie = getCookie(c, 'better-auth.session_token');
  if (!cookie) {
    throw new SessionNotFound(c);
  }

  return verifySession(c);
}

export async function getOptionalUserSession(c: HonoContext): Promise<SessionResponse | null> {
  try {
    return await getUserSession(c);
  } catch {
    return null;
  }
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
      id: sessionResponse.user.id,
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
      id: jwtPayload.sub,
      name: jwtPayload.name,
      email: jwtPayload.email,
      email_verified: jwtPayload.emailVerified,
      created_at: toISO8601String(new Date((payload.iat ?? 0) * 1000)),
      locale: getSessionLocale(c),
    },
  };
}

export function getSessionLocale(c: HonoContext): SupportedLocale {
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
