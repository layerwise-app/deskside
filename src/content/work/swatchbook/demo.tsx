import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CARD, SampleCard } from './card';
import { analyses, cardTokens, strays, tk, tokens, type Token } from './data';
import { CandidateHead, CandidateItem, FixHeading, PanelShell, StrayItem, tagFor } from './panel';
import { ruleLine } from './screens';
import { mono, p, UndoGlyph } from './theme';

type Change = { id: string; token: string; n: number };

const css = `
.swb-demo { width: min(100%, 760px); height: 608px; display: flex; }
.swb-demo .swb-preview { flex: 1; min-width: 0; }
.swb-demo .swb-panel { flex: none; height: 100%; border-left: 1px solid ${p.line}; }
.swb-demo button:disabled { cursor: default; }
.swb-demo .swb-stray:not(:disabled):hover, .swb-demo .swb-cand:not(:disabled):hover { background-color: #F7F9FC; }
@media (max-width: 767px) {
  .swb-demo { width: min(100%, 400px); height: 724px; flex-direction: column; }
  .swb-demo .swb-preview { flex: none; height: 236px; }
  .swb-demo .swb-panel { width: 100% !important; flex: 1; min-height: 0; border-left: none; border-top: 1px solid ${p.line}; }
  .swb-demo .swb-list { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 0 8px 6px !important; }
  .swb-demo .swb-stray { height: 42px !important; padding: 0 8px !important; grid-template-columns: 14px minmax(0,1fr) !important; column-gap: 6px !important; border-radius: 6px; box-shadow: inset 0 0 0 1px ${p.line} !important; }
  .swb-demo .swb-stray[aria-checked='true'] { box-shadow: inset 0 0 0 1.5px ${p.accent} !important; }
  .swb-demo .swb-stray > span:first-child { width: 14px !important; height: 14px !important; }
  .swb-demo .swb-stray-label { display: none !important; }
  .swb-demo .swb-stray-status { grid-column: 2; justify-self: start; transform: scale(0.92); transform-origin: 0 50%; }
  .swb-demo .swb-stray-hex > svg { display: none; }
  .swb-demo .swb-stray-hex > span { font-size: 11px !important; }
  .swb-demo .swb-stray[data-fixed='true'] .swb-stray-hex > :first-child { display: none; }
  .swb-demo .swb-reason { padding-top: 4px !important; }
}
`;

const order = strays.map((s) => s.id);

