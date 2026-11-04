import { useEffect, useRef, useState } from 'react';
import { Phone } from '~/components/frames/Phone';
import { CardHomeScreen, defaultLocks, lockList, type LockId, type Locks, type Toast } from './screens';
import { a } from './theme';

const UNDO_SECONDS = 5;
const SHOW_SECONDS = 30;

/** Live demo: freeze with undo, flip the locks, reveal the card details. */
export default function CardControlsDemo() {
  const [frozen, setFrozen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [hold, setHold] = useState({ focus: false, pointer: false });
  const [locks, setLocks] = useState<Locks>(defaultLocks);
  const [verifying, setVerifying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hideIn, setHideIn] = useState(SHOW_SECONDS);
  const [live, setLive] = useState('');
  const run = useRef(0);
  const freezeRef = useRef<HTMLButtonElement>(null);
  const faceId = useRef<ReturnType<typeof setTimeout>>(undefined);
  const paused = hold.focus || hold.pointer;

  // The undo window counts down once a second, and waits while someone is
  // reaching for Undo with the keyboard or pointer.
  useEffect(() => {
    if (!toast) return;
    if (toast.kind === 'active') {
      const t = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(t);
    }
    if (paused) return;
    const t = setTimeout(() => {
      setToast((cur) => {
        if (!cur || cur.kind !== 'frozen') return cur;
        return cur.seconds <= 1 ? null : { ...cur, seconds: cur.seconds - 1 };
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [toast, paused]);

  // Revealed details hide themselves again.
  useEffect(() => {
    if (!revealed) return;
    if (hideIn <= 0) {
      setRevealed(false);
      setLive('Card details hidden.');
      return;
    }
    const t = setTimeout(() => setHideIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [revealed, hideIn]);

  useEffect(() => () => clearTimeout(faceId.current), []);

  const freeze = () => {
    run.current += 1;
    setHold({ focus: false, pointer: false });
    if (!frozen) {
      setFrozen(true);
      setToast({ kind: 'frozen', seconds: UNDO_SECONDS, run: run.current });
      setLive('Card frozen. Payments and ATM cash are paused, bills still go through. Undo is available for 5 seconds.');
    } else {
      setFrozen(false);
      setToast({ kind: 'active', run: run.current });
      setLive('Card unfrozen. Payments and cash are back on.');
    }
  };

  const undo = () => {
    setFrozen(false);
    setToast(null);
    setHold({ focus: false, pointer: false });
    setLive('Freeze undone. Your card is active.');
    freezeRef.current?.focus();
  };

  const reveal = () => {
    if (verifying) return;
    if (revealed) {
      setRevealed(false);
      setLive('Card details hidden.');
      return;
    }
    setVerifying(true);
    setLive('Checking Face ID.');
    faceId.current = setTimeout(() => {
      setVerifying(false);
      setHideIn(SHOW_SECONDS);
      setRevealed(true);
      setLive(`Face ID confirmed. Sample card details shown. They hide again in ${SHOW_SECONDS} seconds.`);
    }, 900);
  };

  const toggleLock = (id: LockId) => {
    setLocks((l) => ({ ...l, [id]: !l[id] }));
    const label = lockList.find((l) => l.id === id)?.label ?? id;
    setLive(`${label} lock ${locks[id] ? 'off' : 'on'}.`);
  };

  return (
    <Phone fit screen={a.linen}>
      <CardHomeScreen
        frozen={frozen}
        revealed={revealed}
        verifying={verifying}
        hideIn={hideIn}
        locks={locks}
        toast={toast}
        toastPaused={paused}
        freezeRef={freezeRef}
        onFreeze={freeze}
        onReveal={reveal}
        onLock={toggleLock}
        onUndo={undo}
        onToastHold={(by, value) => setHold((h) => (h[by] === value ? h : { ...h, [by]: value }))}
        live={live}
      />
    </Phone>
  );
}
