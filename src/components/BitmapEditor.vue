<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTupper } from '../composables/useTupper'

const { grid, gridHeight, gridWidth, gridVersion, toggleCell, result } = useTupper()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let cellSize = 24
const padding = 6

let dragging = false
let paintValue = 1

const COLORS = {
  bg: '#0f1730',
  on: '#ffe14a',
  off: '#1c2752',
  grid: '#2a376b',
  accent: 'rgba(122, 162, 255, 0.85)'
} as const

function computeCellSize(): number {
  const n = gridHeight.value
  const w = gridWidth.value
  const maxW = 860
  const maxH = 500
  const padTotal = padding * 2
  cellSize = Math.max(6, Math.min(36, Math.floor(
    Math.min((maxW - padTotal) / w, (maxH - padTotal) / n)
  )))
  return cellSize
}

function resizeCanvas(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const n = gridHeight.value
  const w = gridWidth.value
  computeCellSize()
  canvas.width = w * cellSize + padding * 2
  canvas.height = n * cellSize + padding * 2
}

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const n = gridHeight.value
  const w = gridWidth.value
  const g = grid.value
  const bbox = result.computed ? result.bbox : null

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < w; c++) {
      ctx.fillStyle = g[r]?.[c] ? COLORS.on : COLORS.off
      ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize, cellSize)
    }
  }

  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1
  for (let c = 0; c <= w; c++) {
    const x = padding + c * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, padding + n * cellSize)
    ctx.stroke()
  }
  for (let r = 0; r <= n; r++) {
    const y = padding + r * cellSize + 0.5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + w * cellSize, y)
    ctx.stroke()
  }

  if (bbox) {
    const topYMin = n - 1 - bbox.yMax
    const topYMax = n - 1 - bbox.yMin
    ctx.strokeStyle = COLORS.accent
    ctx.lineWidth = 3
    ctx.strokeRect(
      padding + bbox.xMin * cellSize,
      padding + topYMin * cellSize,
      (bbox.xMax - bbox.xMin + 1) * cellSize,
      (topYMax - topYMin + 1) * cellSize
    )
  }
}

function screenToCell(e: MouseEvent | Touch): { r: number; c: number } | null {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) * (canvas.width / rect.width)
  const y = (e.clientY - rect.top) * (canvas.height / rect.height)
  const c = Math.floor((x - padding) / cellSize)
  const r = Math.floor((y - padding) / cellSize)
  return { r, c }
}

function onMouseDown(e: MouseEvent): void {
  e.preventDefault()
  dragging = true
  const pos = screenToCell(e)
  if (!pos) return
  const { r, c } = pos
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return
  paintValue = grid.value[r]?.[c] ? 0 : 1
  toggleCell(r, c, paintValue)
}

function onMouseMove(e: MouseEvent): void {
  if (!dragging) return
  const pos = screenToCell(e)
  if (!pos) return
  const { r, c } = pos
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return
  toggleCell(r, c, paintValue)
}

function onMouseUp(): void {
  dragging = false
}

function onTouchStart(e: TouchEvent): void {
  e.preventDefault()
  const touch = e.touches[0]
  dragging = true
  const pos = screenToCell(touch)
  if (!pos) return
  const { r, c } = pos
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return
  paintValue = grid.value[r]?.[c] ? 0 : 1
  toggleCell(r, c, paintValue)
}

function onTouchMove(e: TouchEvent): void {
  e.preventDefault()
  if (!dragging) return
  const touch = e.touches[0]
  const pos = screenToCell(touch)
  if (!pos) return
  const { r, c } = pos
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return
  toggleCell(r, c, paintValue)
}

function onTouchEnd(): void {
  dragging = false
}

watch(gridVersion, () => {
  resizeCanvas()
  draw()
})

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d') ?? null
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onTouchEnd)
  resizeCanvas()
  draw()
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div class="card">
    <div class="canvas-box">
      <div class="canvas-title">
        <h2>Editor</h2>
        <span class="meta">Click to toggle · drag to paint</span>
      </div>
      <div class="canvas-frame">
        <canvas
          ref="canvasRef"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
        />
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
  align-items: baseline;
  gap: 10px;
}

.canvas-title h2 {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}

.meta {
  color: var(--muted);
  font-size: 12px;
}

.canvas-frame {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--panel2);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  cursor: crosshair;
}
</style>
