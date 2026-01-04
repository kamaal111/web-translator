export const TokenHeadersDescription = {
  'set-auth-token': { description: 'JWT token for API authentication' },
  'set-auth-token-expiry': { description: 'JWT expiry time in seconds (as a string representing digits)' },
  'set-session-token': { description: 'Session token for token refresh' },
  'set-session-update-age': {
    description: 'Session update age in seconds - session should be verified after this time',
  },
};
