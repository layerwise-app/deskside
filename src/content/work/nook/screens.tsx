import type { CSSProperties, ReactNode } from 'react';
import { DialArt, KeyCap } from './remote';
import { Icon, MiniRing, ModeGlyph, n, Screen, SectionTitle, TabBar, Toggle } from './theme';

const card: CSSProperties = {
  background: n.card,
  borderRadius: 20,
  boxShadow: '0 1px 0 rgba(43,39,36,0.06)'
};

function Header({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: '58px 20px 0', ...style }}>{children}</div>;
}

/** The four keys as they look on the remote right now. */
function KeysRow({ labels = ['Morning', 'Dinner', 'Movie', 'Away'], active = 1 }: { labels?: string[]; active?: number }) {
  return (
    <div style={{ display: 'flex', gap: 9, padding: '2px 1px 3px' }}>
      {labels.map((l, i) => (
        <KeyCap key={l} label={l} active={i === active} w={80.5} h={50} />
      ))}
    </div>
  );
}

const appRooms = [
  { name: 'Living room', heat: 69, light: 40, music: 'Playing', here: true },
  { name: 'Kitchen', heat: 69, light: 70, music: 'Playing' },
  { name: 'Bedroom', heat: 66, light: 0, music: 'Off' },
  { name: 'Kids’ room', heat: 67, light: 10, music: 'Off' },
  { name: 'Office', heat: 64, light: 0, music: 'Off' },
  { name: 'Hall', heat: 66, light: 20, music: 'Off' }
];

/** Home: every room at a glance, and where the remote is. */
export function RoomsScreen() {
  return (
    <Screen>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13.5, color: n.soft, fontWeight: 500 }}>Clinton St house · 41° outside</div>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 2 }}>Rooms</div>
          </div>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: '#D9CBB8',
              display: 'grid',
              placeItems: 'center',
              fontSize: 15,
              fontWeight: 600,
              marginTop: 4
            }}
          >
            DL
          </span>
        </div>
        <div
          style={{
            marginTop: 14,
            height: 38,
            borderRadius: 19,
            background: n.card,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px 0 10px',
            fontSize: 13.5,
            fontWeight: 500,
            boxShadow: '0 1px 0 rgba(43,39,36,0.06)'
          }}
        >
          <Icon.here size={18} color={n.glow} />
          <span>
            Remote is in the <b style={{ fontWeight: 600 }}>living room</b>
          </span>
        </div>
      </Header>
      <div style={{ padding: '22px 20px 0' }}>
        <SectionTitle action='Edit'>Keys</SectionTitle>
        <KeysRow />
        <div style={{ fontSize: 12.5, color: n.soft, marginTop: 9 }}>Dinner since 6:40 pm, pressed on the remote</div>
      </div>
      <div style={{ padding: '22px 20px 0' }}>
        <SectionTitle>6 rooms</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {appRooms.map((r) => (
            <div
              key={r.name}
              style={{
                ...card,
                borderRadius: 18,
                padding: '13px 14px 14px',
                boxShadow: r.here ? `inset 0 0 0 2px ${n.glow}` : card.boxShadow
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 20 }}>
                <span style={{ fontSize: 15.5, fontWeight: 600 }}>{r.name}</span>
                {r.here && <Icon.here size={17} color={n.glowDeep} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <MiniRing fill={(r.heat - 60) / 20} size={50}>
                  <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 2 }}>{r.heat}°</span>
                </MiniRing>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: n.soft }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: r.light ? n.ink : n.soft }}>
                    <Icon.bulb size={16} color={r.light ? n.glowDeep : n.mute} />
                    {r.light ? `${r.light}%` : 'Off'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: r.music === 'Off' ? n.soft : n.ink }}>
                    <Icon.music size={16} color={r.music === 'Off' ? n.mute : n.glowDeep} />
                    {r.music}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active='rooms' />
    </Screen>
  );
}

