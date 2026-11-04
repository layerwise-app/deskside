import { useId, type CSSProperties, type ReactNode } from 'react';
import { a, card } from './theme';

/** ISO ID-1 card, stood upright: 54 × 85.6 mm, drawn at 10 units per mm. */
export const CARD_W = 540;
export const CARD_H = 856;
const CARD_R = 34;
export const cardHeight = (w: number) => Math.round((w * CARD_H) / CARD_W);
export const cardRadius = (w: number) => (w * CARD_R) / CARD_W;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Small seeded generator so every render draws the same grain and frost. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

// ── Alder grain: long lines that part around a knot ──────────────────────
function grainPaths(w: number, h: number, kx: number, ky: number) {
  const lines: string[] = [];
  for (let x0 = -40; x0 <= w + 40; x0 += 13) {
    let d = '';
    for (let y = -20; y <= h + 20; y += 16) {
      const dx = x0 - kx;
      const fall = Math.exp(-((y - ky) ** 2) / (2 * 120 ** 2)) * Math.exp(-(dx ** 2) / (2 * 75 ** 2));
      const push = (dx >= 0 ? 1 : -1) * 44 * fall;
      const wave = 4 * Math.sin(y / 95 + x0 / 41) + 2.2 * Math.sin(y / 37 + x0 / 13);
      d += `${y === -20 ? 'M' : 'L'}${r1(x0 + push + wave)} ${y}`;
    }
    lines.push(d);
  }
  const rings: string[] = [];
  for (let i = 0; i < 4; i++) {
    const rx = 9 + i * 9;
    const ry = 26 + i * 21;
    rings.push(
      `M${kx - rx} ${ky}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`
    );
  }
  return { lines: lines.join(''), rings: rings.join('') };
}

const grainFront = grainPaths(CARD_W, CARD_H, 372, 560);
const grainBack = grainPaths(CARD_W, CARD_H, 150, 300);
const grainWide = grainPaths(CARD_H, CARD_W, 640, 250);

// ── Red alder leaf: ovate, doubly serrate, straight parallel veins ────────
function leafShape(L: number, W: number, K: number, teeth = 1) {
  const width = (t: number) => W * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.78)), 0.85);
  const tooth = (t: number) => {
    if (teeth === 0 || t < 0.07 || t > 0.96) return 0;
    const major = (t * K) % 1;
    const minor = (t * K * 2) % 1;
    return teeth * (W * 0.05 * Math.pow(major, 1.7) + W * 0.016 * Math.pow(minor, 1.7));
  };
  const N = K * 12;
  const right: string[] = [];
  const left: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = width(t) + tooth(t);
    right.push(`${r1(x)} ${r1(-L * t)}`);
    left.unshift(`${r1(-x)} ${r1(-L * t)}`);
  }
  const outline = `M0 0L${right.join('L')}L${left.join('L')}Z`;
  let veins = `M0 ${r1(L * 0.08)}L0 ${r1(-L * 0.97)}`;
  for (let k = 1; k < K - 1; k++) {
    const te = (k + 1) / K - 0.012;
    if (te < 0.14 || te > 0.9) continue;
    const ex = width(te) + tooth(te) - W * 0.03;
    const ts = Math.max(0.03, te - 0.2 * (width(te) / W));
    veins += `M0 ${r1(-L * ts)}L${r1(ex)} ${r1(-L * te)}M0 ${r1(-L * ts)}L${r1(-ex)} ${r1(-L * te)}`;
  }
  return { outline, veins };
}

const bigLeaf = leafShape(620, 205, 13, 1.7);
const markLeaf = leafShape(100, 38, 6, 0);

/** The leaf from the wordmark, on its own. */
export function LeafMark({
  size = 24,
  color = a.brass,
  vein = a.forest,
  style
}: {
  size?: number;
  color?: string;
  vein?: string;
  style?: CSSProperties;
}) {
  return (
    <svg width={size * 0.62} height={size} viewBox='-40 -104 80 128' aria-hidden style={{ display: 'block', flex: 'none', ...style }}>
      <g transform='rotate(14)'>
        <path d={markLeaf.outline} fill={color} />
        <path d={markLeaf.veins} stroke={vein} strokeWidth='3.2' strokeLinecap='round' fill='none' />
      </g>
    </svg>
  );
}

