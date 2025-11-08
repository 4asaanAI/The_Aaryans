export interface N8NResponse {
  response: string;
  success: boolean;
  error?: string;
}

export async function sendQueryToN8N(userQuery: string): Promise<N8NResponse> {
  const N8N_URL = import.meta.env.VITE_N8N_URL;
  const N8N_KEY = import.meta.env.VITE_N8N_KEY;

  if (!N8N_URL) {
    console.error('N8N URL not configured');
    return {
      response: 'Chatbot service is not configured. Please contact the administrator.',
      success: false,
      error: 'Missing N8N URL configuration'
    };
  }

  try {
    const response = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_KEY && { 'Authorization': `Bearer ${N8N_KEY}` })
      },
      body: JSON.stringify({
        query: userQuery,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('N8N webhook error:', response.status, response.statusText);

      if (response.status === 404) {
        throw new Error('N8N webhook endpoint not found');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed');
      } else if (response.status >= 500) {
        throw new Error('N8N service is temporarily unavailable');
      }

      throw new Error(`N8N webhook error: ${response.status}`);
    }

    const data = await response.json();

    if (data.response) {
      return {
        response: data.response,
        success: true
      };
    } else if (data.answer) {
      return {
        response: data.answer,
        success: true
      };
    } else if (data.result) {
      return {
        response: data.result,
        success: true
      };
    } else if (typeof data === 'string') {
      return {
        response: data,
        success: true
      };
    }

    console.error('Unexpected N8N response format:', data);
    return {
      response: 'Received an unexpected response format. Please try again.',
      success: false,
      error: 'Invalid response format'
    };

  } catch (error) {
    console.error('Error querying N8N:', error);

    let errorMessage = 'Unable to process your query. Please try again.';

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      response: errorMessage,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
