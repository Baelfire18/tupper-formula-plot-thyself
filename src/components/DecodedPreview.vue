<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useTupper } from '../composables/useTupper'
import { CANVAS_COLORS } from '../constants/colors'
import { formatBigInt } from '../utils/format'

const { gridHeight, gridWidth, gridVersion, result } = useTupper()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// ─── Canvas layout constants ────────────────────────────────

const CANVAS_W = 860
const CANVAS_H = 460
const LEFT_PAD = 56
const TOP_PAD = 32
const RIGHT_PAD = 16
const BOTTOM_PAD = 14
const GRID_AREA_W = CANVAS_W - LEFT_PAD - RIGHT_PAD
const GRID_AREA_H = CANVAS_H - TOP_PAD - BOTTOM_PAD

const MIN_CELL_PX = 2
const MAX_CELL_PX = 48

// Colors for the Tupper plane outside the user's grid
const EXT_ON = '#8a7830'
const EXT_OFF = '#141c38'

// ─── Viewport state ─────────────────────────────────────────

const zoom = ref(1.0) // 1 = grid fits exactly; <1 = zoomed out (explore)
const panX = ref(0.0) // world x of viewport left edge (can be < 0)
const panY = ref(0.0) // world display-row of viewport top edge (can be < 0)

let isDragging = false
let lastMouseX = 0
let lastMouseY = 0

// ─── Tupper plane — band cache ──────────────────────────────
//
// Each "band" is a horizontal strip of n rows determined by
// N_band = floor(abs_y / n). Within a band, bit (n * col + row_in_band)
// of N_band tells us whether that pixel is on.
//
// We cache the reversed binary string of N_band for fast lookups.
// The cache key is the integer offset from our grid's N value.

let cachedN: bigint | null = null
let cachedGridN = 0
const bandBitsCache = new Map<number, string>()

function syncBandCache(): void {
  if (result.k === null || !result.computed) {
    cachedN = null
    bandBitsCache.clear()
    return
  }
  const n = gridHeight.value
  const newN = result.k / BigInt(n)
  if (newN !== cachedN || n !== cachedGridN) {
    cachedN = newN
    cachedGridN = n
    bandBitsCache.clear()
  }
}

/** Reversed binary string for band at offset d from our N (LSB first) */
function getBandBits(offset: number): string {
  if (cachedN === null) return ''
  if (bandBitsCache.has(offset)) return bandBitsCache.get(offset)!
  const bandN = cachedN + BigInt(offset)
  if (bandN < 0n) {
    bandBitsCache.set(offset, '')
    return ''
  }
  const reversed = bandN.toString(2).split('').reverse().join('')
  bandBitsCache.set(offset, reversed)
  return reversed
}

/**
 * Evaluate Tupper's formula at (col, dispRow) in world coordinates.
 * dispRow is top-origin relative to our grid: 0 = top of grid, n-1 = bottom.
 * Negative = above, >= n = below.
 */
function tupperPixelOn(col: number, dispRow: number): boolean {
  if (col < 0 || cachedN === null) return false
  const n = cachedGridN
  const v = n - 1 - dispRow
  const bandOffset = Math.floor(v / n)
  const rowInBand = ((v % n) + n) % n
  const bitIndex = n * col + rowInBand
  const bits = getBandBits(bandOffset)
  return bitIndex >= 0 && bitIndex < bits.length && bits[bitIndex] === '1'
}

// ─── Viewport math ──────────────────────────────────────────

function baseCellSize(): number {
  const n = gridHeight.value
  const w = gridWidth.value
  if (!n || !w) return 20
  return Math.min(GRID_AREA_W / w, GRID_AREA_H / n)
}

function effectiveCellSize(): number {
  return baseCellSize() * zoom.value
}

function minZoomVal(): number {
  return Math.max(0.05, MIN_CELL_PX / baseCellSize())
}

function maxZoomVal(): number {
  return Math.max(1, MAX_CELL_PX / baseCellSize())
}