function Mark({ x, y, h, color, vein }: { x: number; y: number; h: number; color: string; vein: string }) {
  const s = h / 128;
  return (
    <g transform={`translate(${x + 40 * s * 0.62} ${y + 104 * s}) scale(${s}) rotate(14)`}>
      <path d={markLeaf.outline} fill={color} />
      <path d={markLeaf.veins} stroke={vein} strokeWidth='3.2' strokeLinecap='round' fill='none' />
    </g>
  );
}

function Chip({ x, y, w, h, id, rotate }: { x: number; y: number; w: number; h: number; id: string; rotate?: boolean }) {
  const lines = rotate
    ? `M${x} ${y + h * 0.36}H${x + w}M${x} ${y + h * 0.64}H${x + w}M${x + w * 0.34} ${y}V${y + h * 0.36}M${x + w * 0.66} ${y}V${y + h * 0.36}M${x + w * 0.34} ${y + h * 0.64}V${y + h}M${x + w * 0.66} ${y + h * 0.64}V${y + h}`
    : `M${x + w * 0.36} ${y}V${y + h}M${x + w * 0.64} ${y}V${y + h}M${x} ${y + h * 0.34}H${x + w * 0.36}M${x} ${y + h * 0.66}H${x + w * 0.36}M${x + w * 0.64} ${y + h * 0.34}H${x + w}M${x + w * 0.64} ${y + h * 0.66}H${x + w}`;
  const cx = rotate ? x + w * 0.28 : x + w * 0.36;
  const cy = rotate ? y + h * 0.36 : y + h * 0.3;
  const cw = rotate ? w * 0.44 : w * 0.28;
  const ch = rotate ? h * 0.28 : h * 0.4;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}chip`} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#EBCF8E' />
          <stop offset='0.45' stopColor='#CDA45A' />
          <stop offset='1' stopColor='#A27833' />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.17} fill={`url(#${id}chip)`} />
      <path d={lines} stroke='#7E5E22' strokeWidth='2.2' opacity='0.75' fill='none' />
      <rect x={cx} y={cy} width={cw} height={ch} rx='6' fill='none' stroke='#7E5E22' strokeWidth='2.2' opacity='0.75' />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={w * 0.16} fill='none' stroke='#fff' strokeOpacity='0.35' strokeWidth='1.5' />
    </g>
  );
}

