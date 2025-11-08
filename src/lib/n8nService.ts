export interface N8NResponse {
  response: string;
  success: boolean;
  error?: string;
}

 // n8nService.ts
export async function sendQueryToN8N(userQuery: string) {
  const res = await fetch('/api/n8n/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery, ts: new Date().toISOString() }),
  });
  const text = await res.text();
  try { const j = JSON.parse(text); return { response: j.response ?? j.answer ?? j.result ?? text, success: res.ok }; }
  catch { return { response: text, success: res.ok }; }
}

