<script setup lang="ts">
import InfoCard from '../InfoCard.vue'
</script>

<template>
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
        <InfoCard icon="💡" title="Your drawing is a number">
          Every pixel grid can be flattened into a sequence of 1s and 0s — a binary number.
          That number, called <strong>k</strong>, is the only thing you need to perfectly
          reconstruct your drawing.
        </InfoCard>
        <InfoCard icon="🔍" title="The formula reads one bit at a time">
          For each pixel position <code>(x, y)</code>, the formula looks up the right bit
          inside <strong>k</strong> and checks: is it a 1 or a 0? That's literally all it
          does — a fancy way to read binary digits.
        </InfoCard>
        <InfoCard icon="✨" title="The &quot;magic&quot; is choosing the right k">
          The formula itself isn't special — it can decode <em>any</em> image. What makes it
          self-referential is that someone found the exact k whose decoded output is a picture
          of the formula. A mathematical mic drop. 🎤
        </InfoCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.formula-section {
  padding: 70px 20px;
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

.breakdown {
  max-width: 700px;
  margin: 36px auto 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .formula-display {
    font-size: 16px;
  }
}
</style>
