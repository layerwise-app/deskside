import { useId, type CSSProperties, type ReactNode, type Ref } from 'react';
import { CardArt, Frost, VirtualCardArt, cardHeight, cardRadius } from './card';
import { Group, Icon, Screen, SectionLabel, TabBar, TopBar, Track, a, bare, card, type IconName } from './theme';

// ── Shared pieces ─────────────────────────────────────────────────────────

export type LockId = 'gambling' | 'online' | 'abroad' | 'atm';
export type Locks = Record<LockId, boolean>;

export const lockList: { id: LockId; label: string; short: string; long: string; icon: IconName }[] = [
  { id: 'gambling', label: 'Gambling', short: 'Casinos and betting', long: 'Casinos, betting, poker and lottery.', icon: 'dice' },
  { id: 'online', label: 'Online', short: 'Websites and apps', long: 'Websites and apps. Not your virtual card.', icon: 'globe' },
  { id: 'abroad', label: 'Abroad', short: 'Outside the US', long: 'Anything charged outside the US.', icon: 'plane' },
  { id: 'atm', label: 'ATM', short: 'Cash withdrawals', long: 'Cash from any ATM, ours included.', icon: 'cash' }
];

export const defaultLocks: Locks = { gambling: true, online: false, abroad: true, atm: false };

const shadowCard = '0 16px 30px -14px rgba(19,42,30,0.5), 0 3px 6px -2px rgba(19,42,30,0.25)';

/**
 * The card on screen: flips to its details face, frosts over when frozen.
 * The frost sits outside the flip so it covers whichever face is showing.
 */
export function CardStack({
  width,
  frozen = false,
  revealed = false,
  hideIn = 30
}: {
  width: number;
  frozen?: boolean;
  revealed?: boolean;
  hideIn?: number;
}) {
  const h = cardHeight(width);
  const r = cardRadius(width);
  const face: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: r,
    boxShadow: shadowCard,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  };
  return (
    <div style={{ position: 'relative', width, height: h, flex: 'none', perspective: 1100 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(180deg)' : 'none',
          transition: 'transform 640ms cubic-bezier(.35,.75,.25,1)'
        }}
      >
        <div style={face}>
          <CardArt side='front' width={width} />
        </div>
        <div style={{ ...face, transform: 'rotateY(180deg)' }}>
          <CardArt side='details' width={width} hideIn={hideIn} />
        </div>
      </div>
      <Frost on={frozen} width={width} />
    </div>
  );
}

function StatusChip({ frozen }: { frozen: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: '0 10px',
        borderRadius: 13,
        fontSize: 12.5,
        fontWeight: 650,
        alignSelf: 'flex-start',
        background: frozen ? a.frost : a.mossSoft,
        color: frozen ? a.frostInk : a.moss,
        transition: 'background 300ms, color 300ms'
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 4, background: 'currentColor' }} />
      {frozen ? 'Frozen' : 'Active'}
    </span>
  );
}

