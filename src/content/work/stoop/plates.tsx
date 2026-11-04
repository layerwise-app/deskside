import type { ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import {
  CameraScreen,
  ConfirmScreen,
  DetailScreen,
  FeedScreen,
  OldFormScreen,
  PickupScreen,
  ReviewScreen
} from './screens';
import { t } from './theme';

const single = (bg: string, node: ReactNode, screen = t.paper) => ({
  width: 720,
  height: 900,
  render: () => (
    <Plate background={bg}>
      <Phone scale={0.88} screen={screen}>
        {node}
      </Phone>
    </Plate>
  )
});

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={t.cream} style={{ gap: 56 }}>
        <Phone scale={0.82} style={{ marginTop: 60 }}>
          <FeedScreen />
        </Phone>
        <Phone scale={0.82} style={{ marginTop: -60 }}>
          <DetailScreen />
        </Phone>
      </Plate>
    )
  },
  flow: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={t.sageSoft} style={{ gap: 64 }}>
        <Phone scale={0.8} bar='light' screen='#14110e'>
          <CameraScreen />
        </Phone>
        <Phone scale={0.8}>
          <ReviewScreen />
        </Phone>
        <Phone scale={0.8}>
          <DetailScreen />
        </Phone>
      </Plate>
    )
  },
  feed: single('#EFE3CF', <FeedScreen />),
  detail: single('#F6DCCF', <DetailScreen />),
  before: single('#E9E6E1', <OldFormScreen />, '#ffffff'),
  after: single('#E9E6E1', <ReviewScreen />),
  pickup: single(t.sageSoft, <PickupScreen day='sat' window='sat-10' />),
  confirm: single('#F1E6C9', <ConfirmScreen />, t.cream)
};
