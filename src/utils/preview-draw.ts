import type { BBox, Grid } from '../types'
import { CANVAS_COLORS } from '../constants/colors'
import { CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT } from '../constants/grid'
import { computeCellSize, drawCells, drawGridLines, drawBboxOverlay } from './canvas'
import {
  EXPLORE_CANVAS_W,
  EXPLORE_CANVAS_H,
  EXPLORE_LEFT_PAD,
  EXPLORE_TOP_PAD,
  EXPLORE_RIGHT_PAD,
  EXPLORE_BOTTOM_PAD,
  EXPLORE_GRID_W,
  EXPLORE_GRID_H,
  FITTED_TOP_PAD,
  FITTED_RIGHT_PAD,
  FITTED_BOTTOM_PAD,
  EXT_ON_COLOR,
  EXT_OFF_COLOR,
  AXIS_COLOR,
} from '../constants/preview'

// ─── Shared helpers ─────────────────────────────────────────

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace'

/** Compute left padding for the Y-axis labels in fitted mode */
export function computeFittedLeftPad(k: bigint | null, n: number): number {
  if (k !== null) {
    const kStr = k.toString()
    if (kStr.length <= 8) {
      const maxVal = (k + BigInt(n - 1)).toString()
      return Math.max(56, maxVal.length * 8 + 20)
    }
    const maxLabel = `k+${n - 1}`
    return Math.max(56, maxLabel.length * 7 + 20)
  }
  const maxLabel = String(n - 1)
  return Math.max(44, maxLabel.length * 8 + 20)
}

/** Build a Y-axis label for a given bottom-origin row offset from k */
function yLabel(k: bigint | null, offset: number): string {
  if (k !== null) {
    const kStr = k.toString()
    if (kStr.length <= 8) return (k + BigInt(offset)).toString()
    if (offset === 0) return 'k'
    if (offset > 0) return `k+${offset}`
    return `k${offset}`
  }
  return String(offset)
}

// ─── Fitted-mode draw ───────────────────────────────────────

export interface FittedDrawOptions {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  n: number
  w: number
  displayGrid: Grid | null
  bbox: BBox | null
  k: bigint | null
}

