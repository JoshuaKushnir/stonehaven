import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

interface QuoteFields {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  scope?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmail(q: QuoteFields) {
  const rows: [string, string | undefined][] = [
    ['Name', q.name],
    ['Email', q.email],
    ['Phone', q.phone],
    ['Project location', q.location],
    ['Project scope', q.scope],
    ['Budget range', q.budget],
    ['Timeline', q.timeline],
  ];
  const meta = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#7a7268;font:12px/1.4 system-ui;">${k}</td><td style="padding:4px 0;color:#1a1a17;font:14px/1.4 system-ui;">${escapeHtml(v as string)}</td></tr>`)
    .join('');

  return `
<!doctype html>
<html><body style="margin:0;background:#faf8f3;padding:32px;">
  <table style="max-width:560px;margin:auto;background:#fff;padding:32px;border:1px solid #e8e2d4;">
    <tr><td>
      <p style="margin:0 0 6px;font:11px/1 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#7a7268;">New quote request</p>
      <h1 style="margin:0;font:400 28px/1.1 'Fraunces',Georgia,serif;color:#1a1a17;">From ${escapeHtml(q.name)}</h1>
      <table style="margin-top:24px;width:100%;border-top:1px solid #e8e2d4;border-bottom:1px solid #e8e2d4;padding:16px 0;">${meta}</table>
      <h2 style="margin:28px 0 8px;font:400 18px/1.2 'Fraunces',Georgia,serif;color:#1a1a17;">Message</h2>
      <p style="margin:0;white-space:pre-wrap;color:#4a4740;font:14px/1.6 system-ui;">${escapeHtml(q.message)}</p>
    </td></tr>
  </table>
</body></html>`;
}

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');

  let fields: QuoteFields;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      fields = (await request.json()) as QuoteFields;
    } else {
      const fd = await request.formData();
      fields = {
        name: String(fd.get('name') ?? ''),
        email: String(fd.get('email') ?? ''),
        phone: fd.get('phone') ? String(fd.get('phone')) : undefined,
        location: fd.get('location') ? String(fd.get('location')) : undefined,
        scope: fd.get('scope') ? String(fd.get('scope')) : undefined,
        budget: fd.get('budget') ? String(fd.get('budget')) : undefined,
        timeline: fd.get('timeline') ? String(fd.get('timeline')) : undefined,
        message: String(fd.get('message') ?? ''),
      };
    }
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!fields.name || !fields.email || !fields.message) {
    const error = 'missing-required-fields';
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    return Response.redirect(new URL(`/contact?error=${error}`, request.url), 303);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid-email' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    return Response.redirect(new URL('/contact?error=invalid-email', request.url), 303);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.QUOTE_TO_EMAIL || 'studio@stonehaven.example';
  const from = import.meta.env.QUOTE_FROM_EMAIL || 'onboarding@resend.dev';

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: `Stonehaven Website <${from}>`,
        to,
        replyTo: fields.email,
        subject: `New quote request from ${fields.name}`,
        html: renderEmail(fields),
      });
    } catch (err) {
      console.error('[quote] resend error:', err);
      if (wantsJson) {
        return new Response(JSON.stringify({ ok: false, error: 'send-failed' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        });
      }
      return Response.redirect(new URL('/contact?error=send-failed', request.url), 303);
    }
  } else {
    console.log('[quote] RESEND_API_KEY not set — would have emailed:', fields);
  }

  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return Response.redirect(new URL('/contact?sent=1', request.url), 303);
};