function SideButton({
  icon,
  children,
  meta,
  onClick,
  busy,
  label
}: {
  icon: IconName;
  children: ReactNode;
  meta?: string;
  onClick?: () => void;
  busy?: boolean;
  label?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, 'aria-label': label, 'aria-busy': busy || undefined } : {})}
      style={{
        ...bare,
        height: 46,
        borderRadius: 14,
        background: a.surface,
        boxShadow: `inset 0 0 0 1.5px ${a.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '0 12px',
        color: a.ink,
        fontSize: 14.5,
        fontWeight: 650,
        whiteSpace: 'nowrap'
      }}
    >
      <Icon name={icon} size={20} color={a.forest} style={busy ? { animation: 'alder-pulse 700ms ease-in-out infinite' } : undefined} />
      <span style={{ flex: 1 }}>{children}</span>
      {meta && <span style={{ fontSize: 12, color: a.soft, fontWeight: 550 }}>{meta}</span>}
    </Tag>
  );
}

export type Toast = { kind: 'frozen'; seconds: number; run: number } | { kind: 'active'; run: number } | null;

export type CardHomeProps = {
  frozen?: boolean;
  revealed?: boolean;
  verifying?: boolean;
  hideIn?: number;
  locks?: Locks;
  toast?: Toast;
  /** Static stills draw the undo bar at a fixed point instead of animating. */
  toastProgress?: number;
  /** Pauses the undo bar while the toast has focus or the pointer. */
  toastPaused?: boolean;
  freezeRef?: Ref<HTMLButtonElement>;
  onFreeze?: () => void;
  onReveal?: () => void;
  onLock?: (id: LockId) => void;
  onUndo?: () => void;
  onToastHold?: (by: 'focus' | 'pointer', hold: boolean) => void;
  live?: string;
};

/** The Card tab: the card itself, one big Freeze, and four locks. */
export function CardHomeScreen({
  frozen = false,
  revealed = false,
  verifying = false,
  hideIn = 30,
  locks = defaultLocks,
  toast = null,
  toastProgress,
  toastPaused = false,
  freezeRef,
  onFreeze,
  onReveal,
  onLock,
  onUndo,
  onToastHold,
  live
}: CardHomeProps) {
  const ids = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const onCount = Object.values(locks).filter(Boolean).length;
  const cardW = 180;
  return (
    <Screen>
      <style>{`@keyframes alder-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}@keyframes alder-pulse{50%{opacity:.35}}`}</style>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: a.soft, fontWeight: 550 }}>{card.account}</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Your card</div>
        </div>
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            background: a.forest,
            color: a.brass,
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}
        >
          JH
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, padding: '16px 20px 0' }}>
        <div
          role='img'
          aria-label={
            revealed
              ? `Card details: number ${card.number.join(' ')}, expires ${card.expiry}, CVC ${card.cvc}. Sample card, not a real number.`
              : `Alder debit card ending ${card.last4}${frozen ? ', frozen' : ''}`
          }
        >
          <CardStack width={cardW} frozen={frozen} revealed={revealed} hideIn={hideIn} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>Everyday Debit</div>
          <div style={{ fontSize: 13, color: a.soft, marginTop: 1 }}>Ends in {card.last4}</div>
          <div style={{ marginTop: 10 }}>
            <StatusChip frozen={frozen} />
          </div>
          <div style={{ marginTop: 14, minHeight: 54 }}>
            {revealed || verifying ? (
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: revealed ? a.moss : a.soft }}>
                {revealed ? `Shown with Face ID. Hides again in ${hideIn} s.` : 'Look at your phone to confirm it’s you.'}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: a.faint, fontWeight: 600 }}>Last used</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 1 }}>Lantern Coffee</div>
                <div style={{ fontSize: 12.5, color: a.soft }}>8:12 am · $5.25</div>
              </>
            )}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SideButton icon='faceid' onClick={onReveal} busy={verifying}>
              {verifying ? 'Checking…' : revealed ? 'Hide details' : 'Show details'}
            </SideButton>
            <SideButton icon='globe' meta={`··${card.virtual.last4}`}>
              Virtual
            </SideButton>
          </div>
        </div>
      </div>

      <button
        ref={freezeRef}
        type='button'
        role='switch'
        aria-checked={frozen}
        aria-labelledby={`${ids}-ft`}
        aria-describedby={`${ids}-fd`}
        onClick={onFreeze}
        style={{
          ...bare,
          margin: '18px 20px 0',
          height: 80,
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 16px 0 14px',
          background: frozen ? a.frost : a.forest,
          color: frozen ? a.frostInk : '#F4F1E8',
          boxShadow: frozen ? `inset 0 0 0 1.5px ${a.frostMid}` : '0 10px 20px -12px rgba(19,42,30,0.6)',
          transition: 'background 320ms, color 320ms, box-shadow 320ms'
        }}
      >
        <span
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            background: frozen ? a.frostInk : 'rgba(211,230,238,0.14)',
            color: frozen ? '#fff' : a.frost,
            transition: 'background 320ms, color 320ms'
          }}
        >
          <Icon name='snowflake' size={28} width={2} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span id={`${ids}-ft`} style={{ display: 'block', fontSize: 19, fontWeight: 700, letterSpacing: '-0.015em' }}>
            Freeze card
          </span>
          <span id={`${ids}-fd`} style={{ display: 'block', fontSize: 13, opacity: 0.82, marginTop: 2 }}>
            {frozen ? 'On. Tap again to unfreeze.' : 'Stops payments and cash. Undo anytime.'}
          </span>
        </span>
        <Track on={frozen} tone={a.frostInk} size='lg' />
      </button>

      <div style={{ padding: '22px 20px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>Locks</div>
        <div style={{ fontSize: 13, color: a.soft, fontWeight: 550 }}>
          {onCount} on · <span style={{ color: a.forest, fontWeight: 650 }}>Details</span>
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {lockList.map((l) => {
          const on = locks[l.id];
          return (
            <button
              key={l.id}
              type='button'
              role='switch'
              aria-checked={on}
              aria-label={`${l.label} lock`}
              onClick={() => onLock?.(l.id)}
              style={{
                ...bare,
                height: 72,
                borderRadius: 18,
                padding: '12px 12px 0 14px',
                background: on ? a.surface : 'rgba(251,250,246,0.55)',
                boxShadow: on ? `inset 0 0 0 1.5px ${a.forest}` : `inset 0 0 0 1.5px ${a.line}`,
                transition: 'box-shadow 200ms, background 200ms'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={l.icon} size={18} color={on ? a.forest : a.soft} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 650, color: a.ink, whiteSpace: 'nowrap' }}>{l.label}</span>
                <Track on={on} />
              </span>
              <span style={{ display: 'block', fontSize: 12, color: a.soft, marginTop: 6 }}>{l.short}</span>
            </button>
          );
        })}
      </div>

      <TabBar active='card' />

      {toast && (
        <div
          onFocus={() => onToastHold?.('focus', true)}
          onBlur={() => onToastHold?.('focus', false)}
          onPointerEnter={() => onToastHold?.('pointer', true)}
          onPointerLeave={() => onToastHold?.('pointer', false)}
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 94,
            height: 60,
            borderRadius: 18,
            background: a.forestDeep,
            color: '#F4F1E8',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 8px 0 16px',
            boxShadow: '0 16px 30px -12px rgba(10,24,17,0.55)',
            overflow: 'hidden',
            zIndex: 5
          }}
        >
          <Icon name={toast.kind === 'frozen' ? 'snowflake' : 'check'} size={22} color={toast.kind === 'frozen' ? a.frost : '#A9D3B6'} />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 650 }}>
              {toast.kind === 'frozen' ? 'Card frozen' : 'Card is active again'}
            </span>
            <span style={{ display: 'block', fontSize: 12.5, opacity: 0.7 }}>
              {toast.kind === 'frozen' ? `Bills still go through · undo for ${toast.seconds} s` : 'Payments and cash are back on.'}
            </span>
          </span>
          {toast.kind === 'frozen' && (
            <button
              type='button'
              onClick={onUndo}
              style={{
                ...bare,
                height: 44,
                padding: '0 18px',
                borderRadius: 12,
                background: 'rgba(197,155,75,0.18)',
                color: a.brass,
                fontSize: 15.5,
                fontWeight: 700
              }}
            >
              Undo
            </button>
          )}
          {toast.kind === 'frozen' && (
            <span
              key={toast.run}
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 3,
                background: a.brass,
                transformOrigin: '0 50%',
                transform: toastProgress === undefined ? undefined : `scaleX(${toastProgress})`,
                animation: toastProgress === undefined ? 'alder-drain 5s linear forwards' : undefined,
                animationPlayState: toastPaused ? 'paused' : 'running'
              }}
            />
          )}
        </div>
      )}
      {live !== undefined && (
        <div
          aria-live='polite'
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
        >
          {live}
        </div>
      )}
    </Screen>
  );
}

function CopyPill() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 32,
        padding: '0 12px',
        borderRadius: 16,
        boxShadow: `inset 0 0 0 1.5px ${a.line}`,
        fontSize: 13,
        fontWeight: 650,
        color: a.forest
      }}
    >
      <Icon name='copy' size={15} width={2} />
      Copy
    </span>
  );
}

/** After Face ID: the numbers, a countdown, and a warning about callers. */
export function DetailsScreen() {
  const rows = [
    ['Card number', card.number.join(' ')],
    ['Expires', card.expiry],
    ['CVC', card.cvc]
  ];
  return (
    <Screen>
      <TopBar
        right={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 30,
              padding: '0 12px',
              borderRadius: 15,
              background: a.brassSoft,
              color: a.brassDeep,
              fontSize: 13,
              fontWeight: 650
            }}
          >
            Hides in 24 s
          </span>
        }
      />
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Card details</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: a.moss, fontWeight: 600, marginTop: 4 }}>
          <Icon name='faceid' size={17} width={2} />
          Confirmed with Face ID at 9:41 am
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 0' }}>
        <div style={{ borderRadius: cardRadius(176), boxShadow: shadowCard }}>
          <CardArt side='details' width={176} hideIn={24} />
        </div>
      </div>
      <div style={{ padding: '20px 20px 0' }}>
        <Group>
          {rows.map(([label, value], i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '11px 14px 11px 16px',
                borderTop: i ? `1px solid ${a.line}` : 'none'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: a.soft, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
              </div>
              <CopyPill />
            </div>
          ))}
        </Group>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 16,
            background: a.rustSoft,
            color: '#6F2D1D',
            fontSize: 13,
            lineHeight: 1.35
          }}
        >
          <Icon name='shield' size={20} color={a.rust} />
          <span>
            <b style={{ fontWeight: 700 }}>Alder will never call or text to ask for these.</b> If someone does, hang up
            and freeze your card.
          </span>
        </div>
      </div>
      <TabBar active='card' />
    </Screen>
  );
}

/** All four locks, each with what it stops and what it has stopped. */
export function LocksScreen({ locks = defaultLocks }: { locks?: Locks }) {
  const meta: Record<LockId, string | null> = {
    gambling: 'Stopped 1 charge in October',
    online: null,
    abroad: 'Stopped $412.60 in Guadalajara today',
    atm: null
  };
  return (
    <Screen>
      <TopBar />
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Locks</div>
        <div style={{ fontSize: 14, color: a.soft, marginTop: 6, lineHeight: 1.4 }}>
          Turn off a whole kind of spending. Everything else on the card keeps working.
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <Group>
          {lockList.map((l, i) => {
            const on = locks[l.id];
            return (
              <div key={l.id} style={{ display: 'flex', gap: 12, padding: '14px 14px 14px 14px', borderTop: i ? `1px solid ${a.line}` : 'none' }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    flex: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    background: on ? a.forest : a.linen,
                    color: on ? a.brass : a.soft
                  }}
                >
                  <Icon name={l.icon} size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 650 }}>{l.label}</span>
                    <Track on={on} />
                  </div>
                  <div style={{ fontSize: 13, color: a.soft, marginTop: 2, lineHeight: 1.35, paddingRight: 8 }}>{l.long}</div>
                  {on && meta[l.id] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 650, color: a.brassDeep, marginTop: 6 }}>
                      <Icon name='ban' size={14} width={2.1} />
                      {meta[l.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Group>
        <SectionLabel style={{ margin: '22px 0 8px 4px' }}>Always goes through</SectionLabel>
        <Group>
          {[
            ['bolt', 'Bills already set up on this card', 'Willamette Power, Cascade Fiber'],
            ['refresh', 'Refunds and returns', 'Money coming back is never blocked']
          ].map(([icon, title, sub], i) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i ? `1px solid ${a.line}` : 'none' }}>
              <Icon name={icon as IconName} size={19} color={a.moss} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: a.soft }}>{sub}</div>
              </div>
            </div>
          ))}
        </Group>
      </div>
      <TabBar active='card' />
    </Screen>
  );
}

// ── Activity ──────────────────────────────────────────────────────────────

type Cat = 'coffee' | 'groceries' | 'bills' | 'gas' | 'home' | 'dining';
const cats: Record<Cat, { label: string; icon: IconName; bg: string; fg: string }> = {
  coffee: { label: 'Coffee', icon: 'coffee', bg: a.brassSoft, fg: a.brassDeep },
  groceries: { label: 'Groceries', icon: 'basket', bg: a.mossSoft, fg: a.moss },
  bills: { label: 'Bills', icon: 'bolt', bg: '#E4E2EE', fg: '#4D4A78' },
  gas: { label: 'Gas', icon: 'fuel', bg: a.rustSoft, fg: a.rust },
  home: { label: 'Home', icon: 'wrench', bg: '#E8E3D6', fg: '#6A5B3E' },
  dining: { label: 'Dining', icon: 'fork', bg: '#F1E0E4', fg: '#8A3D52' }
};

function Merchant({
  cat,
  name,
  sub,
  amount,
  time
}: {
  cat: Cat;
  name: string;
  sub: string;
  amount: string;
  time: string;
}) {
  const c = cats[cat];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <span style={{ width: 40, height: 40, borderRadius: 13, flex: 'none', display: 'grid', placeItems: 'center', background: c.bg, color: c.fg }}>
        <Icon name={c.icon} size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 12.5, color: a.soft }}>
          <span style={{ color: c.fg, fontWeight: 650 }}>{c.label}</span> · {sub}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 15, fontWeight: 650 }}>{amount}</div>
        <div style={{ fontSize: 12, color: a.faint }}>{time}</div>
      </div>
    </div>
  );
}

/** Transactions with merchant categories, and a charge a lock stopped. */
export function ActivityScreen() {
  const split: [Cat, number][] = [
    ['groceries', 412.36],
    ['bills', 301.4],
    ['dining', 238.15],
    ['gas', 164.08],
    ['home', 96.3],
    ['coffee', 61.25]
  ];
  const total = split.reduce((s, [, v]) => s + v, 0);
  return (
    <Screen>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: a.soft, fontWeight: 550 }}>Everyday Debit ··{card.last4}</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Activity</div>
        </div>
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <Group style={{ padding: '14px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: a.soft, fontWeight: 600 }}>October so far</span>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 10 }}>
            {split.map(([c, v]) => (
              <span key={c} style={{ flex: v, background: cats[c].fg, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 8px', marginTop: 10, fontSize: 12 }}>
            {split.map(([c, v]) => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: cats[c].fg }} />
                <span style={{ color: a.soft }}>{cats[c].label}</span>
                <b style={{ fontWeight: 650 }}>${Math.round(v)}</b>
              </span>
            ))}
          </div>
        </Group>
      </div>

      <div style={{ padding: '16px 20px 0', flex: 1, overflow: 'hidden' }}>
        <SectionLabel>Today</SectionLabel>
        <Merchant cat='coffee' name='Lantern Coffee' sub='SE Belmont St' amount='$5.25' time='8:12 am' />
        <div
          style={{
            margin: '2px -10px 4px',
            padding: '10px 10px 12px',
            borderRadius: 16,
            background: a.surface,
            boxShadow: `inset 0 0 0 1.5px ${a.line}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 13, flex: 'none', display: 'grid', placeItems: 'center', background: a.forest, color: a.brass }}>
              <Icon name='plane' size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Mercado Azul</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>Guadalajara, Mexico · online</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: a.faint, textDecoration: 'line-through' }}>$412.60</div>
              <div style={{ fontSize: 12, color: a.faint }}>3:04 am</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 26,
                padding: '0 9px',
                borderRadius: 13,
                background: a.brassSoft,
                color: a.brassDeep,
                fontSize: 12,
                fontWeight: 700
              }}
            >
              <Icon name='lock' size={13} width={2.2} />
              Stopped by Abroad lock
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 650, color: a.forest }}>Allow once</span>
          </div>
          <div style={{ fontSize: 12.5, color: a.soft, marginTop: 8, lineHeight: 1.35 }}>
            Not you? There’s nothing to do. It never went through, and fraud ops has the merchant.
          </div>
        </div>
        <SectionLabel style={{ marginTop: 12 }}>Yesterday</SectionLabel>
        <Merchant cat='groceries' name='Hollyhock Market' sub='NE Alberta St' amount='$64.17' time='6:48 pm' />
        <Merchant cat='bills' name='Willamette Power & Light' sub='Monthly' amount='$88.40' time='Auto' />
        <Merchant cat='gas' name='Caldera Fuel' sub='NE Sandy Blvd' amount='$41.02' time='8:30 am' />
        <SectionLabel style={{ marginTop: 6 }}>Sat, Oct 21</SectionLabel>
        <Merchant cat='dining' name='Juniper Thai Kitchen' sub='N Mississippi Ave' amount='$36.50' time='7:15 pm' />
      </div>
      <TabBar active='card' />
    </Screen>
  );
}