export function drawFittedPreview(o: FittedDrawOptions): void {
  const { ctx, canvas, n, w, displayGrid, bbox, k } = o

  const lp = computeFittedLeftPad(k, n)
  const availW = CANVAS_MAX_WIDTH - lp - FITTED_RIGHT_PAD
  const availH = CANVAS_MAX_HEIGHT - FITTED_TOP_PAD - FITTED_BOTTOM_PAD
  const cs = computeCellSize(n, w, availW, availH)

  canvas.width = w * cs + lp + FITTED_RIGHT_PAD
  canvas.height = n * cs + FITTED_TOP_PAD + FITTED_BOTTOM_PAD

  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Frame
  ctx.strokeStyle = CANVAS_COLORS.frame
  ctx.lineWidth = 2
  ctx.strokeRect(lp - 1, FITTED_TOP_PAD - 1, w * cs + 2, n * cs + 2)

  // Cells
  if (displayGrid) {
    drawCells(ctx, displayGrid, cs, lp, FITTED_TOP_PAD)
  } else {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < w; c++) {
        ctx.fillStyle = CANVAS_COLORS.off
        ctx.fillRect(lp + c * cs, FITTED_TOP_PAD + r * cs, cs, cs)
      }
    }
  }

  drawGridLines(ctx, n, w, cs, lp, FITTED_TOP_PAD)

  // ── X-axis labels ──
  const fontSize = Math.min(12, Math.max(8, cs - 2))
  ctx.fillStyle = CANVAS_COLORS.muted
  ctx.font = `${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'center'

  const xStep = w > 50 ? Math.ceil(w / 20) : w > 25 ? Math.ceil(w / 15) : 1
  for (let x = 0; x < w; x++) {
    if (x % xStep === 0 || x === w - 1) {
      ctx.fillText(String(x), lp + x * cs + cs / 2, FITTED_TOP_PAD - 8)
    }
  }
  ctx.textAlign = 'right'
  ctx.font = `bold ${fontSize}px ${MONO_FONT}`
  ctx.fillText('x \u2192', lp + w * cs + FITTED_RIGHT_PAD - 6, FITTED_TOP_PAD - 8)

  // ── Y-axis labels ──
  ctx.font = `${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'right'
  const yStep = n > 30 ? Math.ceil(n / 15) : 1
  for (let i = 0; i < n; i++) {
    const bottomRow = n - 1 - i
    if (bottomRow % yStep === 0 || bottomRow === n - 1) {
      ctx.fillText(yLabel(k, bottomRow), lp - 6, FITTED_TOP_PAD + i * cs + cs / 2 + 4)
    }
  }

  // "y ↑" (vertical, arrow pointing up)
  ctx.font = `bold ${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('\u2191', 14, FITTED_TOP_PAD + 4)
  ctx.fillText('y', 14, FITTED_TOP_PAD + 4 + fontSize + 2)

  // BBox
  if (bbox) drawBboxOverlay(ctx, bbox, n, cs, lp, FITTED_TOP_PAD)
}

// ─── Explore-mode draw ──────────────────────────────────────

export interface ExploreDrawOptions {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  n: number
  w: number
  displayGrid: Grid | null
  bbox: BBox | null
  k: bigint | null
  cs: number
  panX: number
  panY: number
  zoom: number
  pixelOn: (col: number, dispRow: number) => boolean
}

export function drawExplorePreview(o: ExploreDrawOptions): void {
  const { ctx, canvas, n, w, displayGrid, bbox, k, cs, panX, panY, pixelOn } = o
  const LP = EXPLORE_LEFT_PAD
  const TP = EXPLORE_TOP_PAD

  canvas.width = EXPLORE_CANVAS_W
  canvas.height = EXPLORE_CANVAS_H

  const startCol = Math.floor(panX)
  const endCol = Math.ceil(panX + EXPLORE_GRID_W / cs)
  const startRow = Math.floor(panY)
  const endRow = Math.ceil(panY + EXPLORE_GRID_H / cs)

  // Background
  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, EXPLORE_CANVAS_W, EXPLORE_CANVAS_H)

  // Clip
  ctx.save()
  ctx.beginPath()
  ctx.rect(LP, TP, EXPLORE_GRID_W, EXPLORE_GRID_H)
  ctx.clip()

  // ── Cells ──
  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const px = LP + (c - panX) * cs
      const py = TP + (r - panY) * cs
      const inGrid = c >= 0 && c < w && r >= 0 && r < n
      let on = false

      if (inGrid && displayGrid) {
        on = !!displayGrid[r]?.[c]
      } else if (c >= 0) {
        on = pixelOn(c, r)
      }

      if (c < 0) {
        ctx.fillStyle = CANVAS_COLORS.bg
      } else if (inGrid) {
        ctx.fillStyle = on ? CANVAS_COLORS.on : CANVAS_COLORS.off
      } else {
        ctx.fillStyle = on ? EXT_ON_COLOR : EXT_OFF_COLOR
      }
      ctx.fillRect(px, py, cs + 0.5, cs + 0.5)
    }
  }

  // ── Grid lines ──
  if (cs >= 4) {
    ctx.strokeStyle = CANVAS_COLORS.grid
    ctx.lineWidth = 1
    for (let c = startCol; c <= endCol; c++) {
      const px = LP + (c - panX) * cs + 0.5
      ctx.beginPath()
      ctx.moveTo(px, TP)
      ctx.lineTo(px, TP + EXPLORE_GRID_H)
      ctx.stroke()
    }
    for (let r = startRow; r <= endRow; r++) {
      const py = TP + (r - panY) * cs + 0.5
      ctx.beginPath()
      ctx.moveTo(LP, py)
      ctx.lineTo(LP + EXPLORE_GRID_W, py)
      ctx.stroke()
    }
  }

  // ── Band separators ──
  if (n > 0) {
    ctx.strokeStyle = 'rgba(122, 162, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    const firstBand = Math.floor(startRow / n) * n
    for (let bandY = firstBand; bandY <= endRow; bandY += n) {
      if (bandY === 0 || bandY === n) continue
      const py = TP + (bandY - panY) * cs
      ctx.beginPath()
      ctx.moveTo(LP, py)
      ctx.lineTo(LP + EXPLORE_GRID_W, py)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // ── Grid highlight ──
  ctx.strokeStyle = CANVAS_COLORS.accent
  ctx.lineWidth = 2
  ctx.setLineDash([6, 3])
  ctx.strokeRect(LP + (0 - panX) * cs, TP + (0 - panY) * cs, w * cs, n * cs)
  ctx.setLineDash([])

  // ── Red axis lines (x=0 and y=0) ──
  const xZeroPx = LP + (0 - panX) * cs
  if (xZeroPx >= LP && xZeroPx <= LP + EXPLORE_GRID_W) {
    ctx.strokeStyle = AXIS_COLOR
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(xZeroPx, TP)
    ctx.lineTo(xZeroPx, TP + EXPLORE_GRID_H)
    ctx.stroke()
  }

  if (k !== null) {
    const yZeroDispBig = k + BigInt(n - 1)
    const vpStartBig = BigInt(Math.floor(panY))
    const vpEndBig = BigInt(Math.ceil(panY + EXPLORE_GRID_H / cs))
    if (yZeroDispBig >= vpStartBig && yZeroDispBig <= vpEndBig) {
      const yZeroPx = TP + (Number(yZeroDispBig) - panY) * cs
      ctx.strokeStyle = AXIS_COLOR
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(LP, yZeroPx)
      ctx.lineTo(LP + EXPLORE_GRID_W, yZeroPx)
      ctx.stroke()
    }
  }

  // ── BBox ──
  if (bbox) {
    const topYMin = n - 1 - bbox.yMax
    const topYMax = n - 1 - bbox.yMin
    ctx.strokeStyle = CANVAS_COLORS.accent
    ctx.lineWidth = 3
    ctx.strokeRect(
      LP + (bbox.xMin - panX) * cs,
      TP + (topYMin - panY) * cs,
      (bbox.xMax - bbox.xMin + 1) * cs,
      (topYMax - topYMin + 1) * cs,
    )
  }

  ctx.restore() // remove clip

  // ── Frame border ──
  ctx.strokeStyle = CANVAS_COLORS.frame
  ctx.lineWidth = 2
  ctx.strokeRect(LP - 1, TP - 1, EXPLORE_GRID_W + 2, EXPLORE_GRID_H + 2)

  // ── Axis gutters ──
  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, LP - 2, EXPLORE_CANVAS_H)
  ctx.fillRect(0, 0, EXPLORE_CANVAS_W, TP - 2)

  // ── X-axis labels ──
  const fontSize = Math.min(12, Math.max(8, Math.floor(cs) - 2))
  ctx.fillStyle = CANVAS_COLORS.muted
  ctx.font = `${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'center'

  const minXSpacing = 40
  const xStep = Math.max(1, Math.ceil(minXSpacing / cs))
  const firstXLabel = Math.ceil(Math.max(0, startCol) / xStep) * xStep
  for (let x = firstXLabel; x <= endCol; x += xStep) {
    const px = LP + (x - panX) * cs + cs / 2
    if (px > LP - 5 && px < EXPLORE_CANVAS_W - EXPLORE_RIGHT_PAD + 5) {
      ctx.fillText(String(x), px, TP - 8)
    }
  }
  ctx.textAlign = 'right'
  ctx.font = `bold ${fontSize}px ${MONO_FONT}`
  ctx.fillText('x \u2192', EXPLORE_CANVAS_W - 4, TP - 8)

  // ── Y-axis labels ──
  ctx.font = `${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'right'
  const minYSpacing = 18
  const yStep = Math.max(1, Math.ceil(minYSpacing / cs))
  const firstYLabel = Math.ceil(startRow / yStep) * yStep
  for (let r = firstYLabel; r <= endRow; r += yStep) {
    const py = TP + (r - panY) * cs + cs / 2 + 4
    if (py > TP && py < EXPLORE_CANVAS_H - EXPLORE_BOTTOM_PAD) {
      ctx.fillText(yLabel(k, n - 1 - r), LP - 6, py)
    }
  }

  // "y ↑" (vertical, arrow pointing up)
  ctx.font = `bold ${fontSize}px ${MONO_FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('\u2191', 14, TP + 4)
  ctx.fillText('y', 14, TP + 4 + fontSize + 2)
}
