import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  DETENT,
  fillFor,
  format,
  modeOrder,
  modes,
  rooms,
  scenes,
  startHouse,
  type House,
  type Mode,
  type RoomId,
  type RoomState
} from './data';
import { DIAL, Remote } from './remote';
import { Icon, ModeGlyph, n } from './theme';

// Phones: the remote at 80% above a compact readout, 340 × 590.
// 768px and up: full size beside a taller readout, 660 × 500.
const css = `
.nook-demo{--nook-scale:.8;position:relative;width:340px;height:590px;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:${n.font};color:${n.ink};-webkit-tap-highlight-color:transparent}
.nook-remote{-webkit-user-select:none;user-select:none}
.nook-remote :focus-visible{outline-color:#F4EFE8}
.nook-key:active .nook-cap{transform:translateY(1.5px)}
.nook-dial{position:absolute;border-radius:50%;touch-action:none;cursor:grab}
.nook-dial.is-dragging{cursor:grabbing}
.nook-panel{box-sizing:border-box;width:340px;background:#F8F5F0;border-radius:20px;padding:14px;display:grid;grid-template-columns:1fr auto;grid-template-areas:"head big" "tiles tiles" "carry carry";gap:12px 10px;align-items:end;box-shadow:0 1px 0 rgba(43,39,36,.06),0 14px 30px -20px rgba(43,39,36,.35)}
.nook-head{grid-area:head;min-width:0}
.nook-where{display:none;font-size:13px;font-weight:500;color:${n.soft}}
.nook-room{display:flex;align-items:center;gap:7px;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.15;white-space:nowrap}
.nook-scene{display:flex;align-items:center;gap:6px;font-size:13px;color:${n.soft};margin-top:4px;white-space:nowrap}
.nook-scene i{width:6px;height:6px;border-radius:3px;background:${n.stone}}
.nook-scene.is-on i{background:${n.glow};box-shadow:0 0 5px rgba(255,122,61,.8)}
.nook-big{grid-area:big;text-align:right}
.nook-big-label{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:${n.soft}}
.nook-big-value{font-size:32px;font-weight:300;letter-spacing:-.03em;line-height:1;margin-top:3px;font-variant-numeric:tabular-nums}
.nook-tiles{grid-area:tiles;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.nook-tile{background:#EEE8E0;border-radius:12px;padding:9px 11px 10px;display:grid;grid-template-columns:1fr auto;align-items:baseline;row-gap:8px;transition:background .2s,color .2s}
.nook-tile b{font-size:12.5px;font-weight:500;color:${n.soft};transition:color .2s}
.nook-tile span{font-size:15.5px;font-weight:600;font-variant-numeric:tabular-nums}
.nook-tile u{grid-column:1/-1;display:block;height:4px;border-radius:2px;background:#DDD5CA;overflow:hidden;text-decoration:none}
.nook-tile u i{display:block;height:100%;border-radius:2px;background:${n.glow};transition:width .45s cubic-bezier(.25,.8,.25,1)}
.nook-tile.is-on{background:${n.ink};color:#F4EFE8}
.nook-tile.is-on b{color:${n.nightSoft}}
.nook-tile.is-on u{background:#4A433E}
.nook-carry{grid-area:carry;display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:6px;align-items:center}
.nook-carry-label{font-size:12.5px;font-weight:500;color:${n.soft};padding-right:2px}
.nook-carry button{height:34px;border:none;border-radius:11px;background:transparent;box-shadow:inset 0 0 0 1.5px ${n.line};font:inherit;font-size:13px;font-weight:600;color:${n.ink};cursor:pointer;padding:0 4px;white-space:nowrap;transition:background .16s,color .16s,box-shadow .16s}
.nook-carry button[aria-checked=true]{background:${n.ink};color:#F4EFE8;box-shadow:none}
@media (min-width:768px){
  .nook-demo{--nook-scale:1;width:660px;height:500px;flex-direction:row;justify-content:center;gap:40px}
  .nook-panel{width:300px;grid-template-columns:1fr;grid-template-areas:"head" "big" "tiles" "carry";padding:22px;gap:18px;align-items:start}
  .nook-where{display:block;margin-bottom:4px}
  .nook-room{font-size:26px}
  .nook-big{text-align:left;padding-top:14px;border-top:1px solid ${n.line}}
  .nook-big-value{font-size:60px;margin-top:6px}
  .nook-tiles{grid-template-columns:1fr;gap:6px}
  .nook-tile{padding:8px 12px 9px;row-gap:7px}
  .nook-carry{grid-template-columns:repeat(3,1fr)}
  .nook-carry-label{grid-column:1/-1;padding:0 0 2px}
}
`;

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap'
} as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const summary = (s: RoomState) =>
  `lights ${s.light ? `${s.light}%` : 'off'}, heat ${s.heat}°F, music ${s.music ? `on at ${s.music}%` : 'off'}`;

