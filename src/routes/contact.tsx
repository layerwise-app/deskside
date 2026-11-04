import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState, type FormEvent } from 'react';
import { Clock } from '~/components/site/Clock';
import { randomFortune } from '~/components/site/Fortune';
import { PageShell } from '~/components/site/PageShell';
import { SocialLinks } from '~/components/site/Social';
import { HONEYPOT, LIMITS, validateContact, type ContactField, type FieldErrors } from '~/lib/contact';
import { sendMessage } from '~/lib/contact.functions';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/contact')({
  loader: () => ({ fortune: randomFortune() }),
  head: () =>
    seo({
      title: `Contact — ${portfolio.name}`,
      description: `Send ${portfolio.name} a note about a product, a project, or a role. Replies within two working days.`,
      path: '/contact'
    }),
  component: ContactPage
});

type Status = { state: 'idle' | 'sending' } | { state: 'sent'; name: string } | { state: 'error'; message: string };

function ContactPage() {
  const { fortune } = Route.useLoaderData();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.state === 'sending') return;
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const local = validateContact(data);
    if (local.kind === 'invalid') {
      setErrors(local.errors);
      focusFirst(local.errors);
      return;
    }
    setErrors({});
    setStatus({ state: 'sending' });
    try {
      const result = await sendMessage({ data });
      if (result.ok) {
        setStatus({ state: 'sent', name: data.name.trim().split(' ')[0] });
        requestAnimationFrame(() => doneRef.current?.focus());
      } else if ('errors' in result) {
        setErrors(result.errors);
        setStatus({ state: 'idle' });
        focusFirst(result.errors);
      } else {
        const minutes = Math.max(1, Math.ceil(result.retryAfter / 60));
        setStatus({
          state: 'error',
          message: `That’s a lot of messages in a short time. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
        });
      }
    } catch {
      setStatus({ state: 'error', message: 'The message didn’t go through. Check your connection and try again.' });
    }
  }

  function focusFirst(errs: FieldErrors) {
    const first = (['name', 'email', 'message'] as ContactField[]).find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  return (
    <PageShell fortune={fortune}>
      <header className='grid-page mt-16 md:mt-24'>
        <p className='label col-span-3 mt-3 text-muted'>Contact</p>
        <h1 className='col-span-9 col-start-4 max-w-[18ch] text-[clamp(38px,5.2vw,76px)] leading-[0.98] font-medium tracking-[-0.045em] text-balance max-md:mt-4'>
          Tell me about the thing you’re making.
        </h1>
      </header>

      <div className='grid-page mt-14 md:mt-20'>
        <aside className='label col-span-3 flex flex-col gap-6 max-md:order-2 max-md:mt-16' aria-label='Other ways to reach me'>
          <div>
            <p className='text-muted'>Elsewhere</p>
            <SocialLinks variant='full' className='mt-1 flex flex-col gap-1' />
          </div>
          <div>
            <p className='text-muted'>Right now in {portfolio.location.city.split(',')[0]}</p>
            <Clock className='mt-1 block' />
          </div>
          <div>
            <p className='text-muted'>Replies</p>
            <p className='mt-1'>Within two working days</p>
          </div>
        </aside>

        <div className='col-span-6 col-start-4'>
          {status.state === 'sent' ? (
            <div className='border-t border-ink pt-6' role='status'>
              <h2 ref={doneRef} tabIndex={-1} className='text-[28px] leading-tight font-medium tracking-[-0.025em] outline-none'>
                Thanks, {status.name}. Your note is in.
              </h2>
              <p className='mt-3 max-w-[48ch] text-[17px] leading-relaxed text-muted'>
                I read every message myself and reply within two working days, usually sooner.
              </p>
              <button
                type='button'
                className='label mt-8 underline underline-offset-4'
                onClick={() => setStatus({ state: 'idle' })}
              >
                Send another
              </button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className='flex flex-col gap-7' aria-describedby='form-status'>
              <Field label='Name' name='name' autoComplete='name' error={errors.name} maxLength={LIMITS.name} />
              <Field label='Email' name='email' type='email' autoComplete='email' error={errors.email} maxLength={LIMITS.email} />
              <Field
                label='Message'
                name='message'
                multiline
                error={errors.message}
                maxLength={LIMITS.messageMax}
                hint='What it is, where it’s at, and when you’d like to start.'
              />
              {/* People never see this field; bots fill it in. */}
              <div aria-hidden className='absolute -left-[9999px] h-px w-px overflow-hidden'>
                <label>
                  Website
                  <input type='text' name={HONEYPOT} tabIndex={-1} autoComplete='off' defaultValue='' />
                </label>
              </div>
              <div className='flex flex-wrap items-center gap-5'>
                <button
                  type='submit'
                  disabled={status.state === 'sending'}
                  className='label rounded-[3px] bg-ink px-5 py-3.5 text-paper transition-colors hover:bg-ink/85 disabled:opacity-60'
                >
                  {status.state === 'sending' ? 'Sending…' : 'Send message'}
                </button>
                <p id='form-status' className='text-[15px] text-[#9f2a16]' role='alert'>
                  {status.state === 'error' ? status.message : ''}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = 'text',
  multiline,
  error,
  hint,
  autoComplete,
  maxLength
}: {
  label: string;
  name: ContactField;
  type?: string;
  multiline?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = `contact-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const cls = `w-full rounded-[3px] border bg-[#f7f7f5] px-3.5 py-3 text-[17px] leading-snug text-ink transition-colors placeholder:text-muted focus-visible:outline-offset-2 ${
    error ? 'border-[#b42318]' : 'border-line hover:border-[#a9a9a3]'
  }`;
  return (
    <div>
      <label htmlFor={id} className='label mb-2 block text-ink'>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className='-mt-1 mb-2 text-[14px] text-muted'>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea id={id} name={name} rows={7} maxLength={maxLength} aria-invalid={!!error} aria-describedby={describedBy} className={`${cls} min-h-[180px] resize-y`} />
      ) : (
        <input id={id} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength} aria-invalid={!!error} aria-describedby={describedBy} className={cls} />
      )}
      {error && (
        <p id={`${id}-error`} className='mt-2 text-[14px] text-[#9f2a16]'>
          {error}
        </p>
      )}
    </div>
  );
}
