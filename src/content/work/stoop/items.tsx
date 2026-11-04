import type { CSSProperties } from 'react';

export type ItemKind =
  | 'dresser'
  | 'chair'
  | 'plant'
  | 'bike'
  | 'lamp'
  | 'rug'
  | 'pot'
  | 'shelf';

export type Item = {
  id: string;
  kind: ItemKind;
  title: string;
  price: number;
  hood: string;
  miles: number;
  seller: string;
  pickup: boolean;
};

export const items: Item[] = [
  { id: 'i1', kind: 'dresser', title: 'Walnut lowboy dresser, 6 drawers', price: 85, hood: 'Sellwood', miles: 0.6, seller: 'Ruth A.', pickup: true },
  { id: 'i2', kind: 'chair', title: 'Rattan peacock chair', price: 40, hood: 'Woodstock', miles: 1.2, seller: 'Dev P.', pickup: true },
  { id: 'i3', kind: 'plant', title: 'Monstera, 4 ft, with pot', price: 25, hood: 'Brooklyn', miles: 0.9, seller: 'Kai M.', pickup: false },
  { id: 'i4', kind: 'bike', title: 'Steel road bike, 56 cm', price: 120, hood: 'Hosford', miles: 2.1, seller: 'Nell O.', pickup: true },
  { id: 'i5', kind: 'lamp', title: 'Brass arc floor lamp', price: 55, hood: 'Eastmoreland', miles: 1.4, seller: 'June T.', pickup: true },
  { id: 'i6', kind: 'rug', title: 'Wool rug 5×8, faded madder', price: 60, hood: 'Richmond', miles: 2.6, seller: 'Omar S.', pickup: false },
  { id: 'i7', kind: 'pot', title: 'Enameled dutch oven, 5 qt', price: 35, hood: 'Sellwood', miles: 0.3, seller: 'Bea L.', pickup: true },
  { id: 'i8', kind: 'shelf', title: 'Pine bookshelf, 5 shelves', price: 30, hood: 'Westmoreland', miles: 0.8, seller: 'Sol R.', pickup: true }
];

const backdrops: Record<ItemKind, [string, string]> = {
  dresser: ['#EADFCF', '#D8C8B1'],
  chair: ['#DDE4D6', '#C9D2BF'],
  plant: ['#F0E5D4', '#DECDB4'],
  bike: ['#E1E5E8', '#CDD2D6'],
  lamp: ['#EEE3D1', '#DCCDB5'],
  rug: ['#EAE2D7', '#D6CABB'],
  pot: ['#E9E1D6', '#D5C9BA'],
  shelf: ['#EFE7DA', '#DCD0BE']
};

/**
 * Product "photos" for the sample listings, drawn as small still lifes so
 * the screens never rely on stock photography.
 */
export function ItemArt({
  kind,
  style,
  framing = 'normal'
}: {
  kind: ItemKind;
  style?: CSSProperties;
  framing?: 'normal' | 'close';
}) {
  const [wall, floor] = backdrops[kind];
  return (
    <svg
      viewBox={framing === 'close' ? '30 40 140 175' : '0 0 200 250'}
      preserveAspectRatio='xMidYMid slice'
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      aria-hidden
    >
      <rect width='200' height='250' fill={wall} />
      <rect y='186' width='200' height='64' fill={floor} />
      <rect y='186' width='200' height='1.2' fill='#000' opacity='0.06' />
      <Art kind={kind} />
    </svg>
  );
}

function Shadow({ cx = 100, w = 70 }: { cx?: number; w?: number }) {
  return <ellipse cx={cx} cy='192' rx={w} ry='7' fill='#3a2a1a' opacity='0.16' />;
}