/** A second number for online shopping, with its own cap. */
export function VirtualScreen() {
  const used = 86.4;
  const cap = 300;
  return (
    <Screen>
      <TopBar />
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Virtual card</div>
        <div style={{ fontSize: 14, color: a.soft, marginTop: 6, lineHeight: 1.4 }}>
          For shopping online. It has its own number, so it keeps working when your plastic is frozen.
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ borderRadius: cardRadius(350) * (540 / 856) * 1.58, boxShadow: '0 16px 30px -16px rgba(80,60,20,0.45), 0 2px 5px rgba(80,60,20,0.18)' }}>
          <VirtualCardArt width={350} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          {[
            ['faceid', 'Show number'],
            ['copy', 'Copy number']
          ].map(([icon, label]) => (
            <span
              key={label}
              style={{
                height: 46,
                borderRadius: 14,
                background: a.surface,
                boxShadow: `inset 0 0 0 1.5px ${a.line}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14.5,
                fontWeight: 650
              }}
            >
              <Icon name={icon as IconName} size={19} color={a.forest} />
              {label}
            </span>
          ))}
        </div>
        <Group style={{ marginTop: 14 }}>
          <div style={{ padding: '13px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, fontWeight: 650 }}>Monthly limit</span>
              <span style={{ fontSize: 15, fontWeight: 650 }}>${cap}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: a.linen, marginTop: 9, overflow: 'hidden' }}>
              <div style={{ width: `${(used / cap) * 100}%`, height: '100%', background: a.brass, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12.5, color: a.soft, marginTop: 6 }}>$86.40 used, last at Tidewater Books · resets Nov 1</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${a.line}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Lock to one shop</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>Only the first shop to charge it can again</div>
            </div>
            <Track on={false} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${a.line}` }}>
            <Icon name='refresh' size={20} color={a.forest} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: a.forest }}>New number</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>The old one stops working right away</div>
            </div>
            <Icon name='next' size={18} color={a.faint} />
          </div>
        </Group>
      </div>
      <TabBar active='card' />
    </Screen>
  );
}