export default function FixDemo() {
  const [selected, setSelected] = useState('fees');
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Change[]>([]);
  const [message, setMessage] = useState('');
  const [box, setBox] = useState({ w: 440, h: 580 });
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const replaceRef = useRef<HTMLButtonElement>(null);
  const strayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const candRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [focusY, setFocusY] = useState(CARD.height / 2);

  const applied = useMemo(() => {
    const m: Record<string, Change> = {};
    for (const c of history) m[c.id] = c;
    return m;
  }, [history]);
  const token = (name: string) => tokens.find((t) => t.name === name) as Token;

  const a = analyses[selected];
  const done = applied[selected];
  const picked = done ? done.token : (choice[selected] ?? a.suggested.token.name);
  const left = strays.filter((s) => !applied[s.id]).length;

  const colors = Object.fromEntries(
    strays.map((s) => [s.id, applied[s.id] ? token(applied[s.id].token).hex : s.hex])
  ) as Record<string, string>;
  const colorCount = new Set([...cardTokens.map(tk), ...Object.values(colors)]).size;

  // Fit the whole card when there is room; on short previews, zoom in and
  // pan to the selection instead.
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const avail = box.h - 38 - 10;
  const fit = Math.min(1, (box.w - 40) / CARD.width, avail / CARD.height);
  const pan = fit < 0.75;
  const scale = pan ? Math.min(0.92, (box.w - 32) / CARD.width) : fit;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let lo = Infinity;
    let hi = -Infinity;
    card.querySelectorAll<HTMLElement>(`[data-stray='${selected}']`).forEach((node) => {
      let top = 0;
      let n: HTMLElement | null = node;
      while (n && n !== card) {
        top += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      lo = Math.min(lo, top);
      hi = Math.max(hi, top + node.offsetHeight);
    });
    if (lo !== Infinity) setFocusY((lo + hi) / 2);
  }, [selected]);
  const offsetY = pan
    ? Math.max(Math.min(avail / 2 - focusY * scale, 4), avail - CARD.height * scale)
    : (avail - CARD.height * scale) / 2;

  const announce = (text: string) => setMessage(text);

  const apply = () => {
    if (done) return;
    const n = history.length + 1;
    const next = [...history, { id: selected, token: picked, n }];
    setHistory(next);
    const remaining = strays.filter((s) => !next.some((c) => c.id === s.id));
    const s = a.stray;
    const tail = remaining.length
      ? `${remaining.length} ${remaining.length === 1 ? 'stray' : 'strays'} left.`
      : 'All strays on this frame now use tokens.';
    announce(`Replaced ${s.hex} with ${picked} in ${s.layers} ${s.layers === 1 ? 'layer' : 'layers'}. ${tail}`);
    if (remaining.length) {
      const i = order.indexOf(selected);
      const after = [...order.slice(i + 1), ...order.slice(0, i)].find((id) => remaining.some((r) => r.id === id));
      if (after) setSelected(after);
    }
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory(history.slice(0, -1));
    setSelected(last.id);
    const s = analyses[last.id].stray;
    announce(`Undid change ${last.n}. ${s.label} ${s.layers === 1 ? 'is' : 'are'} back to ${s.hex}.`);
    if (history.length === 1) requestAnimationFrame(() => replaceRef.current?.focus());
  };

  // Arrow keys move through a radiogroup, as native radios do.
  const roving = (ids: string[], current: string, go: (id: string) => void, refs: Record<string, HTMLButtonElement | null>) =>
    (e: KeyboardEvent) => {
      const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next: string | undefined;
      if (e.key in keys) {
        const i = ids.indexOf(current);
        next = ids[(i + keys[e.key] + ids.length) % ids.length];
      } else if (e.key === 'Home') next = ids[0];
      else if (e.key === 'End') next = ids[ids.length - 1];
      if (!next) return;
      e.preventDefault();
      go(next);
      refs[next]?.focus();
    };

  const selectable = done ? [] : a.candidates.filter((c) => c.pass).map((c) => c.token.name);
  const pickedTag = done ? 'Applied' : undefined;

  return (
    <div
      className='swb-demo'
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: p.white,
        boxShadow: '0 0 0 1px rgba(21,23,26,0.10), 0 20px 40px -24px rgba(21,23,26,0.35)',
        fontFamily: p.ui,
        color: p.ink,
        textAlign: 'left'
      }}
    >
      <style>{css}</style>

      <div
        ref={previewRef}
        className='swb-preview'
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#EEF0F3',
          backgroundImage: 'radial-gradient(rgba(21,23,26,0.13) 1px, transparent 1.2px)',
          backgroundSize: '16px 16px'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11.5,
            color: p.soft,
            gap: 8,
            zIndex: 2
          }}
        >
          <span style={{ fontWeight: 600, color: p.ink, whiteSpace: 'nowrap' }}>Checkout / Reserve</span>
          <span style={mono(11, { whiteSpace: 'nowrap', color: left ? p.soft : p.passText })} aria-hidden>
            {colorCount} colors · {left} {left === 1 ? 'stray' : 'strays'}
          </span>
        </div>
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 38, bottom: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: CARD.width,
              height: CARD.height,
              transform: `translate(-50%, ${offsetY}px) scale(${scale})`,
              transformOrigin: '50% 0',
              transition: 'transform 320ms cubic-bezier(.2,.7,.2,1)'
            }}
          >
            <div ref={cardRef} style={{ position: 'relative' }}>
              <SampleCard colors={colors} selected={selected} />
            </div>
          </div>
        </div>
      </div>

      <PanelShell
        className='swb-panel'
        width={320}
        scope={
          <span style={{ whiteSpace: 'nowrap' }}>
            Moorage Core · <span style={mono(11)}>12</span> tokens
          </span>
        }
        footer={
          <>
            <button
              type='button'
              onClick={undo}
              disabled={!history.length}
              aria-label={history.length ? `Undo change ${history.length}` : 'Undo'}
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: 'none',
                margin: 0,
                background: p.white,
                boxShadow: `inset 0 0 0 1px ${p.lineStrong}`,
                color: history.length ? p.ink : p.faint,
                fontFamily: p.ui,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: history.length ? 'pointer' : 'default'
              }}
            >
              <UndoGlyph size={13} />
              Undo
            </button>
            <button
              ref={replaceRef}
              type='button'
              onClick={apply}
              disabled={!!done}
              style={{
                flex: 1,
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: 'none',
                margin: 0,
                background: done ? p.panel : p.accent,
                color: done ? p.soft : '#fff',
                fontFamily: p.ui,
                fontSize: 12,
                fontWeight: 650,
                cursor: done ? 'default' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {done
                ? `Replaced in ${a.stray.layers} ${a.stray.layers === 1 ? 'layer' : 'layers'}`
                : `Replace with ${picked} in ${a.stray.layers} ${a.stray.layers === 1 ? 'layer' : 'layers'}`}
            </button>
          </>
        }
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 30,
            padding: '0 12px',
            fontSize: 11,
            fontWeight: 650,
            flex: 'none'
          }}
        >
          <span id='swb-strays'>Strays on this frame</span>
          <span style={{ fontWeight: 500, color: left ? p.soft : p.passText }}>
            {left ? `${left} of ${strays.length} left` : 'All replaced'}
          </span>
        </div>
        {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus -- roving tabindex: the radios take focus */}
        <div
          className='swb-list'
          role='radiogroup'
          aria-labelledby='swb-strays'
          onKeyDown={roving(order, selected, setSelected, strayRefs.current)}
          style={{ display: 'flex', flexDirection: 'column', flex: 'none' }}
        >
          {strays.map((s) => {
            const fixed = applied[s.id];
            const an = analyses[s.id];
            return (
              <StrayItem
                key={s.id}
                a={an}
                as='button'
                selected={s.id === selected}
                fixedTo={fixed ? token(fixed.token) : null}
                props={{
                  type: 'button',
                  role: 'radio',
                  'aria-checked': s.id === selected,
                  tabIndex: s.id === selected ? 0 : -1,
                  'aria-label': `${s.hex}, ${s.label}, ${s.layers} ${s.layers === 1 ? 'layer' : 'layers'}, ${
                    fixed
                      ? `replaced with ${fixed.token}`
                      : an.min === 0
                        ? 'decorative'
                        : `contrast ${an.ratio.toFixed(2)} to 1, ${an.pass ? 'passes' : 'fails'}`
                  }`,
                  onClick: () => setSelected(s.id),
                  ref: (el: HTMLButtonElement | null) => {
                    strayRefs.current[s.id] = el;
                  }
                }}
              />
            );
          })}
        </div>

        <div style={{ borderTop: `1px solid ${p.line}`, marginTop: 6, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <FixHeading s={a.stray}>
            <span id='swb-rule'>{ruleLine(a.stray.kind, a.stray.against)}</span>
          </FixHeading>
          <CandidateHead />
          {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus -- roving tabindex: the radios take focus */}
          <div
            role='radiogroup'
            aria-label={`Tokens for ${a.stray.hex}`}
            aria-describedby='swb-rule'
            onKeyDown={
              selectable.length
                ? roving(selectable, picked, (id) => setChoice({ ...choice, [selected]: id }), candRefs.current)
                : undefined
            }
          >
            {a.candidates.map((c) => {
              const name = c.token.name;
              const isPicked = name === picked;
              const disabled = !!done || !c.pass;
              return (
                <CandidateItem
                  key={name}
                  c={c}
                  min={a.min}
                  tag={isPicked && pickedTag ? pickedTag : tagFor(a, c)}
                  checked={isPicked}
                  disabled={disabled}
                  as='button'
                  props={{
                    type: 'button',
                    role: 'radio',
                    'aria-checked': isPicked,
                    'aria-disabled': disabled || undefined,
                    tabIndex: isPicked ? 0 : -1,
                    'aria-label': `${name}, ${c.token.hex}, delta E ${c.dE.toFixed(1)}, contrast ${c.ratio.toFixed(2)} to 1${
                      a.min === 0 ? '' : c.pass ? ', passes' : ', fails'
                    }${tagFor(a, c) ? `, ${tagFor(a, c)?.toLowerCase()}` : ''}`,
                    onClick: () => {
                      if (!disabled) setChoice({ ...choice, [selected]: name });
                    },
                    ref: (el: HTMLButtonElement | null) => {
                      candRefs.current[name] = el;
                    }
                  }}
                />
              );
            })}
          </div>
          <div
            className='swb-reason'
            style={{ padding: '8px 12px 0', fontSize: 11.5, lineHeight: 1.45, color: p.soft }}
          >
            {done
              ? `Logged as change ${done.n} on the Changelog page. Undo puts ${a.stray.hex} back.`
              : a.reason}
          </div>
        </div>
      </PanelShell>

      <div aria-live='polite' style={visuallyHidden}>
        {message}
      </div>
    </div>
  );
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap'
} as const;
