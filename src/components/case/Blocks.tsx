import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Block, CaseStudy, Figure } from '~/content/types';
import { Picture } from '~/components/site/Picture';

function Caption({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <figcaption className='label mt-3 max-w-[64ch] text-muted normal-case tracking-normal text-[13px] leading-snug font-sans'>{children}</figcaption>;
}

function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mt-24 md:mt-32 ${className}`}>{children}</section>;
}

function TextBlock({ heading, body }: { heading?: string; body: string[] }) {
  return (
    <Section className='grid-page'>
      {heading && <h2 className='label col-span-3 mb-4 text-muted'>{heading}</h2>}
      <div className={`prose-case col-span-6 text-[17px] leading-[1.65] ${heading ? 'col-start-4' : 'col-start-4'}`}>
        {body.map((p, i) => (
          <p key={i} className='max-w-[62ch]'>
            {p}
          </p>
        ))}
      </div>
    </Section>
  );
}

function ImageBlock({ image, alt, caption, bleed }: Figure & { caption?: string; bleed?: boolean }) {
  return (
    <Section className={bleed ? '' : 'px-[var(--gutter)]'}>
      <figure className={bleed ? '' : 'mx-auto max-w-[1400px]'}>
        <Picture image={image} alt={alt} sizes={bleed ? '100vw' : '(min-width: 1448px) 1400px, calc(100vw - 48px)'} className={bleed ? '' : 'rounded-[3px]'} />
        <div className={bleed ? 'px-[var(--gutter)]' : ''}>
          <Caption>{caption}</Caption>
        </div>
      </figure>
    </Section>
  );
}

function PairBlock({ images, caption }: { images: [Figure, Figure]; caption?: string }) {
  return (
    <Section className='px-[var(--gutter)]'>
      <figure className='mx-auto max-w-[1400px]'>
        <div className='grid gap-4 md:grid-cols-2 md:gap-6'>
          {images.map((f, i) => (
            <Picture key={i} image={f.image} alt={f.alt} sizes='(min-width: 768px) 50vw, 100vw' className='rounded-[3px]' />
          ))}
        </div>
        <Caption>{caption}</Caption>
      </figure>
    </Section>
  );
}

function useInView<T extends Element>(margin = '0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

function VideoBlock({ src, poster, alt, caption }: Extract<Block, { type: 'video' }>) {
  const [ref, inView] = useInView<HTMLVideoElement>('200px');
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) setPaused(true);
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView && !paused) v.play().catch(() => setPaused(true));
    else v.pause();
  }, [inView, paused, ref]);
  const posterSrc = (poster.sources.find((s) => s.width >= 1200) ?? poster.sources.at(-1)!).src;
  return (
    <Section className='px-[var(--gutter)]'>
      <figure className='mx-auto max-w-[1400px]'>
        <div className='relative'>
          <video
            ref={ref}
            src={src}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload={reduced ? 'none' : 'metadata'}
            aria-label={alt}
            className='w-full rounded-[3px]'
            style={{ aspectRatio: `${poster.width} / ${poster.height}`, background: `center / cover url("${poster.blur}")` }}
          />
          <button
            type='button'
            className='label absolute right-3 bottom-3 rounded-[3px] bg-paper/90 px-2.5 py-1.5 text-ink shadow-[0_1px_0_rgba(0,0,0,0.08)]'
            onClick={() => setPaused((p) => !p)}
            aria-pressed={!paused}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
        <Caption>{caption}</Caption>
      </figure>
    </Section>
  );
}

function DemoBlock({ block, study }: { block: Extract<Block, { type: 'demo' }>; study: CaseStudy }) {
  const Demo = block.component;
  return (
    <Section>
      <div
        className='demo-band'
        style={{
          background: study.color.bg,
          color: study.color.fg,
          ['--demo-h-mobile' as string]: `${block.height.mobile}px`,
          ['--demo-h-desktop' as string]: `${block.height.desktop}px`
        }}
      >
        <div className='demo-copy'>
          <p className='label opacity-75'>Live demo</p>
          <h2 className='mt-2 text-[22px] leading-tight font-medium tracking-[-0.015em]'>{block.title}</h2>
          <p className='mt-2 max-w-[34ch] text-[15px] leading-snug opacity-80'>{block.hint}</p>
        </div>
        <div className='demo-stage'>
          <Suspense fallback={null}>
            <Demo />
          </Suspense>
        </div>
        {block.caption && <p className='demo-caption text-[13px] leading-snug opacity-75'>{block.caption}</p>}
      </div>
    </Section>
  );
}

function QuoteBlock({ quote, name, title }: Extract<Block, { type: 'quote' }>) {
  return (
    <Section className='grid-page'>
      <figure className='col-span-8 col-start-3'>
        <blockquote className='text-[clamp(26px,3.2vw,44px)] leading-[1.15] tracking-[-0.025em] text-balance'>
          <p>
            <span aria-hidden className='-ml-[0.45em]'>“</span>
            {quote}”
          </p>
        </blockquote>
        <figcaption className='label mt-6'>
          <span className='text-ink'>{name}</span>
          <span className='text-muted'> — {title}</span>
        </figcaption>
      </figure>
    </Section>
  );
}

function BeforeAfterBlock({ before, after, caption, labels = ['Before', 'After'] }: Extract<Block, { type: 'beforeAfter' }>) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fromPointer = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const narrow = before.image.width / before.image.height < 1;
  return (
    <Section className='px-[var(--gutter)]'>
      <figure className={`mx-auto ${narrow ? 'max-w-[760px]' : 'max-w-[1400px]'}`}>
        <div
          ref={box}
          className='relative touch-pan-y overflow-hidden rounded-[3px] select-none'
          style={{ cursor: 'ew-resize' }}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            fromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <Picture image={after.image} alt={after.alt} sizes='(min-width: 1448px) 1400px, 100vw' />
          <div className='absolute inset-0' style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Picture image={before.image} alt={before.alt} sizes='(min-width: 1448px) 1400px, 100vw' />
          </div>
          <div className='pointer-events-none absolute inset-y-0' style={{ left: `${pos}%` }}>
            <div className='absolute inset-y-0 -ml-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]' />
            <div className='absolute top-1/2 -ml-[18px] -mt-[18px] grid size-9 place-items-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.25)]'>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.6'>
                <path d='M5 4 1 8l4 4M11 4l4 4-4 4' />
              </svg>
            </div>
          </div>
          <span className='label pointer-events-none absolute top-3 left-3 rounded-[3px] bg-white/90 px-2 py-1 text-ink'>{labels[0]}</span>
          <span className='label pointer-events-none absolute top-3 right-3 rounded-[3px] bg-white/90 px-2 py-1 text-ink'>{labels[1]}</span>
        </div>
        <label className='label mt-4 flex items-center gap-4 text-muted'>
          <span className='shrink-0'>Compare</span>
          <input
            type='range'
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            className='compare-range w-full'
            aria-valuetext={`${Math.round(pos)}% ${labels[0].toLowerCase()}`}
          />
        </label>
        <Caption>{caption}</Caption>
      </figure>
    </Section>
  );
}

function MetricsBlock({ items }: Extract<Block, { type: 'metrics' }>) {
  return (
    <Section className='grid-page'>
      <h2 className='label col-span-3 mb-6 text-muted'>Results</h2>
      <dl className='col-span-9 grid gap-10 md:grid-cols-3 md:gap-6'>
        {items.map((m) => (
          <div key={m.label} className='border-t border-ink pt-4'>
            <dt className='label text-muted'>{m.label}</dt>
            <dd className='mt-3 text-[clamp(44px,5.4vw,76px)] leading-none font-medium tracking-[-0.045em] tabular-nums'>{m.value}</dd>
            {m.detail && <dd className='mt-3 text-[15px] text-muted'>{m.detail}</dd>}
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function Blocks({ study }: { study: CaseStudy }) {
  return (
    <>
      {study.blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={i} {...block} />;
          case 'image':
            return <ImageBlock key={i} {...block} />;
          case 'pair':
            return <PairBlock key={i} {...block} />;
          case 'video':
            return <VideoBlock key={i} {...block} />;
          case 'demo':
            return <DemoBlock key={i} block={block} study={study} />;
          case 'quote':
            return <QuoteBlock key={i} {...block} />;
          case 'beforeAfter':
            return <BeforeAfterBlock key={i} {...block} />;
          case 'metrics':
            return <MetricsBlock key={i} {...block} />;
        }
      })}
    </>
  );
}
