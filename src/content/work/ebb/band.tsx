import { useId, type CSSProperties } from 'react';
import { t } from './theme';

/**
 * The Ebb band drawn as a short knit cylinder seen from slightly above, with
 * the anodized pod and its three LEDs on the front.
 */
export function Band({
  width = 480,
  leds = [true, false, false],
  ledColor = t.coral,
  hole = '#090A08',
  style
}: {
  width?: number;
  leds?: [boolean, boolean, boolean];
  ledColor?: string;
  /** What shows through the ring: the surface it rests on, in shadow. */
  hole?: string;
  style?: CSSProperties;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const R = 220;
  const r = 70;
  const h = 76;
  const th = 11;
  const thy = th * (r / R);
  const pad = 22;
  const vbW = (R + pad) * 2;
  const top = -r - 14;
  const vbH = r * 2 + h + 52;
  const yF = (x: number) => r * Math.sqrt(Math.max(0, 1 - (x * x) / (R * R)));

  // Pod outline, following the curve of the strap.
  const pw = 66;
  const rr = 13;
  const lift = 7;
  const yT = (x: number) => yF(x) - lift;
  const yB = (x: number) => yF(x) + h + lift;
  const curve = (x1: number, x2: number, f: (x: number) => number) => {
    const xm = (x1 + x2) / 2;
    const cy = 2 * f(xm) - (f(x1) + f(x2)) / 2;
    return `Q ${xm} ${cy} ${x2} ${f(x2)}`;
  };
  const pod = [
    `M ${-pw + rr} ${yT(-pw + rr)}`,
    curve(-pw + rr, pw - rr, yT),
    `Q ${pw} ${yT(pw)} ${pw} ${yT(pw) + rr}`,
    `L ${pw} ${yB(pw) - rr}`,
    `Q ${pw} ${yB(pw)} ${pw - rr} ${yB(pw - rr)}`,
    curve(pw - rr, -pw + rr, yB),
    `Q ${-pw} ${yB(-pw)} ${-pw} ${yB(-pw) - rr}`,
    `L ${-pw} ${yT(-pw) + rr}`,
    `Q ${-pw} ${yT(-pw)} ${-pw + rr} ${yT(-pw + rr)}`,
    'Z'
  ].join(' ');

  const front = `M ${-R} 0 A ${R} ${r} 0 0 0 ${R} 0 L ${R} ${h} A ${R} ${r} 0 0 1 ${-R} ${h} Z`;
  const ribs = Array.from({ length: 15 }, (_, i) => 6 + i * ((h - 10) / 14));
  const ledX = [-24, 0, 24];

  return (
    <svg
      width={width}
      height={(width * vbH) / vbW}
      viewBox={`${-R - pad} ${top} ${vbW} ${vbH}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-strap`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#7F887299' />
          <stop offset='0.04' stopColor='#9BA48D' />
          <stop offset='0.3' stopColor='#D3DAC6' />
          <stop offset='0.46' stopColor='#DCE2D0' />
          <stop offset='0.75' stopColor='#BFC7B1' />
          <stop offset='0.96' stopColor='#8D9680' />
          <stop offset='1' stopColor='#6E7663' />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.18' />
          <stop offset='0.25' stopColor='#ffffff' stopOpacity='0' />
          <stop offset='0.8' stopColor='#000000' stopOpacity='0.06' />
          <stop offset='1' stopColor='#000000' stopOpacity='0.22' />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#5E6655' />
          <stop offset='0.6' stopColor='#7B846F' />
          <stop offset='1' stopColor='#8E9781' />
        </linearGradient>
        <linearGradient id={`${id}-innerside`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#000' stopOpacity='0.32' />
          <stop offset='0.3' stopColor='#000' stopOpacity='0.08' />
          <stop offset='0.62' stopColor='#fff' stopOpacity='0.06' />
          <stop offset='0.9' stopColor='#000' stopOpacity='0.12' />
          <stop offset='1' stopColor='#000' stopOpacity='0.3' />
        </linearGradient>
        <linearGradient id={`${id}-pod`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#3A3F35' />
          <stop offset='0.18' stopColor='#23271F' />
          <stop offset='0.85' stopColor='#15170F' />
          <stop offset='1' stopColor='#0D0E0A' />
        </linearGradient>
        <linearGradient id={`${id}-podside`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#000' stopOpacity='0.45' />
          <stop offset='0.18' stopColor='#000' stopOpacity='0' />
          <stop offset='0.82' stopColor='#000' stopOpacity='0' />
          <stop offset='1' stopColor='#000' stopOpacity='0.5' />
        </linearGradient>
        <clipPath id={`${id}-front`}>
          <path d={front} />
        </clipPath>
        <clipPath id={`${id}-innerclip`}>
          <ellipse cx='0' cy='0' rx={R - th} ry={r - thy} />
        </clipPath>
        <filter id={`${id}-blur`} x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur stdDeviation='12' />
        </filter>
        <filter id={`${id}-glow`} x='-200%' y='-200%' width='500%' height='500%'>
          <feGaussianBlur stdDeviation='5' />
        </filter>
      </defs>

      {/* Contact shadow */}
      <ellipse cx='6' cy={h + 8} rx={R * 0.98} ry={r * 0.82} fill='#000' opacity='0.55' filter={`url(#${id}-blur)`} />

      {/* Top rim, inner wall, and the hole through the ring */}
      <ellipse cx='0' cy='0' rx={R} ry={r} fill='#E4E9DA' />
      <ellipse cx='0' cy='0' rx={R - th} ry={r - thy} fill={`url(#${id}-inner)`} />
      <g clipPath={`url(#${id}-innerclip)`}>
        {ribs.map((y) => (
          <path
            key={y}
            d={`M ${-(R - th)} ${y} A ${R - th} ${r - thy} 0 0 1 ${R - th} ${y}`}
            fill='none'
            stroke='#000'
            strokeOpacity='0.06'
            strokeWidth='1.4'
          />
        ))}
        <ellipse cx='0' cy='0' rx={R - th} ry={r - thy} fill={`url(#${id}-innerside)`} />
        <ellipse cx='0' cy={h} rx={R - th} ry={r - thy} fill={hole} />
        <ellipse cx='0' cy={h - 4} rx={R - th} ry={r - thy} fill='none' stroke='#000' strokeOpacity='0.35' strokeWidth='8' />
      </g>

      {/* Front of the strap */}
      <path d={front} fill={`url(#${id}-strap)`} />
      <g clipPath={`url(#${id}-front)`}>
        {ribs.map((y) => (
          <path
            key={y}
            d={`M ${-R} ${y} A ${R} ${r} 0 0 0 ${R} ${y}`}
            fill='none'
            stroke='#000'
            strokeOpacity='0.07'
            strokeWidth='1.6'
          />
        ))}
        <path d={front} fill={`url(#${id}-shade)`} />
      </g>
      <path d={`M ${-R} 0 A ${R} ${r} 0 0 0 ${R} 0`} fill='none' stroke='#F4F7EE' strokeOpacity='0.7' strokeWidth='1.4' />

      {/* Pod */}
      <path d={pod} transform='translate(2 4)' fill='#000' opacity='0.35' filter={`url(#${id}-glow)`} />
      <path d={pod} fill={`url(#${id}-pod)`} />
      <path d={pod} fill={`url(#${id}-podside)`} />
      <path d={pod} fill='none' stroke='#ffffff' strokeOpacity='0.12' strokeWidth='1' />
      <path
        d={`M ${-pw + rr} ${yT(-pw + rr) + 1} ${curve(-pw + rr, pw - rr, (x) => yT(x) + 1)}`}
        fill='none'
        stroke='#ffffff'
        strokeOpacity='0.28'
        strokeWidth='1'
      />

      {/* LEDs */}
      {ledX.map((x, i) => {
        const cy = yF(x) + h * 0.42;
        const on = leds[i];
        return (
          <g key={x}>
            {on && <circle cx={x} cy={cy} r='11' fill={ledColor} opacity='0.55' filter={`url(#${id}-glow)`} />}
            <circle cx={x} cy={cy} r='4.6' fill={on ? ledColor : '#1A1D16'} stroke={on ? '#ffffff' : '#ffffff'} strokeOpacity={on ? 0.5 : 0.08} strokeWidth='0.8' />
            {on && <circle cx={x - 1.2} cy={cy - 1.4} r='1.5' fill='#fff' opacity='0.7' />}
          </g>
        );
      })}
      <text
        x='0'
        y={yF(0) + h - 6}
        textAnchor='middle'
        fontFamily={t.font}
        fontSize='10.5'
        fontWeight='700'
        letterSpacing='2.5'
        fill='#ffffff'
        fillOpacity='0.2'
      >
        EBB
      </text>
    </svg>
  );
}

/** The underside of the pod: optical sensor window and charging pins. */
export function PodUnderside({ width = 220, style }: { width?: number; style?: CSSProperties }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg width={width} height={(width * 120) / 200} viewBox='0 0 200 120' style={{ display: 'block', overflow: 'visible', ...style }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-u`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#2A2E26' />
          <stop offset='1' stopColor='#161812' />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx='0.4' cy='0.35' r='0.7'>
          <stop offset='0' stopColor='#2C3A2E' />
          <stop offset='1' stopColor='#0B0E0A' />
        </radialGradient>
      </defs>
      <rect x='6' y='8' width='188' height='104' rx='30' fill={`url(#${id}-u)`} stroke='#ffffff' strokeOpacity='0.1' />
      <circle cx='100' cy='60' r='34' fill={`url(#${id}-lens)`} stroke='#ffffff' strokeOpacity='0.16' strokeWidth='1.2' />
      <circle cx='100' cy='60' r='26' fill='none' stroke='#ffffff' strokeOpacity='0.06' />
      {/* Two green emitters, four photodiodes */}
      <rect x='92' y='47' width='7' height='7' rx='1.2' fill='#5FD38A' opacity='0.85' />
      <rect x='101' y='66' width='7' height='7' rx='1.2' fill='#5FD38A' opacity='0.85' />
      {[
        [80, 52],
        [113, 52],
        [80, 66],
        [113, 66]
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width='8' height='6' rx='1' fill='#3B4A5A' stroke='#6B7E92' strokeOpacity='0.5' strokeWidth='0.6' />
      ))}
      <circle cx='38' cy='60' r='5.5' fill='#C9A963' stroke='#000' strokeOpacity='0.4' />
      <circle cx='162' cy='60' r='5.5' fill='#C9A963' stroke='#000' strokeOpacity='0.4' />
    </svg>
  );
}
