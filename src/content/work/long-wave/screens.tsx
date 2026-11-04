import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { ShowArt } from './art';
import {
  chapterAt,
  chapterLength,
  chapters,
  clock,
  episode,
  library,
  lineIndexAt,
  minutes,
  pausedAt,
  recap,
  transcript,
  type ShowId
} from './data';
import { ChapterTrack, TRACK } from './scrubber';
import { Icon, Label, Playing, Screen, keyframes, t, type IconName } from './theme';

const tabular: CSSProperties = { fontVariantNumeric: 'tabular-nums' };

/** A real button when it has a handler, a plain span in stills. */
function Tap({
  onClick,
  label,
  pressed,
  children,
  style
}: {
  onClick?: () => void;
  label?: string;
  pressed?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    padding: 0,
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    ...style
  };
  if (!onClick) return <span style={base}>{children}</span>;
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      style={{ ...base, cursor: 'pointer', touchAction: 'manipulation', outlineColor: t.amber }}
    >
      {children}
    </button>
  );
}

function TopBar({ left, center, right }: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div
      style={{
        height: 44,
        margin: '52px 14px 0',
        display: 'grid',
        gridTemplateColumns: '44px 1fr 44px',
        alignItems: 'center',
        flex: 'none'
      }}
    >
      <span style={{ display: 'grid', placeItems: 'center' }}>{left}</span>
      <div style={{ textAlign: 'center' }}>{center}</div>
      <span style={{ display: 'grid', placeItems: 'center' }}>{right}</span>
    </div>
  );
}

function Pill({
  children,
  tone = 'primary',
  icon,
  style
}: {
  children: ReactNode;
  tone?: 'primary' | 'ghost';
  icon?: IconName;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        height: 52,
        borderRadius: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontSize: 16,
        fontWeight: 650,
        letterSpacing: '-0.01em',
        background: tone === 'primary' ? t.amber : 'transparent',
        color: tone === 'primary' ? t.night : t.paper,
        boxShadow: tone === 'primary' ? 'none' : `inset 0 0 0 1.5px ${t.line}`,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {icon && <Icon name={icon} size={tone === 'primary' ? 20 : 18} />}
      {children}
    </span>
  );
}

/** A thin segmented progress bar for lists, one segment per chapter. */
function MiniTrack({
  lengths,
  progress,
  width,
  height = 4,
  gap = 2
}: {
  lengths: number[];
  progress: number;
  width: number;
  height?: number;
  gap?: number;
}) {
  const total = lengths.reduce((a, b) => a + b, 0);
  const usable = width - gap * (lengths.length - 1);
  let acc = 0;
  return (
    <div style={{ display: 'flex', gap, width }}>
      {lengths.map((l, i) => {
        const from = acc / total;
        acc += l;
        const to = acc / total;
        const f = Math.max(0, Math.min(1, (progress - from) / (to - from)));
        return (
          <div
            key={i}
            style={{
              width: (usable * l) / total,
              height,
              borderRadius: height / 2,
              background: 'rgba(243,233,215,0.16)',
              overflow: 'hidden',
              flex: 'none'
            }}
          >
            <div style={{ width: `${f * 100}%`, height: '100%', background: t.amber }} />
          </div>
        );
      })}
    </div>
  );
}

const workbenchLengths = chapters.map((_, i) => chapterLength(i));
const tableLengths = [380, 760, 690, 850, 640, 780, 910, 720, 780];

/* ------------------------------------------------------------------ */
/* Now playing                                                        */
/* ------------------------------------------------------------------ */

export type PlayerControls = {
  trackRef: Ref<HTMLDivElement>;
  slider: HTMLAttributes<HTMLDivElement>;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  onFwd: () => void;
  onSpeed: () => void;
};

type NowPlayingProps = {
  time: number;
  playing?: boolean;
  /** Finger position on the track while dragging. */
  ghostX?: number | null;
  /** Chapter under the finger while dragging. */
  target?: number | null;
  bubble?: boolean;
  active?: boolean;
  /** Animate the level meter and line changes (live demo only). */
  live?: boolean;
  snap?: number;
  speed?: number;
  controls?: PlayerControls;
};

