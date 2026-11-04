import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '~/db';
import { contactMessages } from '~/db/schema';
import { checkRate, RATE_LIMIT, renderEmail, validateContact, type FieldErrors } from '~/lib/contact';
import { portfolio } from '~/portfolio.config';

export type SendResult =
  | { ok: true }
  | { ok: false; errors: FieldErrors }
  | { ok: false; error: 'rate_limited'; retryAfter: number };

async function hashIp(ip: string) {
  const data = new TextEncoder().encode(`deskside-contact:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function clientIp() {
  return (
    getRequestHeader('cf-connecting-ip') ||
    getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP({ xForwardedFor: true }) ||
    'unknown'
  );
}

/**
 * Save a contact form message, and email it to `ownerEmail` when set. The
 * recipient always comes from the config, never from the browser.
 */
export const sendMessage = createServerFn({ method: 'POST' })
  .validator((data: unknown) => (data && typeof data === 'object' ? (data as Record<string, unknown>) : {}))
  .handler(async ({ data }): Promise<SendResult> => {
    const checked = validateContact(data);
    // Bots that fill the hidden field get the same answer as people.
    if (checked.kind === 'spam') return { ok: true };
    if (checked.kind === 'invalid') return { ok: false, errors: checked.errors };

    const ipHash = await hashIp(clientIp());
    const since = new Date(Date.now() - RATE_LIMIT.dayMs);
    const previous = await db
      .select({ createdAt: contactMessages.createdAt })
      .from(contactMessages)
      .where(and(eq(contactMessages.ipHash, ipHash), gt(contactMessages.createdAt, since)));
    const rate = checkRate(previous.map((p) => p.createdAt));
    if (!rate.allowed) return { ok: false, error: 'rate_limited', retryAfter: rate.retryAfter };

    const [saved] = await db
      .insert(contactMessages)
      .values({
        ...checked.value,
        ipHash,
        userAgent: getRequestHeader('user-agent')?.slice(0, 300) ?? null
      })
      .returning({ id: contactMessages.id });

    if (portfolio.ownerEmail) {
      const mail = renderEmail(checked.value, portfolio.name);
      const { error } = await env.EMAIL.send({
        to: portfolio.ownerEmail,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        replyTo: checked.value.email
      });
      if (error) {
        console.warn(`[contact] email for ${saved.id} not sent: ${error.code} ${error.message}`);
      } else {
        await db.update(contactMessages).set({ emailed: true }).where(eq(contactMessages.id, saved.id));
      }
    }

    return { ok: true };
  });