/** The app's dial: the remote's dial, drawn the same, in the same room. */
export function ThermostatScreen() {
  const segs = [
    { mode: 'light' as const, label: 'Lights', value: '40%' },
    { mode: 'heat' as const, label: 'Heat', value: '69°' },
    { mode: 'music' as const, label: 'Music', value: '30%' }
  ];
  const round: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: n.nightCard,
    display: 'grid',
    placeItems: 'center',
    color: '#F4EFE8'
  };
  return (
    <Screen bg={n.night} dark>
      <Header style={{ paddingTop: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={round}>
            <Icon.back size={20} />
          </span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Living room</div>
            <div style={{ fontSize: 12.5, color: n.nightSoft, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: n.glow }} />
              Remote is here
            </div>
          </div>
          <span style={round}>
            <Icon.more size={20} />
          </span>
        </div>
        <div
          style={{
            marginTop: 20,
            background: n.nightCard,
            borderRadius: 18,
            padding: 4,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4
          }}
        >
          {segs.map((s) => {
            const on = s.mode === 'heat';
            return (
              <div
                key={s.mode}
                style={{
                  height: 50,
                  borderRadius: 14,
                  background: on ? '#4A433E' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: on ? '#fff' : n.nightSoft
                }}
              >
                <ModeGlyph mode={s.mode} size={18} color={on ? n.glow : n.nightSoft} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>{s.value}</span>
              </div>
            );
          })}
        </div>
      </Header>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
        <DialArt size={290} fill={0.45} rotation={38} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <div style={{ fontSize: 80, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1, marginLeft: 22 }}>69°</div>
        <div style={{ fontSize: 15, color: n.nightSoft, marginTop: 8 }}>Heating · it’s 67° in here</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', margin: '24px 20px 0', borderTop: `1px solid ${n.nightLine}`, paddingTop: 14 }}>
        {[
          ['Outside', '41°'],
          ['Humidity', '46%'],
          ['10:30 pm', '64°']
        ].map(([k, v], i) => (
          <div key={k} style={{ textAlign: 'center', borderLeft: i ? `1px solid ${n.nightLine}` : 'none' }}>
            <div style={{ fontSize: 12, color: n.nightSoft }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '24px 20px 0' }}>
        <KeysRow />
      </div>
    </Screen>
  );
}

const lamps = [
  { name: 'Floor lamp', where: 'By the sofa', value: 50, icon: Icon.lamp },
  { name: 'Pendant', where: 'Over the table', value: 60, icon: Icon.pendant },
  { name: 'Reading lamp', where: 'Green armchair', value: 0, icon: Icon.lamp },
  { name: 'Shelf strip', where: 'Bookcase', value: 50, icon: Icon.strip }
];

/** Lights in one room: the dial's level, the mix, and the warmth. */
export function LightsScreen() {
  const warmth = [
    { k: 2200, name: 'Candle', c: '#FFB15E' },
    { k: 2700, name: 'Warm', c: '#FFCB8E' },
    { k: 3500, name: 'Neutral', c: '#FFE6C8' },
    { k: 5000, name: 'Daylight', c: '#F4F2EC' }
  ];
  return (
    <Screen>
      <Header style={{ paddingTop: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: n.soft, fontSize: 15, fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: -6 }}>
            <Icon.back size={22} /> Rooms
          </span>
          <Icon.more size={22} color={n.ink} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.1 }}>Living room</div>
        <div style={{ fontSize: 14, color: n.soft, marginTop: 4 }}>3 of 4 lights on · set by Dinner at 6:40 pm</div>

        <div style={{ position: 'relative', height: 64, borderRadius: 20, background: n.sunk, overflow: 'hidden', marginTop: 20 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: n.glow }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
              <Icon.bulb size={22} /> All lights
            </span>
            <span style={{ fontSize: 20, fontWeight: 600 }}>40%</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: n.soft, marginTop: 8 }}>This is what the dial sets. Each lamp keeps its share.</div>
      </Header>

      <div style={{ padding: '18px 20px 0' }}>
        <SectionTitle action='2700 K'>Warmth</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {warmth.map((w) => {
            const on = w.k === 2700;
            return (
              <div key={w.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: w.c,
                    boxShadow: on
                      ? `inset 0 0 0 1px rgba(0,0,0,0.08), 0 0 0 3px ${n.paper}, 0 0 0 5px ${n.ink}`
                      : 'inset 0 0 0 1px rgba(0,0,0,0.08)'
                  }}
                />
                <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? n.ink : n.soft }}>{w.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <SectionTitle>In this room</SectionTitle>
        <div style={{ ...card, padding: '0 16px' }}>
          {lamps.map((l, i) => {
            const on = l.value > 0;
            return (
              <div
                key={l.name}
                style={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderTop: i ? `1px solid ${n.line}` : 'none'
                }}
              >
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: on ? n.glowSoft : n.sunk,
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {l.icon({ size: 21, color: on ? n.glowDeep : n.mute })}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12.5, color: n.soft }}>{l.where}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: on ? n.ink : n.mute, width: 40, textAlign: 'right' }}>
                  {on ? `${l.value}%` : 'Off'}
                </span>
                <Toggle on={on} />
              </div>
            );
          })}
        </div>
        <div style={{ ...card, padding: '0 16px', marginTop: 10, height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600 }}>Off at 11:30 pm</div>
            <div style={{ fontSize: 12.5, color: n.soft }}>Unless someone turns the dial after 11</div>
          </div>
          <Toggle on />
        </div>
      </div>
      <TabBar active='rooms' />
    </Screen>
  );
}

