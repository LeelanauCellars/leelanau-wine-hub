export type LabelLayerType = 'text' | 'shape' | 'image';
export type LabelTextAlign = 'left' | 'center' | 'right';

export type LabelLayer = {
  id: string;
  name: string;
  type: LabelLayerType;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  letterSpacing?: number;
  align?: LabelTextAlign;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  src?: string;
  fit?: 'contain' | 'cover' | 'fill';
};

export type LabelDocument = {
  id: string;
  projectSlug: string;
  name: string;
  width: number;
  height: number;
  background: string;
  units: 'px';
  createdAt: string;
  updatedAt: string;
  layers: LabelLayer[];
};

export type LabelStudioOperation =
  | { type: 'update'; layerId: string; changes: Partial<LabelLayer> }
  | { type: 'add-text'; layer: LabelLayer }
  | { type: 'add-shape'; layer: LabelLayer }
  | { type: 'delete'; layerId: string }
  | { type: 'duplicate'; layerId: string }
  | { type: 'move-layer'; layerId: string; direction: 'front' | 'back' | 'forward' | 'backward' };

export type LabelStudioAssistResponse = {
  message: string;
  operations: LabelStudioOperation[];
  provider?: string;
  model?: string;
  degraded?: boolean;
};

function now() {
  return new Date().toISOString();
}

function textLayer(id: string, name: string, text: string, y: number, fontSize: number, fontWeight = 800): LabelLayer {
  return {
    id,
    name,
    type: 'text',
    visible: true,
    locked: false,
    x: 90,
    y,
    width: 820,
    height: Math.max(70, Math.round(fontSize * 1.45)),
    rotation: 0,
    opacity: 1,
    text,
    fontSize,
    fontWeight,
    fontFamily: 'Arial, Helvetica, sans-serif',
    letterSpacing: 0,
    align: 'center',
    color: '#111111',
  };
}

export function createStarterLabelDocument(projectSlug: string, projectName: string): LabelDocument {
  const stamp = now();
  const common: LabelLayer[] = [
    {
      id: 'background-panel',
      name: 'Background',
      type: 'shape',
      visible: true,
      locked: true,
      x: 0,
      y: 0,
      width: 1000,
      height: 1400,
      rotation: 0,
      opacity: 1,
      fill: '#f7f1e7',
      stroke: '#f7f1e7',
      strokeWidth: 0,
      radius: 0,
    },
  ];

  if (projectSlug === 'pizza-wine') {
    common.push(
      textLayer('pizza-title', 'Wine Name', 'PIZZA\nWINE', 235, 150, 900),
      textLayer('pizza-subtitle', 'Tagline', 'WINE MADE FOR PIZZA', 590, 42, 800),
      textLayer('pizza-duh', 'Secondary Tagline', 'NOT FROM PIZZA (DUH)', 655, 28, 700),
      textLayer('pizza-type', 'Wine Type', 'RED TABLE WINE', 1110, 26, 800),
    );
  } else if (projectSlug === 'the-kicker') {
    common.push(
      textLayer('kicker-eyebrow', 'Eyebrow', 'THE', 250, 46, 800),
      textLayer('kicker-title', 'Wine Name', 'KICKER', 330, 130, 900),
      textLayer('kicker-type', 'Wine Type', 'CHOCOLATE CHERRY RED WINE', 720, 34, 800),
      textLayer('kicker-abv', 'ABV', '16% ALC/VOL', 790, 26, 800),
    );
  } else if (projectSlug === 'sleeping-bear') {
    common.push(
      textLayer('sleeping-bear-title', 'Wine Name', 'SLEEPING BEAR', 215, 88, 900),
      textLayer('sleeping-bear-varietal', 'Varietal', 'RIESLING', 860, 50, 800),
      textLayer('sleeping-bear-tagline', 'Tagline', 'Take a moment. Take it in.', 1000, 34, 500),
    );
  } else {
    common.push(textLayer('wine-name', 'Wine Name', projectName.toUpperCase(), 300, 100, 900));
  }

  return {
    id: `label-${projectSlug}`,
    projectSlug,
    name: `${projectName} Label`,
    width: 1000,
    height: 1400,
    background: '#ffffff',
    units: 'px',
    createdAt: stamp,
    updatedAt: stamp,
    layers: common,
  };
}

export function sanitizeLabelLayer(value: unknown): LabelLayer | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<LabelLayer>;
  if (!raw.id || typeof raw.id !== 'string' || !raw.type || !['text', 'shape', 'image'].includes(raw.type)) return null;
  const number = (input: unknown, fallback: number) => typeof input === 'number' && Number.isFinite(input) ? input : fallback;
  const clamp = (input: number, min: number, max: number) => Math.min(max, Math.max(min, input));
  const layer: LabelLayer = {
    id: raw.id.slice(0, 100),
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.slice(0, 100) : raw.id.slice(0, 100),
    type: raw.type,
    visible: raw.visible !== false,
    locked: raw.locked === true,
    x: clamp(number(raw.x, 100), -4000, 5000),
    y: clamp(number(raw.y, 100), -4000, 6000),
    width: clamp(number(raw.width, 300), 8, 6000),
    height: clamp(number(raw.height, 100), 8, 6000),
    rotation: clamp(number(raw.rotation, 0), -360, 360),
    opacity: clamp(number(raw.opacity, 1), 0, 1),
  };
  if (raw.type === 'text') {
    layer.text = typeof raw.text === 'string' ? raw.text.slice(0, 3000) : 'Text';
    layer.fontSize = clamp(number(raw.fontSize, 48), 4, 800);
    layer.fontWeight = clamp(number(raw.fontWeight, 700), 100, 1000);
    layer.fontFamily = typeof raw.fontFamily === 'string' ? raw.fontFamily.slice(0, 180) : 'Arial, Helvetica, sans-serif';
    layer.letterSpacing = clamp(number(raw.letterSpacing, 0), -30, 120);
    layer.align = raw.align === 'left' || raw.align === 'right' ? raw.align : 'center';
    layer.color = typeof raw.color === 'string' ? raw.color.slice(0, 30) : '#111111';
  }
  if (raw.type === 'shape') {
    layer.fill = typeof raw.fill === 'string' ? raw.fill.slice(0, 30) : '#ffffff';
    layer.stroke = typeof raw.stroke === 'string' ? raw.stroke.slice(0, 30) : '#111111';
    layer.strokeWidth = clamp(number(raw.strokeWidth, 0), 0, 120);
    layer.radius = clamp(number(raw.radius, 0), 0, 1000);
  }
  if (raw.type === 'image') {
    layer.src = typeof raw.src === 'string' ? raw.src.slice(0, 4_000_000) : '';
    layer.fit = raw.fit === 'cover' || raw.fit === 'fill' ? raw.fit : 'contain';
  }
  return layer;
}