const canExplore = computed(() => result.computed && result.k !== null)

function clampPan(): void {
  const n = gridHeight.value
  const w = gridWidth.value
  const cs = effectiveCellSize()
  const viewW = GRID_AREA_W / cs
  const viewH = GRID_AREA_H / cs
  const xMargin = Math.max(viewW * 0.5, 20)
  const yMargin = Math.max(30 * n, viewH)
  panX.value = Math.max(-xMargin, Math.min(w + xMargin, panX.value))
  panY.value = Math.max(-yMargin, Math.min(n + yMargin, panY.value))
}

/** Reset to zoom=1 with the grid centered in the canvas */
function fitAll(): void {
  zoom.value = 1.0
  const cs = baseCellSize()
  const viewW = GRID_AREA_W / cs
  const viewH = GRID_AREA_H / cs
  panX.value = -(viewW - gridWidth.value) / 2
  panY.value = -(viewH - gridHeight.value) / 2
  draw()
}

function zoomIn(): void {
  applyZoom(1.25, canvasCenter().x, canvasCenter().y)
}

function zoomOut(): void {
  applyZoom(0.8, canvasCenter().x, canvasCenter().y)
}

function canvasCenter(): { x: number; y: number } {
  return { x: LEFT_PAD + GRID_AREA_W / 2, y: TOP_PAD + GRID_AREA_H / 2 }
}

function applyZoom(factor: number, cx: number, cy: number): void {
  const cs = effectiveCellSize()
  const worldX = panX.value + (cx - LEFT_PAD) / cs
  const worldY = panY.value + (cy - TOP_PAD) / cs

  const newZoom = Math.max(minZoomVal(), Math.min(maxZoomVal(), zoom.value * factor))
  if (newZoom === zoom.value) return

  zoom.value = newZoom
  const newCs = effectiveCellSize()
  panX.value = worldX - (cx - LEFT_PAD) / newCs
  panY.value = worldY - (cy - TOP_PAD) / newCs
  clampPan()
  draw()
}

