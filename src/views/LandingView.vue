<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { CANVAS_COLORS } from '../constants/colors'
import { GRID_TEMPLATES } from '../data/templates'
import { drawCells, drawGridLines } from '../utils/canvas'

const demoCanvas = ref<HTMLCanvasElement | null>(null)
let animFrame: number | null = null
let animStep = 0

// Use the smiley template rather than hardcoding
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

  // Animate cells column-by-column, bottom-to-top (Tupper ordering)
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

  // Frame border
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
</script>

<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>
            Tupper's Self-Referential
            <span class="accent">Formula Explorer</span>
          </h1>
          <p class="subtitle">
            Discover the remarkable formula that can plot <em>itself</em>. Draw any bitmap, compute
            its unique <strong>k</strong> value, and decode it back — all in your browser using
            JavaScript BigInt.
          </p>
          <div class="hero-actions">
            <router-link to="/playground" class="cta-btn">
              Open Playground
              <span class="arrow">→</span>
            </router-link>
            <a href="#how-it-works" class="cta-secondary">Learn more</a>
          </div>
        </div>
        <div class="hero-visual">
          <canvas ref="demoCanvas" class="demo-canvas" />
        </div>
      </div>
    </section>

    <!-- Formula -->
    <section class="formula-section" id="formula">
      <div class="section-inner">
        <h2>The Formula</h2>
        <div class="formula-card">
          <div class="formula-display">
            <span class="f-half">1/2</span>
            <span class="f-lt">&lt;</span>
            <span class="f-floor">
              mod(
              <span class="f-floor-inner">y / n</span>
              &middot; 2<sup class="f-exp">
                &minus;n
                <span class="f-floor-inner">x</span>
                &minus; mod(
                <span class="f-floor-inner">y</span>
                , n)
              </sup>
              , 2)
            </span>
          </div>
          <p class="formula-note">
            Where <code>n</code> is the height (classically 17), and <code>⌊·⌋</code> denotes the
            floor function. The original uses <code>n = 17</code>, giving a 106×17 bitmap.
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section" id="how-it-works">
      <div class="section-inner">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-icon">🎨</div>
            <h3>Draw Your Bitmap</h3>
            <p>
              Click and drag on the grid editor to create any pixel pattern you like, or choose from
              pre-built templates.
            </p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-icon">🔢</div>
            <h3>Encode to k</h3>
            <p>
              Your bitmap is packed column-by-column into a single huge integer <strong>N</strong>,
              then <code>k = n × N</code> gives the exact y-offset.
            </p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-icon">📊</div>
            <h3>Decode &amp; Plot</h3>
            <p>
              Feed k back into the formula. The plotted region
              <code>k ≤ y &lt; k + n</code> reproduces your original drawing with exact coordinates.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Preview Image -->
    <section class="preview-section">
      <div class="section-inner">
        <h2>The Playground</h2>
        <p class="section-desc">
          A full-featured editor with grid controls, templates, live preview with X/Y axes showing
          exact Tupper coordinates, and computed info including the full k value.
        </p>
        <div class="preview-frame">
          <img src="/preview.png" alt="Tupper Explorer Playground preview" />
        </div>
        <div class="preview-cta">
          <router-link to="/playground" class="cta-btn">
            Try It Now
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Fun Facts -->
    <section class="facts-section">
      <div class="section-inner">
        <h2>Fun Facts</h2>
        <div class="facts-grid">
          <div class="fact-card">
            <div class="fact-icon">🎯</div>
            <h3>Universal Bitmap Decoder</h3>
            <p>
              The formula isn't special — it can plot <em>any</em> 106×17 bitmap. The "magic" is
              choosing the right k value.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">📏</div>
            <h3>543-Digit Number</h3>
            <p>
              The classic self-referential k value is a 543-digit integer that encodes an image of
              the formula itself.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">🧮</div>
            <h3>Generalized Heights</h3>
            <p>
              While Tupper used n=17, the formula works for any height n. This explorer lets you use
              heights from 1 to 60.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">📅</div>
            <h3>Published in 2001</h3>
            <p>
              Jeff Tupper presented this formula at SIGGRAPH 2001 in his paper "Reliable
              Two-Dimensional Graphing Methods."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p>
        Built with Vue 3 + Vite + TypeScript · JavaScript BigInt for arbitrary-precision arithmetic
      </p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
}

/* Hero */
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

/* Sections */
.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-inner h2 {
  font-size: 28px;
  margin: 0 0 12px;
  text-align: center;
}

.section-desc {
  text-align: center;
  color: var(--muted);
  font-size: 15px;
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

/* Formula */
.formula-section {
  padding: 60px 20px;
  background: rgba(122, 162, 255, 0.03);
}

.formula-card {
  max-width: 700px;
  margin: 24px auto 0;
  padding: 28px;
  border-radius: 16px;
  background: var(--panel);
  border: 1px solid var(--border);
  text-align: center;
}

.formula-display {
  font-family: var(--font-mono);
  font-size: 22px;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  line-height: 2;
}

.f-half {
  font-size: 26px;
}

.f-lt {
  color: var(--muted);
  font-size: 24px;
}

.f-floor {
  color: var(--cellOn);
}

.f-floor::before {
  content: '⌊';
  color: var(--accent);
}

.f-floor::after {
  content: '⌋';
  color: var(--accent);
}

.f-floor-inner::before {
  content: '⌊';
  color: var(--accent);
  font-size: 0.9em;
}

.f-floor-inner::after {
  content: '⌋';
  color: var(--accent);
  font-size: 0.9em;
}

.f-exp {
  font-size: 0.65em;
  color: var(--muted);
}

.formula-note {
  margin: 18px 0 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.formula-note code {
  background: rgba(122, 162, 255, 0.12);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
}

/* How It Works */
.how-section {
  padding: 70px 20px;
}

.steps {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  margin-top: 36px;
  flex-wrap: wrap;
}

.step {
  flex: 0 1 260px;
  text-align: center;
  padding: 28px 20px;
  border-radius: 16px;
  background: var(--panel);
  border: 1px solid var(--border);
  position: relative;
}

.step-number {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.step h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.step p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.55;
}

.step p code {
  background: rgba(122, 162, 255, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.step-arrow {
  font-size: 28px;
  color: var(--accent);
  margin-top: 60px;
  font-weight: 700;
}

/* Preview */
.preview-section {
  padding: 60px 20px;
  background: rgba(122, 162, 255, 0.03);
}

.preview-frame {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
}

.preview-frame img {
  display: block;
  width: 100%;
  height: auto;
}

.preview-cta {
  text-align: center;
  margin-top: 30px;
}

/* Fun Facts */
.facts-section {
  padding: 70px 20px;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 30px;
}

.fact-card {
  padding: 24px 20px;
  border-radius: 14px;
  background: var(--panel);
  border: 1px solid var(--border);
}

.fact-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.fact-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.fact-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.55;
}

/* Footer */
.landing-footer {
  padding: 30px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.landing-footer p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

/* Mobile */
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

  .steps {
    flex-direction: column;
    align-items: center;
  }

  .step-arrow {
    transform: rotate(90deg);
    margin-top: 0;
  }

  .formula-display {
    font-size: 16px;
  }
}
</style>
