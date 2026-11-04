/** What the dial is turning. Pressing the dial cycles through these. */
export type Mode = 'light' | 'heat' | 'music';

export const modeOrder: Mode[] = ['light', 'heat', 'music'];

export type ModeSpec = {
  label: string;
  min: number;
  max: number;
  /** One detent of the dial. */
  step: number;
};

export const modes: Record<Mode, ModeSpec> = {
  light: { label: 'Lights', min: 0, max: 100, step: 5 },
  heat: { label: 'Heat', min: 60, max: 80, step: 1 },
  music: { label: 'Music', min: 0, max: 100, step: 5 }
};

/** The dial has 30 detents a turn: 12 degrees each, one step per detent. */
export const DETENT = 12;

export const fillFor = (mode: Mode, v: number) => {
  const m = modes[mode];
  return (v - m.min) / (m.max - m.min);
};

export const format = (mode: Mode, v: number) => {
  if (mode === 'heat') return `${v}°F`;
  return v === 0 ? 'Off' : `${v}%`;
};

export type RoomId = 'living' | 'kitchen' | 'bedroom';
export type RoomState = Record<Mode, number>;
export type House = Record<RoomId, RoomState>;

export const rooms: { id: RoomId; name: string }[] = [
  { id: 'living', name: 'Living room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'bedroom', name: 'Bedroom' }
];

/** 7:12 pm on a Tuesday, as the family left things. */
export const startHouse: House = {
  living: { light: 70, heat: 68, music: 0 },
  kitchen: { light: 85, heat: 67, music: 20 },
  bedroom: { light: 0, heat: 66, music: 0 }
};

export type Scene = { name: string; house: House };

/** The four keys, as shipped. Every label can be rewritten in the app. */
export const scenes: Scene[] = [
  {
    name: 'Morning',
    house: {
      living: { light: 60, heat: 70, music: 25 },
      kitchen: { light: 100, heat: 70, music: 25 },
      bedroom: { light: 50, heat: 68, music: 0 }
    }
  },
  {
    name: 'Dinner',
    house: {
      living: { light: 40, heat: 69, music: 30 },
      kitchen: { light: 70, heat: 69, music: 30 },
      bedroom: { light: 0, heat: 66, music: 0 }
    }
  },
  {
    name: 'Movie',
    house: {
      living: { light: 10, heat: 68, music: 0 },
      kitchen: { light: 0, heat: 67, music: 0 },
      bedroom: { light: 0, heat: 66, music: 0 }
    }
  },
  {
    name: 'Away',
    house: {
      living: { light: 0, heat: 62, music: 0 },
      kitchen: { light: 0, heat: 62, music: 0 },
      bedroom: { light: 0, heat: 62, music: 0 }
    }
  }
];

export const keyLabels = scenes.map((s) => s.name);
