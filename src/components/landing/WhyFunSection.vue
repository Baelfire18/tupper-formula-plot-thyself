<script setup lang="ts">
import InfoCard from '../InfoCard.vue'
</script>

<template>
  <section class="why-section" id="why-fun">
    <div class="section-inner">
      <h2>Why Is It Fun? 😜</h2>
      <p class="section-desc">
        Because it's the mathematical equivalent of a magic trick — a single formula that contains
        <em>every possible image</em> ever.
      </p>
      <div class="card-grid cols-3">
        <InfoCard icon="🪞" title="It Plots Itself">
          There exists a specific number <strong>k</strong> (543 digits long!) such that when you
          graph the formula at that k, the output is <em>a picture of the formula itself</em>.
          That's like a sentence that describes its own typesetting.
        </InfoCard>
        <InfoCard icon="♾️" title="Every Image Is In There">
          The Tupper plane is infinite. Every possible pixel pattern — the Mona Lisa, your name, a
          cat — already exists <em>somewhere</em> at the right y-offset. You just need to find the
          right k.
        </InfoCard>
        <InfoCard icon="🎩" title="It's a Beautiful Trick">
          The formula doesn't "generate" images — it <em>reads bits</em> from a giant number. The
          real magic is the encoding: your drawing becomes a number, and the formula decodes it
          pixel-by-pixel. Simple, yet mind-blowing.
        </InfoCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.why-section {
  padding: 70px 20px 60px;
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

.card-grid {
  display: grid;
  gap: 18px;
  margin-top: 30px;
}

.cols-3 {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
</style>
