// ============================================
// Enums
// ============================================

/** Input mode tabs in the GridControls panel */
export enum InputMode {
  Draw = 'draw',
  Import = 'import',
  Text = 'text',
  Type = 'type',
}

/** Quadrant position of the drawing's center within the grid */
export enum Quadrant {
  Empty = 'EMPTY',
  TopLeft = 'TOP-LEFT',
  TopRight = 'TOP-RIGHT',
  BottomLeft = 'BOTTOM-LEFT',
  BottomRight = 'BOTTOM-RIGHT',
}

/** Available export file formats */
export enum ExportFormat {
  PNG = 'png',
  SVG = 'svg',
  TXT = 'txt',
}

// ============================================
// Type aliases
// ============================================

/** A 2D grid of pixel values (0 = off, 1 = on) */
export type Grid = number[][]

/** A single character glyph in the pixel font (7 rows x variable columns) */
export type FontGlyph = number[][]

// ============================================
// Interfaces
// ============================================

/** Axis-aligned bounding box in bottom-origin coordinates */
export interface BBox {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

/** A 2D point */
export interface Point2D {
  x: number
  y: number
}

/** Result of computing which quadrant the drawing occupies */
export interface QuadrantResult {
  quadrant: Quadrant
  center: Point2D | null
}

/** Result of encoding a bitmap into Tupper's formula values */
export interface EncodingResult {
  N: bigint
  k: bigint
  n: number
  w: number
}

/** Full computation result displayed in the UI */
export interface TupperResult {
  computed: boolean
  N: bigint | null
  k: bigint | null
  decodedGrid: Grid | null
  bbox: BBox | null
  quadrant: Quadrant | null
  center: Point2D | null
}

/** A predefined bitmap template (e.g., smiley, heart) */
export interface GridTemplate {
  id: string
  name: string
  icon: string
  grid: Grid
}

/** A template defined by its k value (e.g., Tupper's formula, Euler's identity) */
export interface FormulaTemplate {
  id: string
  name: string
  icon: string
  n: number
  w: number
  k: string
}

/** Result of rendering text to a pixel grid */
export interface TextRenderResult {
  grid: Grid
  height: number
  width: number
}

/** Canvas color theme for rendering grids */
export interface CanvasColorTheme {
  readonly bg: string
  readonly on: string
  readonly off: string
  readonly grid: string
  readonly accent: string
  readonly muted: string
  readonly frame: string
}
