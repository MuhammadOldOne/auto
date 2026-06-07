export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, car } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing TG_BOT_TOKEN or TG_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const lines = [
    '📋 <b>НОВАЯ ЗАЯВКА С САЙТА veliauto.ru</b>',
    '',
    `👤 Имя: ${name}`,
    `📞 Телефон: ${phone}`,
  ];
  if (car) lines.push(`🚗 Авто: ${car}`);

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML' }),
  });

  if (!tgRes.ok) {
    const err = await tgRes.text();
    console.error('Telegram API error:', err);
    return res.status(502).json({ error: 'Telegram error' });
  }

  return res.status(200).json({ ok: true });
}
