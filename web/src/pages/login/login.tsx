import { useState } from 'react';

import apiClient from '@/api/client';
import type { SessionResponse } from '@/generated/api-client/src/models/SessionResponse';

function Login() {
  const [sessionData, setSessionData] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await apiClient.auth.getSession();
      setSessionData(session);
      console.log('Session data:', session);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session';
      setError(errorMessage);
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hello login</h1>

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleGetSession}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? 'Loading...' : 'Test Session Endpoint'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {sessionData && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#efe', borderRadius: '4px' }}>
          <strong>Session Data:</strong>
          <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>{JSON.stringify(sessionData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Login;
