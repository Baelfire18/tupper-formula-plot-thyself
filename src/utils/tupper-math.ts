import type { BBox, EncodingResult, Grid, QuadrantResult } from '../types'
import { Quadrant } from '../types'

/**
 * Create an empty grid of the given dimensions, filled with 0s.
 */
export function makeEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(0) as number[])
}

/**
 * Encode a top-origin bitmap into Tupper's formula values (N, k).
 * The bitmap is flipped to bottom-origin (Tupper convention) before encoding.
 */
export function encodeBitmapToKN(bitmapTopOrigin: Grid): EncodingResult {
  const n = bitmapTopOrigin.length
  const w = bitmapTopOrigin[0]?.length ?? 0
  if (!w) throw new Error('Bitmap width is 0')

  const grid = [...bitmapTopOrigin].reverse()

  let N = 0n
  for (let x = 0; x < w; x++) {
    for (let row = 0; row < n; row++) {
      if (grid[row][x] === 1) {
        N |= 1n << BigInt(n * x + row)
      }
    }
  }

  return { N, k: BigInt(n) * N, n, w }
}

/**
 * Decode a grid from a k value. Returns a top-origin grid.
 */
export function decodeGridFromK(k: bigint, n: number, w: number): Grid {
  const bigN = k / BigInt(n)
  const grid: Grid = Array.from({ length: n }, () => Array(w).fill(0) as number[])

  for (let x = 0; x < w; x++) {
    for (let row = 0; row < n; row++) {
      grid[row][x] = Number((bigN >> BigInt(n * x + row)) & 1n)
    }
  }

  return grid.reverse()
}

/**
 * Compute bounding box of "on" pixels in bottom-origin coordinates.
 * Returns null if the grid is entirely empty.
 */
export function computeBboxBottomOrigin(gridTopOrigin: Grid): BBox | null {
  const gridBottom = [...gridTopOrigin].reverse()
  const n = gridBottom.length
  const w = gridBottom[0].length
  let xMin = Infinity
  let yMin = Infinity
  let xMax = -Infinity
  let yMax = -Infinity
  let found = false

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < w; x++) {
      if (gridBottom[y][x] === 1) {
        found = true
        xMin = Math.min(xMin, x)
        yMin = Math.min(yMin, y)
        xMax = Math.max(xMax, x)
        yMax = Math.max(yMax, y)
      }
    }
  }

  return found ? { xMin, yMin, xMax, yMax } : null
}

/**
 * Determine which quadrant the drawing's center falls in.
 */
export function computeQuadrant(bbox: BBox | null, n: number, w: number): QuadrantResult {
  if (!bbox) return { quadrant: Quadrant.Empty, center: null }

  const cx = (bbox.xMin + bbox.xMax) / 2
  const cy = (bbox.yMin + bbox.yMax) / 2
  const xm = (w - 1) / 2
  const ym = (n - 1) / 2

  let quadrant: Quadrant
  if (cy > ym) {
    quadrant = cx > xm ? Quadrant.TopRight : Quadrant.TopLeft
  } else {
    quadrant = cx > xm ? Quadrant.BottomRight : Quadrant.BottomLeft
  }

  return { quadrant, center: { x: cx, y: cy } }
}