function Art({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case 'dresser':
      return (
        <g>
          <Shadow w={66} />
          <path d='M46 186 49 166h4l-1 20zM154 186l-3-20h-4l1 20z' fill='#4b2e1c' />
          <rect x='38' y='104' width='124' height='64' rx='3' fill='#7a4a2b' />
          <rect x='38' y='104' width='124' height='5' rx='2' fill='#8d5a37' />
          {[0, 1, 2].map((r) =>
            [0, 1].map((c) => (
              <g key={`${r}${c}`}>
                <rect x={43 + c * 58} y={112 + r * 18} width='56' height='15' rx='1.5' fill='#6a3f24' />
                <rect x={66 + c * 58} y={118 + r * 18} width='10' height='2.4' rx='1.2' fill='#d9b56d' />
              </g>
            ))
          )}
          <rect x='120' y='88' width='22' height='16' rx='2' fill='#c86b4b' />
          <rect x='126' y='80' width='10' height='9' rx='5' fill='#8fa98a' />
        </g>
      );
    case 'chair':
      return (
        <g>
          <Shadow w={44} />
          <path d='M100 172c-48 0-62-46-58-86 3-30 26-48 58-48s55 18 58 48c4 40-10 86-58 86Z' fill='#c99a5b' />
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI * (0.08 + (i / 12) * 0.84);
            return (
              <line
                key={i}
                x1='100'
                y1='150'
                x2={100 - Math.cos(a) * 62}
                y2={150 - Math.sin(a) * 104}
                stroke='#a97a40'
                strokeWidth='2'
              />
            );
          })}
          <ellipse cx='100' cy='150' rx='30' ry='9' fill='#b4844a' />
          <path d='M78 156 72 186M122 156l6 30M100 158v28' stroke='#8a6233' strokeWidth='4' strokeLinecap='round' />
          <ellipse cx='100' cy='186' rx='30' ry='4' fill='none' stroke='#8a6233' strokeWidth='3' />
          <ellipse cx='100' cy='146' rx='24' ry='6' fill='#e9dcc6' />
        </g>
      );
    case 'plant':
      return (
        <g>
          <Shadow w={34} />
          <path d='M74 140h52l-6 46H80z' fill='#c4693f' />
          <rect x='70' y='134' width='60' height='10' rx='2' fill='#d17a4f' />
          {[
            'M100 134c-4-30-30-44-50-38 6 18 26 34 50 38Z',
            'M100 134c2-36 24-58 52-56-4 24-24 48-52 56Z',
            'M100 136c-10-44-2-76 16-90 10 22 4 58-16 90Z',
            'M98 136c-28-10-42-32-38-52 20 6 34 26 38 52Z'
          ].map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? '#3f7a4f' : '#2f6a42'} />
          ))}
          <path d='M64 102c10 8 22 18 34 30M140 86c-10 14-22 30-38 46M116 52c-6 26-10 52-14 80' stroke='#9cc39a' strokeWidth='1.4' fill='none' />
        </g>
      );
    case 'bike':
      return (
        <g fill='none' strokeLinecap='round' strokeLinejoin='round'>
          <Shadow w={78} />
          <circle cx='54' cy='154' r='32' stroke='#2a2a2a' strokeWidth='5' />
          <circle cx='148' cy='154' r='32' stroke='#2a2a2a' strokeWidth='5' />
          <circle cx='54' cy='154' r='3' fill='#888' stroke='none' />
          <circle cx='148' cy='154' r='3' fill='#888' stroke='none' />
          <path d='M54 154 84 104h56L148 154M84 104l24 50 32-50M108 154 54 154' stroke='#2f5d7c' strokeWidth='5' />
          <path d='M80 94h16M136 98l8-10h12' stroke='#2a2a2a' strokeWidth='5' />
          <circle cx='108' cy='154' r='7' stroke='#555' strokeWidth='3' />
        </g>
      );
    case 'lamp':
      return (
        <g>
          <Shadow cx={70} w={40} />
          <rect x='48' y='178' width='44' height='9' rx='4' fill='#3a3a38' />
          <path d='M70 180V96c0-38 36-58 72-48' stroke='#c9a25a' strokeWidth='4' fill='none' strokeLinecap='round' />
          <path d='M128 46c10-2 30 0 34 16l-40 6c-2-10 0-18 6-22Z' fill='#d9b46a' />
          <ellipse cx='142' cy='66' rx='21' ry='4' fill='#fff4d6' />
          <path d='M126 68 112 186h60L158 68' fill='#fff4d6' opacity='0.35' />
        </g>
      );
    case 'rug':
      return (
        <g>
          <Shadow w={82} />
          <path d='M24 186 44 118h132l-20 68z' fill='#a8473b' />
          <path d='M40 178 54 128h110l-14 50z' fill='none' stroke='#e2c9a1' strokeWidth='3' />
          <path d='M70 170 78 136h56l-8 34z' fill='#5f2c3a' />
          <path d='M102 140l8 12-8 12-8-12z' fill='#e2c9a1' />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={26 + i * 11} y1='186' x2={24 + i * 11} y2='192' stroke='#e2c9a1' strokeWidth='1.6' />
          ))}
        </g>
      );
    case 'pot':
      return (
        <g>
          <Shadow w={54} />
          <path d='M52 122h96v44c0 14-12 22-26 22H78c-14 0-26-8-26-22z' fill='#e0662f' />
          <path d='M52 122h96v10H52z' fill='#c4531f' />
          <rect x='40' y='128' width='14' height='8' rx='4' fill='#c4531f' />
          <rect x='146' y='128' width='14' height='8' rx='4' fill='#c4531f' />
          <path d='M50 118c0-10 22-16 50-16s50 6 50 16z' fill='#ea7a45' />
          <rect x='92' y='94' width='16' height='10' rx='5' fill='#2b2420' />
          <path d='M62 140c10 4 20 6 30 6' stroke='#f39a6b' strokeWidth='3' fill='none' strokeLinecap='round' opacity='0.7' />
        </g>
      );
    case 'shelf':
      return (
        <g>
          <Shadow w={52} />
          <rect x='56' y='40' width='88' height='148' fill='#e0bd84' />
          <rect x='62' y='46' width='76' height='136' fill='#c99e62' />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x='62' y={72 + i * 28} width='76' height='4' fill='#e0bd84' />
          ))}
          {[
            [66, 52, 7, 20, '#3d5a6c'],
            [74, 54, 6, 18, '#b5523a'],
            [81, 50, 8, 22, '#e9d8b4'],
            [92, 56, 6, 16, '#5b7a52'],
            [70, 84, 30, 16, '#d9cdb5'],
            [104, 80, 7, 20, '#2f3e55'],
            [112, 82, 6, 18, '#c98a3c'],
            [68, 108, 8, 20, '#7c3b2d'],
            [118, 116, 14, 12, '#8ea58b'],
            [78, 138, 6, 16, '#e3c07a'],
            [86, 134, 7, 20, '#405a77'],
            [96, 136, 6, 18, '#b5523a']
          ].map(([x, y, w, h, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} />
          ))}
        </g>
      );
  }
}
