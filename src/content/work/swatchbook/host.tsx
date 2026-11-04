import type { CSSProperties, ReactNode } from 'react';
import { host, p } from './theme';

/**
 * A neutral, fictional vector editor around the plugin: a top bar, a pages
 * and layers sidebar, the canvas, and a docked plugin panel on the right.
 */
export function HostWindow({
  width = 1160,
  height = 720,
  page,
  layers,
  canvas,
  panel,
  zoom = '100%',
  style
}: {
  width?: number;
  height?: number;
  page: string;
  layers: ReactNode;
  canvas: ReactNode;
  panel?: ReactNode;
  zoom?: string;
  style?: CSSProperties;
}) {
  const pages = ['Flows', 'Components', 'Archive', 'Swatchbook changelog'];
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        background: host.chrome,
        boxShadow: '0 0 0 1px rgba(21,23,26,0.14), 0 2px 6px rgba(21,23,26,0.06), 0 40px 80px -32px rgba(21,23,26,0.35)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: p.ui,
        color: host.ink,
        fontSize: 12,
        WebkitFontSmoothing: 'antialiased',
        flex: 'none',
        ...style
      }}
    >
      <TopBar zoom={zoom} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div
          style={{
            width: 216,
            flex: 'none',
            background: host.bar,
            borderRight: `1px solid ${host.line}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <SideHead>Pages</SideHead>
          <div style={{ padding: '0 6px 8px' }}>
            {pages.map((name) => (
              <div
                key={name}
                style={{
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 8px',
                  borderRadius: 5,
                  background: name === page ? '#F1F2F4' : 'transparent',
                  fontWeight: name === page ? 600 : 400,
                  color: name === page ? host.ink : host.soft
                }}
              >
                <span style={{ width: 10, display: 'grid', placeItems: 'center' }}>
                  {name === page && (
                    <svg width='10' height='10' viewBox='0 0 10 10' aria-hidden>
                      <path d='m2 5.2 2 2 4-4.4' fill='none' stroke={host.ink} strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  )}
                </span>
                {name}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${host.line}` }} />
          <SideHead>Layers</SideHead>
          <div style={{ padding: '0 6px', flex: 1, overflow: 'hidden' }}>{layers}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden', background: host.canvas }}>{canvas}</div>
        {panel && (
          <div style={{ width: 320, flex: 'none', borderLeft: `1px solid ${host.line}`, display: 'flex' }}>{panel}</div>
        )}
      </div>
    </div>
  );
}

function SideHead({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 11, fontWeight: 650 }}>
      {children}
    </div>
  );
}

