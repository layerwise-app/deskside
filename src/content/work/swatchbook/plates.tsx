import type { CSSProperties, ReactNode } from 'react';
import { Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { CARD, type Pin, SampleCard, SettingsCard } from './card';
import { afterColors, beforeColors } from './data';
import { CanvasFrame, HostWindow, LayerRow } from './host';
import { AuditView, ChangelogFrame, ClustersView, DoneView, FixView, FrameColors, SettingsView } from './screens';

const BG = '#E9ECF1';
const dotted = (bg: string): CSSProperties => ({
  backgroundColor: bg,
  backgroundImage: 'radial-gradient(rgba(21,23,26,0.10) 1px, transparent 1.3px)',
  backgroundSize: '22px 22px',
  backgroundPosition: '11px 11px'
});

/** Scales a fixed-size node while keeping its layout box in step. */
function Scale({ s, w, h, children, style }: { s: number; w: number; h: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ width: w * s, height: h * s, flex: 'none', ...style }}>
      <div style={{ width: w, height: h, transform: `scale(${s})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  );
}

function Backdrop({ children, bg = BG, style }: { children: ReactNode; bg?: string; style?: CSSProperties }) {
  return (
    <Plate background={bg} style={{ ...dotted(bg), ...style }}>
      {children}
    </Plate>
  );
}

const portrait = (node: ReactNode, w: number, h: number, s: number, bg = BG) => ({
  width: 720,
  height: 900,
  render: () => (
    <Backdrop bg={bg}>
      <Scale s={s} w={w} h={h}>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(21,23,26,0.10), 0 2px 4px rgba(21,23,26,0.06), 0 30px 60px -20px rgba(21,23,26,0.30)'
          }}
        >
          {node}
        </div>
      </Scale>
    </Backdrop>
  )
});

// Pins sit left of the card and point at the first layer of each stray.
const pinsAt: [number, number][] = [
  [32, 137],
  [32, 267],
  [20, 101.5],
  [20, 53],
  [20, 324],
  [20, 367]
];
const pins = (tone: Pin['tone']): Pin[] => pinsAt.map(([x, y], i) => ({ n: i + 1, x, y, tone }));

const beforeAfter = (state: 'before' | 'after') => ({
  width: 1440,
  height: 900,
  render: () => (
    <Backdrop style={{ gap: 96 }}>
      <Scale s={1.38} w={CARD.width} h={CARD.height} style={{ marginLeft: 60 }}>
        <SampleCard colors={state === 'before' ? beforeColors : afterColors} pins={pins(state === 'before' ? 'stray' : 'token')} />
      </Scale>
      <Scale s={1.3} w={340} h={490}>
        <FrameColors state={state} />
      </Scale>
    </Backdrop>
  )
});

const flowLayers = (
  <>
    <LayerRow kind='frame' name='Checkout / Reserve' open={false} selected />
    <LayerRow kind='frame' name='Checkout / Payment' open={false} />
    <LayerRow kind='frame' name='Checkout / Confirmed' open={false} />
    <LayerRow kind='frame' name='Settings / Notifications' open={false} />
    <LayerRow kind='frame' name='Settings / Profile' open={false} />
    <LayerRow kind='frame' name='Settings / Billing' open={false} />
    <LayerRow kind='frame' name='Waitlist / Join' open={false} />
    <LayerRow kind='frame' name='Waitlist / Offer' open={false} />
    <LayerRow kind='frame' name='Receipts / Email' open={false} />
  </>
);

const changelogLayers = (
  <>
    <LayerRow kind='frame' name='Swatchbook changelog' open />
    <LayerRow kind='text' name='Title' depth={1} />
    <LayerRow kind='group' name='Session · Mar 12, 2024' depth={1} open />
    <LayerRow kind='group' name='171 · Reserve button' depth={2} open={false} />
    <LayerRow kind='group' name='170 · Promo link' depth={2} open={false} />
    <LayerRow kind='group' name='169 · Slip title' depth={2} open={false} />
    <LayerRow kind='group' name='168 · Dividers' depth={2} open={false} />
    <LayerRow kind='group' name='167 · Cancellation note' depth={2} open={false} />
    <LayerRow kind='group' name='166 · Fee labels' depth={2} open={false} selected />
    <LayerRow kind='group' name='165 · Row hints' depth={2} open={false} />
    <LayerRow kind='group' name='164 · Toggle, on' depth={2} open={false} />
    <LayerRow kind='group' name='163 · Segment labels' depth={2} open={false} />
    <LayerRow kind='group' name='162 · Water (reverted)' depth={2} open={false} dim />
    <LayerRow kind='group' name='Session · Feb 27, 2024' depth={1} open={false} />
  </>
);

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Backdrop style={{ gap: 72 }}>
        <Scale s={1.3} w={CARD.width} h={CARD.height}>
          <SampleCard colors={beforeColors} selected='fees' />
        </Scale>
        <Scale s={1.12} w={320} h={640}>
          <FixView selected='fees' fixed={{}} floating height={640} />
        </Scale>
      </Backdrop>
    )
  },
  audit: {
    width: 1440,
    height: 900,
    render: () => (
      <Backdrop>
        <Scale s={1.16} w={1160} h={720}>
          <HostWindow
            page='Flows'
            zoom='85%'
            layers={flowLayers}
            canvas={
              <>
                <CanvasFrame name='Checkout / Reserve' x={28} y={140} scale={0.85} selected>
                  <SampleCard colors={beforeColors} />
                </CanvasFrame>
                <CanvasFrame name='Settings / Notifications' x={330} y={140} scale={0.85}>
                  <SettingsCard />
                </CanvasFrame>
              </>
            }
            panel={<AuditView />}
          />
        </Scale>
      </Backdrop>
    )
  },
  clusters: portrait(<ClustersView height={548} />, 320, 548, 1.48),
  fix: portrait(<FixView height={640} />, 320, 640, 1.28, '#E2E7EE'),
  before: beforeAfter('before'),
  after: beforeAfter('after'),
  changelog: {
    width: 1440,
    height: 900,
    render: () => (
      <Backdrop>
        <Scale s={1.16} w={1160} h={720}>
          <HostWindow
            page='Swatchbook changelog'
            zoom='100%'
            layers={changelogLayers}
            canvas={
              <CanvasFrame name='Swatchbook changelog' x={28} y={20}>
                <ChangelogFrame width={888} />
              </CanvasFrame>
            }
          />
        </Scale>
      </Backdrop>
    )
  },
  settings: portrait(<SettingsView height={652} />, 320, 652, 1.3),
  done: portrait(<DoneView height={578} />, 320, 578, 1.42, '#E2E7EE')
};
