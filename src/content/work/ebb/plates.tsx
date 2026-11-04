import type { CSSProperties, ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { Band, PodUnderside } from './band';
import { BandScreen, PlanScreen, SleepScreen, TodayScreen, WeekScreen, WorkoutScreen } from './screens';
import { t } from './theme';

const plateBg = '#13160F';
const glow = (x = '50%', y = '50%', a = 0.07) =>
  `radial-gradient(ellipse 60% 55% at ${x} ${y}, rgba(198,242,107,${a}), transparent 70%), ${plateBg}`;

const phone = (node: ReactNode, scale: number, style?: CSSProperties) => (
  <Phone scale={scale} bar='light' screen={t.bg} style={style}>
    {node}
  </Phone>
);

const single = (node: ReactNode, background = glow()) => ({
  width: 720,
  height: 900,
  render: () => <Plate background={background}>{phone(node, 0.88)}</Plate>
});

function Callout({
  title,
  body,
  style,
  align = 'left'
}: {
  title: string;
  body: string;
  style: CSSProperties;
  align?: 'left' | 'right';
}) {
  return (
    <div style={{ position: 'absolute', width: 200, fontFamily: t.font, textAlign: align, ...style }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.lime }}>{title}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: t.soft, marginTop: 6, lineHeight: 1.4 }}>{body}</div>
    </div>
  );
}

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={glow('50%', '52%', 0.08)} style={{ gap: 56 }}>
        {phone(<TodayScreen day='fri' />, 0.8, { marginTop: -44 })}
        {phone(<WeekScreen km={16} sunday='spin' />, 0.8, { marginTop: 44 })}
      </Plate>
    )
  },
  mornings: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={glow('50%', '50%', 0.06)} style={{ gap: 60 }}>
        {phone(<TodayScreen day='tue' />, 0.8)}
        {phone(<TodayScreen day='thu' />, 0.8)}
        {phone(<TodayScreen day='fri' />, 0.8)}
      </Plate>
    )
  },
  hardware: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background={glow('36%', '48%', 0.07)} style={{ gap: 70 }}>
        <div style={{ position: 'relative', width: 640, height: 640 }}>
          <div style={{ position: 'absolute', left: 20, top: 150 }}>
            <Band width={600} leds={[true, false, false]} ledColor={t.coral} hole='#0B0D09' />
          </div>
          <svg width='640' height='640' style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
            <g stroke={t.lime} strokeOpacity='0.55' strokeWidth='1.5' fill='none'>
              <path d='M70 140 L282 371' />
              <path d='M590 140 L507 376' />
            </g>
            <circle cx='290.3' cy='380' r='12' fill='none' stroke={t.lime} strokeOpacity='0.7' strokeWidth='1.5' />
            <circle cx='506' cy='379.5' r='3.5' fill={t.lime} />
          </svg>
          <Callout
            title='Three LEDs'
            body='Tap for today, double-tap for the week. No screen, no number.'
            style={{ left: 20, top: 40, width: 250 }}
          />
          <div style={{ position: 'absolute', left: 20, top: 500, display: 'flex', alignItems: 'center', gap: 22 }}>
            <PodUnderside width={170} />
            <div style={{ fontFamily: t.font, width: 250 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.lime }}>Underside</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: t.soft, marginTop: 6, lineHeight: 1.4 }}>
                Optical heart rate and skin temperature. Nine days a charge.
              </div>
            </div>
          </div>
          <Callout title='Knit strap' body='24 g. Worn to sleep, so it has nothing to snag.' style={{ right: 0, top: 40, width: 230 }} align='right' />
        </div>
        {phone(<BandScreen />, 0.8)}
      </Plate>
    )
  },
  week: single(<WeekScreen km={24} sunday='spin' />),
  plan: single(<PlanScreen />),
  workout: single(<WorkoutScreen />),
  sleep: single(<SleepScreen />)
};
