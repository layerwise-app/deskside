import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sourceFor } from '~/components/site/Picture';
import { Clock } from '~/components/site/Clock';
import { Fortune } from '~/components/site/Fortune';
import { work } from '~/content/work';
import { portfolio } from '~/portfolio.config';
import { images as deskImages } from '~/assets/desk/images';
import { DeskIndex } from './DeskIndex';
import type { DeskScene, ScreenRect } from './scene/scene';
import { hasWebGL, RETURN_KEY, transition } from './webgl';

type View = 'auto' | 'desk' | 'index';

const pad = (n: number) => String(n).padStart(2, '0');

/** The first ten projects get keys; the rest are in the index. */
const MAX_KEYS = 10;

/**
 * The bottom corners sit beside the keys when the screen is wide enough for
 * the whole row at full size plus a corner's text on each side (with the
 * gutter), and move up above the keys when it isn't.
 */
const cornerRule = (() => {
  const n = Math.min(work.length, MAX_KEYS);
  const row = n * 104 + (n - 1) * 10;
  const roomy = row + 2 * (24 + 236);
  return `@container (max-width: ${roomy - 1}px) { .desk-stage .corner-bl, .desk-stage .corner-br { bottom: 112px; } }`;
})();

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/**
 * The home page. On desktops with WebGL it is the desk: a 3D computer whose
 * screen shows the selected project, a row of keys, and labels in the
 * corners. On phones, with reduced motion, or without WebGL it is a plain
 * text index; the desk is one keypress away where it can run.
 */
