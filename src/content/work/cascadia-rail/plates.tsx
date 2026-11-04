import type { ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { trainsFor } from './data';
import {
  FareCalendarScreen,
  OldBookingScreen,
  ScanScreen,
  SearchScreen,
  SeatMapScreen,
  SeatPrefsScreen,
  TicketScreen,
  TrainListScreen,
  TripStatusScreen
} from './screens';
import { t } from './theme';

const single = (
  bg: string,
  node: ReactNode,
  { screen = t.cream, bar = 'dark', time = '9:41' }: { screen?: string; bar?: 'dark' | 'light'; time?: string } = {}
) => ({
  width: 720,
  height: 900,
  render: () => (
    <Plate background={bg}>
      <Phone scale={0.88} screen={screen} bar={bar} time={time}>
        {node}
      </Phone>
    </Plate>
  )
});

const train507 = trainsFor(12)[2];

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={t.teal} style={{ gap: 64 }}>
        <Phone scale={0.78} bar='light' screen={t.teal} style={{ marginTop: 32 }}>
          <FareCalendarScreen selected={12} />
        </Phone>
        <Phone scale={0.78} bar='light' screen={t.teal} time='7:55' style={{ marginTop: -32 }}>
          <TicketScreen train={train507} platform='posted' />
        </Phone>
      </Plate>
    )
  },
  flow: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#E7E2D3' style={{ gap: 60 }}>
        <Phone scale={0.78} screen={t.cream}>
          <SearchScreen />
        </Phone>
        <Phone scale={0.78} bar='light' screen={t.teal}>
          <TrainListScreen date={12} />
        </Phone>
        <Phone scale={0.78} bar='light' screen={t.teal} time='7:54'>
          <TicketScreen train={train507} platform='tbd' />
        </Phone>
      </Plate>
    )
  },
  before: single('#E3E1DB', <OldBookingScreen />, { screen: '#1d5a63', bar: 'light' }),
  after: single('#E3E1DB', <FareCalendarScreen />, { screen: t.teal, bar: 'light' }),
  seats: single('#DCE5E1', <SeatPrefsScreen />),
  seatmap: single('#DCE5E1', <SeatMapScreen />),
  scan: {
    width: 720,
    height: 900,
    render: () => (
      <Plate background={t.tealDeep}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 760,
            height: 760,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0) 68%)'
          }}
        />
        <Phone scale={0.88} screen='#ffffff' time='8:22'>
          <ScanScreen />
        </Phone>
      </Plate>
    )
  },
  status: single('#F1E5BF', <TripStatusScreen />, { screen: t.teal, bar: 'light' })
};
