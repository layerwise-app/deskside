import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { fmtDelta, fmtRatio } from './color';
import { type Analysis, type Candidate, type Stray, type Token } from './data';
import { Arrow, Badge, Check, Mark, mono, p, Swatch } from './theme';

/** Props passed through to a row when it is rendered as a real button. */
export type ItemProps = HTMLAttributes<HTMLElement> & {
  type?: 'button';
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/** Plugin panel chrome: header, optional tabs, scrolling body, footer. */
export function PanelShell({
  tab,
  scope,
  children,
  footer,
  width = 320,
  height,
  floating,
  className,
  style
}: {
  className?: string;
  tab?: 'Audit' | 'Clusters' | 'Fix' | 'Log' | 'Settings';
  scope?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  height?: number | string;
  floating?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        boxSizing: 'border-box',
        background: p.white,
        color: p.ink,
        fontFamily: p.ui,
        fontSize: 12,
        lineHeight: 1.35,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        ...(floating
          ? {
              borderRadius: 12,
              boxShadow: '0 0 0 1px rgba(21,23,26,0.10), 0 2px 4px rgba(21,23,26,0.06), 0 24px 48px -16px rgba(21,23,26,0.28)'
            }
          : {}),
        ...style
      }}
    >
      <div
        style={{
          height: 44,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          borderBottom: tab ? 'none' : `1px solid ${p.line}`
        }}
      >
        <Mark />
        <span style={{ fontSize: 13, fontWeight: 650, letterSpacing: '-0.005em' }}>Swatchbook</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: p.soft, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {scope}
        </span>
      </div>
      {tab && <Tabs active={tab} />}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{children}</div>
      {footer && (
        <div
          style={{
            flex: 'none',
            borderTop: `1px solid ${p.line}`,
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: p.white
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function Tabs({ active }: { active: string }) {
  const tabs = ['Audit', 'Clusters', 'Fix', 'Log'];
  return (
    <div
      style={{
        height: 32,
        flex: 'none',
        display: 'flex',
        alignItems: 'stretch',
        gap: 2,
        padding: '0 8px',
        borderBottom: `1px solid ${p.line}`,
        fontSize: 12
      }}
    >
      {tabs.map((t) => (
        <span
          key={t}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            fontWeight: t === active ? 650 : 500,
            color: t === active ? p.ink : p.soft,
            boxShadow: t === active ? `inset 0 -2px 0 ${p.ink}` : 'none'
          }}
        >
          {t}
        </span>
      ))}
      <span
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          color: active === 'Settings' ? p.ink : p.soft,
          boxShadow: active === 'Settings' ? `inset 0 -2px 0 ${p.ink}` : 'none'
        }}
      >
        <Gear />
      </span>
    </div>
  );
}

export function Gear({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' aria-hidden>
      <circle cx='8' cy='8' r='2.2' stroke='currentColor' strokeWidth='1.6' />
      <path
        d='M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
      />
    </svg>
  );
}

const verdictOf = (pass: boolean, min: number) => (min === 0 ? 'none' : pass ? 'pass' : 'fail');

/** One stray in the list. Pass `as='button'` plus handlers to make it interactive. */
export function StrayItem({
  a,
  fixedTo,
  selected,
  as = 'div',
  props
}: {
  a: Analysis;
  fixedTo?: Token | null;
  selected?: boolean;
  as?: 'div' | 'button';
  props?: ItemProps;
}) {
  const Tag = as;
  const s = a.stray;
  return (
    <Tag
      {...(props as object)}
      data-fixed={fixedTo ? 'true' : undefined}
      className='swb-stray'
      style={{
        border: 'none',
        margin: 0,
        fontSize: 12,
        boxSizing: 'border-box',
        width: '100%',
        height: 38,
        padding: '0 12px',
        display: 'grid',
        gridTemplateColumns: '16px minmax(0, 1fr) auto',
        alignItems: 'center',
        columnGap: 10,
        background: selected ? '#EEF3FF' : 'transparent',
        boxShadow: selected ? `inset 2px 0 0 ${p.accent}` : 'none',
        cursor: as === 'button' ? 'pointer' : undefined,
        fontFamily: p.ui,
        color: p.ink,
        textAlign: 'left'
      }}
    >
      <Swatch hex={fixedTo ? fixedTo.hex : s.hex} />
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span className='swb-stray-hex' style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          <span style={mono(12, fixedTo ? { color: p.faint, textDecoration: 'line-through' } : { fontWeight: 500 })}>
            {s.hex}
          </span>
          {fixedTo && (
            <>
              <Arrow size={11} color={p.faint} />
              <span style={mono(12, { fontWeight: 600 })}>{fixedTo.name}</span>
            </>
          )}
        </span>
        <span className='swb-stray-label' style={{ fontSize: 11.5, color: p.soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.label} · {s.layers} {s.layers === 1 ? 'layer' : 'layers'}
        </span>
      </span>
      <span className='swb-stray-status' style={{ display: 'flex', alignItems: 'center' }}>
        {fixedTo ? (
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: p.pass,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Check size={11} color='#fff' width={2.2} />
          </span>
        ) : (
          <Badge verdict={verdictOf(a.pass, a.min)}>
            {a.min === 0 ? 'n/a' : <span style={mono(10.5)}>{a.ratio.toFixed(2)}</span>}
          </Badge>
        )}
      </span>
    </Tag>
  );
}

/** Column headings over the candidate list. */
export function CandidateHead() {
  return (
    <div
      className='swb-cand-head'
      style={{
        display: 'grid',
        gridTemplateColumns: '14px 20px minmax(0,1fr) 30px 46px 46px',
        columnGap: 6,
        padding: '0 12px',
        height: 20,
        alignItems: 'center',
        fontSize: 10.5,
        color: p.soft,
        fontWeight: 500
      }}
    >
      <span />
      <span />
      <span>Token</span>
      <span style={{ textAlign: 'right' }}>ΔE</span>
      <span style={{ textAlign: 'right' }}>Contrast</span>
      <span />
    </div>
  );
}

/** One suggested token. `tag` marks the nearest and the suggestion. */
export function CandidateItem({
  c,
  min,
  tag,
  checked,
  disabled,
  as = 'div',
  props
}: {
  c: Candidate;
  min: number;
  tag?: 'Nearest' | 'Suggested' | 'Applied';
  checked?: boolean;
  disabled?: boolean;
  as?: 'div' | 'button';
  props?: ItemProps;
}) {
  const Tag = as;
  const v = verdictOf(c.pass, min);
  return (
    <Tag
      {...(props as object)}
      className='swb-cand'
      style={{
        border: 'none',
        margin: 0,
        fontSize: 12,
        boxSizing: 'border-box',
        width: '100%',
        height: 44,
        padding: '0 12px',
        display: 'grid',
        gridTemplateColumns: '14px 20px minmax(0,1fr) 30px 46px 46px',
        columnGap: 6,
        alignItems: 'center',
        background: checked ? '#F5F8FF' : 'transparent',
        cursor: as === 'button' ? (disabled ? 'not-allowed' : 'pointer') : undefined,
        fontFamily: p.ui,
        color: p.ink,
        textAlign: 'left'
      }}
    >
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          boxSizing: 'border-box',
          border: `1.5px solid ${checked ? p.accent : disabled ? '#C9CDD3' : '#9AA0A8'}`,
          display: 'grid',
          placeItems: 'center',
          background: disabled ? p.panel : p.white
        }}
      >
        {checked && <span style={{ width: 6, height: 6, borderRadius: 3, background: p.accent }} />}
      </span>
      <Swatch hex={c.token.hex} size={20} radius={5} />
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: disabled ? p.soft : p.ink }}>{c.token.name}</span>
          {tag && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 650,
                color: tag === 'Nearest' ? p.soft : p.accentText,
                background: tag === 'Nearest' ? p.panel : p.accentSoft,
                borderRadius: 3,
                padding: '1px 3px',
                lineHeight: '13px'
              }}
            >
              {tag}
            </span>
          )}
        </span>
        <span style={mono(11, { color: p.soft })}>{c.token.hex}</span>
      </span>
      <span style={mono(11.5, { textAlign: 'right', color: p.ink })}>{fmtDelta(c.dE)}</span>
      <span style={mono(11.5, { textAlign: 'right', color: min === 0 ? p.faint : p.ink })}>{fmtRatio(c.ratio)}</span>
      <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Badge verdict={v} />
      </span>
    </Tag>
  );
}

export function tagFor(a: Analysis, c: Candidate): 'Nearest' | 'Suggested' | undefined {
  if (c === a.suggested) return 'Suggested';
  if (c === a.nearest) return 'Nearest';
  return undefined;
}

/** "Replace #6E7A87" heading with the contrast rule that applies. */
export function FixHeading({ s, children }: { s: Stray; children?: ReactNode }) {
  return (
    <div style={{ padding: '10px 12px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 650 }}>
        Replace <span style={mono(12, { fontWeight: 600 })}>{s.hex}</span>
        <span style={{ fontWeight: 500, color: p.soft }}>· {s.label}</span>
      </div>
      <div style={{ fontSize: 11.5, color: p.soft, marginTop: 2 }}>{children}</div>
    </div>
  );
}
