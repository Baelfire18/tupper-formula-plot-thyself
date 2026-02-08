<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useTupper } from '../composables/useTupper'
import { formatBigInt } from '../utils/format'
import { TupperPlane } from '../utils/tupper-plane'
import { drawFittedPreview, drawExplorePreview } from '../utils/preview-draw'
import {
  EXPLORE_LEFT_PAD,
  EXPLORE_TOP_PAD,
  EXPLORE_GRID_W,
  EXPLORE_GRID_H,
  PREVIEW_MIN_CELL_PX,
  PREVIEW_MAX_CELL_PX,
} from '../constants/preview'

const { gridHeight, gridWidth, gridVersion, result } = useTupper()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// ─── Tupper-plane evaluator ─────────────────────────────────

const plane = new TupperPlane()

// ─── Viewport state (explore mode) ──────────────────────────

const zoom = ref(1.0)
const panX = ref(0.0)
const panY = ref(0.0)
const exploreMode = ref(false)

let isDragging = false
let lastMouseX = 0
let lastMouseY = 0
let lastTouchDist = 0

// ─── Viewport helpers ───────────────────────────────────────

function baseCellSize(): number {
  const n = gridHeight.value
  const w = gridWidth.value
  if (!n || !w) return 20
  return Math.min(EXPLORE_GRID_W / w, EXPLORE_GRID_H / n)
}

function effectiveCellSize(): number {
  return baseCellSize() * zoom.value
}

function minZoomVal(): number {
  return Math.max(0.05, PREVIEW_MIN_CELL_PX / baseCellSize())
}

function maxZoomVal(): number {
  return Math.max(1, PREVIEW_MAX_CELL_PX / baseCellSize())
}

function clampPan(): void {
  const n = gridHeight.value
  const w = gridWidth.value
  const cs = effectiveCellSize()
  const viewW = EXPLORE_GRID_W / cs
  const viewH = EXPLORE_GRID_H / cs
  panX.value = Math.max(-Math.max(viewW * 0.5, 20), Math.min(w + Math.max(viewW * 0.5, 20), panX.value))
  panY.value = Math.max(-Math.max(30 * n, viewH), Math.min(n + Math.max(30 * n, viewH), panY.value))
}

function applyZoom(factor: number, cx: number, cy: number): void {
  const cs = effectiveCellSize()
  const worldX = panX.value + (cx - EXPLORE_LEFT_PAD) / cs
  const worldY = panY.value + (cy - EXPLORE_TOP_PAD) / cs
  const newZoom = Math.max(minZoomVal(), Math.min(maxZoomVal(), zoom.value * factor))
  if (newZoom === zoom.value) return
  zoom.value = newZoom
  const newCs = effectiveCellSize()
  panX.value = worldX - (cx - EXPLORE_LEFT_PAD) / newCs
  panY.value = worldY - (cy - EXPLORE_TOP_PAD) / newCs
  clampPan()
  draw()
}

function exploreCenter(): { x: number; y: number } {
  return { x: EXPLORE_LEFT_PAD + EXPLORE_GRID_W / 2, y: EXPLORE_TOP_PAD + EXPLORE_GRID_H / 2 }
}

// ─── Public viewport actions ────────────────────────────────

const canExplore = computed(() => result.computed && result.k !== null)

function fitAll(): void {
  zoom.value = 1.0
  const cs = baseCellSize()
  const viewW = EXPLORE_GRID_W / cs
  const viewH = EXPLORE_GRID_H / cs
  panX.value = -(viewW - gridWidth.value) / 2
  panY.value = -(viewH - gridHeight.value) / 2
  draw()
}

function enableExplore(): void {
  exploreMode.value = true
  plane.sync(result.k ?? null, result.computed, gridHeight.value)

  const n = gridHeight.value
  const base = baseCellSize()
  const zoomForBands = EXPLORE_GRID_H / (3 * n * base)
  zoom.value = Math.max(minZoomVal(), Math.min(1.0, zoomForBands))

  const cs = effectiveCellSize()
  const viewW = EXPLORE_GRID_W / cs
  const viewH = EXPLORE_GRID_H / cs
  panX.value = (gridWidth.value - viewW) / 2
  panY.value = (n - viewH) / 2
  clampPan()

  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = 'grab'
  draw()
}

function exitExplore(): void {
  exploreMode.value = false
  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = 'default'
  draw()
}

function zoomIn(): void {
  const c = exploreCenter()
  applyZoom(1.25, c.x, c.y)
}

function zoomOut(): void {
  const c = exploreCenter()
  applyZoom(0.8, c.x, c.y)
}

// ─── Draw dispatcher ────────────────────────────────────────

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  const n = gridHeight.value
  const w = gridWidth.value
  const displayGrid = result.computed ? result.decodedGrid : null
  const bbox = result.computed ? result.bbox : null
  const k = result.computed ? result.k : null

  if (exploreMode.value) {
    plane.sync(k, result.computed, n)
    drawExplorePreview({
      ctx,
      canvas,
      n,
      w,
      displayGrid,
      bbox,
      k,
      cs: effectiveCellSize(),
      panX: panX.value,
      panY: panY.value,
      zoom: zoom.value,
      pixelOn: (col, row) => plane.pixelOn(col, row),
    })
  } else {
    drawFittedPreview({ ctx, canvas, n, w, displayGrid, bbox, k })
  }
}

// ─── Mouse / touch events ───────────────────────────────────

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
  if (!exploreMode.value || !result.computed) return
  e.preventDefault()
  const coords = getCanvasCoords(e)
  applyZoom(e.deltaY > 0 ? 0.9 : 1.1, coords.x, coords.y)
}