export function Desk({ fortune }: { fortune: number }) {
  const navigate = useNavigate();
  const router = useRouter();
  const [view, setView] = useState<View>('auto');
  const [opening, setOpening] = useState(false);
  const [canDesk, setCanDesk] = useState(false);
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  const [down, setDown] = useState<number | null>(null);
  const [veil, setVeil] = useState<{ color: string; on: boolean } | null>(null);
  const [returning, setReturning] = useState(false);

  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<DeskScene | null>(null);
  const selectedRef = useRef(0);
  const reducedRef = useRef(false);
  const openingRef = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(false);

  const current = work[selected];

  // Decide what this device gets, before the first paint after hydration.
  useLayoutEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const gl = hasWebGL();
    reducedRef.current = reduced.matches;

    let back: string | null = null;
    try {
      back = sessionStorage.getItem(RETURN_KEY);
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      back = null;
    }
    const backIndex = back ? work.findIndex((c) => c.slug === back) : -1;
    if (backIndex >= 0) {
      selectedRef.current = backIndex;
      setSelected(backIndex);
    }

    const decide = () => {
      const desk = gl && !phone.matches;
      setCanDesk(desk);
      setView(desk && !reduced.matches ? 'desk' : 'index');
    };
    decide();
    if (backIndex >= 0 && gl && !phone.matches && !reduced.matches) {
      setReturning(true);
      setVeil({ color: work[backIndex].color.bg, on: true });
    }
    phone.addEventListener('change', decide);
    return () => phone.removeEventListener('change', decide);
  }, []);

  // Start the scene once the desk is showing. Three.js loads only here.
  useEffect(() => {
    if (view !== 'desk' || !canDesk || sceneRef.current || !canvasRef.current) return;
    let cancelled = false;
    const container = canvasRef.current;
    const fallBack = () => {
      // WebGL said yes but the scene could not start: show the index instead.
      setCanDesk(false);
      setView('index');
    };
    import('./scene/scene').then(({ DeskScene }) => {
      if (cancelled || sceneRef.current) return;
      const css = getComputedStyle(document.documentElement);
      try {
        sceneRef.current = new DeskScene(container, {
          channels: work.map((c) => ({
            slug: c.slug,
            title: c.title,
            kind: c.kind,
            year: c.year,
            bg: c.color.bg,
            fg: c.color.fg,
            cover: sourceFor(c.cover.image, 1600)
          })),
          index: selectedRef.current,
          colors: {
            paper: portfolio.colors.paper,
            paperDeep: portfolio.colors.paperDeep,
            beige: portfolio.colors.beige,
            glaze: portfolio.colors.glaze,
            desk: portfolio.colors.desk
          },
          monoFont: css.getPropertyValue('--ds-font-mono') || 'monospace',
          reducedMotion: reducedRef.current,
          returning,
          onScreenRect: (rect: ScreenRect) => {
            const link = linkRef.current;
            if (!link) return;
            link.style.left = `${rect.x}px`;
            link.style.top = `${rect.y}px`;
            link.style.width = `${rect.width}px`;
            link.style.height = `${rect.height}px`;
          },
          onFirstFrame: () => {
            setReady(true);
            setVeil((v) => (v ? { ...v, on: false } : v));
          }
        });
      } catch {
        fallBack();
      }
    }, fallBack);
    return () => {
      cancelled = true;
    };
  }, [view, canDesk, returning]);

  useEffect(
    () => () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    },
    []
  );

  const select = useCallback((index: number, press = false) => {
    if (openingRef.current || index < 0 || index >= work.length) return;
    selectedRef.current = index;
    setSelected(index);
    sceneRef.current?.setChannel(index);
    if (press) {
      setDown(index);
      window.setTimeout(() => setDown((d) => (d === index ? null : d)), 130);
    }
  }, []);

  const open = useCallback(
    async (index: number) => {
      if (openingRef.current) return;
      const study = work[index];
      const scene = sceneRef.current;
      openingRef.current = true;
      setOpening(true);
      // Fetch the case study while the camera moves, so it is ready on arrival.
      const preload = router
        .preloadRoute({ to: '/work/$slug', params: { slug: study.slug } })
        .catch(() => undefined);
      try {
        sessionStorage.setItem(RETURN_KEY, study.slug);
      } catch {
        // Private mode: the desk simply starts on the first channel.
      }
      if (scene && !reducedRef.current) {
        setVeil({ color: study.color.bg, on: false });
        await scene.zoomIn((t) => {
          const el = veilRef.current;
          if (el) el.style.opacity = String(Math.max(0, Math.min(1, (t - 0.55) / 0.4)));
        });
        transition.color = study.color.bg;
      }
      await preload;
      navigate({ to: '/work/$slug', params: { slug: study.slug } });
    },
    [navigate, router]
  );

  // Keyboard: number keys pick a channel, arrows step, Enter opens, I toggles the index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key.toLowerCase() === 'i' && canDesk) {
        e.preventDefault();
        setView((v) => (v === 'index' ? 'desk' : 'index'));
        return;
      }
      if (e.key === 'Escape' && view === 'index' && canDesk) {
        setView('desk');
        return;
      }
      if (view !== 'desk') return;
      const n = Number(e.key);
      if (e.key.length === 1 && !Number.isNaN(n)) {
        const index = n === 0 ? 9 : n - 1;
        if (index < work.length) {
          e.preventDefault();
          select(index, true);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'BODY' && !(e.target as HTMLElement).classList.contains('key')) return;
        e.preventDefault();
        const step = e.key === 'ArrowRight' ? 1 : -1;
        const next = (selectedRef.current + step + work.length) % work.length;
        select(next, true);
        if ((e.target as HTMLElement).classList.contains('key')) {
          document.querySelectorAll<HTMLButtonElement>('.key')[next]?.focus();
        }
      } else if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'BODY') {
        e.preventDefault();
        open(selectedRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, canDesk, select, open]);

  // Leaving the desk view for the index: move focus into it.
  useEffect(() => {
    if (view === 'index' && canDesk) document.getElementById('index-heading')?.focus();
  }, [view, canDesk]);

  return (
    <div className='desk' data-view={view} data-live={canDesk ? 'true' : undefined}>
      <a
        className='skip-link label'
        href='#index'
        onClick={() => setView('index')}
      >
        Skip to the project index
      </a>
      <h1 className='sr-only'>
        {portfolio.name}, {portfolio.role.toLowerCase()} in {portfolio.location.city}: selected work
      </h1>

      <section
        ref={stageRef}
        className='desk-stage label'
        data-opening={opening ? 'true' : undefined}
        aria-label='A desk with a computer showing the selected project'
        onPointerDown={(e) => {
          pointerStart.current = { x: e.clientX, y: e.clientY };
          dragMoved.current = false;
        }}
        onPointerMove={(e) => {
          const s = pointerStart.current;
          if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) dragMoved.current = true;
        }}
        onPointerUp={() => {
          pointerStart.current = null;
        }}
      >
        {!returning && (
          <div className='desk-poster' data-hidden={ready ? 'true' : undefined} aria-hidden>
            <img
              src={sourceFor(deskImages.poster, 1600)}
              srcSet={deskImages.poster.sources.map((s) => `${s.src} ${s.width}w`).join(', ')}
              sizes='240vh'
              alt=''
              width={deskImages.poster.width}
              height={deskImages.poster.height}
              decoding='async'
              fetchPriority='high'
            />
          </div>
        )}
        <div ref={canvasRef} className='desk-canvas' data-ready={ready} />

        <a
          ref={linkRef}
          href={`/work/${current.slug}`}
          className='desk-screen-link'
          draggable={false}
          style={{ left: '43%', top: '28%', width: '15%', height: '22%' }}
          onClick={(e) => {
            if (dragMoved.current) {
              e.preventDefault();
              return;
            }
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            open(selected);
          }}
        >
          <span className='sr-only'>
            Open the {current.title} case study ({current.kind}, {current.year})
          </span>
        </a>

        <div className='corner corner-tl'>
          <Link to='/about' className='block w-fit' data-no-orbit>
            <span className='block text-ink'>{portfolio.name}</span>
            <span className='block text-muted'>{portfolio.role}</span>
          </Link>
        </div>

        <nav className='corner corner-tr' aria-label='Site' data-no-orbit>
          <ul role='list' className='flex items-center justify-end gap-5'>
            <li>
              <Link
                to='/work'
                className='desk-toggle link'
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  e.preventDefault();
                  setView('index');
                }}
              >
                Index <kbd className='kbd'>I</kbd>
              </Link>
            </li>
            <li>
              <Link to='/about' className='link'>
                About
              </Link>
            </li>
            <li>
              <Link to='/contact' className='link'>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className='corner corner-bl flex flex-col gap-1' data-no-orbit>
          <Clock />
          <Fortune initial={fortune} className='text-left text-ink' />
        </div>

        <div className='corner corner-br flex flex-col gap-1' aria-live='polite'>
          <span className='text-muted'>
            CH {pad(selected + 1)} / {pad(work.length)}
          </span>
          <span className='text-ink'>
            {current.title}, {current.kind}, {current.year}
          </span>
          <span className='text-muted'>Screen or ↵ opens it</span>
        </div>

        <style>{cornerRule}</style>
        <nav aria-label='Projects' data-no-orbit>
          <ul role='list' className='keys'>
            {work.slice(0, MAX_KEYS).map((c, i) => (
              <li key={c.slug}>
                <button
                  type='button'
                  className='key label'
                  aria-pressed={i === selected}
                  aria-keyshortcuts={String((i + 1) % 10)}
                  aria-label={`${c.title}, ${c.kind}${i === selected ? '. Press again to open' : ''}`}
                  data-down={down === i ? 'true' : undefined}
                  onClick={() => (i === selected ? open(i) : select(i))}
                >
                  <span className='key-num' aria-hidden>
                    {(i + 1) % 10}
                  </span>
                  <span className='key-label' aria-hidden>
                    {c.key}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <DeskIndex
        fortune={fortune}
        canDesk={canDesk}
        onDesk={() => setView('desk')}
      />

      {veil && (
        <div
          ref={veilRef}
          className='desk-veil'
          aria-hidden
          style={{
            background: veil.color,
            opacity: veil.on ? 1 : undefined,
            transition: veil.on ? undefined : returning ? 'opacity 420ms ease-out' : undefined
          }}
        />
      )}
    </div>
  );
}
