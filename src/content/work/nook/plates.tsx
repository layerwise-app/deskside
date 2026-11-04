import type { CSSProperties, ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { DIAL, Remote } from './remote';
import { EnergyScreen, LightsScreen, RoomsScreen, SceneEditorScreen, SetupScreen, ThermostatScreen } from './screens';
import { n } from './theme';

const TIME = '7:12';

const single = (bg: string, node: ReactNode, screen: string = n.paper) => ({
  width: 720,
  height: 900,
  render: () => (
    <Plate background={bg}>
      <Phone scale={0.88} screen={screen} time={TIME}>
        {node}
      </Phone>
    </Plate>
  )
});

/** A fixed 1440 × 900 stage for compositions placed by coordinates. */
function Stage({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <Plate background={bg}>
      <div style={{ position: 'relative', width: 1440, height: 900, flex: 'none', fontFamily: n.font, color: n.ink }}>
        {children}
      </div>
    </Plate>
  );
}

const at = (left: number, top: number): CSSProperties => ({ position: 'absolute', left, top });

/** A callout: text on the left, a hairline to a point on the remote. */
function Callout({ y, x, title, body }: { y: number; x: number; title: string; body: string }) {
  const right = 400;
  return (
    <>
      <div style={{ position: 'absolute', right: 1440 - right, top: y - 23, width: 240, textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 14.5, color: n.soft, marginTop: 3, lineHeight: 1.3 }}>{body}</div>
      </div>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width='1' height='1' aria-hidden>
        <line x1={right + 14} y1={y} x2={x - 5} y2={y} stroke='#8C827A' strokeWidth='1.3' />
        <circle cx={x} cy={y} r='4.5' fill='#F4F0EA' stroke={n.ink} strokeWidth='1.5' />
      </svg>
    </>
  );
}

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={n.clay} style={{ gap: 110 }}>
        <Remote fill={0.45} rotation={38} mode='heat' active={1} scale={1.12} style={{ marginTop: 50 }} />
        <Phone scale={0.8} time={TIME} style={{ marginTop: -30 }}>
          <RoomsScreen />
        </Phone>
      </Plate>
    )
  },

  hardware: {
    width: 1440,
    height: 900,
    render: () => {
      const s = 1.25;
      const L = 460;
      const T = 140;
      const p = (x: number, y: number) => [L + x * s, T + y * s] as const;
      // Clockwise from twelve o'clock, as the ring fills.
      const onRing = (deg: number, r: number) =>
        p(DIAL.cx + r * Math.sin((deg * Math.PI) / 180), DIAL.cy - r * Math.cos((deg * Math.PI) / 180));
      const ring = onRing(240, DIAL.ring);
      const knob = onRing(300, DIAL.knob - 5);
      const glyph = p(99, 283);
      const key = p(73, 390);
      const cs = 0.9;
      const CL = 940;
      const CT = 740 - 480 * cs;
      return (
        <Stage bg='#E2DBD0'>
          <div style={at(L, T)}>
            <Remote fill={0.75} rotation={-52} mode='light' active={0} scale={s} />
          </div>
          <Callout y={knob[1]} x={knob[0]} title='Endless dial' body='30 detents a turn. Press it to switch.' />
          <Callout y={ring[1]} x={ring[0]} title='Light ring' body='Fills to the level. Readable from across the room.' />
          <Callout y={glyph[1]} x={glyph[0]} title='Mode lights' body='Lights, heat, or music' />
          <Callout y={key[1]} x={key[0]} title='E-ink keys' body='Labels you write in the app' />

          <div style={at(CL, CT)}>
            <Remote finish='clay' fill={0.45} rotation={38} mode='heat' active={1} scale={cs} />
          </div>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width='1' height='1' aria-hidden>
            <g stroke={n.ink} strokeOpacity='0.5' strokeWidth='1.2'>
              <line x1={CL + 10 * cs} x2={CL + 310 * cs} y1={CT - 26} y2={CT - 26} />
              <line x1={CL + 10 * cs} x2={CL + 10 * cs} y1={CT - 32} y2={CT - 20} />
              <line x1={CL + 310 * cs} x2={CL + 310 * cs} y1={CT - 32} y2={CT - 20} />
              <line x1={CL + 290 * cs + 24} x2={CL + 290 * cs + 24} y1={CT + 10 * cs} y2={CT + 470 * cs} />
              <line x1={CL + 290 * cs + 18} x2={CL + 290 * cs + 30} y1={CT + 10 * cs} y2={CT + 10 * cs} />
              <line x1={CL + 290 * cs + 18} x2={CL + 290 * cs + 30} y1={CT + 470 * cs} y2={CT + 470 * cs} />
            </g>
          </svg>
          <div style={{ ...at(CL, CT - 58), width: 320 * cs, textAlign: 'center', fontSize: 14.5, fontWeight: 500, color: n.soft }}>64 mm</div>
          <div
            style={{
              ...at(CL + 290 * cs + 34, CT + 240 * cs - 10),
              fontSize: 14.5,
              fontWeight: 500,
              color: n.soft,
              transform: 'rotate(90deg)',
              transformOrigin: '0 50%',
              whiteSpace: 'nowrap',
              marginLeft: 10
            }}
          >
            96 mm
          </div>
          <div style={{ ...at(L, 768), width: 320 * s, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
            Charcoal
          </div>
          <div style={{ ...at(CL, 768), width: 320 * cs, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
            Clay <span style={{ fontWeight: 400, color: n.soft }}>· 118 g</span>
          </div>
        </Stage>
      );
    }
  },

  mirror: {
    width: 1440,
    height: 900,
    render: () => {
      // The phone's dial is drawn at the size of the real one, so both line up.
      const ps = 0.8;
      const PT = (900 - 866 * ps) / 2;
      const PL = 770;
      const dialY = PT + (11 + 349) * ps;
      const rs = (88 * (290 / 256) * ps) / 88;
      const RL = 360;
      const RT = dialY - DIAL.cy * rs;
      const x1 = RL + (DIAL.cx + DIAL.well + 16) * rs;
      const x2 = PL + (11 + 195) * ps - 126 * (290 / 256) * ps - 14;
      return (
        <Stage bg='#D9D1C5'>
          <div style={at(RL, RT)}>
            <Remote fill={0.45} rotation={38} mode='heat' active={1} scale={rs} />
          </div>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width='1' height='1' aria-hidden>
            <line x1={x1} x2={x2} y1={dialY} y2={dialY} stroke={n.ink} strokeOpacity='0.45' strokeWidth='1.4' strokeDasharray='2 6' strokeLinecap='round' />
            <circle cx={x1} cy={dialY} r='3.5' fill={n.ink} fillOpacity='0.55' />
            <circle cx={x2} cy={dialY} r='3.5' fill={n.ink} fillOpacity='0.55' />
          </svg>
          <div style={at(PL, PT)}>
            <Phone scale={ps} bar='light' screen={n.night} time={TIME}>
              <ThermostatScreen />
            </Phone>
          </div>
        </Stage>
      );
    }
  },

  lights: single('#EDE3D6', <LightsScreen />),
  scene: single(n.clay, <SceneEditorScreen />),
  energy: single('#E3DDD3', <EnergyScreen />),
  setup: single('#F0E2D6', <SetupScreen />)
};