function onMouseDown(e: MouseEvent): void {
  if (!exploreMode.value || !result.computed) return
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
  const cs = effectiveCellSize()
  panX.value -= (e.clientX - lastMouseX) * scale / cs
  panY.value -= (e.clientY - lastMouseY) * scale / cs
  clampPan()
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  draw()
}

function onMouseUp(): void {
  if (!isDragging) return
  isDragging = false
  const canvas = canvasRef.value
  if (canvas) canvas.style.cursor = exploreMode.value ? 'grab' : 'default'
}

function onDblClick(): void {
  if (exploreMode.value) fitAll()
}

function onTouchStart(e: TouchEvent): void {
  if (!exploreMode.value || !result.computed) return
  e.preventDefault()
  if (e.touches.length === 1) {
    isDragging = true
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    isDragging = false
    lastTouchDist = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY,
    )
  }
}

function onTouchMove(e: TouchEvent): void {
  if (!exploreMode.value || !result.computed) return
  e.preventDefault()
  const canvas = canvasRef.value
  if (!canvas) return
  if (e.touches.length === 1 && isDragging) {
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const cs = effectiveCellSize()
    panX.value -= (e.touches[0].clientX - lastMouseX) * scale / cs
    panY.value -= (e.touches[0].clientY - lastMouseY) * scale / cs
    clampPan()
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
    draw()
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY,
    )
    if (lastTouchDist > 0) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const rect = canvas.getBoundingClientRect()
      applyZoom(
        dist / lastTouchDist,
        (cx - rect.left) * (canvas.width / rect.width),
        (cy - rect.top) * (canvas.height / rect.height),
      )
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

// ─── Computed values for template ───────────────────────────

const zoomPercent = computed(() => Math.round(zoom.value * 100))

const kRangeLabel = computed(() => {
  if (!result.computed || result.k === null) return null
  return {
    start: formatBigInt(result.k),
    end: formatBigInt(result.k + BigInt(gridHeight.value - 1)),
  }
})

const visibleXRange = computed(() => {
  if (!result.computed) return null
  const cs = baseCellSize() * zoom.value
  const start = Math.max(0, Math.floor(panX.value))
  const end = Math.floor(panX.value + EXPLORE_GRID_W / cs)
  return `[${start}, ${end}]`
})

const visibleYRange = computed(() => {
  if (!result.computed || result.k === null) return null
  const cs = baseCellSize() * zoom.value
  const n = gridHeight.value
  const k = result.k
  const startRow = Math.floor(panY.value)
  const endRow = Math.floor(panY.value + EXPLORE_GRID_H / cs)
  return `[${formatBigInt(k + BigInt(n - 1 - endRow))}, ${formatBigInt(k + BigInt(n - 1 - startRow))}]`
})

// ─── Lifecycle & watchers ───────────────────────────────────

watch(gridVersion, () => draw())

watch(
  () => result.computed,
  () => {
    exploreMode.value = false
    draw()
  },
)

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d') ?? null
  draw()
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
        <div class="title-actions">
          <!-- "Explore nearby" when not exploring -->
          <button v-if="canExplore && !exploreMode" class="explore-btn" @click="enableExplore">
            Explore nearby
          </button>
          <!-- Zoom controls when exploring -->
          <template v-if="exploreMode">
            <div class="zoom-controls">
              <button class="zoom-btn" title="Zoom out" @click="zoomOut">&minus;</button>
              <span class="zoom-label mono">{{ zoomPercent }}%</span>
              <button class="zoom-btn" title="Zoom in" @click="zoomIn">+</button>
              <button class="zoom-btn fit-btn" title="Fit grid" @click="fitAll">Fit</button>
            </div>
            <button class="zoom-btn exit-btn" title="Exit explore mode" @click="exitExplore">
              &times;
            </button>
          </template>
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
      <!-- Explore mode hint -->
      <div v-if="exploreMode" class="nav-hint">
        <span class="hint-exploring">Exploring the Tupper plane</span>
        &middot; drag to pan &middot; scroll to zoom &middot; double-click to fit
      </div>
      <!-- Explore mode range -->
      <div v-if="exploreMode && visibleXRange && visibleYRange" class="range-info">
        <div class="range-item">
          <span class="range-label">x visible:</span>
          <span class="range-value mono">{{ visibleXRange }}</span>
        </div>
        <div class="range-item">
          <span class="range-label">y visible:</span>
          <span class="range-value mono">{{ visibleYRange }}</span>
        </div>
      </div>
      <!-- Fitted mode range -->
      <div v-if="!exploreMode && kRangeLabel" class="range-info">
        <div class="range-item">
          <span class="range-label">x range:</span>
          <span class="range-value mono">[0, {{ gridWidth - 1 }}]</span>
        </div>
        <div class="range-item">
          <span class="range-label">y range:</span>
          <span class="range-value mono">[{{ kRangeLabel.start }}, {{ kRangeLabel.end }}]</span>
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

.title-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.explore-btn {
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(122, 162, 255, 0.3);
  background: rgba(122, 162, 255, 0.1);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.explore-btn:hover {
  background: rgba(122, 162, 255, 0.2);
  border-color: rgba(122, 162, 255, 0.5);
}

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

.exit-btn {
  font-size: 18px;
  color: var(--muted);
  margin-left: 2px;
}

.exit-btn:hover {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.3);
  background: rgba(255, 107, 107, 0.1);
}

.zoom-label {
  font-size: 11px;
  color: var(--muted);
  min-width: 36px;
  text-align: center;
}

.canvas-frame {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--panel2);
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  max-height: 600px;
  height: auto;
  image-rendering: pixelated;
}

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
