import type { ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { todayEntry } from './data';
import { FieldCloseup, InkSpecimen, YearPoster } from './prints';
import { EntryScreen, OnThisDayScreen, ReminderScreen, SearchScreen, TodayScreen, YearScreen } from './screens';
import { m } from './theme';

const single = (bg: string, node: ReactNode) => ({
  width: 720,
  height: 900,
  render: () => (
    <Plate background={bg}>
      <Phone scale={0.88} screen={m.paper}>
        {node}
      </Phone>
    </Plate>
  )
});

const drafting = todayEntry.text;

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={m.paper} style={{ gap: 60 }}>
        <Phone scale={0.8} screen={m.paper} style={{ marginTop: -56 }}>
          <EntryScreen />
        </Phone>
        <Phone scale={0.8} screen={m.paper} style={{ marginTop: 56 }}>
          <YearScreen />
        </Phone>
      </Plate>
    )
  },
  flow: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#ECE5D5' style={{ gap: 64 }}>
        <Phone scale={0.8} screen={m.paper}>
          <TodayScreen />
        </Phone>
        <Phone scale={0.8} screen={m.paper}>
          <TodayScreen text={drafting} expanded ink='bright' />
        </Phone>
        <Phone scale={0.8} screen={m.paper}>
          <OnThisDayScreen />
        </Phone>
      </Plate>
    )
  },
  year: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#E9E2D2'>
        <YearPoster />
      </Plate>
    )
  },
  inks: {
    width: 720,
    height: 900,
    render: () => (
      <Plate background={m.paper}>
        <InkSpecimen />
      </Plate>
    )
  },
  closeup: {
    width: 720,
    height: 900,
    render: () => (
      <Plate background='#F1DFD7'>
        <FieldCloseup />
      </Plate>
    )
  },
  search: single('#DCE2EA', <SearchScreen />),
  reminders: single('#F0E3C8', <ReminderScreen />)
};