function Contactless({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  const arcs = [11, 23, 35, 47].map((r) => {
    const t = (50 * Math.PI) / 180;
    return `M${r1(x + r * s * Math.cos(-t))} ${r1(y + r * s * Math.sin(-t))}A${r * s} ${r * s} 0 0 1 ${r1(x + r * s * Math.cos(t))} ${r1(y + r * s * Math.sin(t))}`;
  });
  return <path d={arcs.join('')} stroke={color} strokeWidth={6 * s} strokeLinecap='round' fill='none' />;
}

function Sheen({ id, w, h, r }: { id: string; w: number; h: number; r: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}sheen`} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#fff' stopOpacity='0.12' />
          <stop offset='0.42' stopColor='#fff' stopOpacity='0' />
          <stop offset='0.75' stopColor='#000' stopOpacity='0' />
          <stop offset='1' stopColor='#000' stopOpacity='0.16' />
        </linearGradient>
      </defs>
      <rect width={w} height={h} rx={r} fill={`url(#${id}sheen)`} />
      <rect x='0.75' y='0.75' width={w - 1.5} height={h - 1.5} rx={r - 0.75} fill='none' stroke='#fff' strokeOpacity='0.1' strokeWidth='1.5' />
    </>
  );
}

type Side = 'front' | 'back' | 'details';

/**
 * The Alder debit card, drawn in code. `front` and `back` are the plastic;
 * `details` is the face the app shows after Face ID.
 */
export function CardArt({
  side = 'front',
  width,
  hideIn = 30,
  style
}: {
  side?: Side;
  width: number;
  hideIn?: number;
  style?: CSSProperties;
}) {
  const id = safeId(useId());
  const g = side === 'back' ? grainBack : grainFront;
  return (
    <svg
      width={width}
      height={cardHeight(width)}
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      aria-hidden
      style={{ display: 'block', fontFamily: a.font, ...style }}
    >
      <defs>
        <clipPath id={`${id}clip`}>
          <rect width={CARD_W} height={CARD_H} rx={CARD_R} />
        </clipPath>
        <radialGradient id={`${id}base`} cx='0.25' cy='0.15' r='1.1'>
          <stop offset='0' stopColor={side === 'details' ? '#22412F' : '#27493A'} />
          <stop offset='0.55' stopColor={side === 'details' ? '#173022' : a.forest} />
          <stop offset='1' stopColor={side === 'details' ? '#0F2219' : '#142B1F'} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect width={CARD_W} height={CARD_H} fill={`url(#${id}base)`} />
        <path d={g.lines} stroke='#E8E4D8' strokeOpacity={side === 'front' ? 0.05 : 0.035} strokeWidth='1.6' fill='none' />
        <path d={g.rings} stroke='#E8E4D8' strokeOpacity={side === 'front' ? 0.06 : 0.04} strokeWidth='1.6' fill='none' />

        {side === 'front' && (
          <>
            <g transform='translate(392 930) rotate(-21)'>
              <path d={bigLeaf.outline} fill='#244634' opacity='0.92' />
              <path d={bigLeaf.veins} stroke='#183225' strokeWidth='3.2' strokeLinecap='round' fill='none' />
            </g>
            <Mark x={50} y={60} h={52} color={a.brass} vein={a.forest} />
            <text x='96' y='104' fill='#EFEBE0' fontSize='44' fontWeight='700' letterSpacing='-0.6'>
              Alder
            </text>
            <Contactless x={452} y={86} color='#EFEBE0' s={0.82} />
            <Chip x={56} y={214} w={88} h={116} id={id} rotate />
            <text x='52' y='806' fill='#EFEBE0' fillOpacity='0.9' fontSize='25' fontWeight='550' letterSpacing='0.4'>
              {card.holder}
            </text>
            <text x='488' y='806' fill={a.brass} fontSize='23' fontWeight='700' letterSpacing='2.4' textAnchor='end'>
              DEBIT
            </text>
          </>
        )}

        {side === 'back' && (
          <>
            <defs>
              <linearGradient id={`${id}stripe`} x1='0' y1='0' x2='1' y2='0'>
                <stop offset='0' stopColor='#0B1611' />
                <stop offset='0.5' stopColor='#1A2A22' />
                <stop offset='1' stopColor='#0B1611' />
              </linearGradient>
            </defs>
            <rect x='358' y='0' width='127' height={CARD_H} fill={`url(#${id}stripe)`} />
            <Mark x={50} y={58} h={40} color={a.brass} vein={a.forest} />
            <text x='88' y='92' fill='#EFEBE0' fontSize='32' fontWeight='700' letterSpacing='-0.4'>
              Alder
            </text>
            <text fill='#EFEBE0' fontSize='27' fontWeight='650' letterSpacing='-0.2'>
              <tspan x='50' y='196'>Your card number</tspan>
              <tspan x='50' y='230'>lives in the Alder</tspan>
              <tspan x='50' y='264'>app, behind Face ID.</tspan>
            </text>
            <text fill='#EFEBE0' fillOpacity='0.78' fontSize='21' fontWeight='500'>
              <tspan x='50' y='334'>Lost it? Freeze it in</tspan>
              <tspan x='50' y='362'>the app with one tap.</tspan>
            </text>
            <text fill={a.brass} fontSize='21' fontWeight='600'>
              <tspan x='50' y='430'>Alder will never call</tspan>
              <tspan x='50' y='458'>or text to ask for</tspan>
              <tspan x='50' y='486'>your card details.</tspan>
            </text>
            <text x='50' y='640' fill='#EFEBE0' fillOpacity='0.6' fontSize='17' fontWeight='600' letterSpacing='1.6'>
              HELP, ANY HOUR
            </text>
            <text x='50' y='680' fill='#EFEBE0' fontSize='30' fontWeight='650' letterSpacing='0.2'>
              503-555-0134
            </text>
            <text fill='#EFEBE0' fillOpacity='0.5' fontSize='15' fontWeight='500'>
              <tspan x='50' y='782'>Issued by Alder Credit Union,</tspan>
              <tspan x='50' y='804'>Portland, Oregon. Since 1934.</tspan>
            </text>
          </>
        )}

        {side === 'details' && (
          <>
            <text x='52' y='96' fill='#EFEBE0' fillOpacity='0.72' fontSize='27' fontWeight='600'>
              Everyday Debit
            </text>
            <Mark x={470} y={62} h={46} color={a.brass} vein='#173022' />
            <text x='52' y='250' fill={a.brass} fontSize='21' fontWeight='700' letterSpacing='2.4'>
              CARD NUMBER
            </text>
            <text fill='#F4F1E8' fontSize='66' fontWeight='600' letterSpacing='3' style={{ fontVariantNumeric: 'tabular-nums' }}>
              <tspan x='50' y='330'>
                {card.number[0]} {card.number[1]}
              </tspan>
              <tspan x='50' y='412'>
                {card.number[2]} {card.number[3]}
              </tspan>
            </text>
            <text x='52' y='520' fill={a.brass} fontSize='21' fontWeight='700' letterSpacing='2.4'>
              EXPIRES
            </text>
            <text x='52' y='574' fill='#F4F1E8' fontSize='46' fontWeight='600' letterSpacing='1'>
              {card.expiry}
            </text>
            <text x='300' y='520' fill={a.brass} fontSize='21' fontWeight='700' letterSpacing='2.4'>
              CVC
            </text>
            <text x='300' y='574' fill='#F4F1E8' fontSize='46' fontWeight='600' letterSpacing='1'>
              {card.cvc}
            </text>
            <text x='52' y='668' fill='#EFEBE0' fillOpacity='0.8' fontSize='25' fontWeight='600' letterSpacing='1.6'>
              {card.holder.toUpperCase()}
            </text>
            <rect x='50' y='752' width='440' height='2' fill='#EFEBE0' fillOpacity='0.14' />
            <rect x='50' y='752' width={(440 * Math.max(0, Math.min(30, hideIn))) / 30} height='2' fill={a.brass} />
            <text x='52' y='804' fill='#EFEBE0' fillOpacity='0.62' fontSize='23' fontWeight='550'>
              Hides again in {hideIn} s
            </text>
          </>
        )}
        <Sheen id={id} w={CARD_W} h={CARD_H} r={CARD_R} />
      </g>
    </svg>
  );
}

/** The virtual card: landscape, paper and brass, online only. */
export function VirtualCardArt({ width, revealed = false }: { width: number; revealed?: boolean }) {
  const id = safeId(useId());
  const W = CARD_H;
  const H = CARD_W;
  const digits = revealed ? card.virtual.number : [card.virtual.number[0], '••••', '••••', card.virtual.last4];
  return (
    <svg width={width} height={Math.round((width * H) / W)} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ display: 'block', fontFamily: a.font }}>
      <defs>
        <clipPath id={`${id}clip`}>
          <rect width={W} height={H} rx={CARD_R} />
        </clipPath>
        <linearGradient id={`${id}base`} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#F3EAD2' />
          <stop offset='1' stopColor='#E2D2A9' />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect width={W} height={H} fill={`url(#${id}base)`} />
        <path d={grainWide.lines} stroke={a.forest} strokeOpacity='0.035' strokeWidth='1.6' fill='none' />
        <g transform='translate(836 610) rotate(-38) scale(0.5)'>
          <path d={bigLeaf.outline} fill={a.forest} fillOpacity='0.05' stroke={a.forest} strokeOpacity='0.16' strokeWidth='5' />
          <path d={bigLeaf.veins} stroke={a.forest} strokeOpacity='0.12' strokeWidth='5' strokeLinecap='round' fill='none' />
        </g>
        <Mark x={52} y={52} h={50} color={a.forest} vein='#E9DDBC' />
        <text x='96' y='96' fill={a.forest} fontSize='42' fontWeight='700' letterSpacing='-0.6'>
          Alder
        </text>
        <rect x='640' y='58' width='166' height='46' rx='23' fill='none' stroke={a.forest} strokeOpacity='0.5' strokeWidth='2.5' />
        <text x='723' y='89' fill={a.forest} fontSize='20' fontWeight='700' letterSpacing='2.6' textAnchor='middle'>
          VIRTUAL
        </text>
        <text x='52' y='336' fill={a.forest} fontSize='58' fontWeight='600' letterSpacing='3' style={{ fontVariantNumeric: 'tabular-nums' }}>
          {digits.join('  ')}
        </text>
        <text x='54' y='468' fill={a.forest} fillOpacity='0.66' fontSize='22' fontWeight='700' letterSpacing='2.4'>
          ONLINE ONLY
        </text>
        <text x='54' y='500' fill={a.forest} fontSize='26' fontWeight='600'>
          {card.holder}
        </text>
        <text x='400' y='468' fill={a.forest} fillOpacity='0.66' fontSize='22' fontWeight='700' letterSpacing='2.4'>
          EXPIRES
        </text>
        <text x='400' y='500' fill={a.forest} fontSize='26' fontWeight='600'>
          {card.virtual.expiry}
        </text>
        <Sheen id={id} w={W} h={H} r={CARD_R} />
      </g>
    </svg>
  );
}

