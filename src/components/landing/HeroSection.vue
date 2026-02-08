<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { CANVAS_COLORS } from '../../constants/colors'
import { GRID_TEMPLATES } from '../../data/templates'
import { drawGridLines } from '../../utils/canvas'

const demoCanvas = ref<HTMLCanvasElement | null>(null)
let animFrame: number | null = null
let animStep = 0

const smileyTemplate = GRID_TEMPLATES.find((t) => t.id === 'smiley')
const smiley = smileyTemplate?.grid ?? []

function drawDemo(): void {
  const canvas = demoCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const cell = 28
  const pad = 10
  const n = smiley.length
  const w = smiley[0]?.length ?? 0
  canvas.width = w * cell + pad * 2
  canvas.height = n * cell + pad * 2

  const totalCells = n * w
  const cellsToShow = Math.min(totalCells, animStep)

  ctx.fillStyle = CANVAS_COLORS.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let count = 0
  for (let c = 0; c < w; c++) {
    for (let rBottom = 0; rBottom < n; rBottom++) {
      const rTop = n - 1 - rBottom
      if (count < cellsToShow) {
        ctx.fillStyle = smiley[rTop][c] ? CANVAS_COLORS.on : CANVAS_COLORS.off
      } else {
        ctx.fillStyle = CANVAS_COLORS.off
      }
      ctx.fillRect(pad + c * cell, pad + rTop * cell, cell, cell)
      count++
    }
  }

  drawGridLines(ctx, n, w, cell, pad, pad)

  ctx.strokeStyle = CANVAS_COLORS.frame
  ctx.lineWidth = 2
  ctx.strokeRect(pad - 1, pad - 1, w * cell + 2, n * cell + 2)
}

function animate(): void {
  animStep++
  if (animStep <= 110) {
    drawDemo()
    animFrame = requestAnimationFrame(animate)
  }
}

onMounted(() => {
  animStep = 0
  setTimeout(() => {
    drawDemo()
    animFrame = requestAnimationFrame(animate)
  }, 500)
})

onBeforeUnmount(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
})

function scrollToFormula(): void {
  document.getElementById('formula')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1>
          Tupper's Self-Referential
          <span class="accent">Formula Explorer</span>
        </h1>
        <p class="subtitle">
          A mathematical formula that can plot <em>itself</em> — and anything else you can imagine.
          Draw any bitmap, compute its unique <strong>k</strong> value, decode it back, and even
          explore the infinite Tupper plane. All in your browser.
        </p>
        <div class="hero-actions">
          <router-link to="/playground" class="cta-btn">
            Open Playground
            <span class="arrow">→</span>
          </router-link>
          <a class="cta-secondary" @click.prevent="scrollToFormula">How the formula works</a>
        </div>
      </div>
      <div class="hero-visual">
        <canvas ref="demoCanvas" class="demo-canvas" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 60px 20px 80px;
  background: linear-gradient(180deg, rgba(122, 162, 255, 0.06) 0%, rgba(11, 16, 32, 0) 100%);
}

.hero-content {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 50px;
  align-items: center;
}

.hero-text h1 {
  font-size: 42px;
  line-height: 1.15;
  margin: 0 0 20px;
  font-weight: 800;
}

.accent {
  color: var(--accent);
  display: block;
}

.subtitle {
  font-size: 17px;
  color: var(--muted);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 0 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #7aa2ff, #5b7dd9);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(122, 162, 255, 0.25);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(122, 162, 255, 0.35);
}

.cta-btn .arrow {
  transition: transform 0.2s;
}

.cta-btn:hover .arrow {
  transform: translateX(4px);
}

.cta-secondary {
  padding: 14px 20px;
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s;
}

.cta-secondary:hover {
  color: var(--text);
}

.hero-visual {
  flex-shrink: 0;
}

.demo-canvas {
  display: block;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  image-rendering: pixelated;
  max-width: 320px;
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-text h1 {
    font-size: 30px;
  }

  .subtitle {
    font-size: 15px;
  }

  .hero-visual {
    display: flex;
    justify-content: center;
  }

  .demo-canvas {
    max-width: 260px;
  }
}
</style>
