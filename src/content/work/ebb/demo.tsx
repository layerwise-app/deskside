import { useState } from 'react';
import { Phone } from '~/components/frames/Phone';
import { LONG_RUN_DEFAULT_KM, forecast, type Sunday } from './data';
import { WeekScreen } from './screens';
import { t } from './theme';

const where = {
  in: 'Week in your corridor',
  over: 'Week over your range',
  under: 'Week under your range'
} as const;

/**
 * Live demo: plan Saturday's long run and watch the week move in or out of
 * its corridor, and Sunday's morning sentence change with it.
 */
export default function CorridorDemo() {
  const [km, setKm] = useState(LONG_RUN_DEFAULT_KM);
  const [sunday, setSunday] = useState<Sunday>('spin');
  const f = forecast(km, sunday);

  return (
    <Phone fit bar='light' screen={t.bg}>
      <WeekScreen km={km} sunday={sunday} onKm={setKm} onSunday={setSunday} />
      {/* Changes only when the week crosses an edge or the sentence changes,
          so it is not read out on every step. The slider has its own value. */}
      <div
        aria-live='polite'
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap'
        }}
      >
        {`${where[f.status]}. ${f.headline}`}
      </div>
    </Phone>
  );
}
