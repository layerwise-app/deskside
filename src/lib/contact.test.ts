import { describe, expect, it } from 'vitest';
import { checkRate, HONEYPOT, LIMITS, RATE_LIMIT, renderEmail, validateContact } from './contact';

const good = { name: '  Priya   Natarajan ', email: ' Priya@Harborline.example ', message: 'We need a second look at our ferry checkout.' };

describe('validateContact', () => {
  it('accepts a real message and tidies it', () => {
    const result = validateContact(good);
    expect(result).toEqual({
      kind: 'ok',
      value: { name: 'Priya Natarajan', email: 'priya@harborline.example', message: good.message }
    });
  });

  it('names every missing field', () => {
    const result = validateContact({});
    expect(result.kind).toBe('invalid');
    if (result.kind === 'invalid') expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name']);
  });

  it('rejects a bad email, a short message, and a long one', () => {
    expect(validateContact({ ...good, email: 'priya@harborline' })).toMatchObject({ kind: 'invalid', errors: { email: expect.any(String) } });
    expect(validateContact({ ...good, message: 'hi there' })).toMatchObject({ kind: 'invalid', errors: { message: expect.any(String) } });
    expect(validateContact({ ...good, message: 'x'.repeat(LIMITS.messageMax + 1) })).toMatchObject({ kind: 'invalid' });
  });

  it('treats anything in the hidden field as spam', () => {
    expect(validateContact({ ...good, [HONEYPOT]: 'https://spam.example' })).toEqual({ kind: 'spam' });
    expect(validateContact({ ...good, [HONEYPOT]: '   ' }).kind).toBe('ok');
  });

  it('ignores values that are not strings', () => {
    expect(validateContact({ name: ['a'], email: 42, message: { x: 1 } }).kind).toBe('invalid');
    expect(validateContact(null).kind).toBe('invalid');
  });
});

describe('checkRate', () => {
  const now = new Date('2026-11-04T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const min = 60 * 1000;

  it(`allows ${RATE_LIMIT.max} messages in ten minutes, then asks to wait`, () => {
    expect(checkRate([ago(1 * min), ago(2 * min)], now).allowed).toBe(true);
    const blocked = checkRate([ago(1 * min), ago(2 * min), ago(4 * min)], now);
    expect(blocked.allowed).toBe(false);
    // The oldest of the three leaves the window in six minutes.
    expect(blocked.retryAfter).toBe(6 * 60);
  });

  it('forgets messages older than the window', () => {
    expect(checkRate([ago(11 * min), ago(12 * min), ago(13 * min)], now).allowed).toBe(true);
  });

  it(`caps a day at ${RATE_LIMIT.dayMax}`, () => {
    const day = Array.from({ length: RATE_LIMIT.dayMax }, (_, i) => ago((i + 1) * 60 * min));
    const result = checkRate(day, now);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});

describe('renderEmail', () => {
  it('escapes what the visitor typed in the HTML part', () => {
    const mail = renderEmail({ name: '<b>Eve</b>', email: 'eve@example.com', message: '<script>alert(1)</script>' }, 'Sam Ibarra');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&#60;script&#62;');
    expect(mail.text).toContain('<script>alert(1)</script>');
    expect(mail.subject).toBe('New message from <b>Eve</b> via Sam Ibarra');
  });
});
