import type { CSSProperties, ReactNode } from 'react';
import { contrast, deltaE, fmtDelta } from './color';
import { analyses, audit, cardTokens, clusters, nearMisses, strays, tk, tokens } from './data';
import { CandidateHead, CandidateItem, FixHeading, PanelShell, StrayItem, tagFor } from './panel';
import { Arrow, Badge, Check, FakeButton, Label, mono, p, Swatch } from './theme';

const tok = (name: string) => tokens.find((t) => t.name === name)!;
const n = (v: number) => v.toLocaleString('en-US');

function Divider({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: p.line, flex: 'none', ...style }} />;
}

function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', minHeight: 30, ...style }}>{children}</div>
  );
}

/* ------------------------------------------------------------------ Audit */

/** The audit summary for the whole client file. */
export function AuditView({ height = '100%' }: { height?: number | string }) {
  const total = audit.colors;
  const tokenShare = audit.tokens / total;
  const bandColors = ['#9DB7FF', '#5C8BFF', '#2E6BFF', p.fail];
  const maxBand = Math.max(...audit.bands.map((b) => b.count));
  return (
    <PanelShell
      tab='Audit'
      height={height}
      scope={<span>Whole file</span>}
      footer={
        <>
          <FakeButton tone='secondary'>Review clusters</FakeButton>
          <FakeButton style={{ flex: 1 }}>Fix {audit.auto} automatically</FakeButton>
        </>
      }
    >
      <div style={{ padding: '12px 12px 4px', fontSize: 11.5, color: p.soft }}>
        {audit.pages} pages · <span style={mono(11)}>{n(audit.layers)}</span> layers with a fill or stroke
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '6px 12px 12px' }}>
        {[
          [audit.colors, 'colors in use', p.ink],
          [audit.tokens, 'tokens', p.ink],
          [audit.strays, 'strays', p.failText]
        ].map(([v, l, c]) => (
          <div key={l as string} style={{ background: p.panel, borderRadius: 8, padding: '10px 10px 9px' }}>
            <div style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.02em', color: c as string, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
              {v}
            </div>
            <div style={{ fontSize: 11, color: p.soft, marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden', gap: 1.5 }}>
          <span style={{ width: `${tokenShare * 100}%`, background: p.ink }} />
          {audit.bands.map((b, i) => (
            <span key={b.label} style={{ width: `${(b.count / total) * 100}%`, background: bandColors[i] }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: p.soft }}>
          <span>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: p.ink, marginRight: 5 }} />
            Tokens {Math.round(tokenShare * 100)}%
          </span>
          <span>Strays by distance from nearest token</span>
        </div>
      </div>
      <Divider />
      <Label right='ΔE2000'>Distance from nearest token</Label>
      <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {audit.bands.map((b, i) => (
          <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '58px 58px 1fr 28px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12 }}>{b.label}</span>
            <span style={{ fontSize: 11, color: p.soft }}>{b.note}</span>
            <span style={{ height: 8, borderRadius: 2, background: p.panel, overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${Math.max(2, (b.count / maxBand) * 100)}%`, background: bandColors[i] }} />
            </span>
            <span style={mono(12, { textAlign: 'right' })}>{b.count}</span>
          </div>
        ))}
      </div>
      <Divider />
      <Label>Before you fix</Label>
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Finding
          icon={<Badge verdict='fail'>{audit.failing}</Badge>}
          title='Stray text layers fail AA today'
          body='Measured against the fill each layer actually sits on.'
        />
        <Finding
          icon={<Badge verdict='pass'>{Math.round((audit.auto / audit.strays) * 100)}%</Badge>}
          title={`${audit.auto} of ${audit.strays} strays have a passing token`}
          body={`In the same ramp as their nearest token. ${audit.strays - audit.auto} need a decision, including ${audit.outliers} outliers over ΔE 10.`}
        />
      </div>
      <Divider style={{ marginTop: 12 }} />
      <Label right='by layers'>Largest clusters</Label>
      {[...clusters]
        .sort((a, b) => b.layers - a.layers)
        .slice(0, 3)
        .map((c) => (
          <div key={c.token} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto auto', columnGap: 8, alignItems: 'center', padding: '0 12px', height: 26 }}>
            <Swatch hex={c.hex} size={14} radius={3} />
            <span style={{ fontWeight: 600 }}>{c.token}</span>
            <span style={{ fontSize: 11.5, color: p.soft }}>{c.strays} strays</span>
            <span style={mono(11.5, { width: 34, textAlign: 'right' })}>{c.layers}</span>
          </div>
        ))}
    </PanelShell>
  );
}

function Finding({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: 8, alignItems: 'start' }}>
      <span style={{ paddingTop: 1 }}>{icon}</span>
      <span>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: p.soft, marginTop: 1 }}>{body}</span>
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- Clusters */

/** Strays grouped around the token they are nearest to. */
export function ClustersView({ height = '100%', open = 'ink/500' }: { height?: number | string; open?: string }) {
  return (
    <PanelShell
      tab='Clusters'
      height={height}
      scope={<span>Whole file</span>}
      footer={
        <>
          <FakeButton tone='secondary'>Select 241 layers</FakeButton>
          <FakeButton style={{ flex: 1 }}>Fix 19 in this cluster</FakeButton>
        </>
      }
    >
      <Row style={{ minHeight: 34, justifyContent: 'space-between', fontSize: 11.5, color: p.soft }}>
        <span>
          <b style={{ color: p.ink, fontWeight: 650 }}>{audit.clusters} clusters</b> · {audit.strays} strays
        </span>
        <span>Failing contrast first</span>
      </Row>
      <Divider />
      {clusters.slice(0, 4).map((c) => {
        const misses = nearMisses(c.hex, c.strays, c.seed, 5);
        const isOpen = c.token === open;
        const lo = misses[0]?.dE ?? 0;
        const hi = misses[misses.length - 1]?.dE ?? 0;
        return (
          <div key={c.token} style={{ background: isOpen ? '#F7F9FF' : 'transparent', boxShadow: isOpen ? `inset 2px 0 0 ${p.accent}` : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', columnGap: 10, alignItems: 'center', padding: '9px 12px 6px' }}>
              <Swatch hex={c.hex} size={24} radius={6} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 650 }}>{c.token}</span>
                  <span style={mono(11, { color: p.soft })}>{c.hex}</span>
                </span>
                <span style={{ display: 'block', fontSize: 11.5, color: p.soft, marginTop: 1 }}>
                  {c.strays} strays · {c.layers} layers · ΔE {fmtDelta(lo)}–{fmtDelta(hi)}
                </span>
              </span>
              {c.failing ? <Badge verdict='fail'>{c.failing} fail AA</Badge> : <Badge verdict='pass'>All pass</Badge>}
            </div>
            <div style={{ display: 'flex', gap: 3, padding: '0 12px 10px 46px' }}>
              {misses.slice(0, 12).map((m) => (
                <Swatch key={m.hex} hex={m.hex} size={14} radius={3} />
              ))}
              {misses.length > 12 && <span style={{ fontSize: 10.5, color: p.soft, marginLeft: 3, lineHeight: '14px' }}>+{misses.length - 12}</span>}
            </div>
            {isOpen && <ClusterDetail hex={c.hex} misses={misses} />}
            <Divider />
          </div>
        );
      })}
    </PanelShell>
  );
}

function ClusterDetail({ hex, misses }: { hex: string; misses: { hex: string; dE: number }[] }) {
  // Measure each stray where it is used: gray text on the white card and on
  // the fog/100 price box.
  const fees = strays.find((s) => s.id === 'fees')!;
  const rows = [
    { m: misses[1], on: tk('paper/0'), where: 'Helper text', layers: 38 },
    { m: misses[4], on: tk('fog/100'), where: 'Price rows', layers: 27 },
    { m: misses[9], on: tk('paper/0'), where: 'Timestamps', layers: 19 },
    { m: { hex: fees.hex, dE: deltaE(hex, fees.hex) }, on: fees.against, where: 'Fee labels', layers: fees.layers }
  ].filter((r) => r.m);
  return (
    <div style={{ padding: '0 12px 10px 46px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map(({ m, on, where, layers }) => {
        const r = contrast(m.hex, on);
        const pass = r >= 4.5;
        return (
          <div
            key={m.hex}
            style={{ display: 'grid', gridTemplateColumns: '12px 58px 1fr 34px 46px', alignItems: 'center', gap: 6, height: 24 }}
          >
            <Swatch hex={m.hex} size={12} radius={3} />
            <span style={mono(11)}>{m.hex}</span>
            <span style={{ fontSize: 11, color: p.soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {where} · {layers}
            </span>
            <span style={mono(11, { textAlign: 'right', color: p.soft })}>{fmtDelta(deltaE(hex, m.hex))}</span>
            <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Badge verdict={pass ? 'pass' : 'fail'}>
                <span style={mono(10)}>{r.toFixed(2)}</span>
              </Badge>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- Fix */

/** The fix panel mid-session: one stray done, the next one selected. */
export function FixView({
  height = '100%',
  selected = 'notice',
  fixed = { fees: 'ink/700' },
  tab = true,
  floating
}: {
  height?: number | string;
  selected?: string;
  fixed?: Record<string, string>;
  tab?: boolean;
  floating?: boolean;
}) {
  const a = analyses[selected];
  const left = strays.filter((s) => !fixed[s.id]).length;
  return (
    <PanelShell
      tab={tab ? 'Fix' : undefined}
      floating={floating}
      height={height}
      scope={<span>Checkout / Reserve</span>}
      footer={
        <>
          <FakeButton tone='secondary'>Undo</FakeButton>
          <FakeButton style={{ flex: 1 }}>
            Replace with {a.suggested.token.name} in {a.stray.layers} {a.stray.layers === 1 ? 'layer' : 'layers'}
          </FakeButton>
        </>
      }
    >
      <Label right={`${left} of ${strays.length} left`} style={{ height: 30 }}>
        Strays on this frame
      </Label>
      {strays.map((s) => (
        <StrayItem key={s.id} a={analyses[s.id]} selected={s.id === selected} fixedTo={fixed[s.id] ? tok(fixed[s.id]) : null} />
      ))}
      <Divider style={{ marginTop: 6 }} />
      <FixHeading s={a.stray}>{ruleLine(a.stray.kind, a.stray.against)}</FixHeading>
      <CandidateHead />
      {a.candidates.map((c) => (
        <CandidateItem key={c.token.name} c={c} min={a.min} tag={tagFor(a, c)} checked={c === a.suggested} disabled={!c.pass} />
      ))}
      <div style={{ padding: '8px 12px 0', fontSize: 11.5, lineHeight: 1.45, color: p.soft }}>{a.reason}</div>
    </PanelShell>
  );
}

export function ruleLine(kind: string, against: string) {
  const on = against.toUpperCase();
  if (kind === 'text') return `Text on ${on}. AA needs 4.5:1.`;
  if (kind === 'large') return `Large text on ${on}. AA needs 3:1.`;
  if (kind === 'fill') return `Fill behind a ${on} label. AA needs 4.5:1.`;
  return 'Decorative stroke. No contrast minimum.';
}

/* --------------------------------------------------------------- Settings */

function Radio({ on }: { on?: boolean }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        boxSizing: 'border-box',
        border: `1.5px solid ${on ? p.accent : '#9AA0A8'}`,
        display: 'grid',
        placeItems: 'center',
        flex: 'none'
      }}
    >
      {on && <span style={{ width: 6, height: 6, borderRadius: 3, background: p.accent }} />}
    </span>
  );
}

function Box({ on }: { on?: boolean }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 3.5,
        boxSizing: 'border-box',
        background: on ? p.accent : p.white,
        border: on ? 'none' : '1.5px solid #9AA0A8',
        display: 'grid',
        placeItems: 'center',
        flex: 'none'
      }}
    >
      {on && <Check size={10} color='#fff' width={2.2} />}
    </span>
  );
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span style={{ width: 28, height: 16, borderRadius: 8, background: on ? p.accent : '#C9CDD3', position: 'relative', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: 6, background: '#fff' }} />
    </span>
  );
}

function Segmented({ options, active }: { options: string[]; active: string }) {
  return (
    <span style={{ display: 'inline-flex', padding: 2, borderRadius: 6, background: p.panel, fontSize: 11.5 }}>
      {options.map((o) => (
        <span
          key={o}
          style={{
            height: 22,
            padding: '0 9px',
            borderRadius: 4,
            display: 'grid',
            placeItems: 'center',
            fontWeight: o === active ? 600 : 500,
            background: o === active ? p.white : 'transparent',
            color: o === active ? p.ink : p.soft,
            boxShadow: o === active ? '0 0 0 1px rgba(21,23,26,0.08), 0 1px 2px rgba(21,23,26,0.08)' : 'none'
          }}
        >
          {o}
        </span>
      ))}
    </span>
  );
}

/** Where tokens come from, and how strict matching is. */
export function SettingsView({ height = '100%' }: { height?: number | string }) {
  const field: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 12px', minHeight: 32 };
  return (
    <PanelShell tab='Settings' height={height} scope={<span>Saved to this file</span>}>
      <Label>Token source</Label>
      <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ borderRadius: 8, boxShadow: `inset 0 0 0 1.5px ${p.accent}`, background: '#F7F9FF', padding: '9px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <Radio on /> Libraries enabled in this file
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 22 }}>
            {[
              ['Moorage Core', 12, true, ['#14202B', '#0F6E8C', '#2C7A4B', '#EEF2F5', '#C4432D']],
              ['Moorage Extended', 26, true, ['#F2E6CF', '#8FB8C7', '#3E5A70', '#B7C4CF', '#E8A23B']],
              ['Halyard Charts', 9, false, ['#4C6FFF', '#FF8A5B', '#3CC5A3', '#FFD15C', '#A07BFF']]
            ].map(([name, count, on, chips]) => (
              <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box on={on as boolean} />
                <span style={{ flex: 1, color: on ? p.ink : p.soft }}>{name as string}</span>
                <span style={{ display: 'flex', gap: 2 }}>
                  {(chips as string[]).map((c) => (
                    <Swatch key={c} hex={c} size={10} radius={2} />
                  ))}
                </span>
                <span style={mono(11, { color: p.soft, width: 20, textAlign: 'right' })}>{count as number}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, paddingLeft: 22, fontSize: 11, color: p.soft }}>38 color tokens, refreshed on open</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', color: p.soft }}>
          <Radio /> Local color styles <span style={{ marginLeft: 'auto', ...mono(11) }}>0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', color: p.soft }}>
          <Radio /> Design tokens JSON
          <span style={mono(11, { marginLeft: 'auto' })}>color.tokens.json</span>
        </div>
      </div>
      <Divider />
      <Label>Matching</Label>
      <div style={field}>
        <span>Color difference</span>
        <Segmented options={['ΔE2000', 'CIE76']} active='ΔE2000' />
      </div>
      <div style={{ ...field, minHeight: 40 }}>
        <span>Count as a stray up to</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 84, height: 4, borderRadius: 2, background: p.panel, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', borderRadius: 2, background: p.accent }} />
            <span style={{ position: 'absolute', left: '50%', top: -5, width: 14, height: 14, marginLeft: -7, borderRadius: 7, background: '#fff', boxShadow: '0 0 0 1px rgba(21,23,26,0.2), 0 1px 3px rgba(21,23,26,0.2)' }} />
          </span>
          <span style={mono(11.5, { width: 36, textAlign: 'right' })}>ΔE 10</span>
        </span>
      </div>
      <div style={field}>
        <span>Prefer the nearest token's ramp</span>
        <Toggle on />
      </div>
      <Divider style={{ marginTop: 4 }} />
      <Label>Contrast</Label>
      <div style={field}>
        <span>Target</span>
        <Segmented options={['AA', 'AAA']} active='AA' />
      </div>
      <div style={field}>
        <span>Measure against the fill beneath</span>
        <Toggle on />
      </div>
      <div style={{ padding: '0 12px 6px', fontSize: 11, color: p.soft, lineHeight: 1.4 }}>
        Text over images is flagged for a person to check.
      </div>
      <Divider />
      <Label>Skip layers named</Label>
      <div style={{ padding: '0 12px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Illustration/*', 'Map/*', 'Photo/*'].map((t) => (
          <span key={t} style={mono(11, { height: 22, padding: '0 7px', borderRadius: 4, background: p.panel, display: 'inline-flex', alignItems: 'center' })}>
            {t}
          </span>
        ))}
        <span style={{ height: 22, padding: '0 7px', borderRadius: 4, color: p.accentText, display: 'inline-flex', alignItems: 'center', fontSize: 11.5, fontWeight: 600 }}>
          + Add
        </span>
      </div>
      <Divider />
      <div style={{ ...field, minHeight: 40 }}>
        <span>
          Record every swap on a <b style={{ fontWeight: 600 }}>Changelog</b> page
        </span>
        <Toggle on />
      </div>
    </PanelShell>
  );
}

/* ------------------------------------------------------------------- Done */

/** The report after the client's afternoon of cleanup. */
export function DoneView({ height = '100%' }: { height?: number | string }) {
  const exceptions = [
    ['#F2A541', 'Illustration / Buoy', 'Brand illustration'],
    ['#9CC7D9', 'Map / Water', 'Matches the basemap'],
    ['#E86A33', 'Map / Fuel dock pin', 'Wayfinding color']
  ];
  return (
    <PanelShell
      tab='Audit'
      height={height}
      scope={<span>Whole file</span>}
      footer={
        <>
          <FakeButton tone='secondary'>Export report</FakeButton>
          <FakeButton style={{ flex: 1 }}>Open Changelog page</FakeButton>
        </>
      }
    >
      <div style={{ padding: '14px 12px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 650, color: p.passText }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: p.pass, display: 'grid', placeItems: 'center' }}>
            <Check size={10} color='#fff' width={2.2} />
          </span>
          Audit complete · Tue, Mar 12, 3:52 pm
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
          <span style={{ fontSize: 30, fontWeight: 650, letterSpacing: '-0.03em', color: p.faint, textDecoration: 'line-through', textDecorationThickness: 2 }}>
            212
          </span>
          <Arrow size={16} color={p.soft} />
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>41</span>
          <span style={{ fontSize: 12, color: p.soft }}>colors in the file</span>
        </div>
        <div style={{ display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden', gap: 1.5, marginTop: 10 }}>
          <span style={{ flex: 38, background: p.ink }} />
          <span style={{ flex: 3, background: '#FFB020' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: p.soft }}>
          <span>38 tokens</span>
          <span>3 exceptions</span>
        </div>
      </div>
      <Divider style={{ marginTop: 10 }} />
      <Label>What changed</Label>
      {[
        ['Replaced automatically', '150', 'nearest passing token'],
        ['Replaced by hand', '21', 'picked from suggestions'],
        ['Kept as exceptions', '3', 'listed below']
      ].map(([l, v, d]) => (
        <div key={l} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 12px', minHeight: 40, alignItems: 'center' }}>
          <span>
            <span style={{ display: 'block' }}>{l}</span>
            <span style={{ display: 'block', fontSize: 11, color: p.soft }}>{d}</span>
          </span>
          <span style={mono(13, { fontWeight: 600 })}>{v}</span>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '4px 12px 10px', alignItems: 'center' }}>
        <span>
          <span style={{ display: 'block' }}>Text layers failing AA</span>
          <span style={{ display: 'block', fontSize: 11, color: p.soft }}>was 41 before the audit</span>
        </span>
        <Badge verdict='pass'>0</Badge>
      </div>
      <Divider />
      <Label right='kept on purpose'>Exceptions</Label>
      {exceptions.map(([hex, layer, why]) => (
        <div key={hex} style={{ display: 'grid', gridTemplateColumns: '16px 60px 1fr', columnGap: 8, alignItems: 'center', padding: '0 12px', minHeight: 30 }}>
          <Swatch hex={hex} />
          <span style={mono(11.5)}>{hex}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ fontSize: 11.5 }}>{layer}</span>
            <span style={{ fontSize: 11, color: p.soft }}> · {why}</span>
          </span>
        </div>
      ))}
    </PanelShell>
  );
}

/* -------------------------------------------------------------- Changelog */

type Entry = {
  n: number;
  time: string;
  frame: string;
  layer: string;
  count: number;
  from: string;
  to: string;
  on: string | null;
  min: number;
  rule: string;
  by: string;
  reverted?: string;
};

export const entries: Entry[] = [
  { n: 171, time: '3:52 pm', frame: 'Checkout / Reserve', layer: 'Reserve button', count: 1, from: '#137396', to: 'sea/600', on: '#FFFFFF', min: 4.5, rule: 'Nearest', by: 'Auto' },
  { n: 170, time: '3:52 pm', frame: 'Checkout / Reserve', layer: 'Promo link', count: 1, from: '#13759A', to: 'sea/600', on: '#FFFFFF', min: 4.5, rule: 'Nearest', by: 'Auto' },
  { n: 169, time: '3:52 pm', frame: 'Checkout / Reserve', layer: 'Slip title', count: 1, from: '#18242F', to: 'ink/900', on: '#FFFFFF', min: 3, rule: 'Nearest', by: 'Auto' },
  { n: 168, time: '3:51 pm', frame: 'Checkout / Reserve', layer: 'Dividers', count: 2, from: '#E1E6EB', to: 'fog/300', on: null, min: 0, rule: 'Decorative', by: 'Auto' },
  { n: 167, time: '3:51 pm', frame: 'Checkout / Reserve', layer: 'Cancellation note', count: 2, from: '#348556', to: 'kelp/600', on: '#E2F3E7', min: 4.5, rule: 'Nearest, now passes', by: 'Auto' },
  { n: 166, time: '3:51 pm', frame: 'Checkout / Reserve', layer: 'Fee labels', count: 3, from: '#6E7A87', to: 'ink/700', on: '#EEF2F5', min: 4.5, rule: 'Ramp step', by: 'Auto' },
  { n: 165, time: '3:47 pm', frame: 'Settings / Notifications', layer: 'Row hints', count: 5, from: '#727E8A', to: 'ink/500', on: '#FFFFFF', min: 4.5, rule: 'Nearest', by: 'Auto' },
  { n: 163, time: '3:44 pm', frame: 'Settings / Notifications', layer: 'Segment labels', count: 2, from: '#6F7B88', to: 'ink/700', on: '#EEF2F5', min: 4.5, rule: 'Picked by hand', by: 'Dana W.' },
  { n: 162, time: '3:40 pm', frame: 'Confirmed / Map', layer: 'Water', count: 1, from: '#9CC7D9', to: 'sea/100', on: null, min: 0, rule: 'Nearest', by: 'Dana W.', reverted: 'Reverted, kept' }
];

/** The page Swatchbook writes into the file: one row per swap, newest first. */
export function ChangelogFrame({ width = 900 }: { width?: number }) {
  const cols = '40px 1.5fr 158px 44px 112px 1.15fr 56px';
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        background: p.white,
        borderRadius: 4,
        boxShadow: '0 0 0 1px rgba(21,23,26,0.08), 0 10px 30px -18px rgba(21,23,26,0.3)',
        padding: '28px 30px 22px',
        fontFamily: p.ui,
        color: p.ink,
        fontSize: 12.5
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Swatchbook changelog</div>
          <div style={{ fontSize: 12.5, color: p.soft, marginTop: 4, maxWidth: 520, lineHeight: 1.45 }}>
            Every color Swatchbook replaced in this file, newest first. Select a row and choose Revert in the plugin to put the old color back on those layers.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, textAlign: 'right' }}>
          {[
            ['171', 'replacements'],
            ['1', 'reverted'],
            ['3', 'exceptions']
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              <div style={{ fontSize: 11, color: p.soft }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          padding: '8px 10px',
          borderRadius: 6,
          background: p.panel,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12
        }}
      >
        <span style={{ fontWeight: 650 }}>Tue, Mar 12, 2024 · 2:14 to 3:58 pm</span>
        <span style={{ color: p.soft }}>Dana Whitlock · Swatchbook 1.4 · whole file · Moorage Core + Extended</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 12,
          padding: '12px 10px 6px',
          fontSize: 11,
          color: p.soft,
          fontWeight: 500,
          borderBottom: `1px solid ${p.line}`
        }}
      >
        <span>#</span>
        <span>Layer</span>
        <span>Before → after</span>
        <span style={{ textAlign: 'right' }}>ΔE</span>
        <span style={{ textAlign: 'right' }}>Contrast</span>
        <span>Why</span>
        <span>By</span>
      </div>
      {entries.map((e) => {
        const to = tok(e.to);
        const dE = deltaE(e.from, to.hex);
        const before = e.on ? contrast(e.from, e.on) : null;
        const after = e.on ? contrast(to.hex, e.on) : null;
        const struck = !!e.reverted;
        return (
          <div
            key={e.n}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: 12,
              alignItems: 'center',
              minHeight: 44,
              padding: '0 10px',
              borderBottom: `1px solid ${p.line}`,
              background: e.n === 166 ? '#F5F8FF' : 'transparent',
              boxShadow: e.n === 166 ? `inset 2px 0 0 ${p.accent}` : 'none',
              color: struck ? p.soft : p.ink
            }}
          >
            <span style={mono(11.5, { color: p.soft })}>{e.n}</span>
            <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
              <span style={{ display: 'block', fontWeight: 600, textDecoration: struck ? 'line-through' : 'none' }}>
                {e.layer}
                {e.count > 1 && <span style={{ color: p.soft, fontWeight: 400 }}> ×{e.count}</span>}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: p.soft }}>{e.frame}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Swatch hex={e.from} size={12} radius={3} />
              <span style={mono(11)}>{e.from}</span>
              <Arrow size={10} color={p.faint} />
              <Swatch hex={to.hex} size={12} radius={3} />
              <span style={mono(11, { fontWeight: 600 })}>{e.to}</span>
            </span>
            <span style={mono(11.5, { textAlign: 'right' })}>{fmtDelta(dE)}</span>
            <span style={mono(11.5, { textAlign: 'right', color: before == null ? p.faint : undefined })}>
              {before == null || after == null ? (
                'n/a'
              ) : (
                <>
                  <span style={{ color: before >= e.min ? p.soft : p.failText }}>{before.toFixed(2)}</span>
                  <span style={{ color: p.faint }}> → </span>
                  <span style={{ color: after >= e.min ? p.passText : p.failText, fontWeight: 600 }}>{after.toFixed(2)}</span>
                </>
              )}
            </span>
            <span style={{ fontSize: 11.5, color: p.soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {e.reverted ?? e.rule}
            </span>
            <span style={{ fontSize: 11.5, color: e.by === 'Auto' ? p.soft : p.ink }}>{e.by}</span>
          </div>
        );
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11.5, color: p.soft }}>
        <span>Showing 9 of 171</span>
        <span>Swatchbook writes this page. Edits here are overwritten on the next run.</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Inspector */

/**
 * Colors on the checkout frame, for the before/after stills. Numbered rows
 * match the pins on the card.
 */
export function FrameColors({ state }: { state: 'before' | 'after' }) {
  const after = state === 'after';
  const colorsNow = new Set([...cardTokens.map(tk), ...strays.map((s) => (after ? analyses[s.id].suggested.token.hex : s.hex))]);
  return (
    <PanelShell floating width={340} scope={<span>Checkout / Reserve</span>}>
      <div style={{ padding: '14px 12px 10px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{colorsNow.size}</span>
        <span style={{ fontSize: 12.5, color: p.soft }}>colors on this frame</span>
        <span style={{ marginLeft: 'auto' }}>
          {after ? <Badge verdict='pass'>All tokens</Badge> : <Badge verdict='fail'>6 strays</Badge>}
        </span>
      </div>
      <Divider />
      <Label right={after ? 'now tokens' : 'near misses'}>{after ? 'Replaced' : 'Strays'}</Label>
      {strays.map((s, i) => {
        const a = analyses[s.id];
        const t = a.suggested;
        const hex = after ? t.token.hex : s.hex;
        const ratio = after ? t.ratio : a.ratio;
        const pass = ratio >= a.min;
        return (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '20px 16px 1fr auto', columnGap: 8, alignItems: 'center', padding: '0 12px', height: 38 }}>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                background: after ? p.pass : p.fail,
                color: '#fff',
                font: `700 11px/20px ${p.ui}`,
                textAlign: 'center'
              }}
            >
              {i + 1}
            </span>
            <Swatch hex={hex} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', ...mono(12, { fontWeight: after ? 600 : 500 }) }}>{after ? t.token.name : s.hex}</span>
              <span style={{ display: 'block', fontSize: 11, color: p.soft, whiteSpace: 'nowrap' }}>
                {s.label} · {s.layers} {s.layers === 1 ? 'layer' : 'layers'}
              </span>
            </span>
            {a.min === 0 ? (
              <Badge verdict='none'>decor.</Badge>
            ) : (
              <Badge verdict={pass ? 'pass' : 'fail'}>
                <span style={mono(10.5)}>{ratio.toFixed(2)}</span>
              </Badge>
            )}
          </div>
        );
      })}
      <Divider style={{ marginTop: 6 }} />
      <Label right={`${cardTokens.length}`}>Tokens already in use</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', padding: '0 12px 14px' }}>
        {cardTokens.map((name) => (
          <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Swatch hex={tk(name)} size={14} radius={3} />
            <span style={mono(11.5)}>{name}</span>
          </span>
        ))}
      </div>
    </PanelShell>
  );
}

