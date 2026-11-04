import type { CSSProperties, ReactNode } from 'react';

/**
 * Swatchbook's own chrome. Plugin UI follows design-tool conventions: system
 * UI type at 11–13px, monospace for values. Screens never use site tokens.
 */
export const p = {
  white: '#FFFFFF',
  panel: '#F3F4F6',
  line: '#E5E7EB',
  lineStrong: '#D3D7DD',
  ink: '#15171A',
  soft: '#5B616B',
  faint: '#8A9099',
  accent: '#2E6BFF',
  accentText: '#2457D6',
  accentSoft: '#E8EFFF',
  pass: '#12A150',
  passText: '#0B7A3E',
  passSoft: '#E3F5EA',
  fail: '#D93F2B',
  failText: '#B3311F',
  failSoft: '#FCE9E6',
  canvas: '#E9ECF1',
  ui: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"
};

/** The host app (a generic, fictional vector editor) around the plugin. */
export const host = {
  chrome: '#FAFAFB',
  bar: '#FFFFFF',
  line: '#E3E5E8',
  canvas: '#EEF0F3',
  ink: '#1E2024',
  soft: '#6A6F78',
  select: '#2E6BFF'
};

export const mono = (size = 11.5, extra?: CSSProperties): CSSProperties => ({
  fontFamily: p.mono,
  fontSize: size,
  letterSpacing: '-0.01em',
  fontVariantNumeric: 'tabular-nums',
  ...extra
});

/** A color chip with a hairline so pale colors still have an edge. */
export function Swatch({
  hex,
  size = 16,
  radius = 4,
  style
}: {
  hex: string;
  size?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: radius,
        background: hex,
        boxShadow: 'inset 0 0 0 1px rgba(21,23,26,0.14)',
        display: 'inline-block',
        ...style
      }}
    />
  );
}

export type Verdict = 'pass' | 'fail' | 'none';

export function Badge({ verdict, children }: { verdict: Verdict; children?: ReactNode }) {
  const tone =
    verdict === 'pass'
      ? { bg: p.passSoft, fg: p.passText, dot: p.pass }
      : verdict === 'fail'
        ? { bg: p.failSoft, fg: p.failText, dot: p.fail }
        : { bg: p.panel, fg: p.soft, dot: p.faint };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        height: 18,
        padding: '0 5px 0 4px',
        borderRadius: 4,
        background: tone.bg,
        color: tone.fg,
        fontSize: 10.5,
        fontWeight: 650,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        flex: 'none'
      }}
    >
      {verdict === 'pass' ? (
        <Check size={10} color={tone.dot} />
      ) : verdict === 'fail' ? (
        <Cross size={10} color={tone.dot} />
      ) : (
        <span style={{ width: 6, height: 2, borderRadius: 1, background: tone.dot }} />
      )}
      {children ?? (verdict === 'pass' ? 'Pass' : verdict === 'fail' ? 'Fail' : 'n/a')}
    </span>
  );
}

export function Check({ size = 12, color = 'currentColor', width = 2 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' aria-hidden style={{ flex: 'none' }}>
      <path d='m2.2 6.3 2.4 2.4 5.2-5.4' stroke={color} strokeWidth={width} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

export function Cross({ size = 12, color = 'currentColor', width = 2 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' aria-hidden style={{ flex: 'none' }}>
      <path d='m3 3 6 6M9 3 3 9' stroke={color} strokeWidth={width} strokeLinecap='round' />
    </svg>
  );
}

export function Arrow({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' aria-hidden style={{ flex: 'none' }}>
      <path d='M2 6h7.5M6.5 3 9.5 6l-3 3' stroke={color} strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

export function UndoGlyph({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 14 14' fill='none' aria-hidden style={{ flex: 'none' }}>
      <path d='M4.5 3 2 5.5 4.5 8' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M2.5 5.5h6a3.2 3.2 0 0 1 0 6.4H6' stroke={color} strokeWidth='1.8' strokeLinecap='round' />
    </svg>
  );
}

/** Swatchbook's mark: three fanned chips. */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' aria-hidden style={{ flex: 'none' }}>
      <rect x='3' y='4.5' width='7' height='12.5' rx='2' fill='#12A150' transform='rotate(-16 6.5 16)' />
      <rect x='6.5' y='3' width='7' height='13' rx='2' fill='#FFB020' transform='rotate(-2 10 16)' />
      <rect x='10' y='3.5' width='7' height='12.5' rx='2' fill={p.accent} transform='rotate(14 13.5 16)' />
      <circle cx='9.8' cy='15.2' r='1.3' fill='#fff' />
    </svg>
  );
}

/** Small section label used throughout the panel. */
export function Label({ children, right, style }: { children: ReactNode; right?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        height: 28,
        padding: '0 12px',
        fontSize: 11,
        fontWeight: 650,
        color: p.ink,
        ...style
      }}
    >
      <span>{children}</span>
      {right != null && <span style={{ fontWeight: 500, color: p.soft }}>{right}</span>}
    </div>
  );
}

/** A non-interactive button for stills. */
export function FakeButton({
  children,
  tone = 'primary',
  style
}: {
  children: ReactNode;
  tone?: 'primary' | 'secondary';
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        height: 30,
        padding: '0 12px',
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: tone === 'primary' ? p.accent : p.white,
        color: tone === 'primary' ? '#fff' : p.ink,
        boxShadow: tone === 'primary' ? 'none' : `inset 0 0 0 1px ${p.lineStrong}`,
        ...style
      }}
    >
      {children}
    </span>
  );
}
