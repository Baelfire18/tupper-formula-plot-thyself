import type { BBox, Grid } from '../types'
import { CANVAS_COLORS } from '../constants/colors'
import { CELL_SIZE_MIN, CELL_SIZE_MAX } from '../constants/grid'

/**
 * Compute the optimal cell size for rendering a grid within available space.
 */
export function computeCellSize(
  rows: number,
  cols: number,
  availWidth: number,
  availHeight: number,
): number {
  return Math.max(
    CELL_SIZE_MIN,
    Math.min(
      CELL_SIZE_MAX,
      Math.floor(Math.min(availWidth / cols, availHeight / rows)),
    ),
  )
}

/**
 * Draw grid cells (filled rectangles) on a canvas context.
 */
export function drawCells(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  colorOn = CANVAS_COLORS.on,
  colorOff = CANVAS_COLORS.off,
): void {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = grid[r]?.[c] ? colorOn : colorOff
      ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cellSize)
    }
  }
}

/**
 * Draw grid lines on a canvas context.
 */
export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  color = CANVAS_COLORS.grid,
): void {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  for (let c = 0; c <= cols; c++) {
    const x = offsetX + c * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(x, offsetY)
    ctx.lineTo(x, offsetY + rows * cellSize)
    ctx.stroke()
  }
  for (let r = 0; r <= rows; r++) {
    const y = offsetY + r * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(offsetX, y)
    ctx.lineTo(offsetX + cols * cellSize, y)
    ctx.stroke()
  }
}

/**
 * Draw a bounding box overlay, converting from bottom-origin to top-origin coordinates.
 */
export function drawBboxOverlay(
  ctx: CanvasRenderingContext2D,
  bbox: BBox,
  totalRows: number,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  color = CANVAS_COLORS.accent,
): void {
  const topYMin = totalRows - 1 - bbox.yMax
  const topYMax = totalRows - 1 - bbox.yMin
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.strokeRect(
    offsetX + bbox.xMin * cellSize,
    offsetY + topYMin * cellSize,
    (bbox.xMax - bbox.xMin + 1) * cellSize,
    (topYMax - topYMin + 1) * cellSize,
  )
}

/**
 * Convert screen (mouse/touch) coordinates to grid cell coordinates.
 */
export function screenToCell(
  event: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement,
  cellSize: number,
  offsetX: number,
  offsetY: number,
): { r: number; c: number } {
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  return {
    c: Math.floor((x - offsetX) / cellSize),
    r: Math.floor((y - offsetY) / cellSize),
  }
}
