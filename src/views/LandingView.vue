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
            A mathematical formula that can plot <em>itself</em> — and anything else you can imagine.
            Draw any bitmap, compute its unique <strong>k</strong> value, decode it back, and even
            explore the infinite Tupper plane. All in your browser.
          </p>
          <div class="hero-actions">
            <router-link to="/playground" class="cta-btn">
              Open Playground
              <span class="arrow">→</span>
            </router-link>
            <a href="#formula" class="cta-secondary">How the formula works</a>
          </div>
        </div>
        <div class="hero-visual">
          <canvas ref="demoCanvas" class="demo-canvas" />
        </div>
      </div>
    </section>

    <!-- Why Is It Fun -->
    <section class="why-section" id="why-fun">
      <div class="section-inner">
        <h2>Why Is It Fun? 😜</h2>
        <p class="section-desc">
          Because it's the mathematical equivalent of a magic trick — a single formula that contains
          <em>every possible image</em> ever.
        </p>
        <div class="why-grid">
          <div class="why-card">
            <div class="why-icon">🪞</div>
            <h3>It Plots Itself</h3>
            <p>
              There exists a specific number <strong>k</strong> (543 digits long!) such that when you
              graph the formula at that k, the output is <em>a picture of the formula itself</em>.
              That's like a sentence that describes its own typesetting.
            </p>
          </div>
          <div class="why-card">
            <div class="why-icon">♾️</div>
            <h3>Every Image Is In There</h3>
            <p>
              The Tupper plane is infinite. Every possible pixel pattern — the Mona Lisa, your name,
              a cat — already exists <em>somewhere</em> at the right y-offset. You just need to find
              the right k.
            </p>
          </div>
          <div class="why-card">
            <div class="why-icon">🎩</div>
            <h3>It's a Beautiful Trick</h3>
            <p>
              The formula doesn't "generate" images — it <em>reads bits</em> from a giant number. The
              real magic is the encoding: your drawing becomes a number, and the formula decodes it
              pixel-by-pixel. Simple, yet mind-blowing.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How the Formula Works (simplified) -->
    <section class="formula-section" id="formula">
      <div class="section-inner">
        <h2>How The Formula Works</h2>
        <p class="section-desc">
          It looks intimidating, but the idea is dead simple.
        </p>
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
        </div>

        <div class="breakdown">
          <div class="breakdown-step">
            <div class="bd-number">💡</div>
            <div class="bd-content">
              <h3>Your drawing is a number</h3>
              <p>
                Every pixel grid can be flattened into a sequence of 1s and 0s — a binary number.
                That number, called <strong>k</strong>, is the only thing you need to perfectly
                reconstruct your drawing.
              </p>
            </div>
          </div>
          <div class="breakdown-step">
            <div class="bd-number">🔍</div>
            <div class="bd-content">
              <h3>The formula reads one bit at a time</h3>
              <p>
                For each pixel position <code>(x, y)</code>, the formula looks up the right bit
                inside <strong>k</strong> and checks: is it a 1 or a 0? That's literally all it
                does — a fancy way to read binary digits.
              </p>
            </div>
          </div>
          <div class="breakdown-step">
            <div class="bd-number">✨</div>
            <div class="bd-content">
              <h3>The "magic" is choosing the right k</h3>
              <p>
                The formula itself isn't special — it can decode <em>any</em> image. What makes it
                self-referential is that someone found the exact k whose decoded output is a picture
                of the formula. A mathematical mic drop. 🎤
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Playground (unified) -->
    <section class="playground-section" id="playground">
      <div class="section-inner">
        <h2>The Playground</h2>
        <p class="section-desc">
          Draw, encode, decode, and explore — all in one place.
        </p>

        <!-- Steps -->
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-icon">🎨</div>
            <h3>Draw</h3>
            <p>
              Paint pixels on the grid, load a template, type words, or paste a text grid. Multiple
              ways to create your bitmap.
            </p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-icon">🔢</div>
            <h3>Plot It!</h3>
            <p>
              One click encodes your drawing into its unique <strong>k</strong> value and instantly
              shows the decoded preview with exact coordinates.
            </p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-icon">🔭</div>
            <h3>Explore</h3>
            <p>
              Pan and zoom across the infinite Tupper plane. See what other patterns live near your
              grid. Export as PNG, SVG, or text.
            </p>
          </div>
        </div>

        <!-- Screenshot -->
        <div class="preview-frame">
          <img src="/preview.png" alt="Tupper Explorer Playground preview" />
        </div>

        <!-- Features -->
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📐</div>
            <h3>Adjustable Grid</h3>
            <p>Any size from 1×1 up to 60×106. Your drawing is preserved when you resize.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✏️</div>
            <h3>Multiple Input Modes</h3>
            <p>Draw, import k, paste a text grid, or type words rendered as pixel art.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <h3>Templates</h3>
            <p>Smiley, heart, Tupper's formula, Euler's identity — load and explore instantly.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔭</div>
            <h3>Explore Mode</h3>
            <p>
              Navigate the Tupper plane beyond your grid. See bands, axis lines, and nearby patterns.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Copy &amp; Export</h3>
            <p>Copy k, n, w with one click. Export as PNG, SVG, or plain text.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Live Coordinates</h3>
            <p>Exact X/Y axis values on both canvases, including k-relative offsets.</p>
          </div>
        </div>

        <div class="playground-cta">
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
        <h2>Fun Facts 🤓</h2>
        <div class="facts-grid">
          <div class="fact-card">
            <div class="fact-icon">🎯</div>
            <h3>Universal Bitmap Decoder</h3>
            <p>
              The formula can plot <em>any</em> 106×17 bitmap. It's not picky — the "magic" is
              picking the right k value.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">📏</div>
            <h3>543-Digit Number</h3>
            <p>
              The classic self-referential k is a 543-digit integer. That's a number with more digits
              than most people will ever see in their life.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">🌌</div>
            <h3>Infinite Gallery</h3>
            <p>
              The Tupper plane is like the Library of Babel for images. The Mona Lisa, your name, a
              cat — they're all in there at the right y-offset.
            </p>
          </div>
          <div class="fact-card">
            <div class="fact-icon">📅</div>
            <h3>Published in 2001</h3>
            <p>
              Jeff Tupper presented this at SIGGRAPH 2001. It was a footnote in a paper about
              graphing — and became the most famous part.
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

