import { useState } from 'react';
import { Phone } from '~/components/frames/Phone';
import { ConfirmScreen, PickupScreen, pickupDays } from './screens';
import { t } from './theme';

/** Live demo: book a porch pickup window, then change your mind. */
export default function PickupDemo() {
  const [day, setDay] = useState('sat');
  const [window, setWindow] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const label = (() => {
    const d = pickupDays.find((x) => x.id === day)!;
    const w = d.windows.find((x) => x.id === window);
    return w ? `${d.dow}, ${d.date} · ${w.label}` : '';
  })();

  return (
    <Phone fit screen={booked ? t.cream : t.paper}>
      {booked ? (
        <ConfirmScreen windowLabel={label} onChange={() => setBooked(false)} />
      ) : (
        <PickupScreen
          day={day}
          window={window}
          onDay={(id) => {
            setDay(id);
            setWindow(null);
          }}
          onWindow={setWindow}
          onConfirm={() => window && setBooked(true)}
        />
      )}
    </Phone>
  );
}