/** The 2016 card: landscape, glossy, every digit embossed on the front. */
export function OldCardArt({ width }: { width: number }) {
  const id = safeId(useId());
  const W = CARD_H;
  const H = CARD_W;
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
  const emboss = (x: number, y: number, size: number, text: string, spacing: number) => (
    <g fontFamily={mono} fontSize={size} fontWeight='600' letterSpacing={spacing}>
      <text x={x + 2.4} y={y + 2.8} fill='#081A13' fillOpacity='0.6'>
        {text}
      </text>
      <text x={x - 1.3} y={y - 1.3} fill='#fff' fillOpacity='0.7'>
        {text}
      </text>
      <text x={x} y={y} fill={`url(#${id}silver)`}>
        {text}
      </text>
    </g>
  );
  return (
    <svg width={width} height={Math.round((width * H) / W)} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ display: 'block' }}>
      <defs>
        <clipPath id={`${id}clip`}>
          <rect width={W} height={H} rx={CARD_R} />
        </clipPath>
        <linearGradient id={`${id}base`} x1='0' y1='0' x2='1' y2='0.8'>
          <stop offset='0' stopColor='#4F8E70' />
          <stop offset='0.45' stopColor='#2B604B' />
          <stop offset='1' stopColor='#173B30' />
        </linearGradient>
        <linearGradient id={`${id}sky`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#9CC9B4' stopOpacity='0' />
          <stop offset='1' stopColor='#9CC9B4' stopOpacity='0.28' />
        </linearGradient>
        <linearGradient id={`${id}silver`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#F7F5EE' />
          <stop offset='0.55' stopColor='#C4C2B9' />
          <stop offset='1' stopColor='#E2E0D8' />
        </linearGradient>
        <linearGradient id={`${id}holo`} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#D9E4EA' />
          <stop offset='0.25' stopColor='#E9D9E8' />
          <stop offset='0.5' stopColor='#DCEBD6' />
          <stop offset='0.75' stopColor='#EDE3C9' />
          <stop offset='1' stopColor='#CFDDEA' />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect width={W} height={H} fill={`url(#${id}base)`} />
        {/* A stock scenic: the mountain and the firs every 2010s card had */}
        <path d='M250 540 L430 352 L492 300 L530 262 L556 246 L580 258 L612 290 L676 350 L880 540 Z' fill={`url(#${id}sky)`} />
        <path d='M492 300 L530 262 L556 246 L580 258 L612 290 L596 298 L582 286 L568 304 L554 288 L538 306 L522 296 L506 310 Z' fill='#fff' fillOpacity='0.3' />
        <path
          d='M380 540 l26-70 26 70 z M420 540 l20-52 20 52 z M640 540 l30-84 30 84 z M690 540 l22-58 22 58 z M730 540 l28-76 28 76 z M780 540 l18-48 18 48 z M800 540 l26-68 26 68z'
          fill='#0F2C22'
          fillOpacity='0.5'
        />
        <path d='M0 300 C 240 210 520 200 860 70 L860 0 L0 0 Z' fill='#fff' fillOpacity='0.07' />
        <path d='M0 330 C 260 250 560 230 860 110' stroke='#fff' strokeOpacity='0.18' strokeWidth='3' fill='none' />
        {/* Logo */}
        <circle cx='80' cy='80' r='30' fill='none' stroke='#F2EFE6' strokeWidth='3' />
        <path d='M80 58 l14 20 h-7 l11 15 h-11 v7 h-14 v-7 h-11 l11 -15 h-7 z' fill='#F2EFE6' />
        <text x='126' y='86' fill='#F2EFE6' fontFamily="'Newsreader', Georgia, serif" fontSize='38' fontWeight='600' letterSpacing='6'>
          ALDER
        </text>
        <text x='128' y='110' fill='#F2EFE6' fillOpacity='0.85' fontFamily="'Newsreader', Georgia, serif" fontSize='15' fontWeight='500' letterSpacing='5.2'>
          CREDIT UNION
        </text>
        <text x='800' y='90' fill='#F2EFE6' fontFamily="'Newsreader', Georgia, serif" fontStyle='italic' fontSize='40' fontWeight='600' textAnchor='end'>
          Debit
        </text>
        <Chip x={84} y={180} w={118} h={88} id={id} />
        {emboss(78, 372, 52, card.number.join(' '), 3.5)}
        <text x='80' y='404' fill='#F2EFE6' fillOpacity='0.75' fontFamily={mono} fontSize='17'>
          {card.number[0]}
        </text>
        <text fill='#F2EFE6' fillOpacity='0.75' fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize='11' fontWeight='700' letterSpacing='0.6'>
          <tspan x='324' y='428'>VALID</tspan>
          <tspan x='324' y='442'>THRU</tspan>
        </text>
        {emboss(370, 444, 34, '08/24', 3)}
        {emboss(78, 500, 36, 'JUNE M HALVORSEN', 3)}
        <rect x='708' y='420' width='104' height='68' rx='8' fill={`url(#${id}holo)`} />
        <path d='M716 470 L804 432 M716 486 L812 446 M740 488 L812 458' stroke='#fff' strokeOpacity='0.55' strokeWidth='2' />
        <g transform='translate(760 476) scale(0.36) rotate(10)'>
          <path d={markLeaf.outline} fill='none' stroke='#6A7F86' strokeWidth='5' />
        </g>
        <Sheen id={id} w={W} h={H} r={CARD_R} />
      </g>
    </svg>
  );
}