function TopBar({ zoom }: { zoom: string }) {
  const tool = (d: ReactNode, active = false) => (
    <span
      style={{
        width: 30,
        height: 28,
        borderRadius: 6,
        display: 'grid',
        placeItems: 'center',
        background: active ? host.ink : 'transparent',
        color: active ? '#fff' : host.ink
      }}
    >
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden>
        {d}
      </svg>
    </span>
  );
  return (
    <div
      style={{
        height: 42,
        flex: 'none',
        background: host.bar,
        borderBottom: `1px solid ${host.line}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ display: 'flex', gap: 6, padding: '0 10px 0 4px' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: '#D9DBDF' }} />
          ))}
        </span>
        {tool(<path d='M4 2.5 12 8l-3.6.8L10.6 13l-1.6.8-2.2-4.2L4 12z' />, true)}
        {tool(<path d='M5 2v12M11 2v12M2 5h12M2 11h12' />)}
        {tool(<rect x='3' y='3.5' width='10' height='9' rx='1' />)}
        {tool(<path d='M3.5 12.5 9.8 6.2m-2-2 4 4M10 2.5l3.5 3.5-1.2 1.2-3.5-3.5zM3.5 12.5l.8-3 2.2 2.2z' />)}
        {tool(<path d='M3.5 3.5h9M8 3.5v9.5M6 13h4' />)}
        {tool(<path d='M5.5 8.5V4.2a1 1 0 0 1 2 0V8m0-.5V3.2a1 1 0 0 1 2 0V8m0-.3V4.2a1 1 0 0 1 2 0v5.3a4 4 0 0 1-4 4h-.6a4 4 0 0 1-3.2-1.6L2.4 9.9a1 1 0 0 1 1.6-1.2l1.5 1.6' />)}
      </div>
      <div style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: host.soft }}>Moorage</span>
        <span style={{ color: '#B6BAC1' }}>/</span>
        <span style={{ fontWeight: 600 }}>Booking flows</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'flex' }}>
          {[
            ['DW', '#F2C46D'],
            ['SI', '#9FD0B8']
          ].map(([n, c], i) => (
            <span
              key={n}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: c,
                color: host.ink,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                display: 'grid',
                placeItems: 'center',
                marginLeft: i ? -3 : 0,
                boxShadow: `0 0 0 2px ${host.bar}`
              }}
            >
              {n}
            </span>
          ))}
        </span>
        <span style={{ fontSize: 12, color: host.soft, fontVariantNumeric: 'tabular-nums', padding: '0 4px' }}>{zoom}</span>
      </div>
    </div>
  );
}

type LayerKind = 'frame' | 'text' | 'rect' | 'line' | 'group' | 'vector';

/** One row in the layers tree. */
export function LayerRow({
  kind,
  name,
  depth = 0,
  open,
  selected,
  dim
}: {
  kind: LayerKind;
  name: string;
  depth?: number;
  open?: boolean;
  selected?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      style={{
        height: 26,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 6 + depth * 14,
        paddingRight: 8,
        borderRadius: 5,
        background: selected ? '#E3EBFF' : 'transparent',
        color: dim ? host.soft : host.ink,
        fontWeight: kind === 'frame' ? 600 : 400,
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}
    >
      <span style={{ width: 8, color: host.soft, fontSize: 8, flex: 'none' }}>
        {open === undefined ? '' : open ? '▾' : '▸'}
      </span>
      <LayerGlyph kind={kind} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
    </div>
  );
}

function LayerGlyph({ kind }: { kind: LayerKind }) {
  const s = { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', stroke: host.soft, strokeWidth: 1.4, 'aria-hidden': true, style: { flex: 'none' } } as const;
  if (kind === 'frame')
    return (
      <svg {...s}>
        <path d='M3.5 1v10M8.5 1v10M1 3.5h10M1 8.5h10' />
      </svg>
    );
  if (kind === 'text')
    return (
      <svg {...s}>
        <path d='M2 2.5h8M6 2.5v7.5' strokeLinecap='round' />
      </svg>
    );
  if (kind === 'line')
    return (
      <svg {...s}>
        <path d='M1.5 6h9' strokeLinecap='round' />
      </svg>
    );
  if (kind === 'group')
    return (
      <svg {...s}>
        <rect x='1.5' y='1.5' width='9' height='9' rx='1.5' strokeDasharray='2 1.5' />
      </svg>
    );
  if (kind === 'vector')
    return (
      <svg {...s}>
        <path d='M2 9.5 5 3l2.5 4.5L10 2' strokeLinejoin='round' />
      </svg>
    );
  return (
    <svg {...s}>
      <rect x='1.5' y='2.5' width='9' height='7' rx='1.5' />
    </svg>
  );
}

/** A frame on the canvas with its name above it, like any vector editor. */
export function CanvasFrame({
  name,
  x,
  y,
  scale = 1,
  selected,
  children
}: {
  name: string;
  x: number;
  y: number;
  scale?: number;
  selected?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div
        style={{
          fontSize: 11,
          color: selected ? host.select : host.soft,
          fontWeight: selected ? 600 : 500,
          marginBottom: 6,
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </div>
      <div style={{ transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  );
}
