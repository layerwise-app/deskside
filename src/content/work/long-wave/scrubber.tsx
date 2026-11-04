import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { chapterAt, chapterLength, chapters, clock, episode } from './data';
import { t } from './theme';

/** The track is the screen's width minus 20px margins on each side. */
export const TRACK = { width: 350, height: 52, gap: 3 };

export type Segment = { i: number; x: number; w: number };

/** One segment per chapter, sized by the chapter's length. */
export function segments(width = TRACK.width, gap = TRACK.gap): Segment[] {
  const usable = width - gap * (chapters.length - 1);
  let x = 0;
  return chapters.map((_, i) => {
    const w = (usable * chapterLength(i)) / episode.duration;
    const seg = { i, x, w };
    x += w + gap;
    return seg;
  });
}

export function timeToX(time: number, segs: Segment[]) {
  const i = chapterAt(time);
  const s = segs[i];
  const f = Math.min(1, Math.max(0, (time - chapters[i].start) / chapterLength(i)));
  return s.x + f * s.w;
}

/** The chapter under a point on the track. Gaps belong to the nearer side. */
export function xToChapter(x: number, segs: Segment[], gap = TRACK.gap) {
  for (const s of segs) if (x < s.x + s.w + gap / 2) return s.i;
  return segs.length - 1;
}

type TrackProps = {
  time: number;
  /** Taller bars while dragging or focused. */
  active?: boolean;
  /** The chapter under the finger, lit while dragging. */
  target?: number | null;
  /** Where the finger is, in track px. */
  ghostX?: number | null;
  /** Show the chapter title above the track. */
  bubble?: boolean;
  /** Bumps on every snap so the thumb pulses. */
  snap?: number;
  width?: number;
  trackRef?: Ref<HTMLDivElement>;
  slider?: HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
  /** Rendered under the bars, inside the slider (the time labels). */
  children?: ReactNode;
};

/**
 * The chapter scrubber. Presentational: the live demo passes pointer and key
 * handlers through `slider`, stills pass a fixed state.
 */
export function ChapterTrack({
  time,
  active = false,
  target = null,
  ghostX = null,
  bubble = false,
  snap = 0,
  width = TRACK.width,
  trackRef,
  slider,
  style,
  children
}: TrackProps) {
  const segs = segments(width);
  const current = chapterAt(time);
  const thumbX = timeToX(time, segs);
  const barH = active ? 12 : 6;
  const mid = TRACK.height / 2;
  const shown = target ?? current;
  const anchor = ghostX ?? segs[shown].x + Math.min(segs[shown].w / 2, 18);
  const bubbleW = 252;
  const bubbleLeft = Math.min(width - bubbleW + 14, Math.max(-14, anchor - bubbleW / 2));

  return (
    <div
      ref={trackRef}
      {...slider}
      style={{
        position: 'relative',
        width,
        touchAction: 'none',
        cursor: slider ? (ghostX != null ? 'grabbing' : 'pointer') : undefined,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        borderRadius: 10,
        // The site's focus ring is dark ink; on this night screen it needs the accent.
        outlineColor: t.amber,
        outlineOffset: 4,
        ...style
      }}
    >
      <div style={{ position: 'relative', height: TRACK.height }}>
        {segs.map((s) => {
          const played = s.i < current ? 1 : s.i === current ? (thumbX - s.x) / s.w : 0;
          const lit = target === s.i;
          return (
            <div
              key={s.i}
              style={{
                position: 'absolute',
                left: s.x,
                width: s.w,
                top: mid - barH / 2,
                height: barH,
                borderRadius: 3,
                overflow: 'hidden',
                background: lit ? 'rgba(243,233,215,0.42)' : 'rgba(243,233,215,0.17)',
                transition: 'top 160ms ease-out, height 160ms ease-out, background 120ms'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  right: 'auto',
                  width: `${Math.max(0, Math.min(1, played)) * 100}%`,
                  background: t.amber,
                  transition: 'width 200ms cubic-bezier(.3,.7,.2,1)'
                }}
              />
            </div>
          );
        })}

        {ghostX != null && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: ghostX - 1,
              top: mid - 17,
              width: 2,
              height: 34,
              borderRadius: 1,
              background: 'rgba(243,233,215,0.75)',
              pointerEvents: 'none'
            }}
          />
        )}

        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: thumbX,
            top: mid,
            width: active ? 22 : 16,
            height: active ? 22 : 16,
            transform: 'translate(-50%, -50%)',
            transition: 'left 200ms cubic-bezier(.3,.7,.2,1), width 160ms, height 160ms',
            pointerEvents: 'none'
          }}
        >
          <div
            key={snap}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: t.paper,
              boxShadow: `0 0 0 3px ${t.night}, 0 2px 8px rgba(0,0,0,0.5)`,
              animation: snap ? 'lw-pop 280ms ease-out' : undefined
            }}
          />
        </div>

        {bubble && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: bubbleLeft,
              bottom: mid + 22,
              width: bubbleW,
              padding: '11px 14px 13px',
              borderRadius: 14,
              background: t.paper,
              color: t.night,
              boxShadow: '0 14px 30px -8px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
              zIndex: 2
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8A5A16'
              }}
            >
              <span>
                Chapter {shown + 1} of {chapters.length}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
                {clock(chapters[shown].start)}
              </span>
            </div>
            <div
              style={{
                fontFamily: t.serif,
                fontSize: 19,
                lineHeight: 1.16,
                fontWeight: 560,
                letterSpacing: '-0.01em',
                marginTop: 5
              }}
            >
              {chapters[shown].title}
            </div>
            <div
              style={{
                position: 'absolute',
                left: Math.min(bubbleW - 22, Math.max(10, anchor - bubbleLeft - 8)),
                bottom: -7,
                width: 16,
                height: 16,
                background: t.paper,
                transform: 'rotate(45deg)',
                borderRadius: 3,
                zIndex: -1
              }}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