// ─── Canvas drawing ─────────────────────────────────────────

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  canvas.width = CANVAS_W
  canvas.height = CANVAS_H

  const n = gridHeight.value
  const w = gridWidth.value
  const displayGrid = result.computed ? result.decodedGrid : null
  const bbox = result.computed ? result.bbox : null
  const k = result.computed ? result.k : null
  const cs = effectiveCellSize()
  const exploring = canExplore.value

  syncBandCache()

  // Visible cell range in world coordinates
  const startCol = Math.floor(panX.value)
  const endCol = Math.ceil(panX.value + GRID_AREA_W / cs)
  const startRow = Math.floor(panY.value)
  const endRow = Math.ceil(panY.value + GRID_AREA_H / cs)

  // Background
  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // Clip to the grid drawing area
  ctx.save()
  ctx.beginPath()
  ctx.rect(LEFT_PAD, TOP_PAD, GRID_AREA_W, GRID_AREA_H)
  ctx.clip()

  // ── Draw cells ──
  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const px = LEFT_PAD + (c - panX.value) * cs
      const py = TOP_PAD + (r - panY.value) * cs
      const inGrid = c >= 0 && c < w && r >= 0 && r < n
      let on = false

      if (inGrid && displayGrid) {
        on = !!displayGrid[r]?.[c]
      } else if (exploring && c >= 0) {
        on = tupperPixelOn(c, r)
      }

      if (c < 0) {
        ctx.fillStyle = CANVAS_COLORS.bg
      } else if (inGrid) {
        ctx.fillStyle = on ? CANVAS_COLORS.on : CANVAS_COLORS.off
      } else {
        ctx.fillStyle = on ? EXT_ON : EXT_OFF
      }
      ctx.fillRect(px, py, cs + 0.5, cs + 0.5)
    }
  }

  // ── Grid lines (only when cells are big enough) ──
  if (cs >= 4) {
    ctx.strokeStyle = CANVAS_COLORS.grid
    ctx.lineWidth = 1
    for (let c = startCol; c <= endCol; c++) {
      const px = LEFT_PAD + (c - panX.value) * cs + 0.5
      ctx.beginPath()
      ctx.moveTo(px, TOP_PAD)
      ctx.lineTo(px, TOP_PAD + GRID_AREA_H)
      ctx.stroke()
    }
    for (let r = startRow; r <= endRow; r++) {
      const py = TOP_PAD + (r - panY.value) * cs + 0.5
      ctx.beginPath()
      ctx.moveTo(LEFT_PAD, py)
      ctx.lineTo(LEFT_PAD + GRID_AREA_W, py)
      ctx.stroke()
    }
  }

  // ── Band separators (dashed lines at n-row boundaries) ──
  if (zoom.value < 0.95 && n > 0) {
    ctx.strokeStyle = 'rgba(122, 162, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    const firstBand = Math.floor(startRow / n) * n
    for (let bandY = firstBand; bandY <= endRow; bandY += n) {
      if (bandY === 0 || bandY === n) continue // our grid edges handled below
      const py = TOP_PAD + (bandY - panY.value) * cs
      ctx.beginPath()
      ctx.moveTo(LEFT_PAD, py)
      ctx.lineTo(LEFT_PAD + GRID_AREA_W, py)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // ── Our-grid highlight (dashed border when zoomed out) ──
  if (zoom.value < 0.95) {
    const gx = LEFT_PAD + (0 - panX.value) * cs
    const gy = TOP_PAD + (0 - panY.value) * cs
    const gw = w * cs
    const gh = n * cs
    ctx.strokeStyle = CANVAS_COLORS.accent
    ctx.lineWidth = 2
    ctx.setLineDash([6, 3])
    ctx.strokeRect(gx, gy, gw, gh)
    ctx.setLineDash([])
  }

  // ── BBox overlay ──
  if (bbox) {
    const topYMin = n - 1 - bbox.yMax
    const topYMax = n - 1 - bbox.yMin
    const bx = LEFT_PAD + (bbox.xMin - panX.value) * cs
    const by = TOP_PAD + (topYMin - panY.value) * cs
    const bw = (bbox.xMax - bbox.xMin + 1) * cs
    const bh = (topYMax - topYMin + 1) * cs
    ctx.strokeStyle = CANVAS_COLORS.accent
    ctx.lineWidth = 3
    ctx.strokeRect(bx, by, bw, bh)
  }

  ctx.restore() // remove clip

  // Frame border
  ctx.strokeStyle = CANVAS_COLORS.frame
  ctx.lineWidth = 2
  ctx.strokeRect(LEFT_PAD - 1, TOP_PAD - 1, GRID_AREA_W + 2, GRID_AREA_H + 2)

  // Clear axis gutter areas
  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, LEFT_PAD - 2, CANVAS_H)
  ctx.fillRect(0, 0, CANVAS_W, TOP_PAD - 2)

  // ── X-axis labels ──
  const fontSize = Math.min(12, Math.max(8, Math.floor(cs) - 2))
  ctx.fillStyle = CANVAS_COLORS.muted
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.textAlign = 'center'

  const minXSpacing = 40
  const xStep = Math.max(1, Math.ceil(minXSpacing / cs))
  const firstXLabel = Math.ceil(Math.max(0, startCol) / xStep) * xStep
  for (let x = firstXLabel; x <= endCol; x += xStep) {
    const px = LEFT_PAD + (x - panX.value) * cs + cs / 2
    if (px > LEFT_PAD - 5 && px < CANVAS_W - RIGHT_PAD + 5) {
      ctx.fillText(String(x), px, TOP_PAD - 8)
    }
  }

  ctx.textAlign = 'right'
  ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.fillText('x \u2192', CANVAS_W - 4, TOP_PAD - 8)

  // ── Y-axis labels (extended to handle rows outside our grid) ──
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.textAlign = 'right'

  const minYSpacing = 18
  const yStep = Math.max(1, Math.ceil(minYSpacing / cs))
  const firstYLabel = Math.ceil(startRow / yStep) * yStep
  for (let r = firstYLabel; r <= endRow; r += yStep) {
    const py = TOP_PAD + (r - panY.value) * cs + cs / 2 + 4
    if (py > TOP_PAD && py < CANVAS_H - BOTTOM_PAD) {
      const offsetFromK = n - 1 - r
      let label: string
      if (k !== null) {
        const kStr = k.toString()
        if (kStr.length <= 8) {
          label = (k + BigInt(offsetFromK)).toString()
        } else if (offsetFromK === 0) {
          label = 'k'
        } else if (offsetFromK > 0) {
          label = `k+${offsetFromK}`
        } else {
          label = `k${offsetFromK}`
        }
      } else {
        label = String(offsetFromK)
      }
      ctx.fillText(label, LEFT_PAD - 6, py)
    }
  }

  ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.save()
  ctx.translate(14, TOP_PAD + 16)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'left'
  ctx.fillText('y \u2191', 0, 0)
  ctx.restore()
}

