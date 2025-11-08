export interface N8NResponse {
  response: string;
  success: boolean;
  error?: string;
}

export async function sendQueryToN8N(userQuery: string): Promise<N8NResponse> {
  const N8N_URL = import.meta.env.VITE_N8N_URL; // e.g. http://localhost:5678/webhook-test/chat
  const N8N_KEY = import.meta.env.VITE_N8N_KEY; // optional

  if (!N8N_URL) {
    return {
      response: 'Chatbot service is not configured. Please contact the administrator.',
      success: false,
      error: 'Missing N8N URL configuration',
    };
  }

  try {
    const res = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_KEY ? { Authorization: `Bearer ${N8N_KEY}` } : {}),
      },
      body: JSON.stringify({
        query: userQuery,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      if (res.status === 404) throw new Error('N8N webhook endpoint not found');
      if (res.status === 401 || res.status === 403) throw new Error('Authentication failed');
      if (res.status >= 500) throw new Error('N8N service is temporarily unavailable');
      throw new Error(`N8N webhook error: ${res.status} ${res.statusText}`);
    }

    // Try JSON first, then fall back to text
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { /* not JSON */ }

    const normalized =
      (data && (data.response ?? data.answer ?? data.result)) ??
      (typeof data === 'string' ? data : text);

    if (typeof normalized === 'string' && normalized.length > 0) {
      return { response: normalized, success: true };
    }

    return {
      response: 'Received an unexpected response format. Please try again.',
      success: false,
      error: 'Invalid response format',
    };
  } catch (err: any) {
    // Browser fetch hides CORS details; map the common messages
    let msg = 'Unable to process your query. Please try again.';
    const s = String(err?.message ?? err);

    if (s.includes('Failed to fetch') || s.includes('NetworkError')) {
      msg =
        'Network error. Possible causes: wrong URL, CORS/mixed content, or n8n is unreachable.';
    } else {
      msg = s;
    }

    return { response: msg, success: false, error: s };
  }
}