/** Live demo: the remote itself. Turn the dial, press it, press a key. */
export default function RemoteDemo() {
  const [house, setHouse] = useState<House>(startHouse);
  const [room, setRoom] = useState<RoomId>('living');
  const [mode, setMode] = useState<Mode>('heat');
  const [rotation, setRotation] = useState(0);
  const [scene, setScene] = useState<number | null>(null);
  const [byHand, setByHand] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('');
  const dialRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; last: number; acc: number; travel: number; x: number; y: number } | null>(null);
  const carryId = `${useId()}-carry`;

  const spec = modes[mode];
  const state = house[room];
  const value = state[mode];
  const roomName = rooms.find((r) => r.id === room)!.name;
  const valueText =
    mode === 'heat'
      ? `${roomName}, ${value}°F`
      : `${roomName}, ${spec.label.toLowerCase()} ${value ? `${value}%` : 'off'}`;

  /** Move the current room's value by whole detents. */
  const turn = (detents: number) => {
    if (!detents) return;
    setHouse((h) => {
      const cur = h[room][mode];
      const next = clamp(cur + detents * spec.step, spec.min, spec.max);
      return next === cur ? h : { ...h, [room]: { ...h[room], [mode]: next } };
    });
    setScene(null);
    setByHand(true);
  };

  /** Pressing the dial switches what it controls, like the hardware. */
  const pressDial = () => {
    const next = modeOrder[(modeOrder.indexOf(mode) + 1) % modeOrder.length];
    setMode(next);
    setMessage(`Dial controls ${modes[next].label.toLowerCase()}: ${format(next, state[next])}.`);
  };

  const pressKey = (i: number) => {
    const s = scenes[i];
    setHouse(s.house);
    setScene(i);
    setByHand(false);
    setMessage(`${s.name}. ${roomName}: ${summary(s.house[room])}.`);
  };

  const carryTo = (id: RoomId) => {
    if (id === room) return;
    const name = rooms.find((r) => r.id === id)!.name;
    setRoom(id);
    setMessage(`Remote is in the ${name.toLowerCase()}. ${spec.label} ${format(mode, house[id][mode])}.`);
  };

  const angleAt = (e: PointerEvent) => {
    const r = dialRef.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    return { a: (Math.atan2(dy, dx) * 180) / Math.PI, d: Math.hypot(dx, dy), r: r.width / 2 };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, last: angleAt(e).a, acc: 0, travel: 0, x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const { a, d, r } = angleAt(e);
    g.travel = Math.max(g.travel, Math.hypot(e.clientX - g.x, e.clientY - g.y));
    // Too close to the middle to read an angle reliably.
    if (d < r * 0.15) {
      g.last = a;
      return;
    }
    let delta = a - g.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    g.last = a;
    g.acc += delta;
    setRotation((x) => x + delta);
    const detents = Math.trunc(g.acc / DETENT);
    if (detents) {
      g.acc -= detents * DETENT;
      turn(detents);
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (g.travel < 6) pressDial();
  };

  const onPointerCancel = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
    let detents: number | null = keys[e.key] ?? null;
    if (e.key === 'Home') detents = (spec.min - value) / spec.step;
    if (e.key === 'End') detents = (spec.max - value) / spec.step;
    if (detents !== null) {
      const by = detents;
      e.preventDefault();
      turn(by);
      setRotation((x) => x + by * DETENT);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pressDial();
    }
  };

  const sceneLine = scene !== null ? `${scenes[scene].name} scene` : byHand ? 'Set by hand' : 'No scene on';
  const big = mode === 'heat' ? `${value}°` : format(mode, value);

  return (
    <div className='nook-demo'>
      <style>{css}</style>
      <Remote
        fill={fillFor(mode, value)}
        rotation={rotation}
        mode={mode}
        active={scene}
        scale='var(--nook-scale)'
        ease={dragging ? 90 : 450}
        onKey={pressKey}
        onMode={(m) => setMode(m)}
      >
        <div
          ref={dialRef}
          className={`nook-dial${dragging ? ' is-dragging' : ''}`}
          role='slider'
          tabIndex={0}
          aria-label='Dial'
          aria-valuemin={spec.min}
          aria-valuemax={spec.max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onLostPointerCapture={onPointerCancel}
          onKeyDown={onKeyDown}
          style={{
            left: DIAL.cx - DIAL.reach,
            top: DIAL.cy - DIAL.reach,
            width: DIAL.reach * 2,
            height: DIAL.reach * 2
          }}
        />
      </Remote>

      <div className='nook-panel'>
        <div className='nook-head'>
          <div className='nook-where'>Remote is in</div>
          <div className='nook-room'>
            <Icon.here size={18} color={n.glow} />
            {roomName}
          </div>
          <div className={`nook-scene${scene !== null ? ' is-on' : ''}`}>
            <i />
            {sceneLine}
          </div>
        </div>
        <div className='nook-big' aria-hidden>
          <div className='nook-big-label'>
            <ModeGlyph mode={mode} size={15} color={n.glowDeep} />
            {spec.label}
          </div>
          <div className='nook-big-value'>{big}</div>
        </div>
        <div className='nook-tiles' aria-label={`${roomName} right now`} role='group'>
          {modeOrder.map((m) => (
            <div key={m} className={`nook-tile${m === mode ? ' is-on' : ''}`}>
              <b>{modes[m].label}</b>
              <span>{format(m, state[m])}</span>
              <u aria-hidden>
                <i style={{ width: `${fillFor(m, state[m]) * 100}%` }} />
              </u>
            </div>
          ))}
        </div>
        <div className='nook-carry' role='radiogroup' aria-labelledby={carryId}>
          <div className='nook-carry-label' id={carryId}>
            Carry it to
          </div>
          {rooms.map((r) => (
            <button key={r.id} type='button' role='radio' aria-checked={r.id === room} onClick={() => carryTo(r.id)}>
              {r.name}
            </button>
          ))}
        </div>
      </div>
      <div aria-live='polite' style={srOnly}>
        {message}
      </div>
    </div>
  );
}
