/**
 * Cloudflare Pages Function: Contact form handler
 * Route: POST /api/contact
 *
 * Environment variables (set in Cloudflare Dashboard → Pages → Settings → Environment variables):
 * - CONTACT_EMAIL: destination email address
 * - RESEND_API_KEY: Resend API key (optional — without it, returns success but does not send)
 */

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return phone === '' || /^[\d\s\-+().]{7,}$/.test(phone);
}

async function sendEmail({ name, email, phone, message }, env) {
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL) {
    console.log('Email forwarding skipped: missing RESEND_API_KEY or CONTACT_EMAIL');
    return true;
  }

  const payload = {
    from: 'Dawn Eig Website <contact@dawneig.com>',
    to: env.CONTACT_EMAIL,
    subject: `New inquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : '',
      '',
      'Message:',
      message,
    ].join('\n'),
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }

  const { name, email, phone = '', message } = body;

  if (!name || name.trim().length < 2) {
    return jsonResponse({ success: false, error: 'Name is required' }, 400);
  }

  if (!email || !validateEmail(email)) {
    return jsonResponse({ success: false, error: 'Valid email is required' }, 400);
  }

  if (!validatePhone(phone)) {
    return jsonResponse({ success: false, error: 'Invalid phone number' }, 400);
  }

  if (!message || message.trim().length < 10) {
    return jsonResponse({ success: false, error: 'Message is required' }, 400);
  }

  const sent = await sendEmail(
    { name: name.trim(), email: email.trim(), phone: phone.trim(), message: message.trim() },
    env
  );

  if (!sent) {
    return jsonResponse({ success: false, error: 'Failed to send message. Please try again.' }, 502);
  }

  return jsonResponse({ success: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: HEADERS });
}
