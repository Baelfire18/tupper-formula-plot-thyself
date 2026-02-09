<script setup lang="ts">
import InfoCard from '../InfoCard.vue'
</script>

<template>
  <section class="facts-section">
    <div class="section-inner">
      <h2>Fun Facts 🤓</h2>
      <div class="card-grid">
        <InfoCard icon="🎯" title="Universal Bitmap Decoder">
          The formula can plot <em>any</em> 106×17 bitmap. It's not picky — the "magic" is picking
          the right k value.
        </InfoCard>
        <InfoCard icon="📏" title="543-Digit Number">
          The classic self-referential k is a 543-digit integer. That's a number with more digits
          than most people will ever see in their life.
        </InfoCard>
        <InfoCard icon="🌌" title="Infinite Gallery">
          The Tupper plane is like the Library of Babel for images. The Mona Lisa, your name, a cat
          — they're all in there at the right y-offset.
        </InfoCard>
        <InfoCard icon="📅" title="Published in 2001">
          Jeff Tupper presented this at SIGGRAPH 2001. It was a footnote in a paper about graphing —
          and became the most famous part.
        </InfoCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.facts-section {
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 30px;
}
</style>
