import { t } from './theme';

/** Small seeded generator so the pattern is identical on every render. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const N = 27;

/**
 * Cascadia Rail's boarding mark: an invented 2D pattern of rounded modules
 * framed by corner brackets, with the rail mark in the middle. It has no QR
 * finder squares or timing lines, so no reader will try to decode it.
 */
export function TicketCode({ size = 280, seed = 'HX4-27Q', ink = t.ink }: { size?: number; seed?: string; ink?: string }) {
  const rand = mulberry32(hash(seed));
  const cells: [number, number][] = [];
  const mid = (N - 1) / 2;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const nearCorner = (x < 5 || x > N - 6) && (y < 5 || y > N - 6);
      const inCenter = Math.abs(x - mid) <= 3 && Math.abs(y - mid) <= 3;
      if (nearCorner || inCenter) {
        rand();
        continue;
      }
      if (rand() < 0.47) cells.push([x, y]);
    }
  }
  const m = 1;
  const bracket = (x: number, y: number, dx: number, dy: number) =>
    `M${x + dx * 4} ${y} H${x} V${y + dy * 4}`;
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} aria-hidden style={{ display: 'block' }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={m - 0.16} height={m - 0.16} rx={0.3} fill={ink} />
      ))}
      <g fill='none' stroke={ink} strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'>
        <path d={bracket(0.75, 0.75, 1, 1)} />
        <path d={bracket(N - 0.75, 0.75, -1, 1)} />
        <path d={bracket(0.75, N - 0.75, 1, -1)} />
        <path d={bracket(N - 0.75, N - 0.75, -1, -1)} />
      </g>
      <rect x={2.6} y={2.6} width={1.8} height={1.8} rx={0.5} fill={ink} />
      <rect x={N - 4.4} y={N - 4.4} width={1.8} height={1.8} rx={0.5} fill={ink} />
      {/* Center: the rail mark */}
      <g transform={`translate(${mid - 2.9} ${mid - 2.9})`}>
        <rect width={6.8} height={6.8} rx={1.8} fill={ink} />
        <path d='M4.81 1.71A2.2 2.2 0 1 0 4.81 5.09' fill='none' stroke={t.yellow} strokeWidth={0.65} strokeLinecap='round' />
        <path d='M2.9 2.95h3.1M2.9 3.85h3.1' stroke='#fff' strokeWidth={0.38} strokeLinecap='round' />
      </g>
    </svg>
  );
}
