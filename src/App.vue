<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import LandingFooter from './components/landing/LandingFooter.vue'
</script>

<template>
  <AppHeader />
  <router-view />
  <LandingFooter />
</template>

<style scoped></style>