/** The player. The chapter title is the headline; the timeline is the chapters. */
export function NowPlayingScreen({
  time,
  playing = false,
  ghostX = null,
  target = null,
  bubble = false,
  active = false,
  live = false,
  snap = 0,
  speed = 1,
  controls
}: NowPlayingProps) {
  const ch = chapterAt(time);
  const li = lineIndexAt(time);
  const line = transcript[li];
  const dragging = ghostX != null;
  return (
    <Screen>
      <style>{keyframes}</style>
      <TopBar
        left={<Icon name='down' size={26} color={t.soft} />}
        center={
          <>
            <div style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '0.1em', color: t.dim }}>PLAYING FROM</div>
            <div style={{ fontSize: 14, fontWeight: 650, marginTop: 2 }}>Workbench</div>
          </>
        }
        right={<Icon name='more' size={24} color={t.soft} />}
      />

      <div style={{ display: 'flex', gap: 16, padding: '16px 20px 0', alignItems: 'center' }}>
        <ShowArt show='workbench' size={124} radius={12} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: t.soft, fontWeight: 600 }}>Ep. {episode.number} · Oct 22</div>
          <div
            style={{
              fontFamily: t.serif,
              fontSize: 21,
              lineHeight: 1.14,
              fontWeight: 560,
              letterSpacing: '-0.01em',
              marginTop: 5
            }}
          >
            {episode.title}
          </div>
          <div style={{ fontSize: 13, color: t.soft, marginTop: 6 }}>with {episode.host}</div>
        </div>
      </div>

      <div
        style={{
          padding: '0 20px',
          marginTop: 22,
          height: 128,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          opacity: bubble ? 0 : 1,
          transition: 'opacity 160ms'
        }}
      >
        <Label style={{ color: t.amber }}>
          Chapter {ch + 1} of {chapters.length}
        </Label>
        <div
          style={{
            fontFamily: t.serif,
            fontSize: 28,
            lineHeight: 1.1,
            fontWeight: 460,
            letterSpacing: '-0.018em',
            marginTop: 8,
            textWrap: 'balance'
          }}
        >
          {chapters[ch].title}
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: 6 }}>
        <ChapterTrack
          time={time}
          active={active || dragging}
          target={target}
          ghostX={ghostX}
          bubble={bubble}
          snap={snap}
          trackRef={controls?.trackRef}
          slider={controls?.slider}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12.5,
              marginTop: -8,
              paddingBottom: 2,
              ...tabular
            }}
          >
            <span style={{ color: dragging ? t.amber : t.paper, fontWeight: 650, minWidth: 64 }}>{clock(time)}</span>
            <span style={{ color: t.dim }}>{minutes(chapterLength(ch) - (time - chapters[ch].start))} left in chapter</span>
            <span style={{ color: t.soft, minWidth: 64, textAlign: 'right' }}>−{clock(episode.duration - time)}</span>
          </div>
        </ChapterTrack>
      </div>

      <div
        style={{
          margin: '20px 20px 0',
          padding: '14px 16px 16px',
          borderRadius: 16,
          background: t.raised,
          height: 140,
          overflow: 'hidden',
          flex: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 16 }}>
          {playing && <Playing live={live} />}
          <Label style={{ color: t.amber }}>{line.who === 'HOLLIS' ? 'Hollis' : 'Miriam'}</Label>
          <span style={{ fontSize: 12, color: t.dim, ...tabular }}>{clock(line.t)}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: t.soft, fontWeight: 600 }}>
            <Icon name='transcript' size={16} />
            Transcript
          </span>
        </div>
        <div
          key={li}
          style={{
            fontFamily: t.serif,
            fontSize: 18.5,
            lineHeight: 1.38,
            marginTop: 9,
            letterSpacing: '-0.005em',
            animation: live ? 'lw-fade 320ms ease-out' : undefined
          }}
        >
          {line.text}
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px'
        }}
      >
        <Tap onClick={controls?.onPrev} label='Previous chapter' style={{ width: 48, height: 48 }}>
          <Icon name='prevChapter' size={26} />
        </Tap>
        <Tap onClick={controls?.onBack} label='Back 15 seconds' style={{ width: 48, height: 48 }}>
          <Icon name='back15' size={28} />
        </Tap>
        <Tap
          onClick={controls?.onToggle}
          label={playing ? 'Pause' : 'Play'}
          style={{ width: 78, height: 78, borderRadius: 39, background: t.amber, color: t.night }}
        >
          <Icon name={playing ? 'pause' : 'play'} size={34} style={playing ? undefined : { marginLeft: 3 }} />
        </Tap>
        <Tap onClick={controls?.onFwd} label='Forward 30 seconds' style={{ width: 48, height: 48 }}>
          <Icon name='fwd30' size={28} />
        </Tap>
        <Tap onClick={controls?.onNext} label='Next chapter' style={{ width: 48, height: 48 }}>
          <Icon name='nextChapter' size={26} />
        </Tap>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '22px 18px 42px',
          fontSize: 11,
          fontWeight: 600,
          color: t.soft
        }}
      >
        <Tap
          onClick={controls?.onSpeed}
          label={`Playback speed ${speed}×`}
          style={{ flexDirection: 'column', gap: 5, height: 46 }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: speed === 1 ? t.paper : t.amber, height: 22, display: 'flex', alignItems: 'center', ...tabular }}>
            {speed}×
          </span>
          Speed
        </Tap>
        {(
          [
            ['moon', 'Sleep'],
            ['chapters', 'Chapters'],
            ['queue', 'Up next']
          ] as const
        ).map(([icon, label]) => (
          <span key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: 46, justifyContent: 'center' }}>
            <Icon name={icon} size={22} color={t.paper} />
            {label}
          </span>
        ))}
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Before: the old player                                             */
/* ------------------------------------------------------------------ */

