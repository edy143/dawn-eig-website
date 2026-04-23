/**
 * Cloudflare Pages Function: Contact form handler
 * Route: POST /api/contact
 *
 * Environment variables (Cloudflare Dashboard → Pages → Settings → Environment variables):
 *   CONTACT_EMAIL    = destination inbox (e.g. your personal email)
 *   RESEND_API_KEY   = Resend API key (get from https://resend.com/api-keys)
 *
 * To verify the sending domain in Resend:
 *   1. Add dawneiglp.com in Resend → Domains
 *   2. Copy DNS records into Cloudflare DNS
 *   3. Wait for verification, then replace onboarding@resend.dev below.
 */

const ALLOWED_ORIGINS = [
  'https://dawneiglp.com',
  'https://www.dawneiglp.com',
  'http://localhost:8788',
  'http://localhost:3000',
];

function getHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), { status, headers: getHeaders(origin) });
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
    from: 'Dawn Eig Website <contact@dawneiglp.com>',
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

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend API error:', res.status, err);
  }

  return res.ok;
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400, origin);
  }

  const { name, email, phone = '', message } = body;

  if (!name || name.trim().length < 2) {
    return jsonResponse({ success: false, error: 'Name is required' }, 400, origin);
  }

  if (!email || !validateEmail(email)) {
    return jsonResponse({ success: false, error: 'Valid email is required' }, 400, origin);
  }

  if (!validatePhone(phone)) {
    return jsonResponse({ success: false, error: 'Invalid phone number' }, 400, origin);
  }

  if (!message || message.trim().length < 10) {
    return jsonResponse({ success: false, error: 'Message is required' }, 400, origin);
  }

  const sent = await sendEmail(
    { name: name.trim(), email: email.trim(), phone: phone.trim(), message: message.trim() },
    env
  );

  if (!sent) {
    return jsonResponse({ success: false, error: 'Failed to send message. Please try again.' }, 502, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: getHeaders(origin) });
}
