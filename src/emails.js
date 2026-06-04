// DSP Connect emails — calls Resend API directly from client
// getdspconnect.com is verified in Resend

const RESEND_KEY = 're_boT5aRnU_2qZPXBQgQ37V8bhopmhgKfS6';
const FROM = 'DSP Connect <noreply@getdspconnect.com>';
const PORTAL = 'https://dsp-connect-portal.vercel.app';

const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{margin:0;padding:0;background:#F5F6F8;font-family:Inter,-apple-system,sans-serif;font-size:14px;color:#0D0F1A;}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:0.5px solid #E2E4EA;border-radius:10px;overflow:hidden;}
.hdr{padding:22px 28px;border-bottom:0.5px solid #E2E4EA;font-size:12px;font-weight:600;color:#0D0F1A;letter-spacing:0.5px;text-transform:uppercase;}
.body{padding:28px 28px;}
h2{font-size:17px;font-weight:500;margin:0 0 10px;}
p{color:#4A4E68;line-height:1.65;margin:0 0 14px;font-size:13px;}
table{width:100%;border-collapse:collapse;margin:14px 0;}
td{padding:8px 10px;border-bottom:0.5px solid #ECEEF2;font-size:12px;vertical-align:top;}
td:first-child{color:#8A8EA8;text-transform:uppercase;letter-spacing:0.4px;font-size:10px;width:130px;padding-top:10px;}
td:last-child{color:#0D0F1A;font-weight:500;font-family:monospace;}
.btn{display:inline-block;padding:9px 20px;background:#1A14D4;color:#fff;text-decoration:none;border-radius:5px;font-size:12px;font-weight:500;margin:6px 0;}
.cred{background:#F5F6F8;border-left:3px solid #1A14D4;padding:12px 14px;margin:14px 0;border-radius:0 5px 5px 0;}
.cred p{margin:3px 0;font-size:12px;}
.note{background:#FFF8EC;border-left:3px solid #9A5F0A;padding:10px 14px;margin:14px 0;border-radius:0 5px 5px 0;font-size:12px;color:#9A5F0A;}
.ok{background:#F0FBF6;border-left:3px solid #0F7A52;padding:10px 14px;margin:14px 0;border-radius:0 5px 5px 0;font-size:12px;color:#0F7A52;}
.ftr{padding:16px 28px;border-top:0.5px solid #E2E4EA;font-size:10px;color:#8A8EA8;}
</style></head><body>
<div class="wrap">
<div class="hdr">DSP Connect · Managing Partner Portal</div>
<div class="body">${body}</div>
<div class="ftr">DSP Connect · getdspconnect.com · This is an automated message.</div>
</div></body></html>`;

async function send(to, subject, html) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) console.error('Resend error:', await res.text());
  } catch (e) { console.error('Email failed:', e); }
}

export async function sendWelcomeEmail(partner) {
  await send(partner.email, 'Welcome to DSP Connect — Your portal is ready', wrap(`
    <h2>Welcome to DSP Connect</h2>
    <p>Your Managing Partner account has been created. Log in to complete onboarding and access your dashboard.</p>
    <div class="cred">
      <p>Portal: <strong><a href="${PORTAL}" style="color:#1A14D4">${PORTAL}</a></strong></p>
      <p>Email: <strong>${partner.email}</strong></p>
      <p>Password: <strong>${partner.password}</strong></p>
    </div>
    <table>
      <tr><td>Vertical</td><td>${partner.vertical}</td></tr>
      <tr><td>Start date</td><td>${partner.start_date}</td></tr>
      <tr><td>Revenue share</td><td>10% of Qualified AUM</td></tr>
      <tr><td>Base equity</td><td>5.00% (upon $5M AUM)</td></tr>
      <tr><td>Non-compete</td><td>${partner.non_compete_days || 90} days</td></tr>
    </table>
    <a href="${PORTAL}" class="btn">Access your portal →</a>
  `));
}

export async function sendOnboardingCompleteEmail(partner) {
  await send(partner.email, 'DSP Connect — Onboarding complete, account active', wrap(`
    <h2>Onboarding complete</h2>
    <p>You have successfully executed your Managing Partner agreements. Your account is now fully active.</p>
    <div class="ok">✓ Exhibit A, Exhibit B, and Operating Rules acknowledged and executed.</div>
    <table>
      <tr><td>Legal name</td><td>${partner.legal_name || partner.name}</td></tr>
      <tr><td>Executed</td><td>${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</td></tr>
      <tr><td>Revenue share</td><td>10% of Qualified AUM</td></tr>
      <tr><td>Base equity</td><td>5.00% (upon $5M AUM)</td></tr>
      <tr><td>Max equity Yr 1</td><td>15.00%</td></tr>
    </table>
    <div class="note">⚠ Your 90-day equity acceleration window begins today. Missed windows are permanently forfeited.</div>
    <a href="${PORTAL}" class="btn">View your dashboard →</a>
  `));
}

export async function sendClientApprovedEmail(partner, client) {
  await send(partner.email, `DSP Connect — Client approved: ${client.name}`, wrap(`
    <h2>Client approved</h2>
    <p>Your client submission has been reviewed and approved by DSP Connect.</p>
    <div class="ok">✓ ${client.name} is now Active.</div>
    <table>
      <tr><td>Client</td><td>${client.name}</td></tr>
      <tr><td>Type</td><td>${client.type === 'brand' ? 'Brand client' : 'Agency client'}</td></tr>
      <tr><td>Monthly spend</td><td>$${Math.round(client.monthly_spend||0).toLocaleString()}</td></tr>
      <tr><td>Your comp (10%)</td><td>$${Math.round((client.monthly_spend||0)*0.1).toLocaleString()}/mo</td></tr>
    </table>
    <a href="${PORTAL}" class="btn">View compensation →</a>
  `));
}

export async function sendPayoutEmail(partner, payout) {
  await send(partner.email, `DSP Connect — Payout recorded: $${Math.round(payout.amount||0).toLocaleString()}`, wrap(`
    <h2>Payout recorded</h2>
    <p>A payment has been recorded on your DSP Connect account.</p>
    <table>
      <tr><td>Amount</td><td>$${Math.round(payout.amount||0).toLocaleString()}</td></tr>
      <tr><td>Period</td><td>${payout.period_label||'—'}</td></tr>
      ${payout.period_start?`<tr><td>Period start</td><td>${payout.period_start}</td></tr>`:''}
      ${payout.period_end?`<tr><td>Period end</td><td>${payout.period_end}</td></tr>`:''}
      <tr><td>Reference</td><td>${payout.reference||'—'}</td></tr>
      ${payout.notes?`<tr><td>Notes</td><td>${payout.notes}</td></tr>`:''}
    </table>
    <a href="${PORTAL}" class="btn">View payout history →</a>
  `));
}

export async function sendTicketReplyEmail(partner, ticket, reply) {
  await send(partner.email, `DSP Connect — Support ticket update: ${ticket.subject}`, wrap(`
    <h2>Your support ticket has been updated</h2>
    <table>
      <tr><td>Subject</td><td>${ticket.subject}</td></tr>
      <tr><td>Type</td><td>${ticket.type}</td></tr>
      <tr><td>Status</td><td>Closed</td></tr>
    </table>
    <p style="font-weight:500;color:#0D0F1A;margin-bottom:6px;">Response from DSP Connect:</p>
    <div class="ok">${reply}</div>
    <a href="${PORTAL}" class="btn">Go to help desk →</a>
  `));
}