/** The player before: a hairline scrubber that only knows timecodes. */
export function OldPlayerScreen({ time = 2300 }: { time?: number }) {
  const w = TRACK.width;
  const x = (time / episode.duration) * w;
  return (
    <Screen>
      <TopBar
        left={<Icon name='down' size={26} color={t.soft} />}
        center={<div style={{ fontSize: 14, fontWeight: 650 }}>Now Playing</div>}
        right={<Icon name='more' size={24} color={t.soft} />}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
        <ShowArt show='workbench' size={300} radius={14} />
      </div>
      <div style={{ padding: '26px 20px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }}>{episode.title}</div>
        <div style={{ fontSize: 15, color: t.soft, marginTop: 4 }}>Workbench · Ep. {episode.number}</div>
      </div>
      <div style={{ padding: '0 20px', marginTop: 58 }}>
        <div style={{ position: 'relative', height: 30 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 13, height: 4, borderRadius: 2, background: 'rgba(243,233,215,0.17)' }} />
          <div style={{ position: 'absolute', left: 0, width: x, top: 13, height: 4, borderRadius: 2, background: t.amber }} />
          <div
            style={{
              position: 'absolute',
              left: x - 11,
              top: 4,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: t.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x - 38,
              bottom: 36,
              width: 76,
              height: 34,
              borderRadius: 10,
              background: '#3A3F4B',
              color: t.paper,
              display: 'grid',
              placeItems: 'center',
              fontSize: 15,
              fontWeight: 700,
              ...tabular
            }}
          >
            {clock(time)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 2, color: t.soft, ...tabular }}>
          <span style={{ color: t.paper, fontWeight: 650 }}>{clock(time)}</span>
          <span>−{clock(episode.duration - time)}</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <Icon name='back15' size={32} />
        <span style={{ width: 78, height: 78, borderRadius: 39, background: t.paper, color: t.night, display: 'grid', placeItems: 'center' }}>
          <Icon name='pause' size={34} />
        </span>
        <Icon name='fwd30' size={32} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '30px 36px 46px', color: t.soft }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: t.paper }}>1×</span>
        <Icon name='moon' size={22} />
        <Icon name='speaker' size={22} />
        <Icon name='queue' size={22} />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Chapters                                                           */
/* ------------------------------------------------------------------ */

