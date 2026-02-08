<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useTupper } from "../composables/useTupper";
import { CANVAS_COLORS } from "../constants/colors";
import { CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT } from "../constants/grid";
import {
  computeCellSize,
  drawCells,
  drawGridLines,
  drawBboxOverlay,
} from "../utils/canvas";
import { formatBigInt } from "../utils/format";

const { gridHeight, gridWidth, gridVersion, result } = useTupper();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let cellSize = 24;

const leftPad = ref(56);
const topPad = 40;
const rightPad = 50;
const bottomPad = 14;

function recalcCellSize(): number {
  const availW = CANVAS_MAX_WIDTH - leftPad.value - rightPad;
  const availH = CANVAS_MAX_HEIGHT - topPad - bottomPad;
  cellSize = computeCellSize(gridHeight.value, gridWidth.value, availW, availH);
  return cellSize;
}

function computeLeftPad(): void {
  const k = result.k;
  const n = gridHeight.value;
  if (k !== null) {
    const kStr = k.toString();
    if (kStr.length <= 8) {
      const maxVal = (k + BigInt(n - 1)).toString();
      leftPad.value = Math.max(56, maxVal.length * 8 + 20);
    } else {
      const maxLabel = `k+${n - 1}`;
      leftPad.value = Math.max(56, maxLabel.length * 7 + 20);
    }
  } else {
    const maxLabel = String(n - 1);
    leftPad.value = Math.max(44, maxLabel.length * 8 + 20);
  }
}

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  computeLeftPad();
  recalcCellSize();
  const n = gridHeight.value;
  const w = gridWidth.value;
  canvas.width = w * cellSize + leftPad.value + rightPad;
  canvas.height = n * cellSize + topPad + bottomPad;
}

function draw(): void {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const n = gridHeight.value;
  const w = gridWidth.value;
  const displayGrid = result.computed ? result.decodedGrid : null;
  const bbox = result.computed ? result.bbox : null;
  const k = result.computed ? result.k : null;
  const lp = leftPad.value;

  ctx.fillStyle = CANVAS_COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid frame border
  ctx.strokeStyle = CANVAS_COLORS.frame;
  ctx.lineWidth = 2;
  ctx.strokeRect(lp - 1, topPad - 1, w * cellSize + 2, n * cellSize + 2);

  // Cells — use displayGrid if available, otherwise draw empty
  if (displayGrid) {
    drawCells(ctx, displayGrid, cellSize, lp, topPad);
  } else {
    // Draw all-off cells for the empty state
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < w; c++) {
        ctx.fillStyle = CANVAS_COLORS.off;
        ctx.fillRect(
          lp + c * cellSize,
          topPad + r * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
  }

  drawGridLines(ctx, n, w, cellSize, lp, topPad);

  // X-axis labels (top)
  const fontSize = Math.min(12, Math.max(8, cellSize - 2));
  ctx.fillStyle = CANVAS_COLORS.muted;
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";

  const xStep = w > 50 ? Math.ceil(w / 20) : w > 25 ? Math.ceil(w / 15) : 1;
  for (let x = 0; x < w; x++) {
    if (x % xStep === 0 || x === w - 1) {
      ctx.fillText(String(x), lp + x * cellSize + cellSize / 2, topPad - 8);
    }
  }

  // "x →" indicator
  ctx.textAlign = "right";
  ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText("x →", lp + w * cellSize + rightPad - 6, topPad - 8);

  // Y-axis labels (left)
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "right";

  const yStep = n > 30 ? Math.ceil(n / 15) : 1;
  for (let i = 0; i < n; i++) {
    const bottomRow = n - 1 - i;
    if (bottomRow % yStep === 0 || bottomRow === n - 1) {
      let label: string;
      if (k !== null) {
        const kStr = k.toString();
        if (kStr.length <= 8) {
          label = (k + BigInt(bottomRow)).toString();
        } else {
          label = bottomRow === 0 ? "k" : `k+${bottomRow}`;
        }
      } else {
        label = String(bottomRow);
      }
      ctx.fillText(label, lp - 6, topPad + i * cellSize + cellSize / 2 + 4);
    }
  }

  // "y ↑" indicator
  ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.save();
  ctx.translate(14, topPad + 16);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "left";
  ctx.fillText("y ↑", 0, 0);
  ctx.restore();

  // BBox overlay
  if (bbox) {
    drawBboxOverlay(ctx, bbox, n, cellSize, lp, topPad);
  }
}

interface KRangeLabel {
  start: string;
  end: string;
}

const kRangeLabel = computed<KRangeLabel | null>(() => {
  if (!result.computed || result.k === null) return null;
  const k = result.k;
  const n = gridHeight.value;
  const kEnd = k + BigInt(n - 1);
  return {
    start: formatBigInt(k),
    end: formatBigInt(kEnd),
  };
});

watch(gridVersion, () => {
  resizeCanvas();
  draw();
});

watch(
  () => result.computed,
  () => {
    resizeCanvas();
    draw();
  },
);

onMounted(() => {
  ctx = canvasRef.value?.getContext("2d") ?? null;
  resizeCanvas();
  draw();
});
</script>

<template>
  <div class="card">
    <div class="canvas-box">
      <div class="canvas-title">
        <h2>Decoded Preview (from k)</h2>
        <span class="meta">With X/Y axes</span>
      </div>
      <div class="canvas-frame">
        <canvas ref="canvasRef" />
      </div>
      <div v-if="kRangeLabel" class="range-info">
        <div class="range-item">
          <span class="range-label">x range:</span>
          <span class="range-value mono">[0, {{ gridWidth - 1 }}]</span>
        </div>
        <div class="range-item">
          <span class="range-label">y range:</span>
          <span class="range-value mono"
            >[{{ kRangeLabel.start }}, {{ kRangeLabel.end }}]</span
          >
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