/** Relabel a key. The e-ink redraws on the remote a moment later. */
export function SceneEditorScreen() {
  const labels = ['Morning', 'Dinner', 'Reading', 'Away'];
  const actions = [
    { icon: Icon.bulb, title: 'Living room', detail: 'Reading lamp 100%, others 20%' },
    { icon: Icon.bulb, title: 'Kitchen', detail: 'Lights 30%' },
    { icon: Icon.music, title: 'Music', detail: 'Off everywhere' }
  ];
  return (
    <Screen>
      <Header style={{ paddingTop: 58 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
          <span style={{ color: n.soft, fontWeight: 500 }}>Cancel</span>
          <span style={{ fontWeight: 600, fontSize: 17 }}>Key 3</span>
          <span style={{ color: n.glowDeep, fontWeight: 600 }}>Save</span>
        </div>
      </Header>
      <div
        style={{
          margin: '18px 20px 0',
          height: 182,
          borderRadius: 24,
          background: n.clay,
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 12 }}>
          {labels.map((l, i) => (
            <span
              key={l}
              style={{
                borderRadius: 18,
                outline: i === 2 ? `2.5px solid ${n.glow}` : 'none',
                outlineOffset: 5
              }}
            >
              <KeyCap label={l} active={i === 2} w={118} h={68} />
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: n.soft }}>Label</div>
        <div
          style={{
            marginTop: 8,
            height: 54,
            borderRadius: 16,
            background: n.card,
            boxShadow: `inset 0 0 0 2px ${n.glow}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            fontSize: 18,
            fontWeight: 500
          }}
        >
          Reading
          <span style={{ width: 2, height: 24, borderRadius: 1, background: n.glow, marginLeft: 2 }} />
          <span style={{ marginLeft: 'auto', fontSize: 13, color: n.mute, fontWeight: 500 }}>7 / 10</span>
        </div>
        <div style={{ fontSize: 13, color: n.soft, marginTop: 8, lineHeight: 1.4 }}>
          Was “Movie”. Up to 10 letters print at full size.
        </div>
      </div>
      <div style={{ padding: '22px 20px 0' }}>
        <SectionTitle>When you press it</SectionTitle>
        <div style={{ ...card, padding: '0 16px' }}>
          {actions.map((a, i) => (
            <div
              key={a.title}
              style={{ height: 58, display: 'flex', alignItems: 'center', gap: 12, borderTop: i ? `1px solid ${n.line}` : 'none' }}
            >
              {a.icon({ size: 20, color: n.soft })}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: n.soft }}>{a.detail}</div>
              </div>
              <Icon.next size={16} color={n.mute} />
            </div>
          ))}
          <div
            style={{
              height: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderTop: `1px solid ${n.line}`,
              color: n.glowDeep,
              fontSize: 15,
              fontWeight: 600
            }}
          >
            <Icon.plus size={20} /> Add a room or speaker
          </div>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 20px 40px' }}>
        <div style={{ fontSize: 12.5, color: n.soft, textAlign: 'center', marginBottom: 10 }}>
          Redraws in about 2 seconds. E-ink keeps it with no power.
        </div>
        <div
          style={{
            height: 54,
            borderRadius: 17,
            background: n.ink,
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 17,
            fontWeight: 600
          }}
        >
          Send to remote
        </div>
      </div>
    </Screen>
  );
}

/** kWh used for heat each day in October 2023. Away key on the 13th to 15th. */
const october = [8, 7, 7, 8, 9, 10, 10, 11, 10, 11, 12, 12, 4, 3, 5, 12, 13, 13, 12, 14, 15, 14, 13, 14, 15, 15, 16, 17, 16, 17, 18];

function DailyChart() {
  const w = 318;
  const plotW = 296;
  const base = 128;
  const per = 5.4;
  const slot = plotW / october.length;
  const bw = 6;
  const x = (i: number) => i * slot + (slot - bw) / 2;
  const bar = (i: number, v: number) => {
    const h = v * per;
    const r = 2.5;
    const l = x(i);
    const t = base - h;
    return `M${l} ${base}V${t + r}Q${l} ${t} ${l + r} ${t}H${l + bw - r}Q${l + bw} ${t} ${l + bw} ${t + r}V${base}Z`;
  };
  const away = [12, 13, 14];
  const ax0 = x(away[0]);
  const ax1 = x(away[2]) + bw;
  return (
    <svg width={w} height={150} viewBox={`0 0 ${w} 150`} style={{ display: 'block' }} aria-hidden>
      {[10, 20].map((g) => (
        <g key={g}>
          <line x1='0' x2={plotW} y1={base - g * per} y2={base - g * per} stroke={n.line} strokeWidth='1' strokeDasharray='2 3' />
          <text x={w} y={base - g * per + 3.5} textAnchor='end' fontSize='10.5' fill={n.mute} fontFamily={n.font}>
            {g}
          </text>
        </g>
      ))}
      {october.map((v, i) => (
        <path key={i} d={bar(i, v)} fill={n.glow} />
      ))}
      <line x1='0' x2={plotW} y1={base + 0.5} y2={base + 0.5} stroke={n.stone} strokeWidth='1' />
      <path d={`M${ax0} 92v-5H${ax1}v5`} fill='none' stroke={n.ink} strokeWidth='1.3' />
      <text x={(ax0 + ax1) / 2} y='81' textAnchor='middle' fontSize='11' fontWeight='600' fill={n.ink} fontFamily={n.font}>
        Away
      </text>
      {[0, 7, 14, 21, 28].map((i) => (
        <text key={i} x={x(i) + bw / 2} y='145' textAnchor={i === 0 ? 'start' : 'middle'} fontSize='10.5' fill={n.mute} fontFamily={n.font} dx={i === 0 ? -2 : 0}>
          {i === 0 ? 'Oct 1' : i + 1}
        </text>
      ))}
    </svg>
  );
}

/** Energy: what heat cost this month, by room, and how the house was run. */
export function EnergyScreen() {
  const byRoom = [
    ['Living room', 34],
    ['Kitchen', 21],
    ['Bedroom', 19],
    ['Kids’ room', 16],
    ['Office', 10]
  ] as const;
  const split = [
    { name: 'Remote', count: 403, pct: 92, c: n.glow },
    { name: 'Phone', count: 26, pct: 6, c: n.ink },
    { name: 'Schedule', count: 9, pct: 2, c: n.stone }
  ];
  return (
    <Screen>
      <Header style={{ paddingTop: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>Energy</div>
          <span
            style={{
              height: 34,
              borderRadius: 17,
              background: n.card,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 8px',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 1px 0 rgba(43,39,36,0.06)'
            }}
          >
            <Icon.back size={16} color={n.soft} /> October <Icon.next size={16} color={n.mute} />
          </span>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: n.soft, fontWeight: 500 }}>Used for heat</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 52, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>361</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: n.soft }}>kWh</span>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={n.ink} strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' aria-hidden>
            <path d='M12 5v14M6 13l6 6 6-6' />
          </svg>
          13% less than October 2022
        </div>
      </Header>
      <div style={{ ...card, margin: '16px 20px 0', padding: '14px 16px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: n.soft, marginBottom: 4 }}>
          <span>kWh each day</span>
          <span style={{ color: n.mute, fontWeight: 500 }}>Away saved about 24 kWh</span>
        </div>
        <DailyChart />
      </div>
      <div style={{ ...card, margin: '12px 20px 0', padding: '14px 16px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: n.soft, marginBottom: 8 }}>By room</div>
        {byRoom.map(([name, pct]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', height: 25, gap: 10, fontSize: 13.5 }}>
            <span style={{ width: 86, flex: 'none' }}>{name}</span>
            <span style={{ flex: 1, height: 6, borderRadius: 3, background: n.sunk, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(pct / 34) * 100}%`, borderRadius: 3, background: n.glow }} />
            </span>
            <span style={{ width: 34, textAlign: 'right', fontWeight: 600, flex: 'none' }}>{pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ ...card, margin: '12px 20px 0', padding: '14px 16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: n.soft }}>
          <span>Changes this month</span>
          <span style={{ color: n.ink }}>438 · about 14 a day</span>
        </div>
        <div style={{ display: 'flex', gap: 2, height: 10, marginTop: 10 }}>
          {split.map((s, i) => (
            <span
              key={s.name}
              style={{
                width: `${s.pct}%`,
                background: s.c,
                borderRadius: i === 0 ? '5px 0 0 5px' : i === split.length - 1 ? '0 5px 5px 0' : 0
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12.5 }}>
          {split.map((s) => (
            <span key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: s.c }} />
              {s.name} <b style={{ fontWeight: 600 }}>{s.count}</b>
            </span>
          ))}
        </div>
      </div>
      <TabBar active='energy' />
    </Screen>
  );
}

type PlanRoom = { name: string; x: number; y: number; w: number; h: number; state: 'done' | 'now' | 'todo' };

const plan: PlanRoom[] = [
  { name: 'Living room', x: 0, y: 0, w: 178, h: 136, state: 'done' },
  { name: 'Kitchen', x: 184, y: 0, w: 138, h: 136, state: 'done' },
  { name: 'Hall', x: 0, y: 142, w: 322, h: 34, state: 'done' },
  { name: 'Bedroom', x: 0, y: 182, w: 124, h: 120, state: 'now' },
  { name: 'Kids’ room', x: 130, y: 182, w: 94, h: 120, state: 'todo' },
  { name: 'Office', x: 230, y: 182, w: 92, h: 120, state: 'todo' }
];

function FloorPlan() {
  const beacon = (x: number, y: number, base = false) => (
    <g>
      <circle cx={x} cy={y} r={base ? 9 : 7.5} fill={n.ink} />
      {base ? (
        <rect x={x - 4} y={y - 2.5} width='8' height='5' rx='1.5' fill={n.card} />
      ) : (
        <circle cx={x} cy={y} r='2.2' fill={n.card} />
      )}
    </g>
  );
  return (
    <svg width='322' height='302' viewBox='0 0 322 302' style={{ display: 'block' }} aria-hidden>
      {plan.map((r) => (
        <g key={r.name}>
          <rect
            x={r.x + 1}
            y={r.y + 1}
            width={r.w - 2}
            height={r.h - 2}
            rx='11'
            fill={r.state === 'done' ? n.sunk : r.state === 'now' ? n.glowSoft : n.card}
            stroke={r.state === 'now' ? n.glow : r.state === 'todo' ? n.stone : 'none'}
            strokeWidth={r.state === 'now' ? 2 : 1.4}
            strokeDasharray={r.state === 'todo' ? '4 4' : undefined}
          />
          <text
            x={r.x + 12}
            y={r.name === 'Hall' ? r.y + 22 : r.y + 24}
            fontFamily={n.font}
            fontSize='13'
            fontWeight='600'
            fill={r.state === 'todo' ? n.soft : n.ink}
          >
            {r.name}
          </text>
          {r.state === 'done' && (
            <g transform={`translate(${r.x + r.w - 28} ${r.y + 9})`}>
              <circle cx='9' cy='9' r='9' fill={n.ink} />
              <path d='m5 9.3 2.7 2.7 5.3-5.6' fill='none' stroke='#fff' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round' />
            </g>
          )}
          {r.state === 'todo' && (
            <text x={r.x + 12} y={r.y + 42} fontFamily={n.font} fontSize='11.5' fill={n.mute}>
              Not yet
            </text>
          )}
        </g>
      ))}
      {/* The remote, listening, in the bedroom */}
      <circle cx='62' cy='250' r='32' fill='none' stroke={n.glow} strokeOpacity='0.25' strokeWidth='1.5' />
      <circle cx='62' cy='250' r='20' fill='none' stroke={n.glow} strokeOpacity='0.5' strokeWidth='1.5' />
      <rect x='55' y='240' width='14' height='20' rx='6' fill={n.ink} />
      <circle cx='62' cy='246.5' r='4' fill='none' stroke={n.glow} strokeWidth='1.6' />
      {beacon(30, 110, true)}
      {beacon(300, 114)}
      {beacon(300, 280)}
    </svg>
  );
}

/** Setup: carry the remote to each room so it learns where it is. */
export function SetupScreen() {
  return (
    <Screen>
      <Header style={{ paddingTop: 58 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon.back size={22} color={n.ink} style={{ marginLeft: -4 }} />
          <div style={{ flex: 1, display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < 2 ? n.ink : i === 2 ? n.glow : n.line }} />
            ))}
          </div>
          <span style={{ fontSize: 15, color: n.soft, fontWeight: 500 }}>Skip</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: n.glowDeep, marginTop: 24 }}>Step 3 of 4</div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 6 }}>Walk it to each room</div>
        <div style={{ fontSize: 15, color: n.soft, marginTop: 10, lineHeight: 1.4 }}>
          Stand near the middle of the room and press the dial. The base and two beacons work out where you are, to about three feet.
        </div>
      </Header>
      <div style={{ ...card, margin: '20px 20px 0', padding: 14 }}>
        <FloorPlan />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12.5, color: n.soft }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width='14' height='14' viewBox='0 0 18 18' aria-hidden>
              <circle cx='9' cy='9' r='8' fill={n.ink} />
              <rect x='5' y='6.5' width='8' height='5' rx='1.5' fill={n.card} />
            </svg>
            Base
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width='14' height='14' viewBox='0 0 18 18' aria-hidden>
              <circle cx='9' cy='9' r='7' fill={n.ink} />
              <circle cx='9' cy='9' r='2.2' fill={n.card} />
            </svg>
            Beacon
          </span>
          <span style={{ marginLeft: 'auto', color: n.ink, fontWeight: 600 }}>3 of 6 rooms</span>
        </div>
      </div>
      <div
        style={{
          margin: '12px 20px 0',
          borderRadius: 20,
          background: n.ink,
          color: '#F4EFE8',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}
      >
        <MiniRing fill={0.3} size={40} stroke={3.5} track='#4A433E' />
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 600 }}>Press the dial in the bedroom</div>
          <div style={{ fontSize: 13, color: n.nightSoft }}>The ring circles while it listens</div>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 20px 40px' }}>
        <div
          style={{
            height: 54,
            borderRadius: 17,
            boxShadow: `inset 0 0 0 1.5px ${n.stone}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 16,
            fontWeight: 600
          }}
        >
          Skip the bedroom
        </div>
      </div>
    </Screen>
  );
}
