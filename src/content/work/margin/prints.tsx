import { doy, inkCounts, monthLengths, monthNames, TODAY, written, yearNotes, yearWithToday } from './data';
import { TodayScreen } from './screens';
import { inks, m, type InkId } from './theme';
import { DotYear, handLoop } from './year';

/**
 * The year printed as a broadside: twelve rows of dots, and the margin notes
 * that go with them, set beside a red pencil rule.
 */
export function YearPoster() {
  const data = yearWithToday;
  const total = written(data);
  const blank = TODAY + 1 - total;
  const ahead = 365 - TODAY - 1;
  const counts = inkCounts(data);
  const pitchX = 22;
  const pitchY = 40;
  const r = 7.5;
  const gutter = 0;
  const at = (month: number, day: number) => ({
    x: gutter + (day - 1) * pitchX + pitchX / 2,
    y: month * pitchY + pitchY / 2
  });
  const gridW = 31 * pitchX;
  const gridH = 12 * pitchY;
  const notes = yearNotes;
  return (
    <div
      style={{
        width: 1300,
        height: 790,
        background: '#FCFAF4',
        borderRadius: 4,
        boxShadow: '0 1px 0 rgba(35,40,58,0.06), 0 24px 50px -28px rgba(35,40,58,0.35)',
        position: 'relative',
        fontFamily: m.font,
        color: m.ink,
        padding: '54px 64px 0'
      }}
    >
      <svg width='0' height='0' style={{ position: 'absolute' }} aria-hidden>
        <filter id='mg-press' x='-10%' y='-10%' width='120%' height='120%'>
          <feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='7' result='n' />
          <feDisplacementMap in='SourceGraphic' in2='n' scale='2.2' xChannelSelector='R' yChannelSelector='G' />
        </filter>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.pencilText }}>
            Margin · Ines Calloway, Foster-Powell
          </div>
          <div style={{ fontSize: 58, fontWeight: 450, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 12 }}>
            2025, <i style={{ fontWeight: 350, color: m.soft }}>so far</i>
          </div>
          <div style={{ fontSize: 19, fontStyle: 'italic', color: m.soft, marginTop: 12 }}>
            {total} days written, {blank} left as paper, {ahead} still ahead.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '10px 30px', fontSize: 16, paddingBottom: 4 }}>
          {inks.map((i) => (
            <span key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 13, height: 13, borderRadius: 7, background: i.color, filter: 'url(#mg-press)' }} />
              {i.mood}
              <span style={{ color: m.soft, fontVariantNumeric: 'tabular-nums' }}>{counts[i.id]}</span>
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 13, height: 13, display: 'grid', placeItems: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: m.gap }} />
            </span>
            Paper
            <span style={{ color: m.soft, fontVariantNumeric: 'tabular-nums' }}>{blank}</span>
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', marginTop: 40 }}>
        <div style={{ width: 52, flex: 'none' }}>
          {monthNames.map((name) => (
            <div key={name} style={{ height: pitchY, display: 'flex', alignItems: 'center', fontSize: 17, fontStyle: 'italic', color: m.soft }}>
              {name.slice(0, 3)}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', width: gridW, height: gridH, flex: 'none' }}>
          <DotYear data={data} orient='rows' pitchX={pitchX} pitchY={pitchY} r={r} today={false} style={{ filter: 'url(#mg-press)' }} />
          <svg width={gridW} height={gridH} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
            {notes.map((n) => {
              if (n.to) {
                const a = at(n.month, n.day);
                const b = at(n.month, n.to);
                const y = a.y + 14;
                return (
                  <path
                    key={n.text}
                    d={`M${a.x - 6} ${y - 5} L${a.x - 5} ${y} Q${(a.x + b.x) / 2} ${y + 2.5} ${b.x + 5} ${y - 0.5} L${b.x + 6} ${y - 6}`}
                    fill='none'
                    stroke={m.pencil}
                    strokeWidth='1.7'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                );
              }
              const p = at(n.month, n.day);
              return <path key={n.text} d={handLoop(p.x, p.y, 13, doy(n.month, n.day))} fill='none' stroke={m.pencil} strokeWidth='1.7' strokeLinecap='round' />;
            })}
            {/* Leader from each mark to the margin rule. */}
            {notes.map((n) => {
              const p = at(n.month, n.to ?? n.day);
              const last = at(n.month, monthLengths[n.month]);
              return (
                <path
                  key={`l${n.text}`}
                  d={`M${last.x + 20} ${p.y} H${gridW + 26}`}
                  stroke={m.pencil}
                  strokeWidth='1'
                  strokeDasharray='1 4'
                  strokeLinecap='round'
                  opacity='0.8'
                />
              );
            })}
          </svg>
        </div>
        <div style={{ marginLeft: 30, paddingLeft: 20, borderLeft: `1.6px solid ${m.pencil}`, position: 'relative', flex: 1, height: gridH }}>
          {notes.map((n) => (
            <div
              key={n.text}
              style={{
                position: 'absolute',
                left: 20,
                right: 0,
                top: n.month * pitchY + pitchY / 2,
                transform: 'translateY(-50%)',
                fontSize: 15,
                lineHeight: 1.25,
                display: 'flex',
                gap: 8
              }}
            >
              <span style={{ color: m.pencilText, fontWeight: 650, fontVariantNumeric: 'lining-nums tabular-nums', width: 76, flex: 'none', whiteSpace: 'nowrap' }}>
                {n.to ? `Aug ${n.day}–${n.to}` : `${monthNames[n.month].slice(0, 3)} ${n.day}`}
              </span>
              <span style={{ fontStyle: 'italic' }}>{n.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 30,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 14.5,
          color: m.soft
        }}
      >
        <span>Each dot is a day with a page, in the ink chosen that night. A plain day is just paper.</span>
        <span style={{ fontStyle: 'italic' }}>Printed from Margin on Tuesday, November 4, 2025</span>
      </div>
    </div>
  );
}

function drawdown(seed: number, w: number, h: number) {
  // A palette-knife drawdown: square start, wavering edges, a thin ragged tail.
  const top: string[] = [];
  const bottom: string[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = t * w;
    const thin = t > 0.72 ? (t - 0.72) / 0.28 : 0;
    const wob = Math.sin(t * 9 + seed) * 1.4 + Math.sin(t * 23 + seed * 2) * 0.8;
    top.push(`${x.toFixed(1)} ${(4 + wob + thin * thin * h * 0.32).toFixed(1)}`);
    bottom.push(`${x.toFixed(1)} ${(h - 4 + Math.sin(t * 11 + seed * 3) * 1.3 - thin * thin * h * 0.28).toFixed(1)}`);
  }
  const tipX = w + 6;
  return `M0 4 L${top.join(' L')} L${tipX} ${h / 2 + Math.sin(seed) * 3} L${bottom.reverse().join(' L')} L0 ${h - 4} Z`;
}

/** The five inks as a printer's specimen card. */
export function InkSpecimen() {
  const counts = inkCounts(yearWithToday);
  const notes: Record<InkId, string> = {
    bright: 'Sun on the porch, a good call, a thing that worked.',
    steady: 'An ordinary day that went the way it should.',
    restless: 'Wound up, waiting on something, can’t settle.',
    low: 'Grey in the head. Nothing wrong, nothing right.',
    heavy: 'A hard one. Writing it down still counts.'
  };
  return (
    <div style={{ width: 600, fontFamily: m.font, color: m.ink }}>
      <svg width='0' height='0' style={{ position: 'absolute' }} aria-hidden>
        <filter id='mg-press-s' x='-5%' y='-20%' width='110%' height='140%'>
          <feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='3' result='n' />
          <feDisplacementMap in='SourceGraphic' in2='n' scale='3' xChannelSelector='R' yChannelSelector='G' />
        </filter>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.pencilText }}>Margin · mood inks</div>
      <div style={{ fontSize: 44, fontWeight: 450, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
        Five inks, <i style={{ fontWeight: 350, color: m.soft }}>no grades</i>
      </div>
      <div style={{ fontSize: 17, color: m.soft, marginTop: 10, lineHeight: 1.4, maxWidth: 520 }}>
        Named for how the day felt, not how it went. There is no good ink and no streak color.
      </div>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {inks.map((i, idx) => (
          <div key={i.id} style={{ display: 'grid', gridTemplateColumns: '210px 1fr', columnGap: 26, alignItems: 'center' }}>
            <svg width='210' height='70' viewBox='0 0 216 70' aria-hidden>
              <g filter='url(#mg-press-s)'>
                <path d={drawdown(idx * 1.7 + 1, 200, 70)} fill={i.color} />
                <path d={drawdown(idx * 1.7 + 4, 200, 70)} fill={i.color} opacity='0.35' transform='translate(6 3) scale(1 0.92)' />
              </g>
            </svg>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 550, letterSpacing: '-0.01em' }}>{i.name}</span>
                <span style={{ fontSize: 18, fontStyle: 'italic', color: m.soft }}>{i.mood.toLowerCase()}</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: m.soft, fontFamily: m.sans, letterSpacing: '0.02em' }}>{i.color}</span>
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.35, marginTop: 3 }}>{notes[i.id]}</div>
              <div style={{ fontSize: 13.5, color: m.soft, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{counts[i.id]} days in 2025</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const closeText = 'The back brake on the blue bike. Took two tries, Dmitri’s cable cutters and the good dish towel, which is now a grease towel.';

/**
 * A close crop of the writing field and its margin, with spec notes in red
 * pencil: the ruled field, the fold, the margin.
 */
export function FieldCloseup() {
  const s = 1.5;
  const top = 115;
  const h = 480;
  const left = 56;
  const W = left + 390 * s + 24;
  const y = (v: number) => (v - top) * s;
  const ruleX = left + (22 + 236 + 12) * s;
  const notes = [
    'Three ruled lines, 32 px apart. The field never opens taller than this.',
    'Past the third line, Keep writing turns red pencil. Over half of pages open it.',
    'The margin: a red rule, then this date from earlier years, 96 px wide.'
  ];
  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: h * s,
        fontFamily: m.font,
        borderRadius: 30,
        overflow: 'hidden',
        background: m.paper,
        boxShadow: '0 1px 0 rgba(35,40,58,0.06), 0 24px 50px -28px rgba(35,40,58,0.4)'
      }}
    >
      <div style={{ position: 'absolute', left, top: -top * s, width: 390, height: 844, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        <TodayScreen text={closeText} ink='bright' overflowing />
      </div>
      <svg width={W} height={h * s} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <path d={`M${left + 24} ${y(224)} q-8 0 -8 8 V${y(318) - 8} q0 8 8 8`} fill='none' stroke={m.pencil} strokeWidth='1.6' strokeLinecap='round' />
        <path d={`M${left + 2} ${y(339)} H${left + 24}`} fill='none' stroke={m.pencil} strokeWidth='1.6' strokeLinecap='round' />
        <Mark x={left - 8} y={y(271)} n={1} />
        <Mark x={left - 8} y={y(339)} n={2} />
        <Mark x={ruleX} y={y(212)} n={3} />
      </svg>
      <div style={{ position: 'absolute', left: left + 22 * s, top: y(378), width: 236 * s, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {notes.map((n, i) => (
          <div key={n} style={{ display: 'flex', gap: 10, fontSize: 17, lineHeight: 1.3, fontStyle: 'italic', color: m.pencilText }}>
            <svg width='22' height='22' style={{ flex: 'none', marginTop: 1 }} aria-hidden>
              <Mark x={11} y={11} n={i + 1} />
            </svg>
            <span>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mark({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r='10' fill={m.paper} stroke={m.pencil} strokeWidth='1.5' />
      <text x={x} y={y + 0.5} textAnchor='middle' dominantBaseline='central' fontSize='12.5' fontWeight='650' fontFamily={m.font} fill={m.pencilText}>
        {n}
      </text>
    </g>
  );
}
