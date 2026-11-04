import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { Phone } from '~/components/frames/Phone';
import { chapterAt, chapters, clock, episode, pausedAt } from './data';
import { TRACK, segments, xToChapter } from './scrubber';
import { NowPlayingScreen } from './screens';
import { t } from './theme';

const segs = segments();
const speeds = [1, 1.2, 1.5, 2];
const last = chapters.length - 1;

/** Pauses the simulated playhead while the demo is scrolled out of view. */
function useInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Live demo: scrub by chapter, play, and watch the transcript follow. */
export default function ChapterScrubberDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(pausedAt);
  const dragRef = useRef<{ id: number; target: number } | null>(null);
  const keyTimer = useRef<number | undefined>(undefined);

  const [time, setTime] = useState(pausedAt);
  const [playing, setPlaying] = useState(false);
  const [drag, setDrag] = useState<{ x: number; target: number } | null>(null);
  const [keyBubble, setKeyBubble] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [snap, setSnap] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [message, setMessage] = useState('');

  const inView = useInView(rootRef);
  const reduced = useReducedMotion();

  const seek = (s: number) => {
    const next = Math.max(0, Math.min(episode.duration, s));
    timeRef.current = next;
    setTime(Math.floor(next));
  };

  const jumpTo = (i: number) => {
    seek(chapters[i].start);
    setSnap((n) => n + 1);
  };

  // The simulated playhead. Real time, at the chosen speed.
  useEffect(() => {
    if (!playing || !inView || drag) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      // A backgrounded tab stops frames; don't leap ahead when it comes back.
      const dt = Math.min(0.25, (now - prev) / 1000);
      prev = now;
      const before = chapterAt(timeRef.current);
      timeRef.current = Math.min(episode.duration, timeRef.current + dt * speed);
      const after = chapterAt(timeRef.current);
      if (after !== before) setMessage(`Chapter ${after + 1}: ${chapters[after].title}`);
      setTime(Math.floor(timeRef.current));
      if (timeRef.current >= episode.duration) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView, drag, speed]);

  useEffect(() => () => window.clearTimeout(keyTimer.current), []);

  const localX = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    // The phone is scaled with CSS, so convert screen px back to track px.
    return Math.max(0, Math.min(TRACK.width, ((clientX - r.left) * TRACK.width) / r.width));
  };

  const moveTo = (clientX: number) => {
    const x = localX(clientX);
    const target = xToChapter(x, segs);
    if (dragRef.current && dragRef.current.target !== target) {
      dragRef.current.target = target;
      jumpTo(target);
    }
    setDrag({ x, target });
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.id !== e.pointerId) return;
    const target = dragRef.current.target;
    dragRef.current = null;
    setDrag(null);
    setMessage(`Chapter ${target + 1}: ${chapters[target].title}, from ${clock(chapters[target].start)}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = chapterAt(timeRef.current);
    const into = timeRef.current - chapters[i].start;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') next = Math.min(last, i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown') next = into > 3 ? i : Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next == null) return;
    e.preventDefault();
    jumpTo(next);
    setKeyBubble(true);
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => setKeyBubble(false), 1800);
  };

  const ch = chapterAt(time);
  const prevTarget = () => {
    const i = chapterAt(timeRef.current);
    return timeRef.current - chapters[i].start > 3 ? i : Math.max(0, i - 1);
  };

  return (
    <div ref={rootRef} style={{ display: 'grid', placeItems: 'center' }}>
      <Phone fit bar='light' screen={t.night}>
        <NowPlayingScreen
          time={time}
          playing={playing}
          ghostX={drag?.x ?? null}
          target={drag ? drag.target : keyBubble ? ch : null}
          bubble={Boolean(drag) || keyBubble}
          active={Boolean(drag) || focusVisible}
          live={!reduced}
          snap={snap}
          speed={speed}
          controls={{
            trackRef,
            slider: {
              role: 'slider',
              tabIndex: 0,
              'aria-label': 'Episode position, by chapter',
              'aria-valuemin': 1,
              'aria-valuemax': chapters.length,
              'aria-valuenow': ch + 1,
              'aria-valuetext': `Chapter ${ch + 1} of ${chapters.length}: ${chapters[ch].title}, ${clock(chapters[ch].start)}`,
              onPointerDown: (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                const x = localX(e.clientX);
                const target = xToChapter(x, segs);
                dragRef.current = { id: e.pointerId, target };
                setKeyBubble(false);
                setDrag({ x, target });
                jumpTo(target);
              },
              onPointerMove: (e) => {
                if (dragRef.current?.id === e.pointerId) moveTo(e.clientX);
              },
              onPointerUp: endDrag,
              onPointerCancel: endDrag,
              onLostPointerCapture: endDrag,
              onKeyDown,
              onFocus: (e) => setFocusVisible(e.currentTarget.matches(':focus-visible')),
              onBlur: () => {
                setFocusVisible(false);
                setKeyBubble(false);
              }
            },
            onToggle: () => {
              if (!playing && timeRef.current >= episode.duration) seek(0);
              setPlaying((p) => !p);
            },
            onPrev: () => jumpTo(prevTarget()),
            onNext: () => jumpTo(Math.min(last, chapterAt(timeRef.current) + 1)),
            onBack: () => seek(timeRef.current - 15),
            onFwd: () => seek(timeRef.current + 30),
            onSpeed: () => setSpeed((s) => speeds[(speeds.indexOf(s) + 1) % speeds.length])
          }}
        />
      </Phone>
      <div
        role='status'
        aria-live='polite'
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap'
        }}
      >
        {message}
      </div>
    </div>
  );
}
