import path from 'node:path';

import z from 'zod';

import type { HonoContext } from '../../context';
import { getValueFromSetCookie, makeNewRequest } from '../../utils/request';
import { getLogger } from '../../context/logging';
import { BetterAuthException } from '../exceptions';
import { APIException, Unauthorized } from '../../exceptions';
import env from '../../env';
import { APP_API_BASE_PATH, ONE_DAY_IN_SECONDS } from '../../constants/common';
import { ROUTE_NAME, TOKEN_ROUTE_NAME } from '../constants';
import { decodeJwt, type JWTPayload } from 'jose';

const { BETTER_AUTH_URL, JWT_EXPIRY_DAYS, BETTER_AUTH_SESSION_UPDATE_AGE_DAYS } = env;
const TOKEN_URL = path.join(BETTER_AUTH_URL, APP_API_BASE_PATH, ROUTE_NAME, TOKEN_ROUTE_NAME);

const BetterAuthExceptionSchema = z.object({
  code: z.string(),
  message: z.string(),
});

const TokenResponseSchema = z.object({
  token: z.string().optional(),
});

export async function handleAuthRequest<Schema extends z.ZodType>(
  c: HonoContext,
  options: { responseSchema: Schema; requireSessionToken?: boolean },
): Promise<{ jsonResponse: z.infer<Schema>; sessionToken: string | null }> {
  const request = await makeNewRequest(c);
  const response = await c.get('auth').handler(request);
  const jsonResponse: unknown = await response.json();
  const exceptionResult = BetterAuthExceptionSchema.safeParse(jsonResponse);
  if (exceptionResult.success) {
    getLogger(c).error(`better-auth error -> ${exceptionResult.data.message}`, {
      error: JSON.stringify(exceptionResult.data),
    });

    throw new BetterAuthException(c, {
      code: exceptionResult.data.code,
      message: exceptionResult.data.message,
      headers: response.headers,
    });
  }

  const validatedResponse = options.responseSchema.parse(jsonResponse);
  const sessionToken = getValueFromSetCookie(response.headers, 'better-auth.session_token');

  const requireToken = options.requireSessionToken ?? true;
  if (!sessionToken && requireToken) {
    throw new APIException(c, 500, {
      message: 'Failed to retrieve session token from authentication response',
      code: 'MISSING_SESSION_TOKEN',
    });
  }

  return { jsonResponse: validatedResponse, sessionToken: sessionToken ?? null };
}

function createHeadersWithJwt(jwt: string | undefined): Headers {
  const headers = new Headers();
  headers.set('content-type', 'application/json');

  if (!jwt) return headers;

  let payload: JWTPayload | undefined;
  try {
    payload = decodeJwt(jwt);
  } catch {
    // Swallow
  }

  const expirySeconds = payload?.exp
    ? payload.exp - Math.floor(Date.now() / 1000)
    : ONE_DAY_IN_SECONDS * JWT_EXPIRY_DAYS;
  headers.set('set-auth-token', jwt);
  headers.set('set-auth-token-expiry', expirySeconds.toString());

  return headers;
}

export async function getHeadersWithJwtAfterAuth(c: HonoContext, sessionToken: string): Promise<Headers> {
  const tokenRequestHeaders = new Headers({ Authorization: `Bearer ${sessionToken}` });
  const tokenRequest = new Request(TOKEN_URL, { method: 'GET', headers: tokenRequestHeaders });
  const response = await c.get('auth').handler(tokenRequest);
  if (!response.ok) {
    getLogger(c).error('Failed to retrieve JWT from token endpoint');
    throw new Unauthorized(c);
  }

  const responseJson: unknown = await response.json();
  const responseData = TokenResponseSchema.parse(responseJson);
  const headers = createHeadersWithJwt(responseData.token);

  headers.set('set-session-token', sessionToken);
  const sessionUpdateAgeSeconds = ONE_DAY_IN_SECONDS * BETTER_AUTH_SESSION_UPDATE_AGE_DAYS;
  headers.set('set-session-update-age', sessionUpdateAgeSeconds.toString());

  return headers;
}

export async function parseTokenResponseAndCreateHeaders(
  response: Response,
  sessionToken: string | null = null,
): Promise<{ token: string; headers: Headers }> {
  const jsonResponse: unknown = await response.json();
  const responseData = TokenResponseSchema.parse(jsonResponse);
  if (!responseData.token) {
    throw new Error('Token not found in response');
  }

  const headers = createHeadersWithJwt(responseData.token);
  if (sessionToken) {
    headers.set('set-session-token', sessionToken);
    const sessionUpdateAgeSeconds = ONE_DAY_IN_SECONDS * BETTER_AUTH_SESSION_UPDATE_AGE_DAYS;
    headers.set('set-session-update-age', sessionUpdateAgeSeconds.toString());
  }

  return { token: responseData.token, headers };
}