// ─── Mouse / touch event handlers ───────────────────────────

function getCanvasCoords(e: MouseEvent | Touch): { x: number; y: number } {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function onWheel(e: WheelEvent): void {
  e.preventDefault()
  if (!result.computed) return
  const coords = getCanvasCoords(e)
  // deltaY > 0 → zoom out (see more), deltaY < 0 → zoom in
  const factor = e.deltaY > 0 ? 0.9 : 1.1
  applyZoom(factor, coords.x, coords.y)
}

function onMouseDown(e: MouseEvent): void {
  if (!result.computed) return
  isDragging = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = 'grabbing'
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scale = canvas.width / rect.width
  const dx = (e.clientX - lastMouseX) * scale
  const dy = (e.clientY - lastMouseY) * scale
  const cs = effectiveCellSize()
  panX.value -= dx / cs
  panY.value -= dy / cs
  clampPan()
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  draw()
}

function onMouseUp(): void {
  if (!isDragging) return
  isDragging = false
  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = result.computed ? 'grab' : 'default'
}

function onDblClick(): void {
  fitAll()
}

// Touch support
let lastTouchDist = 0

function onTouchStart(e: TouchEvent): void {
  if (!result.computed) return
  e.preventDefault()
  if (e.touches.length === 1) {
    isDragging = true
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    isDragging = false
    const t0 = e.touches[0]
    const t1 = e.touches[1]
    lastTouchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
  }
}

function onTouchMove(e: TouchEvent): void {
  if (!result.computed) return
  e.preventDefault()
  const canvas = canvasRef.value
  if (!canvas) return
  if (e.touches.length === 1 && isDragging) {
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const dx = (e.touches[0].clientX - lastMouseX) * scale
    const dy = (e.touches[0].clientY - lastMouseY) * scale
    const cs = effectiveCellSize()
    panX.value -= dx / cs
    panY.value -= dy / cs
    clampPan()
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
    draw()
  } else if (e.touches.length === 2) {
    const t0 = e.touches[0]
    const t1 = e.touches[1]
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
    if (lastTouchDist > 0) {
      const centerX = (t0.clientX + t1.clientX) / 2
      const centerY = (t0.clientY + t1.clientY) / 2
      const rect = canvas.getBoundingClientRect()
      const cx = (centerX - rect.left) * (canvas.width / rect.width)
      const cy = (centerY - rect.top) * (canvas.height / rect.height)
      applyZoom(dist / lastTouchDist, cx, cy)
    }
    lastTouchDist = dist
  }
}

function onTouchEnd(e: TouchEvent): void {
  if (e.touches.length === 0) {
    isDragging = false
    lastTouchDist = 0
  }
}

// ─── Reactive computed for template ─────────────────────────

const zoomPercent = computed(() => Math.round(zoom.value * 100))

const isZoomedOut = computed(() => zoom.value < 0.95)

const visibleXRange = computed(() => {
  if (!result.computed) return null
  const cs = baseCellSize() * zoom.value
  const start = Math.max(0, Math.floor(panX.value))
  const end = Math.floor(panX.value + GRID_AREA_W / cs)
  return `[${start}, ${end}]`
})

const visibleYRange = computed(() => {
  if (!result.computed || result.k === null) return null
  const cs = baseCellSize() * zoom.value
  const n = gridHeight.value
  const k = result.k
  const startRow = Math.floor(panY.value)
  const endRow = Math.floor(panY.value + GRID_AREA_H / cs)
  const bottomStart = n - 1 - endRow
  const bottomEnd = n - 1 - startRow
  return `[${formatBigInt(k + BigInt(bottomStart))}, ${formatBigInt(k + BigInt(bottomEnd))}]`
})

// ─── Watchers & lifecycle ───────────────────────────────────

watch(gridVersion, () => {
  draw()
})

watch(
  () => result.computed,
  () => {
    fitAll()
  },
)

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d') ?? null
  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = 'grab'
  fitAll()
  window.addEventListener('mouseup', onMouseUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div class="card">
    <div class="canvas-box">
      <div class="canvas-title">
        <h2>Decoded Preview (from k)</h2>
        <div v-if="canExplore" class="zoom-controls">
          <button class="zoom-btn" title="Zoom out (explore)" @click="zoomOut">&minus;</button>
          <span class="zoom-label mono">{{ zoomPercent }}%</span>
          <button class="zoom-btn" title="Zoom in" @click="zoomIn">+</button>
          <button class="zoom-btn fit-btn" title="Fit grid" @click="fitAll">Fit</button>
        </div>
      </div>
      <div class="canvas-frame">
        <canvas
          ref="canvasRef"
          @wheel="onWheel"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @dblclick="onDblClick"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        />
      </div>
      <div v-if="canExplore" class="nav-hint">
        <template v-if="isZoomedOut">
          <span class="hint-exploring">Exploring the Tupper plane</span>
          &middot; drag to pan &middot; scroll to zoom &middot; double-click to fit
        </template>
        <template v-else>
          Scroll to zoom out and explore the Tupper plane &middot; drag to pan
        </template>
      </div>
      <div v-if="visibleXRange && visibleYRange" class="range-info">
        <div class="range-item">
          <span class="range-label">x visible:</span>
          <span class="range-value mono">{{ visibleXRange }}</span>
        </div>
        <div class="range-item">
          <span class="range-label">y visible:</span>
          <span class="range-value mono">{{ visibleYRange }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.canvas-box {
  display: grid;
  gap: 8px;
}

.canvas-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.canvas-title h2 {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}

/* Zoom controls */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
  line-height: 1;
}

.zoom-btn:hover {
  background: rgba(122, 162, 255, 0.15);
  border-color: rgba(122, 162, 255, 0.3);
}

.fit-btn {
  width: auto;
  padding: 0 8px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zoom-label {
  font-size: 11px;
  color: var(--muted);
  min-width: 36px;
  text-align: center;
}

/* Canvas frame */
.canvas-frame {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--panel2);
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
  image-rendering: pixelated;
  cursor: grab;
}

/* Navigation hint */
.nav-hint {
  font-size: 10px;
  color: var(--muted);
  text-align: center;
  opacity: 0.7;
}

.hint-exploring {
  color: var(--accent);
  font-weight: 600;
  opacity: 1;
}

/* Range info */
.range-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
}

.range-item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.range-label {
  color: var(--muted);
  font-weight: 600;
}

.range-value {
  color: var(--text);
  word-break: break-all;
}

.mono {
  font-family: var(--font-mono);
}
</style>
