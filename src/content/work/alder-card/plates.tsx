import type { ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { CardArt, Lit, OldCardArt, cardRadius, cardShadow } from './card';
import { ActivityScreen, CardHomeScreen, DetailsScreen, LocksScreen, LostScreen, VirtualScreen } from './screens';
import { a } from './theme';

const single = (bg: string, node: ReactNode) => ({
  width: 720,
  height: 900,
  render: () => (
    <Plate background={bg}>
      <Phone scale={0.88} screen={a.linen}>
        {node}
      </Phone>
    </Plate>
  )
});

/** The old and new cards share one size of still so the slider lines up. */
const compare = (node: ReactNode) => ({
  width: 1440,
  height: 900,
  render: () => <Lit>{node}</Lit>
});

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Lit style={{ gap: 120 }}>
        <div
          style={{
            borderRadius: cardRadius(300),
            boxShadow: cardShadow,
            transform: 'rotate(-7deg) translateY(28px)'
          }}
        >
          <CardArt side='front' width={300} />
        </div>
        <Phone scale={0.8} screen={a.linen} style={{ marginTop: -10 }}>
          <CardHomeScreen />
        </Phone>
      </Lit>
    )
  },
  cards: {
    width: 1440,
    height: 900,
    render: () => (
      <Lit style={{ gap: 90 }}>
        <div style={{ borderRadius: cardRadius(353), boxShadow: cardShadow, transform: 'rotate(-3deg) translateY(-14px)' }}>
          <CardArt side='front' width={353} />
        </div>
        <div style={{ borderRadius: cardRadius(353), boxShadow: cardShadow, transform: 'rotate(3deg) translateY(14px)' }}>
          <CardArt side='back' width={353} />
        </div>
      </Lit>
    )
  },
  'old-card': compare(
    <div style={{ borderRadius: 24.6, boxShadow: cardShadow }}>
      <OldCardArt width={620} />
    </div>
  ),
  'new-card': compare(
    <div style={{ borderRadius: cardRadius(391), boxShadow: cardShadow }}>
      <CardArt side='front' width={391} />
    </div>
  ),
  freeze: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#DCE6E8' style={{ gap: 56 }}>
        <Phone scale={0.76} screen={a.linen}>
          <CardHomeScreen />
        </Phone>
        <Phone scale={0.76} screen={a.linen}>
          <CardHomeScreen frozen toast={{ kind: 'frozen', seconds: 4, run: 0 }} toastProgress={0.78} />
        </Phone>
        <Phone scale={0.76} screen={a.linen}>
          <LostScreen />
        </Phone>
      </Plate>
    )
  },
  details: single('#E2DCCB', <DetailsScreen />),
  virtual: single('#EDE3C9', <VirtualScreen />),
  locks: single('#E8E4D8', <LocksScreen />),
  activity: single('#DCE4DA', <ActivityScreen />)
};