/** All ten chapters as a sheet over the player. */
export function ChaptersScreen({ time = pausedAt + 4 }: { time?: number }) {
  const current = chapterAt(time);
  return (
    <Screen bg='#0B0D12'>
      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 0,
          right: 0,
          bottom: 0,
          background: t.raised,
          borderRadius: '28px 28px 0 0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ width: 38, height: 5, borderRadius: 3, background: t.line, margin: '9px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 20px 0' }}>
          <div style={{ fontFamily: t.serif, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>Chapters</div>
          <span style={{ fontSize: 16, fontWeight: 650, color: t.amber }}>Done</span>
        </div>
        <div style={{ fontSize: 13, color: t.soft, padding: '4px 20px 12px' }}>
          10 chapters, written by {episode.producer}, producer
        </div>
        <div style={{ borderTop: `1px solid ${t.line}` }}>
          {chapters.map((c, i) => {
            const played = i < current;
            const isCurrent = i === current;
            const into = time - c.start;
            return (
              <div
                key={c.start}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: 12,
                  padding: '11px 20px 11px',
                  alignItems: 'start',
                  background: isCurrent ? 'rgba(242,165,65,0.09)' : undefined,
                  boxShadow: isCurrent ? `inset 3px 0 0 ${t.amber}` : undefined,
                  borderBottom: `1px solid ${t.line}`
                }}
              >
                <span style={{ height: 22, display: 'flex', alignItems: 'center' }}>
                  {isCurrent ? (
                    <Playing />
                  ) : played ? (
                    <Icon name='check' size={17} color={t.dim} stroke={2.2} />
                  ) : (
                    <span style={{ fontFamily: t.serif, fontSize: 15, color: t.soft, ...tabular }}>{String(i + 1).padStart(2, '0')}</span>
                  )}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: t.serif,
                      fontSize: 16.5,
                      lineHeight: 1.25,
                      fontWeight: isCurrent ? 560 : 430,
                      color: played ? t.dim : t.paper
                    }}
                  >
                    {c.title}
                  </div>
                  {isCurrent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(243,233,215,0.16)', overflow: 'hidden' }}>
                        <div style={{ width: `${(into / chapterLength(i)) * 100}%`, height: '100%', background: t.amber }} />
                      </div>
                      <span style={{ fontSize: 12, color: t.amber, fontWeight: 650, ...tabular }}>
                        {clock(into)} of {clock(chapterLength(i))}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', ...tabular }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: played ? t.dim : t.soft, height: 22, lineHeight: '22px' }}>{clock(c.start)}</div>
                  <div style={{ fontSize: 11.5, color: t.dim }}>{minutes(chapterLength(i))}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Transcript                                                         */
/* ------------------------------------------------------------------ */

/** The transcript follows playback. Every line is a place to jump to. */
export function TranscriptScreen({ time = 3038 }: { time?: number }) {
  const current = lineIndexAt(time);
  const ch = chapterAt(time);
  const first = transcript.findIndex((l) => l.t >= 3021); // 50:21
  const lines = transcript.slice(first, first + 8);
  return (
    <Screen>
      <TopBar
        left={<Icon name='down' size={26} color={t.soft} />}
        center={<div style={{ fontSize: 15, fontWeight: 650 }}>Transcript</div>}
        right={<Icon name='text' size={22} color={t.soft} />}
      />
      <div style={{ padding: '10px 20px 0' }}>
        <div
          style={{
            height: 40,
            borderRadius: 12,
            background: t.raised,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 12px',
            color: t.dim,
            fontSize: 15
          }}
        >
          <Icon name='search' size={18} />
          Search this episode
        </div>
      </div>
      <div style={{ padding: '18px 20px 10px', borderBottom: `1px solid ${t.line}` }}>
        <Label style={{ color: t.amber }}>
          Chapter {ch + 1} · {clock(chapters[ch].start)}
        </Label>
        <div style={{ fontFamily: t.serif, fontSize: 16, lineHeight: 1.3, marginTop: 4, color: t.soft }}>{chapters[ch].title}</div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: '6px 0 0' }}>
        {lines.map((l, k) => {
          const idx = first + k;
          const state = idx < current ? 'past' : idx === current ? 'now' : 'next';
          return (
            <div
              key={l.t}
              style={{
                margin: '0 10px',
                padding: '11px 10px 12px 14px',
                borderRadius: 14,
                background: state === 'now' ? t.raised : undefined,
                boxShadow: state === 'now' ? `inset 3px 0 0 ${t.amber}` : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Label style={{ fontSize: 10.5, color: state === 'now' ? t.amber : t.dim }}>{l.who === 'HOLLIS' ? 'Hollis' : 'Miriam'}</Label>
                <span style={{ fontSize: 11.5, color: t.dim, ...tabular }}>{clock(l.t)}</span>
                {state === 'now' && (
                  <span style={{ marginLeft: 'auto' }}>
                    <Playing />
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: t.serif,
                  fontSize: 18.5,
                  lineHeight: 1.38,
                  marginTop: 4,
                  color: state === 'past' ? 'rgba(243,233,215,0.4)' : state === 'now' ? t.paper : 'rgba(243,233,215,0.78)'
                }}
              >
                {l.text}
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 150,
            background: `linear-gradient(to bottom, rgba(20,23,31,0), ${t.night} 62%)`,
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 18,
            transform: 'translateX(-50%)',
            height: 36,
            padding: '0 14px',
            borderRadius: 18,
            background: t.raised2,
            boxShadow: `inset 0 0 0 1px ${t.line}, 0 8px 20px rgba(0,0,0,0.4)`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 650,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 4, background: t.amber }} />
          Following playback
          <span style={{ color: t.dim, fontWeight: 500 }}>· tap a line to jump</span>
        </div>
      </div>
      <MiniPlayer time={time} />
    </Screen>
  );
}

function MiniPlayer({ time }: { time: number }) {
  const ch = chapterAt(time);
  return (
    <div style={{ background: t.raised, padding: '0 0 34px', flex: 'none' }}>
      <MiniTrack lengths={workbenchLengths} progress={time / episode.duration} width={390} height={3} gap={2} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 4px 20px' }}>
        <ShowArt show='workbench' size={44} radius={8} title={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.serif, fontSize: 15.5, fontWeight: 540, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {chapters[ch].title}
          </div>
          <div style={{ fontSize: 12, color: t.soft, marginTop: 2, ...tabular }}>
            Chapter {ch + 1} of 10 · {clock(time)}
          </div>
        </div>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: t.amber, color: t.night, display: 'grid', placeItems: 'center' }}>
          <Icon name='pause' size={22} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Previously                                                         */
/* ------------------------------------------------------------------ */

const recapWords = recap.split(' ');
const lastHeard = transcript[lineIndexAt(pausedAt)];

/**
 * Opens instead of the player when you come back after three days or more.
 * With `recapAt`, the host is reading the recap aloud.
 */
export function PreviouslyScreen({ recapAt = null }: { recapAt?: number | null }) {
  const hearing = recapAt != null;
  const spoken = hearing ? Math.round((recapWords.length * recapAt) / 30) : recapWords.length;
  const ch = chapterAt(pausedAt);
  return (
    <Screen>
      <TopBar
        left={<Icon name='down' size={26} color={t.soft} />}
        center={<div style={{ fontSize: 14, fontWeight: 650 }}>Workbench · Ep. {episode.number}</div>}
        right={<Icon name='more' size={24} color={t.soft} />}
      />
      <div style={{ padding: '14px 22px 0' }}>
        <Label style={{ color: t.amber }}>Welcome back · 6 days away</Label>
        <div
          style={{
            fontFamily: t.serif,
            fontStyle: 'italic',
            fontSize: 42,
            lineHeight: 1,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            marginTop: 10
          }}
        >
          Previously
        </div>
        <div style={{ fontSize: 14.5, color: t.soft, marginTop: 10, lineHeight: 1.4 }}>
          You stopped {clock(pausedAt)} in, during Chapter {ch + 1}: Lofting.
        </div>
      </div>

      <div
        style={{
          margin: '16px 16px 0',
          borderRadius: 20,
          background: t.raised,
          padding: '16px 18px 16px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label style={{ display: 'flex', alignItems: 'center', gap: 8, color: hearing ? t.amber : t.soft }}>
            {hearing && <Playing />}
            {hearing ? 'Hearing the story so far' : 'The story so far'}
          </Label>
          <span style={{ fontSize: 12, color: hearing ? t.amber : t.dim, fontWeight: 600, ...tabular }}>
            {hearing ? `${clock(recapAt)} / 0:30` : '30 sec'}
          </span>
        </div>
        {hearing && (
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(243,233,215,0.14)', marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(recapAt / 30) * 100}%`, background: t.amber }} />
          </div>
        )}
        <div style={{ fontFamily: t.serif, fontSize: 16.5, lineHeight: 1.42, marginTop: 10, letterSpacing: '-0.003em' }}>
          {recapWords.map((w, i) => (
            <span key={i} style={{ color: i < spoken ? t.paper : 'rgba(243,233,215,0.34)' }}>
              {w}
              {i < recapWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: t.dim, marginTop: 12 }}>
          Written by {episode.producer}, producer · read by {episode.host}
        </div>
      </div>

      <div style={{ margin: '16px 22px 0', paddingLeft: 14, borderLeft: `2px solid ${t.amber}` }}>
        <Label>The last thing you heard</Label>
        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 17, lineHeight: 1.36, marginTop: 6 }}>
          “{lastHeard.text}”
        </div>
        <div style={{ fontSize: 12.5, color: t.soft, marginTop: 6, ...tabular }}>Hollis · {clock(lastHeard.t)}</div>
      </div>

      <div style={{ marginTop: 'auto', padding: '14px 16px 40px' }}>
        <Pill icon='play'>{hearing ? `Skip to ${clock(pausedAt)}` : `Resume at ${clock(pausedAt)}`}</Pill>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Pill tone='ghost' icon={hearing ? 'pause' : 'speaker'} style={{ flex: 1, height: 44, fontSize: 14.5 }}>
            {hearing ? 'Pause recap' : 'Hear recap'}
          </Pill>
          <Pill tone='ghost' icon='prevChapter' style={{ flex: 1, height: 44, fontSize: 14.5 }}>
            From {clock(chapters[ch].start)}
          </Pill>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Library                                                            */
/* ------------------------------------------------------------------ */

function TabBar() {
  const tabs = [
    ['home', 'Listen now', false],
    ['library', 'Library', true],
    ['search', 'Search', false]
  ] as const;
  return (
    <div
      style={{
        marginTop: 'auto',
        height: 84,
        paddingBottom: 30,
        borderTop: `1px solid ${t.line}`,
        background: t.night,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        flex: 'none'
      }}
    >
      {tabs.map(([icon, label, on]) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: on ? t.amber : t.dim }}>
          <Icon name={icon} size={24} />
          {label}
        </div>
      ))}
    </div>
  );
}

/** In-progress episodes first, with where you are by chapter, then the queue. */
export function LibraryScreen() {
  const [wb, table] = library.continue;
  return (
    <Screen>
      <div style={{ padding: '56px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: t.serif, fontSize: 34, fontWeight: 500, letterSpacing: '-0.025em' }}>Library</div>
        <span style={{ width: 38, height: 38, borderRadius: 19, background: t.slateDeep, color: t.paper, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>
          JK
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0' }}>
        {['In progress', 'Shows', 'Downloads'].map((p, i) => (
          <span
            key={p}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 16,
              fontSize: 13.5,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              background: i === 0 ? t.paper : 'transparent',
              color: i === 0 ? t.night : t.soft,
              boxShadow: i === 0 ? 'none' : `inset 0 0 0 1.5px ${t.line}`
            }}
          >
            {p}
          </span>
        ))}
      </div>

      <Label style={{ padding: '18px 20px 10px' }}>Continue</Label>
      <div style={{ margin: '0 16px', borderRadius: 20, background: t.raised, padding: 16 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <ShowArt show='workbench' size={66} radius={10} title={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>
              {wb.showName} · {wb.when}
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 18, lineHeight: 1.18, fontWeight: 560, marginTop: 3 }}>{wb.title}</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <MiniTrack lengths={workbenchLengths} progress={wb.at / wb.duration} width={326} height={5} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 8, color: t.soft, ...tabular }}>
          <span>
            <span style={{ color: t.paper, fontWeight: 600 }}>Ch. {wb.chapter + 1} of {wb.chapterCount}</span> · Lofting
          </span>
          <span>{minutes(wb.duration - wb.at)} left</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span
            style={{
              height: 30,
              padding: '0 12px',
              borderRadius: 15,
              background: 'rgba(242,165,65,0.12)',
              color: t.amber,
              fontSize: 12.5,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 3, background: t.amber }} />
            Recap waiting · 30 sec
          </span>
          <span style={{ height: 38, padding: '0 16px 0 12px', borderRadius: 19, background: t.amber, color: t.night, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
            <Icon name='play' size={16} />
            Resume
          </span>
        </div>
      </div>

      <div style={{ margin: '10px 16px 0', borderRadius: 20, background: t.raised, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <ShowArt show='table' size={50} radius={8} title={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>
              {table.showName} · {table.when}
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 16, lineHeight: 1.2, fontWeight: 540, marginTop: 2 }}>{table.title}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <MiniTrack lengths={tableLengths} progress={table.at / table.duration} width={326} height={5} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 8, color: t.soft, ...tabular }}>
          <span>
            <span style={{ color: t.paper, fontWeight: 600 }}>Ch. {table.chapter + 1} of {table.chapterCount}</span> · Picking by hand
          </span>
          <span>{minutes(table.duration - table.at)} left</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 20px 4px' }}>
        <Label>Up next · 3 episodes</Label>
        <span style={{ fontSize: 13, fontWeight: 650, color: t.amber }}>Edit</span>
      </div>
      {library.queue.map((q) => (
        <QueueRow key={q.title} show={q.show} showName={q.showName} title={q.title} duration={q.duration} chapters={q.chapters} />
      ))}
      <TabBar />
    </Screen>
  );
}

function QueueRow({ show, showName, title, duration, chapters: count }: { show: ShowId; showName: string; title: string; duration: number; chapters: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '7px 16px 7px 20px' }}>
      <ShowArt show={show} size={50} radius={8} title={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>{showName}</div>
        <div style={{ fontFamily: t.serif, fontSize: 15.5, lineHeight: 1.2, fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: t.dim, marginTop: 2 }}>
          {minutes(duration)} · {count} chapters
        </div>
      </div>
      <Icon name='grip' size={20} color={t.dim} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Episode                                                            */
/* ------------------------------------------------------------------ */

/** The episode page: what it is, where you are, and the chapters as a contents page. */
export function EpisodeScreen() {
  const current = chapterAt(pausedAt);
  return (
    <Screen>
      <TopBar
        left={<Icon name='back' size={26} color={t.soft} />}
        center={<div style={{ fontSize: 14, fontWeight: 650 }}>Workbench</div>}
        right={<Icon name='share' size={22} color={t.soft} />}
      />
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <ShowArt show='workbench' size={132} radius={14} />
        <div style={{ paddingBottom: 4 }}>
          <Label style={{ color: t.amber }}>Episode {episode.number}</Label>
          <div style={{ fontSize: 13, color: t.soft, marginTop: 6, lineHeight: 1.45 }}>
            {episode.released}
            <br />
            {minutes(episode.duration)} · 10 chapters
            <br />
            Transcript · Recap
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontFamily: t.serif, fontSize: 30, lineHeight: 1.08, fontWeight: 520, letterSpacing: '-0.022em', textWrap: 'balance' }}>
          {episode.title}
        </div>
        <div style={{ fontSize: 14, color: t.soft, marginTop: 10, lineHeight: 1.45 }}>{episode.description}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '18px 20px 0', alignItems: 'center' }}>
        <Pill icon='play' style={{ flex: 1, height: 50 }}>
          Resume at {clock(pausedAt)}
        </Pill>
        {(['plus', 'download'] as const).map((n) => (
          <span key={n} style={{ width: 50, height: 50, borderRadius: 25, boxShadow: `inset 0 0 0 1.5px ${t.line}`, display: 'grid', placeItems: 'center' }}>
            <Icon name={n} size={22} />
          </span>
        ))}
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <MiniTrack lengths={workbenchLengths} progress={pausedAt / episode.duration} width={350} height={4} />
        <div style={{ fontSize: 12.5, color: t.soft, marginTop: 7, ...tabular }}>{minutes(episode.duration - pausedAt)} left</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 20px 6px' }}>
        <Label>Chapters</Label>
        <span style={{ fontSize: 13, fontWeight: 650, color: t.amber }}>See all 10</span>
      </div>
      <div style={{ padding: '0 20px' }}>
        {chapters.slice(2, 7).map((c, k) => {
          const i = k + 2;
          const isCurrent = i === current;
          return (
            <div
              key={c.start}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr auto',
                gap: 10,
                alignItems: 'baseline',
                padding: '9px 0',
                borderTop: `1px solid ${t.line}`
              }}
            >
              <span style={{ fontFamily: t.serif, fontSize: 14, color: isCurrent ? t.amber : t.dim, ...tabular }}>{String(i + 1).padStart(2, '0')}</span>
              <span
                style={{
                  fontFamily: t.serif,
                  fontSize: 15.5,
                  fontWeight: isCurrent ? 560 : 430,
                  color: i < current ? t.soft : t.paper,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {c.title}
              </span>
              <span style={{ fontSize: 12.5, color: isCurrent ? t.amber : t.dim, fontWeight: 600, ...tabular }}>
                {isCurrent ? 'Playing' : clock(c.start)}
              </span>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