function MapSketch() {
  // A few blocks of SE Belmont around SE 34th, drawn as a quiet street map.
  const blocks: [number, number, number, number][] = [];
  const cols = [0, 62, 118, 176, 236, 292];
  const rows = [0, 50, 92];
  for (const x of cols) for (const y of rows) blocks.push([x + 6, y + 6, 50, y === 50 ? 26 : 36]);
  return (
    <svg viewBox='0 0 350 136' width='100%' height='136' aria-hidden style={{ display: 'block' }}>
      <rect width='350' height='136' fill='#E6E2D6' />
      {blocks.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx='4' fill={i === 9 ? '#CFDDCB' : '#D9D4C6'} />
      ))}
      <rect x='0' y='86' width='350' height='12' fill='#F4EBD2' />
      <rect x='166' y='0' width='10' height='136' fill='#F4F1E8' />
      <text x='12' y='95.5' fontSize='8.5' fontWeight='650' fill='#8A7A55' fontFamily={a.font} letterSpacing='0.6'>
        SE BELMONT ST
      </text>
      <text x='0' y='0' fontSize='8' fontWeight='650' fill='#8E968F' fontFamily={a.font} letterSpacing='0.6' transform='translate(173.5 4) rotate(90)'>
        SE 34TH AVE
      </text>
      <circle cx='216' cy='76' r='22' fill={a.brass} fillOpacity='0.16' />
      <circle cx='216' cy='76' r='11' fill={a.brass} stroke='#fff' strokeWidth='3' />
      <circle cx='216' cy='76' r='3.6' fill={a.forest} />
    </svg>
  );
}

