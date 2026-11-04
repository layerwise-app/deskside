import type { CSSProperties } from 'react';
import { monthLengths, monthNames, doy, TODAY } from './data';
import { ink, m, type InkId } from './theme';

type YearProps = {
  data: (InkId | null)[];
  /** `rows`: one month per row, days across. `cols`: one month per column. */
  orient: 'rows' | 'cols';
  pitchX: number;
  pitchY: number;
  r: number;
  /** Space for month labels: left of the rows, or above the columns. */
  gutter?: number;
  labels?: 'initial' | 'short' | 'none';
  labelSize?: number;
  /** Day numbers down the left side, for `cols`. */
  dayGutter?: number;
  /** Ring today in red pencil. */
  today?: boolean;
  /** Ring one day in ink, as if tapped. */
  selected?: number;
  /** Days circled by hand in red pencil. */
  circled?: number[];
  /** Today's dot was just saved: give it the class the demo animates. */
  fresh?: boolean;
  /** Fill today with this color when it has an entry but no mood ink. */
  todayFill?: string;
  style?: CSSProperties;
  title?: string;
};

/**
 * The year as 365 dots. Written days print in their mood ink; days without
 * an entry stay a pinprick of paper, and nothing marks them as missed.
 */
export function DotYear({
  data,
  orient,
  pitchX,
  pitchY,
  r,
  gutter = 0,
  labels = 'none',
  labelSize = 11,
  dayGutter = 0,
  today = true,
  selected,
  circled = [],
  fresh = false,
  todayFill,
  style,
  title
}: YearProps) {
  const rows = orient === 'rows';
  const width = rows ? gutter + 31 * pitchX : dayGutter + 12 * pitchX;
  const height = rows ? 12 * pitchY : gutter + 31 * pitchY;
  const pos = (month: number, day: number) =>
    rows
      ? { cx: gutter + (day - 1) * pitchX + pitchX / 2, cy: month * pitchY + pitchY / 2 }
      : { cx: dayGutter + month * pitchX + pitchX / 2, cy: gutter + (day - 1) * pitchY + pitchY / 2 };
  const pin = Math.max(1.1, r * 0.3);
  const dots = [];
  let todayPos = { cx: 0, cy: 0 };
  let selectedPos: { cx: number; cy: number } | null = null;
  const circles: { cx: number; cy: number; d: number }[] = [];
  for (let mo = 0; mo < 12; mo++) {
    for (let day = 1; day <= monthLengths[mo]; day++) {
      const i = doy(mo, day);
      const p = pos(mo, day);
      const v = data[i];
      if (i === TODAY) todayPos = p;
      if (i === selected) selectedPos = p;
      if (circled.includes(i)) circles.push({ ...p, d: i });
      const fill = v ? ink(v).color : i === TODAY ? todayFill : undefined;
      if (fill) {
        dots.push(
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={r}
            fill={fill}
            className={fresh && i === TODAY ? 'mg-drop' : undefined}
          />
        );
      } else {
        dots.push(<circle key={i} cx={p.cx} cy={p.cy} r={pin} fill={i < TODAY ? m.gap : m.future} />);
      }
    }
  }
  const short = (name: string) => (labels === 'initial' ? name[0] : name.slice(0, 3));
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      {labels !== 'none' &&
        monthNames.map((name, mo) => {
          const p = pos(mo, 1);
          return rows ? (
            <text
              key={name}
              x={0}
              y={p.cy}
              dominantBaseline='central'
              fontSize={labelSize}
              fontFamily={m.font}
              fontStyle='italic'
              fill={m.soft}
            >
              {short(name)}
            </text>
          ) : (
            <text
              key={name}
              x={p.cx}
              y={gutter / 2}
              dominantBaseline='central'
              textAnchor='middle'
              fontSize={labelSize}
              fontFamily={m.font}
              fontStyle='italic'
              fill={m.soft}
            >
              {short(name)}
            </text>
          );
        })}
      {!rows &&
        dayGutter > 0 &&
        [1, 10, 20, 31].map((day) => (
          <text
            key={day}
            x={0}
            y={pos(0, day).cy}
            dominantBaseline='central'
            fontSize={labelSize - 1}
            fontFamily={m.font}
            fill={m.faint}
          >
            {day}
          </text>
        ))}
      {dots}
      {fresh && (
        <circle className='mg-bloom' cx={todayPos.cx} cy={todayPos.cy} r={r * 2.4} fill='none' stroke={data[TODAY] ? ink(data[TODAY]!).color : (todayFill ?? m.pencil)} strokeWidth={1.6} opacity={0} />
      )}
      {today && (
        <circle cx={todayPos.cx} cy={todayPos.cy} r={r + Math.max(2.5, r * 0.45)} fill='none' stroke={m.pencil} strokeWidth={Math.max(1.3, r * 0.16)} />
      )}
      {selectedPos && (
        <circle cx={selectedPos.cx} cy={selectedPos.cy} r={r + Math.max(2.5, r * 0.45)} fill='none' stroke={m.ink} strokeWidth={1.5} />
      )}
      {circles.map((c) => (
        <path key={c.d} d={handLoop(c.cx, c.cy, r * 1.85, c.d)} fill='none' stroke={m.pencil} strokeWidth={Math.max(1.4, r * 0.13)} strokeLinecap='round' strokeLinejoin='round' />
      ))}
    </svg>
  );
}

/** A loose pencil loop around a point, slightly overshooting where it closes. */
export function handLoop(cx: number, cy: number, R: number, seed: number) {
  const pts: string[] = [];
  const start = -2.2 + (seed % 7) * 0.13;
  const steps = 44;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const a = start + t * Math.PI * 2.18;
    const k = 1 + 0.07 * Math.sin(t * Math.PI * 3 + seed) + t * 0.08;
    const x = cx + Math.cos(a) * R * 1.12 * k;
    const y = cy + Math.sin(a) * R * 0.92 * k;
    pts.push(`${s === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}
