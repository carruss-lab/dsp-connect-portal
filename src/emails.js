// DSP Connect email sender — calls /api/send-email Vercel function

const BASE_URL = process.env.REACT_APP_URL || 'https://dsp-connect-portal.vercel.app';

const wrap = (body) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<style>
  body{margin:0;padding:0;background:#F5F6F8;font-family:Inter,-apple-system,sans-serif;font-size:14px;color:#0D0F1A;}
  .wrap{max-width:580px;margin:32px auto;background:#fff;border:0.5px solid #E2E4EA;border-radius:10px;overflow:hidden;}
  .header{padding:28px 32px 20px;border-bottom:0.5px solid #E2E4EA;}
  .logo{display:flex;align-items:center;gap:10px;margin-bottom:0;}
  .logo-mark{width:28px;height:28px;background:#1A14D4;border-radius:6px;display:flex;align-items:center;justify-content:center;}
  .logo-text{font-size:12px;font-weight:600;color:#0D0F1A;letter-spacing:0.6px;text-transform:uppercase;}
  .body{padding:28px 32px;}
  h2{font-size:18px;font-weight:500;color:#0D0F1A;margin:0 0 8px;}
  p{color:#4A4E68;line-height:1.6;margin:0 0 16px;}
  .table{width:100%;border-collapse:collapse;margin:16px 0;}
  .table td{padding:9px 12px;border-bottom:0.5px solid #ECEEF2;font-size:13px;}
  .table td:first-child{color:#8A8EA8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;width:140px;}
  .table td:last-child{color:#0D0F1A;font-weight:500;font-family:'IBM Plex Mono',monospace;}
  .btn{display:inline-block;padding:10px 22px;background:#1A14D4;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500;margin:8px 0 0;}
  .cred-box{background:#F5F6F8;border-left:3px solid #1A14D4;border-radius:0 6px 6px 0;padding:14px 16px;margin:16px 0;}
  .cred-box p{margin:4px 0;color:#4A4E68;font-size:13px;}
  .cred-box strong{color:#1A14D4;font-family:'IBM Plex Mono',monospace;}
  .footer{padding:18px 32px;border-top:0.5px solid #E2E4EA;font-size:11px;color:#8A8EA8;}
  .green{color:#0F7A52;} .amber{color:#9A5F0A;} .mono{font-family:'IBM Plex Mono',monospace;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">
      <div style="font-size:14px;font-weight:600;color:#0D0F1A;letter-spacing:0.5px;">DSP Connect</div>
    </div>
  </div>
  <div class="body">${body}</div>
  <div class="footer">DSP Connect · Managing Partner Portal · getdspconnect.com<br/>This is an automated message. Do not reply directly to this email.</div>
</div>
</body>
</html>`;

async function send(to, subject, html) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) {
    console.error('Email send failed:', e);
  }
}

// 1. Welcome email — when partner account is created
export async function sendWelcomeEmail(partner) {
  const html = wrap(`
    <h2>Welcome to DSP Connect</h2>
    <p>Your Managing Partner account has been created. You can now access the DSP Connect Partner Portal to track your clients, compensation, and equity.</p>
    <div class="cred-box">
      <p>Portal URL: <strong>${BASE_URL}</strong></p>
      <p>Email: <strong>${partner.email}</strong></p>
      <p>Password: <strong>${partner.password}</strong></p>
    </div>
    <p>Your first step after logging in is to complete onboarding — reading and signing off on your compensation policy, equity vesting policy, and operating rules.</p>
    <table class="table">
      <tr><td>Your vertical</td><td>${partner.vertical}</td></tr>
      <tr><td>Start date</td><td>${partner.start_date}</td></tr>
      <tr><td>Non-compete</td><td>${partner.non_compete_days || 90} days</td></tr>
      <tr><td>Base equity</td><td>5.00% (upon qualifying)</td></tr>
      <tr><td>Revenue share</td><td>10% of Qualified AUM</td></tr>
    </table>
    <a href="${BASE_URL}" class="btn">Access your portal →</a>
    <p style="margin-top:16px;font-size:12px;color:#8A8EA8;">Keep your credentials secure. Contact your DSP Connect administrator if you have any issues logging in.</p>
  `);
  await send(partner.email, 'Welcome to DSP Connect — Your portal is ready', html);
}

// 2. Onboarding complete — when partner finishes signing
export async function sendOnboardingCompleteEmail(partner) {
  const html = wrap(`
    <h2>Onboarding complete</h2>
    <p>You have successfully executed your Managing Partner agreements with DSP Connect. Your account is now fully active.</p>
    <table class="table">
      <tr><td>Legal name</td><td>${partner.legal_name || partner.name}</td></tr>
      <tr><td>Executed on</td><td>${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</td></tr>
      <tr><td>Documents signed</td><td>Exhibit A, Exhibit B, Operating Rules</td></tr>
      <tr><td>Revenue share</td><td>10% of Qualified AUM</td></tr>
      <tr><td>Base equity grant</td><td>5.00% (upon $5M AUM)</td></tr>
      <tr><td>Max equity Year 1</td><td>15.00%</td></tr>
    </table>
    <p class="amber">⚠ Your 90-day equity acceleration window begins today. Missing any window permanently forfeits that equity. Log in to your portal to track your progress.</p>
    <a href="${BASE_URL}" class="btn">View your dashboard →</a>
  `);
  await send(partner.email, 'DSP Connect — Onboarding complete, your account is active', html);
}

// 3. Client approved — when admin approves a client submission
export async function sendClientApprovedEmail(partner, client) {
  const html = wrap(`
    <h2>Client approved</h2>
    <p>Your client submission has been reviewed and approved by DSP Connect. The campaign can now move forward.</p>
    <table class="table">
      <tr><td>Client</td><td>${client.name}</td></tr>
      <tr><td>Type</td><td>${client.type === 'brand' ? 'Brand client' : 'Agency client'}</td></tr>
      <tr><td>Monthly spend</td><td>$${Math.round(client.monthly_spend || 0).toLocaleString()}</td></tr>
      <tr><td>Your comp (10%)</td><td class="green">$${Math.round((client.monthly_spend || 0) * 0.1).toLocaleString()}/mo</td></tr>
      <tr><td>Status</td><td class="green">Approved — Active</td></tr>
    </table>
    <p>This client's spend is now included in your monthly compensation calculation. Log in to your portal to view your updated compensation summary.</p>
    <a href="${BASE_URL}" class="btn">View compensation →</a>
  `);
  await send(partner.email, `DSP Connect — Client approved: ${client.name}`, html);
}

// 4. Payout recorded — when admin logs a payment
export async function sendPayoutEmail(partner, payout) {
  const html = wrap(`
    <h2>Payout recorded</h2>
    <p>A payment has been recorded on your DSP Connect partner account.</p>
    <table class="table">
      <tr><td>Amount</td><td class="green">$${Math.round(payout.amount || 0).toLocaleString()}</td></tr>
      <tr><td>Period</td><td>${payout.period_label || '—'}</td></tr>
      ${payout.period_start ? `<tr><td>Period start</td><td>${payout.period_start}</td></tr>` : ''}
      ${payout.period_end ? `<tr><td>Period end</td><td>${payout.period_end}</td></tr>` : ''}
      <tr><td>Reference</td><td>${payout.reference || '—'}</td></tr>
      ${payout.notes ? `<tr><td>Notes</td><td>${payout.notes}</td></tr>` : ''}
      <tr><td>Recorded on</td><td>${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</td></tr>
    </table>
    <p>Your full payout history is available in your portal under Compensation.</p>
    <a href="${BASE_URL}" class="btn">View payout history →</a>
  `);
  await send(partner.email, `DSP Connect — Payout recorded: $${Math.round(payout.amount || 0).toLocaleString()}`, html);
}

// 5. Ticket reply — when admin responds to a support ticket
export async function sendTicketReplyEmail(partner, ticket, reply) {
  const html = wrap(`
    <h2>Your support ticket has been updated</h2>
    <table class="table">
      <tr><td>Ticket</td><td>${ticket.subject}</td></tr>
      <tr><td>Type</td><td>${ticket.type}</td></tr>
      <tr><td>Status</td><td>Closed</td></tr>
    </table>
    <p style="font-weight:500;color:#0D0F1A;margin-bottom:8px;">Response from DSP Connect:</p>
    <div style="background:#F5F6F8;border-left:3px solid #0F7A52;border-radius:0 6px 6px 0;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#0D0F1A;">${reply}</p>
    </div>
    <p>If you have further questions, submit a new ticket from your portal.</p>
    <a href="${BASE_URL}" class="btn">Go to help desk →</a>
  `);
  await send(partner.email, `DSP Connect — Support ticket update: ${ticket.subject}`, html);
}
