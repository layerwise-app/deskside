/**
 * Sample data for Cascadia Rail's screens. "Today" in the app is Tuesday,
 * March 3, 2026; the month shown is March 2026, which starts on a Sunday.
 */

export const TODAY = 3;
export const MONTH = 'March';
export const YEAR = 2026;
export const BIKE_FEE = 5;

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Lowest one-way adult fare, Portland to Seattle, for each day of March. */
const fares: (number | null)[] = [
  null, null, 58, 44, 41, 56, 39,
  48, 36, 29, 29, 29, 47, 34,
  45, 34, 31, 29, 33, 52, 42,
  49, 44, 39, 39, 41, 58, 46,
  54, 36, 29
];

export const LOWEST = Math.min(...fares.filter((f): f is number => f !== null));

export type Day = {
  date: number;
  weekday: number;
  fare: number | null;
  cheapest: boolean;
  past: boolean;
  today: boolean;
};

export const days: Day[] = fares.map((fare, i) => ({
  date: i + 1,
  weekday: i % 7,
  fare,
  cheapest: fare === LOWEST,
  past: fare === null,
  today: i + 1 === TODAY
}));

export const dayLabel = (date: number) => `${weekdaysShort[days[date - 1].weekday]}, Mar ${date}`;
export const dayLabelLong = (date: number) => `${weekdays[days[date - 1].weekday]}, ${MONTH} ${date}`;

export type Train = {
  no: number;
  dep: string;
  arr: string;
  duration: string;
  fare: number;
  lowest: boolean;
  note?: string;
  warn?: boolean;
  bikeFull?: boolean;
};

/** The northbound weekday timetable. Each train sits a set amount above the day's lowest fare. */
const timetable = [
  { no: 501, dep: '5:40 am', arr: '9:04 am', duration: '3 h 24 m', over: 7, note: '4 bike spaces' },
  { no: 503, dep: '6:55 am', arr: '10:21 am', duration: '3 h 26 m', over: 4, note: '2 bike spaces' },
  { no: 507, dep: '8:15 am', arr: '11:41 am', duration: '3 h 26 m', over: 0, note: '3 bike spaces' },
  { no: 509, dep: '10:30 am', arr: '1:58 pm', duration: '3 h 28 m', over: 6, note: '6 bike spaces' },
  { no: 511, dep: '12:45 pm', arr: '4:09 pm', duration: '3 h 24 m', over: 2, note: '5 bike spaces' },
  { no: 513, dep: '3:20 pm', arr: '6:47 pm', duration: '3 h 27 m', over: 18, note: '3 seats left', warn: true },
  { no: 515, dep: '5:35 pm', arr: '9:02 pm', duration: '3 h 27 m', over: 23, note: 'Bike car full', bikeFull: true },
  { no: 517, dep: '7:50 pm', arr: '11:16 pm', duration: '3 h 26 m', over: 3, note: '6 bike spaces' }
];

export function trainsFor(date: number): Train[] {
  const base = days[date - 1].fare ?? LOWEST;
  return timetable.map(({ over, ...rest }) => ({ ...rest, fare: base + over, lowest: over === 0 }));
}

export const stations = {
  PDX: { city: 'Portland', station: 'Union Station' },
  SEA: { city: 'Seattle', station: 'King Street Station' }
};

/** Train 507's stops, as seen at 9:41 am on the day of travel. */
export const stops = [
  { name: 'Portland', station: 'Union Station', time: '8:15 am', state: 'done', note: 'Left 8:15 am from Platform 3' },
  { name: 'Vancouver, WA', station: 'Vancouver Station', time: '8:31 am', state: 'done', note: 'Left 8:32 am' },
  { name: 'Kelso-Longview', station: 'Kelso Depot', time: '9:14 am', state: 'done', note: 'Left 9:15 am' },
  { name: 'Olympia-Lacey', station: 'Lacey Station', time: '10:02 am', state: 'next', note: 'Expected on time' },
  { name: 'Tacoma', station: 'Tacoma Dome', time: '10:46 am', state: 'later', note: 'Expected on time' },
  { name: 'Seattle', station: 'King Street Station', time: '11:41 am', state: 'yours', note: 'Your stop • exit toward S Jackson St' }
] as const;

export const rider = {
  name: 'Dana Whitlock',
  booking: 'HX4-27Q',
  car: 4,
  seat: '12A',
  bikeCar: 5,
  card: '4417'
};
