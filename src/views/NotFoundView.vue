<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { decodeGridFromK } from '../utils/tupper-math'
import { CANVAS_COLORS } from '../constants/colors'
import KValueDisplay from '../components/KValueDisplay.vue'

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)

// "404" drawn as pixel art — decoded via Tupper's formula
const K_404 =
  1464972284708714392238233913905445766077843322578378635212541574254812145547697427475150579213388840215511040n
const N_404 = 20
const W_404 = 20

function drawGrid() {
  const cvs = canvas.value
  if (!cvs) return

  const ctx = cvs.getContext('2d')
  if (!ctx) return

  const grid = decodeGridFromK(K_404, N_404, W_404)
  const cellSize = 16
  const pad = 2

  cvs.width = W_404 * cellSize + pad * 2
  cvs.height = N_404 * cellSize + pad * 2

  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, cvs.width, cvs.height)

  for (let r = 0; r < N_404; r++) {
    for (let c = 0; c < W_404; c++) {
      const x = pad + c * cellSize
      const y = pad + r * cellSize
      ctx.fillStyle = grid[r][c] === 1 ? CANVAS_COLORS.on : CANVAS_COLORS.off
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1)
    }
  }
}

onMounted(drawGrid)

function goHome() {
  router.push('/')
}

function goPlayground() {
  router.push('/playground')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-inner">
      <canvas ref="canvas" class="pixel-canvas" />

      <p class="tagline">This page doesn't exist in the Tupper plane.</p>

      <p class="sub">
        But the <strong>k</strong> value for "404" does — you're looking at it right now, decoded
        live from a {{ K_404.toString().length }}-digit number.
      </p>

      <div class="actions">
        <button class="btn-primary" @click="goHome">Back to Home</button>
        <button class="btn-secondary" @click="goPlayground">Open Playground</button>
      </div>

      <KValueDisplay :k="K_404" :n="N_404" :w="W_404" show-copy />
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.not-found-inner {
  max-width: 480px;
}

.pixel-canvas {
  border-radius: 12px;
  border: 2px solid rgba(122, 162, 255, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  image-rendering: pixelated;
}

.tagline {
  font-size: 22px;
  font-weight: 700;
  margin: 28px 0 10px;
  color: var(--text);
}

.sub {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 32px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  background: var(--accent);
  color: #0f1730;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(122, 162, 255, 0.35);
}

.btn-secondary {
  padding: 12px 28px;
  border-radius: 14px;
  border: 1px solid rgba(122, 162, 255, 0.3);
  background: rgba(122, 162, 255, 0.08);
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-secondary:hover {
  background: rgba(122, 162, 255, 0.16);
  border-color: rgba(122, 162, 255, 0.5);
}

.not-found-inner :deep(.k-display) {
  margin-top: 32px;
  text-align: left;
}
</style>