/** After a freeze: where the card was last used, and the two ways out. */
export function LostScreen() {
  return (
    <Screen>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Can’t find it?</div>
        <span style={{ width: 36, height: 36, borderRadius: 18, background: a.surface, boxShadow: `inset 0 0 0 1.5px ${a.line}`, display: 'grid', placeItems: 'center', color: a.soft }}>
          <Icon name='close' size={18} width={2.2} />
        </span>
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 18,
            background: a.frost,
            color: a.frostInk,
            boxShadow: `inset 0 0 0 1.5px ${a.frostMid}`
          }}
        >
          <span style={{ width: 40, height: 40, borderRadius: 20, background: a.frostInk, color: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Icon name='snowflake' size={22} width={2} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Frozen at 9:39 am</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Nobody can use it. Bills still go through.</div>
          </div>
        </div>

        <SectionLabel style={{ margin: '20px 0 8px 2px' }}>Last used</SectionLabel>
        <Group>
          <MapSketch />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: a.brassSoft, color: a.brassDeep, flex: 'none' }}>
              <Icon name='coffee' size={19} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Lantern Coffee</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>3412 SE Belmont St · 8:12 am</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 11px', borderRadius: 16, boxShadow: `inset 0 0 0 1.5px ${a.line}`, fontSize: 13, fontWeight: 650, color: a.forest }}>
              <Icon name='phone' size={14} width={2} />
              Call
            </span>
          </div>
        </Group>
        <div style={{ fontSize: 12.5, color: a.soft, margin: '8px 2px 0', lineHeight: 1.35 }}>
          Most cards turn up where they were last used. Six in ten are unfrozen within two days.
        </div>

        <SectionLabel style={{ margin: '20px 0 8px 2px' }}>When you know</SectionLabel>
        <Group>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name='check' size={20} color={a.moss} width={2.2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>I found it</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>Unfreeze and carry on</div>
            </div>
            <Icon name='next' size={18} color={a.faint} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${a.line}` }}>
            <Icon name='truck' size={20} color={a.forest} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650 }}>Replace it</div>
              <div style={{ fontSize: 12.5, color: a.soft }}>Arrives by Mon, Oct 30 · same PIN</div>
            </div>
            <Icon name='next' size={18} color={a.faint} />
          </div>
        </Group>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 2px 0', fontSize: 13, color: a.soft, lineHeight: 1.35 }}>
          <Icon name='globe' size={18} color={a.forest} />
          <span>
            Your virtual card <b style={{ color: a.ink, fontWeight: 650 }}>··{card.virtual.last4}</b> keeps working while this one is frozen.
          </span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 20px 40px' }}>
        <div
          style={{
            height: 54,
            borderRadius: 16,
            background: a.forest,
            color: '#F4F1E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 16.5,
            fontWeight: 650
          }}
        >
          Keep it frozen for now
        </div>
      </div>
    </Screen>
  );
}

