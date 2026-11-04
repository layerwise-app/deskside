/** Contact form rules, shared by the form and the server. */

export type ContactField = 'name' | 'email' | 'message';
export type FieldErrors = Partial<Record<ContactField, string>>;
export type ContactMessage = { name: string; email: string; message: string };

export const LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 5000 };

/** At most 3 messages per 10 minutes and 10 per day from one address. */
export const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 3, dayMs: 24 * 60 * 60 * 1000, dayMax: 10 };

/** The hidden field people never see. Anything typed in it is a bot. */
export const HONEYPOT = 'website';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Validation =
  | { kind: 'ok'; value: ContactMessage }
  | { kind: 'invalid'; errors: FieldErrors }
  | { kind: 'spam' };

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function validateContact(raw: unknown): Validation {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  if (str(input[HONEYPOT]).trim() !== '') return { kind: 'spam' };

  const name = str(input.name).trim().replace(/\s+/g, ' ');
  const email = str(input.email).trim().toLowerCase();
  const message = str(input.message).trim().replace(/\r\n/g, '\n');
  const errors: FieldErrors = {};

  if (!name) errors.name = 'Tell me your name.';
  else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!email) errors.email = 'Add an email so I can reply.';
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = 'That email address doesn’t look right.';

  if (message.length < LIMITS.messageMin)
    errors.message = `Say a little more: at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.messageMax)
    errors.message = `Keep it under ${LIMITS.messageMax.toLocaleString('en-US')} characters.`;

  return Object.keys(errors).length ? { kind: 'invalid', errors } : { kind: 'ok', value: { name, email, message } };
}

/**
 * Given when earlier messages from the same address arrived, may another be
 * sent now? Returns how many seconds to wait when not.
 */
export function checkRate(previous: Date[], now = new Date()) {
  const t = now.getTime();
  const inWindow = previous.filter((d) => t - d.getTime() < RATE_LIMIT.windowMs).sort((a, b) => +a - +b);
  const inDay = previous.filter((d) => t - d.getTime() < RATE_LIMIT.dayMs).sort((a, b) => +a - +b);
  if (inWindow.length >= RATE_LIMIT.max) {
    const wait = RATE_LIMIT.windowMs - (t - inWindow[inWindow.length - RATE_LIMIT.max].getTime());
    return { allowed: false as const, retryAfter: Math.ceil(wait / 1000) };
  }
  if (inDay.length >= RATE_LIMIT.dayMax) {
    const wait = RATE_LIMIT.dayMs - (t - inDay[inDay.length - RATE_LIMIT.dayMax].getTime());
    return { allowed: false as const, retryAfter: Math.ceil(wait / 1000) };
  }
  return { allowed: true as const, retryAfter: 0 };
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The email the owner receives for each message. */
export function renderEmail(msg: ContactMessage, site: string) {
  const subject = `New message from ${msg.name} via ${site}`.slice(0, 200);
  const text = `${msg.name} <${msg.email}> wrote:\n\n${msg.message}\n\nReply to this email to answer them.`;
  const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#171716">
<p style="margin:0 0 4px;color:#5c5b57;font-size:12px;letter-spacing:.06em;text-transform:uppercase">New message from your site</p>
<p style="margin:0 0 16px"><strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt;</p>
<p style="margin:0 0 16px;white-space:pre-wrap">${escapeHtml(msg.message)}</p>
<p style="margin:0;color:#5c5b57;font-size:13px">Reply to this email to answer them.</p>
</div>`;
  return { subject, text, html };
}
