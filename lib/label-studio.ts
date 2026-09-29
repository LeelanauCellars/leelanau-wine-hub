export type LabelLayerType = 'text' | 'shape' | 'image' | 'vector';
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
  svg?: string;
  outlineSvg?: string;
  renderMode?: 'outline' | 'live';
  sourceFontFamily?: string;
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
  return {
    id: `label-${projectSlug}`,
    projectSlug,
    name: `${projectName} Label`,
    width: 1000,
    height: 1417,
    background: '#ffffff',
    units: 'px',
    createdAt: stamp,
    updatedAt: stamp,
    layers: [],
  };
}

export function sanitizeLabelLayer(value: unknown): LabelLayer | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<LabelLayer>;
  if (!raw.id || typeof raw.id !== 'string' || !raw.type || !['text', 'shape', 'image', 'vector'].includes(raw.type)) return null;
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
    layer.outlineSvg = typeof raw.outlineSvg === 'string' ? raw.outlineSvg.slice(0, 8_000_000) : '';
    layer.renderMode = raw.renderMode === 'outline' && layer.outlineSvg ? 'outline' : 'live';
    layer.sourceFontFamily = typeof raw.sourceFontFamily === 'string' ? raw.sourceFontFamily.slice(0, 180) : '';
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
  if (raw.type === 'vector') {
    layer.svg = typeof raw.svg === 'string' ? raw.svg.slice(0, 8_000_000) : '';
  }
  return layer;
}