// ── Frost: ferns that grow in from every edge, like a car window at 6 am ──
const frost = (() => {
  const rand = rng(1934);
  const main: string[] = [];
  const sub: string[] = [];
  const twig: string[] = [];
  const W = CARD_W;
  const H = CARD_H;
  const seeds: [number, number, number, number][] = [];
  const jitter = () => (rand() - 0.5) * 0.8;
  for (let i = 0; i < 4; i++) seeds.push([60 + (i + rand()) * 105, -4, Math.PI / 2 + jitter(), 110 + rand() * 90]);
  for (let i = 0; i < 5; i++) seeds.push([40 + (i + rand()) * 92, H + 4, -Math.PI / 2 + jitter(), 150 + rand() * 150]);
  for (let i = 0; i < 5; i++) seeds.push([-4, 90 + (i + rand()) * 140, jitter(), 90 + rand() * 90]);
  for (let i = 0; i < 5; i++) seeds.push([W + 4, 90 + (i + rand()) * 140, Math.PI + jitter(), 90 + rand() * 90]);
  seeds.push([0, 0, Math.PI / 4, 190], [W, 0, (3 * Math.PI) / 4, 170], [0, H, -Math.PI / 4, 240], [W, H, (-3 * Math.PI) / 4, 230]);

  const line = (x: number, y: number, ang: number, len: number) =>
    `M${r1(x)} ${r1(y)}L${r1(x + len * Math.cos(ang))} ${r1(y + len * Math.sin(ang))}`;

  function branch(x: number, y: number, ang: number, len: number, depth: number) {
    const step = 12;
    const n = Math.max(2, Math.round(len / step));
    let px = x;
    let py = y;
    let an = ang;
    let d = `M${r1(px)} ${r1(py)}`;
    for (let i = 1; i <= n; i++) {
      an += (rand() - 0.5) * 0.2;
      px += step * Math.cos(an);
      py += step * Math.sin(an);
      d += `L${r1(px)} ${r1(py)}`;
      if (i >= n - 1) continue;
      const rest = (n - i) * step;
      for (const k of [-1, 1]) {
        if (depth === 2 && i % 2 === 0 && rand() < 0.9) {
          branch(px, py, an + k * (0.95 + rand() * 0.2), rest * (0.34 + rand() * 0.2), 1);
        } else if (depth === 1 && rand() < 0.75) {
          twig.push(line(px, py, an + k * 1.05, Math.min(16, rest * 0.5)));
        }
      }
    }
    (depth === 2 ? main : sub).push(d);
  }
  for (const [x, y, ang, len] of seeds) branch(x, y, ang, len, 2);
  return { main: main.join(''), sub: sub.join(''), twig: twig.join('') };
})();

