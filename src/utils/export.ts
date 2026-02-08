import type { Grid } from '../types'
import { CANVAS_COLORS } from '../constants/colors'
import { SVG_CELL_SIZE } from '../constants/grid'

/**
 * Convert a grid to a TXT string (rows of comma-separated 1s and 0s).
 */
export function gridToTxt(grid: Grid): string {
  return grid.map((row) => row.join(',')).join('\n')
}

/**
 * Convert a grid to an SVG string.
 */
export function gridToSvg(grid: Grid): string {
  const n = grid.length
  const w = grid[0]?.length ?? 0
  const cellPx = SVG_CELL_SIZE
  const svgW = w * cellPx
  const svgH = n * cellPx

  let rects = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < w; c++) {
      const fill = grid[r][c] ? CANVAS_COLORS.on : CANVAS_COLORS.off
      rects += `  <rect x="${c * cellPx}" y="${r * cellPx}" width="${cellPx}" height="${cellPx}" fill="${fill}" stroke="${CANVAS_COLORS.grid}" stroke-width="0.5"/>\n`
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`,
    `<rect width="100%" height="100%" fill="${CANVAS_COLORS.bg}"/>`,
    rects.trimEnd(),
    '</svg>',
  ].join('\n')
}

/**
 * Download a Blob as a file with the given filename.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Download a canvas element as a PNG file.
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
