export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, subject, html, type } = req.body;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer re_boT5aRnU_2qZPXBQgQ37V8bhopmhgKfS6`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DSP Connect <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data });
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