/* ─── Hero ───────────────────────────────────────────────── */

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

/* ─── Shared section styles ──────────────────────────────── */

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
  max-width: 620px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

/* ─── Why Is It Fun ──────────────────────────────────────── */

.why-section {
  padding: 70px 20px 60px;
  background: rgba(122, 162, 255, 0.03);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  margin-top: 30px;
}

.why-card {
  padding: 28px 24px;
  border-radius: 16px;
  background: var(--panel);
  border: 1px solid var(--border);
}

.why-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.why-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.why-card p {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.6;
}

/* ─── Formula + Breakdown ────────────────────────────────── */

.formula-section {
  padding: 70px 20px;
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

.breakdown p code,
.fact-card p code {
  background: rgba(122, 162, 255, 0.12);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.breakdown {
  max-width: 700px;
  margin: 36px auto 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-step {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 22px 24px;
  border-radius: 14px;
  background: var(--panel);
  border: 1px solid var(--border);
}

.bd-number {
  flex-shrink: 0;
  font-size: 22px;
  margin-top: 2px;
}

.bd-content h3 {
  margin: 0 0 6px;
  font-size: 15px;
}

.bd-content p {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.6;
}

/* ─── The Playground (unified) ───────────────────────────── */

.playground-section {
  padding: 70px 20px;
  background: rgba(122, 162, 255, 0.03);
}

.steps {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 48px;
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

.step-arrow {
  font-size: 28px;
  color: var(--accent);
  margin-top: 60px;
  font-weight: 700;
}

.preview-frame {
  max-width: 680px;
  margin: 0 auto 40px;
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

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 24px 20px;
  border-radius: 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}

.feature-card:hover {
  border-color: rgba(122, 162, 255, 0.3);
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.feature-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.55;
}

.playground-cta {
  text-align: center;
  margin-top: 36px;
}

/* ─── Fun Facts ──────────────────────────────────────────── */

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

/* ─── Footer ─────────────────────────────────────────────── */

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

/* ─── Mobile ─────────────────────────────────────────────── */

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

  .breakdown-step {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
