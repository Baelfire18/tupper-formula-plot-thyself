<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useTupper } from "../composables/useTupper";
import { CANVAS_COLORS } from "../constants/colors";
import {
  EDITOR_PADDING,
  CANVAS_MAX_WIDTH,
  CANVAS_MAX_HEIGHT,
} from "../constants/grid";
import {
  computeCellSize,
  drawCells,
  drawGridLines,
  drawBboxOverlay,
  screenToCell,
} from "../utils/canvas";

const { grid, gridHeight, gridWidth, gridVersion, toggleCell, result } =
  useTupper();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let cellSize = 24;

let dragging = false;
let paintValue = 1;

function recalcCellSize(): number {
  const availW = CANVAS_MAX_WIDTH - EDITOR_PADDING * 2;
  const availH = CANVAS_MAX_HEIGHT - EDITOR_PADDING * 2;
  cellSize = computeCellSize(gridHeight.value, gridWidth.value, availW, availH);
  return cellSize;
}

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  recalcCellSize();
  canvas.width = gridWidth.value * cellSize + EDITOR_PADDING * 2;
  canvas.height = gridHeight.value * cellSize + EDITOR_PADDING * 2;
}

function draw(): void {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const n = gridHeight.value;
  const w = gridWidth.value;
  const bbox = result.computed ? result.bbox : null;

  ctx.fillStyle = CANVAS_COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCells(ctx, grid.value, cellSize, EDITOR_PADDING, EDITOR_PADDING);
  drawGridLines(ctx, n, w, cellSize, EDITOR_PADDING, EDITOR_PADDING);

  if (bbox) {
    drawBboxOverlay(ctx, bbox, n, cellSize, EDITOR_PADDING, EDITOR_PADDING);
  }
}

function onMouseDown(e: MouseEvent): void {
  e.preventDefault();
  dragging = true;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const pos = screenToCell(e, canvas, cellSize, EDITOR_PADDING, EDITOR_PADDING);
  const { r, c } = pos;
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return;
  paintValue = grid.value[r]?.[c] ? 0 : 1;
  toggleCell(r, c, paintValue);
}

function onMouseMove(e: MouseEvent): void {
  if (!dragging) return;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const pos = screenToCell(e, canvas, cellSize, EDITOR_PADDING, EDITOR_PADDING);
  const { r, c } = pos;
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return;
  toggleCell(r, c, paintValue);
}

function onMouseUp(): void {
  dragging = false;
}

function onTouchStart(e: TouchEvent): void {
  e.preventDefault();
  const touch = e.touches[0];
  dragging = true;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const pos = screenToCell(
    touch,
    canvas,
    cellSize,
    EDITOR_PADDING,
    EDITOR_PADDING,
  );
  const { r, c } = pos;
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return;
  paintValue = grid.value[r]?.[c] ? 0 : 1;
  toggleCell(r, c, paintValue);
}

function onTouchMove(e: TouchEvent): void {
  e.preventDefault();
  if (!dragging) return;
  const touch = e.touches[0];
  const canvas = canvasRef.value;
  if (!canvas) return;
  const pos = screenToCell(
    touch,
    canvas,
    cellSize,
    EDITOR_PADDING,
    EDITOR_PADDING,
  );
  const { r, c } = pos;
  if (r < 0 || r >= gridHeight.value || c < 0 || c >= gridWidth.value) return;
  toggleCell(r, c, paintValue);
}

function onTouchEnd(): void {
  dragging = false;
}

watch(gridVersion, () => {
  resizeCanvas();
  draw();
});

onMounted(() => {
  ctx = canvasRef.value?.getContext("2d") ?? null;
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("touchend", onTouchEnd);
  resizeCanvas();
  draw();
});

onBeforeUnmount(() => {
  window.removeEventListener("mouseup", onMouseUp);
  window.removeEventListener("touchend", onTouchEnd);
});
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
  cursor: crosshair;
}
</style>
