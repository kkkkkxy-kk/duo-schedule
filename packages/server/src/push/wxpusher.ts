const WXPUSHER_API = 'https://wxpusher.zjiecode.com/api/send/message';

export async function sendWxMessage(uids: string[], content: string, summary: string): Promise<void> {
  const token = process.env.WXPUSHER_APP_TOKEN;
  if (!token || uids.length === 0) {
    console.log('[WxPusher skip]', summary, '->', uids.join(',') || '(no uids)');
    return;
  }

  const res = await fetch(WXPUSHER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appToken: token,
      content,
      summary,
      contentType: 1,
      uids,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[WxPusher error]', res.status, text);
  }
}
