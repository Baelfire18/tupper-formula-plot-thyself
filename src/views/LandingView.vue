<script setup lang="ts">
import HeroSection from '../components/landing/HeroSection.vue'
import WhyFunSection from '../components/landing/WhyFunSection.vue'
import FormulaSection from '../components/landing/FormulaSection.vue'
import PlaygroundSection from '../components/landing/PlaygroundSection.vue'
import FunFactsSection from '../components/landing/FunFactsSection.vue'
</script>

<template>
  <div class="landing">
    <HeroSection />
    <WhyFunSection />
    <FormulaSection />
    <PlaygroundSection />
    <FunFactsSection />
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
}
</style>
