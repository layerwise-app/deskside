import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import {
  inkCounts,
  onThisDay,
  prompts,
  searchHits,
  todayEntry,
  TODAY,
  doy,
  written,
  yearWithToday,
  type PastEntry
} from './data';
import { DotYear } from './year';
import { BackBar, caps, DateHead, Icon, ink, InkDot, inks, m, Screen, words, type InkId } from './theme';

/** Ruled line height of the writing field, in px. */
export const LINE = 32;
export const FIELD_W = 236;
const COLLAPSED = 3;
const EXPANDED = 8;

const plainButton: CSSProperties = {
  border: 'none',
  background: 'transparent',
  font: 'inherit',
  color: 'inherit',
  padding: 0,
  cursor: 'pointer'
};

/**
 * The margin: a red pencil rule, and beside it what you wrote on this date
 * in earlier years. Compact beside the writing field, fuller on a saved page.
 */
export function MarginColumn({
  notes = onThisDay,
  full = false,
  style
}: {
  notes?: PastEntry[];
  full?: boolean;
  style?: CSSProperties;
}) {
  return (
    <aside
      aria-label='November 4 in earlier years'
      style={{
        width: 96,
        flex: 'none',
        marginLeft: 12,
        paddingLeft: 11,
        borderLeft: `1.5px solid ${m.pencil}`,
        minHeight: full ? 300 : 280,
        ...style
      }}
    >
      <div style={{ ...caps, fontSize: 10, letterSpacing: '0.07em', color: m.pencilText, lineHeight: 1.2, whiteSpace: 'nowrap' }}>On this day</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: full ? 16 : 14, marginTop: 10 }}>
        {notes.map((n) => (
          <div key={n.year}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 650, fontVariantNumeric: 'lining-nums' }}>
              <InkDot id={n.ink} size={7} />
              {n.year}
            </div>
            <div style={{ fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.32, color: m.soft, marginTop: 2 }}>{n.note}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

type InkPickerProps = { value: InkId | null; onChange?: (id: InkId) => void };

/** Five inks as a real radiogroup: arrows move and choose, like native radios. */
export function InkPicker({ value, onChange }: InkPickerProps) {
  const interactive = Boolean(onChange);
  const focusIndex = Math.max(
    0,
    inks.findIndex((i) => i.id === value)
  );
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const current = inks.findIndex((i) => i.id === value);
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1
    };
    let next: number | null = null;
    if (e.key in keys) next = ((current === -1 ? 0 : current) + keys[e.key] + inks.length) % inks.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = inks.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(inks[next].id);
    const group = e.currentTarget;
    requestAnimationFrame(() => group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next!]?.focus());
  };
  const chosen = value ? ink(value) : null;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span id={interactive ? 'mg-ink-label' : undefined} style={{ ...caps, color: m.soft }}>
          Today’s ink
        </span>
        <span style={{ fontSize: 13.5, fontStyle: 'italic', color: m.soft }}>
          {chosen ? `${chosen.name}, for ${chosen.mood.toLowerCase()}` : 'Optional. No ink is wrong.'}
        </span>
      </div>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- a radiogroup when interactive, a plain row when not */}
      <div
        role={interactive ? 'radiogroup' : undefined}
        aria-labelledby={interactive ? 'mg-ink-label' : undefined}
        onKeyDown={interactive ? onKey : undefined}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 10 }}
      >
        {inks.map((i, idx) => {
          const on = i.id === value;
          const swatch = (
            <>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: i.color,
                  boxShadow: on ? `0 0 0 3px ${m.paper}, 0 0 0 5px ${m.ink}` : 'inset 0 -2px 0 rgba(35,40,58,0.12)',
                  transition: 'box-shadow 160ms'
                }}
              />
              <span style={{ fontSize: 13, fontWeight: on ? 650 : 450, color: on ? m.ink : m.soft }}>{i.mood}</span>
            </>
          );
          const box: CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0 4px',
            borderRadius: 12
          };
          return interactive ? (
            <button
              key={i.id}
              type='button'
              role='radio'
              aria-checked={on}
              aria-label={`${i.mood}, ${i.name.toLowerCase()} ink`}
              tabIndex={idx === focusIndex ? 0 : -1}
              onClick={() => onChange?.(i.id)}
              style={{ ...plainButton, ...box }}
            >
              {swatch}
            </button>
          ) : (
            <div key={i.id} style={box}>
              {swatch}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type TodayProps = {
  prompt?: string;
  text?: string;
  expanded?: boolean;
  ink?: InkId | null;
  /** Shown when the text runs past three lines while folded. */
  overflowing?: boolean;
  onText?: (s: string) => void;
  onExpand?: () => void;
  onInk?: (id: InkId) => void;
  onSave?: () => void;
  onPrompt?: () => void;
  fieldRef?: Ref<HTMLTextAreaElement>;
};

/** Today: one small question and a field three ruled lines tall. */
export function TodayScreen({
  prompt = prompts[0],
  text = '',
  expanded = false,
  ink: chosen = null,
  overflowing = false,
  onText,
  onExpand,
  onInk,
  onSave,
  onPrompt,
  fieldRef
}: TodayProps) {
  const interactive = Boolean(onText);
  const count = words(text);
  const lines = expanded ? EXPANDED : COLLAPSED;
  const canSave = count > 0;
  return (
    <Screen>
      <DateHead weekday='Tuesday' date='November 4' />
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 32 }}>
          <span style={{ ...caps, color: m.pencilText }}>Today’s question</span>
          {interactive ? (
            <button type='button' onClick={onPrompt} style={{ ...plainButton, ...another }}>
              <Icon name='swap' size={16} />
              Ask me another
            </button>
          ) : (
            <span style={another}>
              <Icon name='swap' size={16} />
              Ask me another
            </span>
          )}
        </div>
        <div
          id={interactive ? 'mg-prompt' : undefined}
          style={{ fontSize: 28, fontStyle: 'italic', lineHeight: '32px', letterSpacing: '-0.012em', marginTop: 4, maxWidth: 330 }}
        >
          {prompt}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '20px 0 0 22px' }}>
        <div style={{ width: FIELD_W, flex: 'none' }}>
          <textarea
            ref={fieldRef}
            id={interactive ? 'mg-field' : undefined}
            value={text}
            readOnly={!interactive}
            tabIndex={interactive ? undefined : -1}
            aria-hidden={interactive ? undefined : true}
            aria-labelledby={interactive ? 'mg-prompt' : undefined}
            aria-describedby={interactive ? 'mg-count' : undefined}
            placeholder='Three lines is plenty.'
            onChange={(e) => onText?.(e.target.value)}
            spellCheck={interactive}
            style={{
              display: 'block',
              width: '100%',
              height: lines * LINE,
              margin: 0,
              padding: 0,
              border: 'none',
              borderRadius: 0,
              resize: 'none',
              font: 'inherit',
              fontSize: 18,
              lineHeight: `${LINE}px`,
              color: m.ink,
              caretColor: m.pencil,
              background: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, ${m.ruling} ${LINE - 1}px, ${m.ruling} ${LINE}px)`,
              backgroundAttachment: 'local',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              transition: 'height 220ms cubic-bezier(.2,.7,.2,1)'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 36, marginTop: 2 }}>
            {interactive ? (
              <button
                type='button'
                onClick={onExpand}
                aria-expanded={expanded}
                aria-controls='mg-field'
                style={{
                  ...plainButton,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  height: 32,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: overflowing && !expanded ? m.pencilText : m.ink
                }}
              >
                {expanded ? 'Fold to three lines' : 'Keep writing'}
                <Icon name={expanded ? 'up' : 'down'} size={16} />
              </button>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14.5, fontWeight: 600, color: overflowing && !expanded ? m.pencilText : m.ink }}>
                {expanded ? 'Fold to three lines' : 'Keep writing'}
                <Icon name={expanded ? 'up' : 'down'} size={16} />
              </span>
            )}
            <span id={interactive ? 'mg-count' : undefined} style={{ fontSize: 13, color: m.soft, fontVariantNumeric: 'tabular-nums' }}>
              {count === 1 ? '1 word' : `${count} words`}
            </span>
          </div>
        </div>
        <MarginColumn />
      </div>
      <div style={{ marginTop: 'auto', padding: '0 22px 40px' }}>
        <InkPicker value={chosen} onChange={onInk} />
        <SaveButton enabled={canSave} onSave={onSave} />
      </div>
    </Screen>
  );
}

const another: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 32,
  padding: '0 2px',
  fontSize: 14.5,
  color: m.soft
};

function SaveButton({ enabled, onSave }: { enabled: boolean; onSave?: () => void }) {
  const style: CSSProperties = {
    width: '100%',
    height: 54,
    marginTop: 18,
    borderRadius: 14,
    border: 'none',
    font: 'inherit',
    fontSize: 18,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: enabled ? m.ink : m.deep,
    color: enabled ? m.paper : m.soft,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'background 160ms, color 160ms'
  };
  const label = enabled ? 'Save today' : 'Write a line first';
  return onSave ? (
    <button type='button' onClick={onSave} disabled={!enabled} style={style}>
      {label}
    </button>
  ) : (
    <div style={style}>{label}</div>
  );
}

type EntryProps = {
  prompt?: string;
  text?: string;
  ink?: InkId | null;
  time?: string;
  data?: (InkId | null)[];
  /** The dot was just saved; animate it in (the demo supplies the keyframes). */
  fresh?: boolean;
  onEdit?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
};

/** A saved page: the answer, its margin, and the year with today's dot. */
export function EntryScreen({
  prompt = todayEntry.prompt,
  text = todayEntry.text,
  ink: chosen = todayEntry.ink,
  time = todayEntry.time,
  data = yearWithToday,
  fresh = false,
  onEdit,
  headingRef
}: EntryProps) {
  const count = words(text);
  const i = chosen ? ink(chosen) : null;
  // A page saved without a mood prints in plain ink blue.
  const year = data.map((v, d) => (d === TODAY ? (chosen ?? null) : v));
  const edit = onEdit ? (
    <button type='button' onClick={onEdit} style={{ ...plainButton, height: 38, padding: '0 14px', borderRadius: 19, fontSize: 15.5, fontWeight: 600, boxShadow: `inset 0 0 0 1.25px ${m.line}` }}>
      Edit
    </button>
  ) : (
    <span style={{ height: 38, padding: '0 14px', borderRadius: 19, fontSize: 15.5, fontWeight: 600, boxShadow: `inset 0 0 0 1.25px ${m.line}`, display: 'flex', alignItems: 'center' }}>
      Edit
    </span>
  );
  return (
    <Screen>
      <DateHead weekday='Tuesday' date='November 4' right={edit} />
      <div style={{ padding: '22px 22px 0' }}>
        <h2
          ref={headingRef}
          tabIndex={headingRef ? -1 : undefined}
          style={{ margin: 0, fontSize: 24, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.2, letterSpacing: '-0.01em' }}
        >
          {prompt}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 13.5, color: m.soft }}>
          {i ? (
            <>
              <InkDot id={i.id} size={9} />
              <span style={{ color: m.ink }}>
                {i.name} · {i.mood}
              </span>
            </>
          ) : (
            <span style={{ color: m.ink }}>No ink</span>
          )}
          <span>·</span>
          <span>{time}</span>
          <span>·</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count === 1 ? '1 word' : `${count} words`}</span>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '18px 0 0 22px', flex: 1, minHeight: 0 }}>
        <div
          tabIndex={onEdit ? 0 : undefined}
          role={onEdit ? 'region' : undefined}
          aria-label={onEdit ? 'Today’s page' : undefined}
          style={{
            width: FIELD_W,
            flex: 'none',
            fontSize: 18,
            lineHeight: '29px',
            overflowY: 'auto',
            maxHeight: 360,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            scrollbarWidth: 'none'
          }}
        >
          {text}
        </div>
        <MarginColumn full style={{ alignSelf: 'flex-start' }} />
      </div>
      <MiniYear data={year} fresh={fresh} todayFill={chosen ? undefined : m.ink} />
    </Screen>
  );
}

/** The year card under a saved page, with today's dot in place. */
export function MiniYear({ data, fresh = false, todayFill }: { data: (InkId | null)[]; fresh?: boolean; todayFill?: string }) {
  const total = written(data) + (todayFill && !data[TODAY] ? 1 : 0);
  // A fresh save counts up once the dot has landed; reduced motion skips the wait.
  const [shown, setShown] = useState(fresh ? total - 1 : total);
  useEffect(() => {
    if (!fresh) return setShown(total);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(total);
    const id = window.setTimeout(() => setShown(total), 820);
    return () => window.clearTimeout(id);
  }, [fresh, total]);
  const ticked = fresh && shown === total;
  return (
    <div
      style={{
        margin: 'auto 16px 40px',
        background: m.sheet,
        borderRadius: 18,
        padding: '14px 16px 16px',
        boxShadow: `inset 0 0 0 1px ${m.line}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          2025 <span style={{ fontWeight: 400, fontStyle: 'italic', color: m.soft }}>in dots</span>
        </span>
        <span
          className={ticked ? 'mg-tick' : undefined}
          style={{ fontSize: 13.5, color: m.soft, fontVariantNumeric: 'tabular-nums' }}
        >
          {shown} days written
        </span>
      </div>
      <DotYear
        data={data}
        orient='rows'
        pitchX={10}
        pitchY={11.5}
        r={3.5}
        gutter={14}
        labels='initial'
        labelSize={9.5}
        fresh={fresh}
        todayFill={todayFill}
        title={`2025: ${total} days written. November 4 is circled.`}
      />
    </div>
  );
}