/**
 * Frost over the card art. `on` grows it up from the bottom edge, where
 * the Freeze button is; turning it off melts it back the same way.
 */
export function Frost({ on, width, label = 'Frozen' }: { on: boolean; width: number; label?: string }) {
  const s = width / 176;
  const clip = on ? 'circle(150% at 50% 108%)' : 'circle(0% at 50% 108%)';
  const layer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: cardRadius(width),
    clipPath: clip,
    WebkitClipPath: clip,
    transition: 'clip-path 760ms cubic-bezier(.25,.8,.25,1), -webkit-clip-path 760ms cubic-bezier(.25,.8,.25,1)'
  };
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          ...layer,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 46%, rgba(214,233,241,0.32) 0%, rgba(206,228,238,0.58) 58%, rgba(238,247,250,0.9) 100%)',
          backdropFilter: 'blur(2px) saturate(0.55) brightness(1.1)',
          WebkitBackdropFilter: 'blur(2px) saturate(0.55) brightness(1.1)',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.7)'
        }}
      />
      <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} style={{ ...layer, width: '100%', height: '100%', display: 'block' }}>
        <path d={frost.twig} stroke='#fff' strokeOpacity='0.5' strokeWidth='1.3' strokeLinecap='round' fill='none' />
        <path d={frost.sub} stroke='#fff' strokeOpacity='0.66' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' fill='none' />
        <path d={frost.main} stroke='#fff' strokeOpacity='0.85' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8 * s,
          opacity: on ? 1 : 0,
          transform: on ? 'none' : 'scale(0.9)',
          transition: on ? 'opacity 320ms 380ms, transform 420ms 380ms cubic-bezier(.3,1.4,.5,1)' : 'opacity 160ms, transform 160ms'
        }}
      >
        <span
          style={{
            width: 58 * s,
            height: 58 * s,
            borderRadius: 29 * s,
            background: 'rgba(255,255,255,0.86)',
            boxShadow: '0 4px 14px -4px rgba(31,87,112,0.35)',
            display: 'grid',
            placeItems: 'center',
            color: a.frostInk
          }}
        >
          <svg width={30 * s} height={30 * s} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
            <FlakePath />
          </svg>
        </span>
        <span
          style={{
            fontFamily: a.font,
            fontSize: 13.5 * s,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: a.frostInk,
            background: 'rgba(255,255,255,0.86)',
            padding: `${3 * s}px ${10 * s}px`,
            borderRadius: 20 * s
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function FlakePath() {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i - Math.PI / 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    if (i < 3) d += `M${r1(12 - 9 * c)} ${r1(12 - 9 * s)}L${r1(12 + 9 * c)} ${r1(12 + 9 * s)}`;
    const bx = 12 + 5.4 * c;
    const by = 12 + 5.4 * s;
    for (const k of [-1, 1]) {
      const b = ang + k * 0.8;
      d += `M${r1(bx)} ${r1(by)}L${r1(bx + 3.1 * Math.cos(b))} ${r1(by + 3.1 * Math.sin(b))}`;
    }
  }
  return <path d={d} />;
}

/** A soft, lit surface for card stills. */
export function Lit({ children, background = a.paper, style }: { children: ReactNode; background?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: `radial-gradient(ellipse 60% 70% at 50% 38%, #F4F1E9 0%, ${background} 58%, #D9D4C4 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Drop shadow for a card lying on paper, lit from the upper left. */
export const cardShadow =
  '0 2px 3px rgba(20,36,27,0.22), 0 18px 30px -14px rgba(20,36,27,0.4), 0 50px 90px -30px rgba(20,36,27,0.45)';
