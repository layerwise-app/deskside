import type { CSSProperties, ReactNode } from 'react';
import type { ShowId } from './data';
import { t } from './theme';

/**
 * Show artwork for the Long Wave network, drawn in SVG so the screens never
 * rely on stock images. Each show has one motif and its name set in Fraunces.
 */
export function ShowArt({
  show,
  size,
  radius = 10,
  title = true,
  style
}: {
  show: ShowId;
  size: number;
  radius?: number;
  /** Small thumbnails drop the wordmark. */
  title?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        flex: 'none',
        boxShadow: 'inset 0 0 0 1px rgba(243,233,215,0.08)',
        position: 'relative',
        ...style
      }}
    >
      <svg viewBox='0 0 100 100' width={size} height={size} style={{ display: 'block' }}>
        {art[show]}
        {title && <Wordmark show={show} />}
      </svg>
    </div>
  );
}

const names: Record<ShowId, { name: string[]; ink: string }> = {
  workbench: { name: ['Workbench'], ink: t.paper },
  table: { name: ['The Long', 'Table'], ink: '#FBEFDC' },
  draft: { name: ['Second', 'Draft'], ink: '#1E1B17' },
  night: { name: ['Night', 'Shift'], ink: t.paper },
  tide: { name: ['Low Tide'], ink: '#141A22' }
};

function Wordmark({ show }: { show: ShowId }) {
  const { name, ink } = names[show];
  const size = name.length > 1 ? 13 : 14;
  return (
    <g fill={ink} style={{ fontFamily: t.serif }}>
      {name.map((line, i) => (
        <text
          key={line}
          x='8'
          y={92 - (name.length - 1 - i) * (size + 1)}
          fontSize={size}
          fontWeight={560}
          letterSpacing='-0.4'
        >
          {line}
        </text>
      ))}
      <text x='92' y='13' fontSize='5.2' textAnchor='end' fontWeight={600} letterSpacing='0.9' style={{ fontFamily: t.sans }}>
        LONG WAVE
      </text>
    </g>
  );
}

/** A body plan: the boat's cross-sections, the drawing a builder lofts. */
function BodyPlan() {
  const stations = [0, 1, 2, 3, 4, 5];
  return (
    <g fill='none' strokeLinecap='round'>
      {stations.map((i) => {
        const w = 10 + i * 5.2;
        const d = 20 + i * 3.2;
        const top = 22;
        return (
          <path
            key={i}
            d={`M${50 - w} ${top} C ${50 - w} ${top + d * 0.7}, ${50 - w * 0.35} ${top + d}, 50 ${top + d} C ${50 + w * 0.35} ${top + d}, ${50 + w} ${top + d * 0.7}, ${50 + w} ${top}`}
            stroke={i === 4 ? t.amber : 'rgba(243,233,215,0.7)'}
            strokeWidth={i === 4 ? 1.6 : 0.9}
          />
        );
      })}
      <path d='M14 22h72' stroke='rgba(243,233,215,0.45)' strokeWidth='0.8' />
      <path d='M50 16v46' stroke='rgba(243,233,215,0.45)' strokeWidth='0.8' strokeDasharray='2 2' />
      {[30, 38, 46].map((y) => (
        <path key={y} d={`M18 ${y}h64`} stroke='rgba(243,233,215,0.16)' strokeWidth='0.6' />
      ))}
    </g>
  );
}

const art: Record<ShowId, ReactNode> = {
  workbench: (
    <>
      <rect width='100' height='100' fill='#2F4553' />
      <BodyPlan />
    </>
  ),
  table: (
    <>
      <rect width='100' height='100' fill='#A9503A' />
      <rect y='58' width='100' height='42' fill='#8E4130' />
      <ellipse cx='50' cy='58' rx='30' ry='9' fill='#F0DDBF' />
      <ellipse cx='50' cy='58' rx='19' ry='5.6' fill='none' stroke='#C9A57E' strokeWidth='0.8' />
      <path d='M14 58h4M82 58h4' stroke='#F0DDBF' strokeWidth='1.2' strokeLinecap='round' />
      <path d='M28 30c4-8 9-10 14-9M58 22c5 1 9 4 11 10' stroke='#F0DDBF' strokeWidth='1' fill='none' strokeLinecap='round' opacity='0.6' />
    </>
  ),
  draft: (
    <>
      <rect width='100' height='100' fill='#EADCC3' />
      {[18, 26, 34, 42, 50, 58].map((y, i) => (
        <g key={y}>
          <rect x='10' y={y} width={[74, 62, 70, 48, 66, 40][i]} height='3.2' rx='1.6' fill='#1E1B17' opacity={i === 2 || i === 4 ? 0.25 : 0.82} />
          {(i === 2 || i === 4) && <path d={`M8 ${y + 1.6}h${[74, 62, 70, 48, 66, 40][i] + 4}`} stroke={t.amberDeep} strokeWidth='1.4' />}
        </g>
      ))}
    </>
  ),
  night: (
    <>
      <rect width='100' height='100' fill='#1D2536' />
      <circle cx='74' cy='26' r='9' fill='#EFE3CC' />
      <circle cx='78.5' cy='23' r='8' fill='#1D2536' />
      <path d='M0 70 L18 52 L36 70 L54 52 L72 70 L90 52 L100 62 V100 H0Z' fill='none' stroke='rgba(243,233,215,0.35)' strokeWidth='1' />
      <path d='M0 70h100' stroke='rgba(243,233,215,0.5)' strokeWidth='1.2' />
      {[12, 30, 48, 66, 84].map((x, i) => (
        <rect key={x} x={x} y='40' width='4' height='6' fill={i === 1 || i === 3 ? t.amber : 'rgba(243,233,215,0.18)'} />
      ))}
    </>
  ),
  tide: (
    <>
      <rect width='100' height='100' fill='#8D9CAD' />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M-5 ${20 + i * 8} C 15 ${14 + i * 8}, 30 ${27 + i * 8}, 50 ${20 + i * 8} S 85 ${14 + i * 8}, 105 ${21 + i * 8}`}
          fill='none'
          stroke='#141A22'
          strokeWidth='0.9'
          opacity={0.25 + i * 0.08}
        />
      ))}
      <circle cx='70' cy='36' r='3' fill={t.amber} />
    </>
  )
};