/** The year: 365 dots, one column per month. Gaps are paper, never a penalty. */
export function YearScreen() {
  const data = yearWithToday;
  const total = written(data);
  const blank = TODAY + 1 - total;
  const counts = inkCounts(data);
  const selected = doy(9, 19);
  return (
    <Screen>
      <BackBar
        right={
          <span style={{ display: 'flex', borderRadius: 16, boxShadow: `inset 0 0 0 1.25px ${m.line}`, fontSize: 14, height: 32, alignItems: 'center', padding: 3 }}>
            <span style={{ padding: '0 10px', color: m.soft }}>2024</span>
            <span style={{ padding: '0 10px', height: 26, borderRadius: 13, background: m.ink, color: m.paper, display: 'flex', alignItems: 'center' }}>2025</span>
          </span>
        }
      />
      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>2025</span>
          <span style={{ fontSize: 22, fontStyle: 'italic', color: m.soft }}>so far</span>
        </div>
        <div style={{ fontSize: 15.5, color: m.soft, marginTop: 8 }}>
          {total} days written, {blank} left as paper.
          <br />
          Nothing to catch up on.
        </div>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <DotYear data={data} orient='cols' pitchX={27} pitchY={13.4} r={4.6} gutter={18} dayGutter={22} labels='initial' labelSize={12} selected={selected} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '16px 22px 0' }}>
        {inks.map((i) => (
          <div key={i.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
              <InkDot id={i.id} size={9} />
              {i.mood}
            </div>
            <div style={{ fontSize: 12.5, color: m.soft, paddingLeft: 14, fontVariantNumeric: 'tabular-nums' }}>{counts[i.id]} days</div>
          </div>
        ))}
      </div>
      <div
        style={{
          margin: 'auto 16px 40px',
          background: m.sheet,
          borderRadius: 16,
          padding: '13px 16px 14px',
          boxShadow: `inset 0 0 0 1px ${m.line}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InkDot id='steady' size={9} />
          <span style={{ fontSize: 15.5, fontWeight: 600 }}>Sunday, October 19</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: m.soft }}>Moss · Steady</span>
        </div>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: m.soft, marginTop: 6 }}>Where did you go that wasn’t home or work?</div>
        <div style={{ fontSize: 15.5, lineHeight: 1.38, marginTop: 3 }}>
          Rode the bike out to Sauvie Island for the last pumpkins. Headwind both ways, somehow.
        </div>
      </div>
    </Screen>
  );
}

/** Tapping a margin note: this date across every year you have written. */
export function OnThisDayScreen() {
  const rows: (PastEntry & { today?: boolean })[] = [
    { year: 2025, weekday: 'Tuesday', ink: todayEntry.ink, prompt: todayEntry.prompt, text: todayEntry.text, note: '', today: true },
    ...onThisDay
  ];
  return (
    <Screen>
      <BackBar />
      <div style={{ padding: '6px 22px 0' }}>
        <div style={{ ...caps, color: m.pencilText }}>In the margin</div>
        <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 6 }}>November 4</div>
        <div style={{ fontSize: 18, fontStyle: 'italic', color: m.soft, marginTop: 4 }}>four years of the same date</div>
      </div>
      <div style={{ padding: '24px 22px 0', display: 'flex', flexDirection: 'column' }}>
        {rows.map((r, idx) => (
          <div key={r.year} style={{ display: 'grid', gridTemplateColumns: '62px 18px 1fr', columnGap: 8 }}>
            <div style={{ paddingTop: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 650, lineHeight: 1.1, fontVariantNumeric: 'lining-nums' }}>{r.year}</div>
              <div style={{ fontSize: 12.5, color: r.today ? m.pencilText : m.soft, marginTop: 2, fontWeight: r.today ? 600 : 400 }}>
                {r.today ? 'Today' : r.weekday}
              </div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ position: 'absolute', top: 6, width: 12, height: 12, borderRadius: 6, background: ink(r.ink).color, boxShadow: r.today ? `0 0 0 3px ${m.paper}, 0 0 0 4.5px ${m.pencil}` : undefined, zIndex: 1 }} />
              {idx < rows.length - 1 && <span style={{ position: 'absolute', top: 14, bottom: -8, width: 1.5, background: m.line }} />}
            </div>
            <div style={{ paddingBottom: 22 }}>
              <div style={{ fontSize: 14, fontStyle: 'italic', color: m.soft, lineHeight: 1.3 }}>{r.prompt}</div>
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.42,
                  marginTop: 4,
                  display: '-webkit-box',
                  WebkitLineClamp: r.today ? 3 : 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {r.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function Highlight({ children }: { children: ReactNode }) {
  return (
    <mark
      style={{
        color: 'inherit',
        background: `linear-gradient(to bottom, transparent 55%, rgba(200,68,46,0.26) 55%, rgba(200,68,46,0.26) 94%, transparent 94%)`,
        padding: '0 1px'
      }}
    >
      {children}
    </mark>
  );
}

/** Search every page and margin note; tags come from words you repeat. */
export function SearchScreen() {
  const tags: [string, number, boolean?][] = [
    ['bike', 19, true],
    ['garden', 27],
    ['Dmitri', 12],
    ['rain', 31],
    ['soup', 8]
  ];
  const groups = [
    { year: 2025, hits: searchHits.filter((h) => h.year === 2025) },
    { year: 2024, hits: searchHits.filter((h) => h.year === 2024) }
  ];
  return (
    <Screen>
      <div style={{ padding: '58px 16px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            background: m.sheet,
            boxShadow: `inset 0 0 0 1.25px ${m.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            fontSize: 17
          }}
        >
          <span style={{ color: m.soft, display: 'flex' }}>
            <Icon name='search' size={19} />
          </span>
          <span>bike</span>
          <span style={{ width: 1.5, height: 20, background: m.pencil, marginLeft: -6 }} />
          <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: 10, background: m.gap, color: m.sheet, display: 'grid', placeItems: 'center', fontSize: 13, lineHeight: 1 }}>
            ×
          </span>
        </div>
        <span style={{ fontSize: 16 }}>Cancel</span>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px 0', overflow: 'hidden' }}>
        {tags.map(([tag, n, on]) => (
          <span
            key={tag}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14.5,
              whiteSpace: 'nowrap',
              background: on ? m.ink : 'transparent',
              color: on ? m.paper : m.ink,
              boxShadow: on ? 'none' : `inset 0 0 0 1.25px ${m.line}`
            }}
          >
            {tag}
            <span style={{ fontSize: 12.5, opacity: on ? 0.75 : 1, color: on ? m.paper : m.soft }}>{n}</span>
          </span>
        ))}
      </div>
      <div style={{ padding: '16px 22px 0', fontSize: 15, color: m.soft }}>
        19 pages mention <i style={{ color: m.ink }}>bike</i>, the first in March 2023.
      </div>
      <div style={{ padding: '6px 22px 0', flex: 1 }}>
        {groups.map((g) => (
          <div key={g.year}>
            <div style={{ ...caps, color: m.soft, padding: '18px 0 4px', borderBottom: `1px solid ${m.line}` }}>{g.year}</div>
            {g.hits.map((h) => (
              <div key={h.date} style={{ padding: '12px 0 13px', borderBottom: `1px solid ${m.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InkDot id={h.ink} size={8} />
                  <span style={{ fontSize: 15, fontWeight: 650, width: 58, flex: 'none', whiteSpace: 'nowrap' }}>{h.date}</span>
                  <span style={{ fontSize: 13.5, fontStyle: 'italic', color: m.soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.prompt}
                  </span>
                </div>
                <div style={{ fontSize: 15.5, lineHeight: 1.4, marginTop: 4, paddingLeft: 16 }}>
                  {h.before}
                  <Highlight>{h.match}</Highlight>
                  {h.after}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Screen>
  );
}

/** Onboarding, last step: one reminder at one time, and what it will say. */
export function ReminderScreen() {
  const times = [
    ['Before work', '7:30 am'],
    ['Lunch', '12:15 pm'],
    ['After dinner', '8:45 pm'],
    ['No reminder', 'I’ll find it']
  ];
  const chosen = 2;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const offDay = 6;
  return (
    <Screen>
      <div style={{ padding: '62px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 26, height: 4, borderRadius: 2, background: i < 3 ? m.ink : m.line }} />
          ))}
        </div>
        <span style={{ fontSize: 15, color: m.soft }}>3 of 3</span>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <div style={{ fontSize: 31, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          When should we leave the page out?
        </div>
        <div style={{ fontSize: 16.5, color: m.soft, lineHeight: 1.4, marginTop: 10 }}>
          One reminder, at one time. Skip a day and that’s it: no second nudge, nothing to lose.
        </div>
      </div>
      <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {times.map(([label, time], i) => {
          const on = i === chosen;
          return (
            <div
              key={label}
              style={{
                height: 54,
                borderRadius: 14,
                background: m.sheet,
                boxShadow: on ? `inset 0 0 0 2px ${m.ink}` : `inset 0 0 0 1.25px ${m.line}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 16px'
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  boxShadow: on ? `inset 0 0 0 6px ${m.ink}` : `inset 0 0 0 1.5px ${m.gap}`,
                  flex: 'none'
                }}
              />
              <span style={{ fontSize: 17, fontWeight: on ? 600 : 450 }}>{label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 16, color: on ? m.ink : m.soft, fontStyle: i === 3 ? 'italic' : 'normal', fontVariantNumeric: 'tabular-nums' }}>
                {time}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...caps, color: m.soft }}>On</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => {
            const on = i !== offDay;
            return (
              <span
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14.5,
                  fontWeight: 600,
                  background: on ? m.ink : 'transparent',
                  color: on ? m.paper : m.soft,
                  boxShadow: on ? 'none' : `inset 0 0 0 1.25px ${m.line}`
                }}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ ...caps, color: m.soft }}>What you’ll see at 8:45</div>
        <div
          style={{
            marginTop: 10,
            borderRadius: 18,
            background: 'rgba(35,40,58,0.06)',
            padding: '12px 14px',
            display: 'flex',
            gap: 11,
            fontFamily: m.sans
          }}
        >
          <AppGlyph />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: m.soft }}>
              <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>MARGIN</span>
              <span>now</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>What did you fix this week?</div>
            <div style={{ fontSize: 14, color: m.soft, marginTop: 1 }}>Three lines is plenty.</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 22px 40px' }}>
        <div style={{ height: 54, borderRadius: 14, background: m.ink, color: m.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>
          Start with today’s question
        </div>
      </div>
    </Screen>
  );
}

/** The app icon: a page with its red margin rule and one dot. */
export function AppGlyph({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 40 40' aria-hidden style={{ flex: 'none' }}>
      <rect width='40' height='40' rx='10' fill={m.ink} />
      <rect x='8' y='8' width='24' height='26' rx='2' fill={m.paper} />
      <path d='M24.5 8v26' stroke={m.pencil} strokeWidth='1.6' />
      <path d='M11 15.5h10M11 20.5h10M11 25.5h7' stroke={m.ruling} strokeWidth='1.4' strokeLinecap='round' />
      <circle cx='28.3' cy='15.5' r='1.9' fill={inks[0].color} />
    </svg>
  );
}

