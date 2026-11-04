/**
 * The week the case study is built around: Mon Oct 14 to Sun Oct 20, 2024,
 * for Noor, a recreational runner training for a 30K. Today is Friday.
 * Load is Ebb's unitless training load (duration × intensity).
 */

export const CORRIDOR = { low: 320, high: 480, avg: 400 };

/** Load per kilometre for Noor's long run at an easy 5:50/km. */
export const LONG_RUN_LOAD_PER_KM = 9.5;
export const LONG_RUN_MIN_PER_KM = 5 + 50 / 60;
export const LONG_RUN_MAX_KM = 30;
export const LONG_RUN_DEFAULT_KM = 16;

export const SPIN_LOAD = 28;

export type DayState = 'done' | 'today' | 'planned';

export type Day = {
  id: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  dow: string;
  letter: string;
  date: string;
  /** Short name under the bar. */
  short: string;
  title: string;
  detail: string;
  load: number;
  state: DayState;
};

export const fixedDays: Day[] = [
  { id: 'mon', dow: 'Mon', letter: 'M', date: 'Oct 14', short: 'Easy', title: 'Easy run', detail: '7.4 km · 42 min', load: 44, state: 'done' },
  { id: 'tue', dow: 'Tue', letter: 'T', date: 'Oct 15', short: '6×800', title: 'Intervals, 6 × 800 m', detail: '10.4 km · 58 min', load: 96, state: 'done' },
  { id: 'wed', dow: 'Wed', letter: 'W', date: 'Oct 16', short: 'Mobility', title: 'Mobility', detail: '20 min', load: 6, state: 'done' },
  { id: 'thu', dow: 'Thu', letter: 'T', date: 'Oct 17', short: 'Ride', title: 'Tempo ride', detail: '31 km · 1 h 05 min', load: 72, state: 'done' },
  { id: 'fri', dow: 'Fri', letter: 'F', date: 'Oct 18', short: 'Easy', title: 'Easy run', detail: '30 min, under 145 bpm', load: 30, state: 'today' }
];

export const doneLoad = fixedDays.filter((d) => d.state === 'done').reduce((s, d) => s + d.load, 0);

export const longRunLoad = (km: number) => Math.round(km * LONG_RUN_LOAD_PER_KM);

export function longRunMinutes(km: number) {
  return Math.round((km * LONG_RUN_MIN_PER_KM) / 5) * 5;
}

export function formatDuration(min: number) {
  if (min === 0) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

export type Sunday = 'spin' | 'rest';

export function weekDays(km: number, sunday: Sunday): Day[] {
  return [
    ...fixedDays,
    {
      id: 'sat',
      dow: 'Sat',
      letter: 'S',
      date: 'Oct 19',
      short: km === 0 ? 'Skip' : 'Long',
      title: km === 0 ? 'Long run skipped' : 'Long run',
      detail: km === 0 ? 'Nothing planned' : `${km} km · ${formatDuration(longRunMinutes(km))}`,
      load: longRunLoad(km),
      state: 'planned'
    },
    {
      id: 'sun',
      dow: 'Sun',
      letter: 'S',
      date: 'Oct 20',
      short: sunday === 'spin' ? 'Spin' : 'Rest',
      title: sunday === 'spin' ? 'Easy spin' : 'Rest',
      detail: sunday === 'spin' ? '45 min, under 130 bpm' : 'Day off',
      load: sunday === 'spin' ? SPIN_LOAD : 0,
      state: 'planned'
    }
  ];
}

export type Status = 'under' | 'in' | 'over';
export type Level = 'ready' | 'steady' | 'easy';

export const levelLeds: Record<Level, number> = { ready: 3, steady: 2, easy: 1 };

export function statusOf(total: number): Status {
  if (total < CORRIDOR.low) return 'under';
  if (total > CORRIDOR.high) return 'over';
  return 'in';
}

/** Longest long run that keeps the week inside, for a given Sunday. */
export function maxKm(sunday: Sunday) {
  const fixed = fixedDays.reduce((s, d) => s + d.load, 0) + (sunday === 'spin' ? SPIN_LOAD : 0);
  return Math.floor((CORRIDOR.high - fixed) / LONG_RUN_LOAD_PER_KM);
}

export type Forecast = {
  total: number;
  status: Status;
  /** How far outside the corridor, 0 when inside. */
  gap: number;
  rhr: number;
  hrv: number;
  level: Level;
  headline: string;
  detail: string;
};

/**
 * Sunday morning, predicted from Noor's last 40 long runs: resting heart
 * rate and HRV the morning after, plus where the week lands.
 */
export function forecast(km: number, sunday: Sunday): Forecast {
  const total = weekDays(km, sunday).reduce((s, d) => s + d.load, 0);
  const status = statusOf(total);
  const gap = status === 'over' ? total - CORRIDOR.high : status === 'under' ? CORRIDOR.low - total : 0;
  const rhr = Math.round(Math.max(0, km - 10) * 0.45);
  const hrv = Math.round(Math.max(0, km - 8) * 1.1);
  const level: Level = rhr >= 5 ? 'easy' : rhr >= 3 ? 'steady' : 'ready';

  let headline: string;
  let detail: string;
  if (status === 'over') {
    if (sunday === 'spin' && gap <= SPIN_LOAD) {
      headline = 'Make Sunday a rest day.';
      detail = `This plan ends the week ${gap} over your range. Skipping the spin brings it back inside.`;
    } else {
      headline = 'Shorten Saturday.';
      detail =
        sunday === 'spin'
          ? `Even with Sunday off, the week would end ${gap - SPIN_LOAD} over your range. ${maxKm('rest')} km or less keeps it inside.`
          : `The week still ends ${gap} over your range. ${maxKm('rest')} km or less keeps it inside.`;
    }
  } else if (status === 'under') {
    headline = 'Sunday has room for more.';
    detail =
      sunday === 'spin'
        ? `The week would end ${gap} under your range. A longer ride on Sunday would bring it in.`
        : `The week would end ${gap} under your range. Put the spin back, or run a little on Saturday.`;
  } else if (level === 'easy') {
    headline = 'Go easy on Sunday.';
    detail = `After a ${km} km run, your resting heart rate usually sits ${rhr} bpm above normal the next morning.`;
  } else if (level === 'steady') {
    headline = 'Sunday looks like a normal day.';
    detail =
      sunday === 'spin'
        ? 'Keep the 45-minute spin easy, under 130 bpm. The week lands inside your range.'
        : `Resting is fine too. The week still lands at ${total}, inside your range.`;
  } else {
    headline = 'Sunday should feel fresh.';
    detail =
      sunday === 'spin'
        ? `Your heart rate should be back to normal. The week lands at ${total}, inside your range.`
        : `Your heart rate should be back to normal, and the week still lands inside your range.`;
  }

  return { total, status, gap, rhr, hrv, level, headline, detail };
}
