import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Phone } from '~/components/frames/Phone';
import { BIKE_FEE, dayLabelLong, type Train } from './data';
import { ConfirmSheet, FareCalendarScreen, minus, ScanScreen, TicketScreen, TrainListScreen } from './screens';
import { t } from './theme';

type View = 'calendar' | 'trains' | 'ticket' | 'scan';

/** How long the demo waits before dispatch "posts" the platform. */
const POST_DELAY = 2200;

const css = `
.cr-demo .cr-on-dark:focus-visible { outline-color: ${t.yellow}; }
.cr-demo .cr-cell:not(:disabled):hover { filter: brightness(0.96); }
.cr-demo .cr-row:not(:disabled):hover { box-shadow: inset 0 0 0 2px ${t.teal} !important; }
@keyframes cr-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.cr-view { position: absolute; inset: 0; animation: cr-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes cr-sheet { from { transform: translateY(100%); } to { transform: none; } }
.cr-sheet { animation: cr-sheet 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes cr-fade { from { opacity: 0; } to { opacity: 1; } }
.cr-scrim { animation: cr-fade 200ms both; }
@keyframes cr-pop { 0% { transform: scale(0.3); opacity: 0; } 55% { transform: scale(1.18); opacity: 1; } 100% { transform: scale(1); } }
.cr-fresh .cr-value { animation: cr-pop 560ms cubic-bezier(0.3, 1.3, 0.5, 1) both; transform-origin: 20% 80%; }
@keyframes cr-ring { 0% { box-shadow: 0 0 0 0 rgba(246, 196, 69, 0.85); } 100% { box-shadow: 0 0 0 20px rgba(246, 196, 69, 0); } }
.cr-fresh { animation: cr-ring 1000ms ease-out 2; }
@keyframes cr-row { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.cr-update, .cr-badge { animation: cr-row 420ms ease-out both; }
@keyframes cr-band { to { background-position: 52px 0; } }
.cr-band { animation: cr-band 1.4s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .cr-view, .cr-sheet, .cr-scrim, .cr-fresh, .cr-fresh .cr-value, .cr-update, .cr-badge, .cr-band { animation: none !important; }
}
`;

/** Live demo: pick a day by its fare, pick a train, watch the ticket get its platform. */
export default function FareCalendarDemo() {
  const [view, setView] = useState<View>('calendar');
  const [date, setDate] = useState(12);
  const [train, setTrain] = useState<Train | null>(null);
  const [sheet, setSheet] = useState<Train | null>(null);
  const [posted, setPosted] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [tick, setTick] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const navigated = useRef(false);

  const go = (next: View) => {
    navigated.current = true;
    setView(next);
  };

  // After moving between views, put focus on the new view's heading.
  useEffect(() => {
    if (navigated.current) headingRef.current?.focus({ preventScroll: true });
  }, [view]);

  // The platform posts a couple of seconds after the ticket appears.
  useEffect(() => {
    if (view !== 'ticket' || posted || !train) return;
    const id = window.setTimeout(() => {
      setPosted(true);
      setFresh(true);
      setAnnounce(`Platform 3 posted for train ${train.no}. Boarding now.`);
    }, POST_DELAY);
    return () => window.clearTimeout(id);
  }, [view, posted, train]);

  // Scan mode keeps a running clock so a screenshot is easy to spot.
  useEffect(() => {
    if (view !== 'scan') return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [view]);

  useEffect(() => {
    if (sheet) payRef.current?.focus({ preventScroll: true });
  }, [sheet]);

  const closeSheet = () => {
    setSheet(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  };

  const pay = () => {
    if (!sheet) return;
    setTrain(sheet);
    setSheet(null);
    setPosted(false);
    setFresh(false);
    setAnnounce(`Booked train ${sheet.no}, ${dayLabelLong(date)}, $${sheet.fare + BIKE_FEE}. Car 4, seat 12A. Platform not posted yet.`);
    go('ticket');
  };

  const onSheetKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeSheet();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([tabindex="-1"])')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const postedAt = train ? minus(train.dep, 20) : '7:55 am';
  const hhmm = (s: string) => s.split(' ')[0];
  const time =
    view === 'ticket'
      ? hhmm(posted ? postedAt : minus(train!.dep, 21))
      : view === 'scan'
        ? hhmm(minus(train!.dep, 18))
        : '9:41';
  const clock = (() => {
    const [h, m] = hhmm(minus(train?.dep ?? '8:15 am', 18)).split(':');
    const s = 8 + tick;
    return `${h}:${String(Number(m) + Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  })();

  return (
    <div className='cr-demo' style={{ position: 'relative' }}>
      <style>{css}</style>
      <Phone
        fit
        screen={view === 'scan' ? '#ffffff' : t.teal}
        bar={view === 'scan' ? 'dark' : 'light'}
        time={time}
      >
        {view === 'calendar' && (
          <div className='cr-view' key='calendar'>
            <FareCalendarScreen
              headingRef={headingRef}
              onPick={(d) => {
                setDate(d);
                go('trains');
              }}
            />
          </div>
        )}
        {view === 'trains' && (
          <div className='cr-view' key='trains'>
            <div inert={sheet ? true : undefined} style={{ position: 'absolute', inset: 0 }}>
              <TrainListScreen
                date={date}
                scroll
                headingRef={headingRef}
                onBack={() => go('calendar')}
                onDay={(d) => setDate(d)}
                onPick={(tr) => {
                  opener.current = document.activeElement as HTMLElement | null;
                  setSheet(tr);
                }}
              />
            </div>
            {sheet && (
              // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- keeps Tab inside the open sheet
              <div onKeyDown={onSheetKey}>
                <ConfirmSheet date={date} train={sheet} onPay={pay} onClose={closeSheet} payRef={payRef} />
              </div>
            )}
          </div>
        )}
        {view === 'ticket' && train && (
          <div className='cr-view' key='ticket'>
            <TicketScreen
              date={date}
              train={train}
              platform={posted ? 'posted' : 'tbd'}
              fresh={fresh}
              headingRef={headingRef}
              onBack={() => go('trains')}
              onScan={() => {
                setTick(0);
                setFresh(false);
                go('scan');
              }}
            />
          </div>
        )}
        {view === 'scan' && train && (
          <div className='cr-view' key='scan'>
            <ScanScreen live clock={clock} date={date} train={train} onDone={() => go('ticket')} headingRef={headingRef} />
          </div>
        )}
      </Phone>
      <div aria-live='polite' role='status' style={visuallyHidden}>
        {announce}
      </div>
    </div>
  );
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0
} as const;
