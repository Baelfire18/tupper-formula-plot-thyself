<script setup lang="ts">
import InfoCard from '../InfoCard.vue'
</script>

<template>
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
        <InfoCard icon="📐" title="Adjustable Grid">
          Any size from 1×1 up to 60×106. Your drawing is preserved when you resize.
        </InfoCard>
        <InfoCard icon="✏️" title="Multiple Input Modes">
          Draw, import k, paste a text grid, or type words rendered as pixel art.
        </InfoCard>
        <InfoCard icon="🧩" title="Templates">
          Smiley, heart, Tupper's formula, Euler's identity — load and explore instantly.
        </InfoCard>
        <InfoCard icon="🔭" title="Explore Mode">
          Navigate the Tupper plane beyond your grid. See bands, axis lines, and nearby patterns.
        </InfoCard>
        <InfoCard icon="📋" title="Copy &amp; Export">
          Copy k, n, w with one click. Export as PNG, SVG, or plain text.
        </InfoCard>
        <InfoCard icon="📊" title="Live Coordinates">
          Exact X/Y axis values on both canvases, including k-relative offsets.
        </InfoCard>
      </div>

      <div class="playground-cta">
        <router-link to="/playground" class="cta-btn">
          Try It Now
          <span class="arrow">→</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.playground-section {
  padding: 70px 20px;
  background: rgba(122, 162, 255, 0.03);
}

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

/* Steps */
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

/* Screenshot */
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

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

/* CTA */
.playground-cta {
  text-align: center;
  margin-top: 36px;
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

@media (max-width: 768px) {
  .steps {
    flex-direction: column;
    align-items: center;
  }

  .step-arrow {
    transform: rotate(90deg);
    margin-top: 0;
  }
}
</style>
