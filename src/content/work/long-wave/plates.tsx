import type { CSSProperties, ReactNode } from 'react';
import { Phone, Plate } from '~/components/frames/Phone';
import type { Plates } from '~/content/plates';
import { chapters, pausedAt } from './data';
import { ChapterTrack, TRACK, segments, timeToX } from './scrubber';
import {
  ChaptersScreen,
  EpisodeScreen,
  LibraryScreen,
  NowPlayingScreen,
  OldPlayerScreen,
  PreviouslyScreen,
  TranscriptScreen
} from './screens';
import { Label, keyframes, t } from './theme';

const segs = segments();

/** The player mid-drag: finger `frac` of the way into chapter `i`. */
function dragging(i: number, frac: number) {
  return {
    time: chapters[i].start,
    target: i,
    ghostX: segs[i].x + segs[i].w * frac,
    bubble: true,
    active: true
  };
}

const phone = (node: ReactNode, scale: number, style?: CSSProperties) => (
  <Phone scale={scale} bar='light' screen={t.night} style={style}>
    {node}
  </Phone>
);

const single = (bg: string, node: ReactNode) => ({
  width: 720,
  height: 900,
  render: () => <Plate background={bg}>{phone(node, 0.88)}</Plate>
});

function Anatomy() {
  const S = 2.6;
  const left = (1440 - TRACK.width * S) / 2;
  const top = 452;
  const state = dragging(4, 0.62);
  const thumb = timeToX(state.time, segs);
  const mid = TRACK.height / 2;
  const at = (x: number) => left + x * S;
  const y = top + mid * S;
  const markers: { n: number; x: number; y: number }[] = [
    { n: 1, x: at(state.ghostX) + 300, y: top - 228 },
    { n: 2, x: at(state.ghostX), y: y + 78 },
    { n: 3, x: at(segs[7].x + segs[7].w / 2), y: y + 52 },
    { n: 4, x: at(segs[2].x + segs[2].w / 2), y: y + 52 }
  ];
  const notes = [
    ['The title follows you', 'The producer’s chapter title rides above the finger, so you pick a place by name, not by timecode.'],
    ['Finger and landing', 'The thin line is your finger. The thumb is where you’ll land: the first line of that chapter.'],
    ['Width is length', 'The four-minute cold open is a sliver. Lofting, at 16 minutes, is a slab. Gaps are boundaries.'],
    ['Played fills amber', '“How far was I?” becomes a count of chapters, which people remember better than minutes.']
  ];
  return (
    <Plate background={t.night} style={{ display: 'block' }}>
      <style>{keyframes}</style>
      <div style={{ position: 'absolute', left: 120, top: 86, color: t.paper }}>
        <Label style={{ color: t.amber, fontSize: 14 }}>Anatomy</Label>
        <div style={{ fontFamily: t.serif, fontSize: 52, fontWeight: 460, letterSpacing: '-0.025em', marginTop: 10, lineHeight: 1 }}>
          The chapter scrubber
        </div>
        <div style={{ fontFamily: t.sans, fontSize: 18, color: t.soft, marginTop: 14 }}>
          Workbench, Ep. 41 · 10 chapters · 2 h 7 min · dragging into Chapter 5
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: TRACK.width,
          transform: `scale(${S})`,
          transformOrigin: '0 0',
          color: t.paper,
          fontFamily: t.sans
        }}
      >
        <ChapterTrack {...state} />
      </div>
      {/* Leader from the thumb to its marker */}
      <div style={{ position: 'absolute', left: at(thumb) - 1, top: y + 34, width: 2, height: 44, background: 'rgba(242,165,65,0.5)' }} />
      <div style={{ position: 'absolute', left: at(thumb) - 1, top: y + 77, width: at(state.ghostX) - at(thumb) + 2, height: 2, background: 'rgba(242,165,65,0.5)' }} />
      <div style={{ position: 'absolute', left: at(state.ghostX) - 1, top: y + 48, width: 2, height: 30, background: 'rgba(242,165,65,0.5)' }} />
      {markers.map((m) => (
        <div
          key={m.n}
          style={{
            position: 'absolute',
            left: m.x - 17,
            top: m.y - 17,
            width: 34,
            height: 34,
            borderRadius: 17,
            background: t.amber,
            color: t.night,
            display: 'grid',
            placeItems: 'center',
            font: `700 17px ${t.sans}`,
            boxShadow: `0 0 0 5px ${t.night}`
          }}
        >
          {m.n}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 690,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 40,
          fontFamily: t.sans
        }}
      >
        {notes.map(([h, body], i) => (
          <div key={h} style={{ borderTop: `1px solid ${t.line}`, paddingTop: 18 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ color: t.amber, fontWeight: 700, fontSize: 17 }}>{i + 1}</span>
              <span style={{ color: t.paper, fontFamily: t.serif, fontSize: 22, fontWeight: 540, letterSpacing: '-0.01em' }}>{h}</span>
            </div>
            <div style={{ color: t.soft, fontSize: 16, lineHeight: 1.5, marginTop: 8 }}>{body}</div>
          </div>
        ))}
      </div>
    </Plate>
  );
}

export const plates: Plates = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#191D27' style={{ gap: 44 }}>
        {phone(<ChaptersScreen />, 0.76, { marginTop: 56 })}
        {phone(<NowPlayingScreen {...dragging(6, 0.42)} />, 0.76, { marginTop: -56 })}
        {phone(<TranscriptScreen />, 0.76, { marginTop: 56 })}
      </Plate>
    )
  },
  flow: {
    width: 1440,
    height: 900,
    render: () => (
      <Plate background='#E9DFCB' style={{ gap: 64 }}>
        {phone(<LibraryScreen />, 0.8)}
        {phone(<PreviouslyScreen />, 0.8)}
        {phone(<NowPlayingScreen time={pausedAt + 7} playing />, 0.8)}
      </Plate>
    )
  },
  anatomy: { width: 1440, height: 900, render: () => <Anatomy /> },
  before: single('#2A303C', <OldPlayerScreen time={2300} />),
  after: single('#2A303C', <NowPlayingScreen {...dragging(4, 0.3)} />),
  chapters: single('#8593A8', <ChaptersScreen />),
  transcript: single('#E9DFCB', <TranscriptScreen />),
  episode: single('#C8D0DA', <EpisodeScreen />),
  recap: single('#E4C99A', <PreviouslyScreen recapAt={12} />)
};
