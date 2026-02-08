<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">⌊ ⌋</span>
        <span class="logo-text">Tupper Explorer</span>
      </router-link>
      <nav class="nav-links">
        <router-link to="/" :class="{ active: route.name === 'landing' }">Home</router-link>
        <router-link to="/playground" :class="{ active: route.name === 'playground' }"
          >Playground</router-link
        >
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(18, 26, 51, 0.97), rgba(11, 16, 32, 0.97));
  backdrop-filter: blur(12px);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  font-size: 16px;
}

.logo-icon {
  font-size: 20px;
  color: var(--accent);
  font-family: var(--font-mono);
}

.logo-text {
  letter-spacing: 0.3px;
}

.nav-links {
  display: flex;
  gap: 6px;
}

.nav-links a {
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}

.nav-links a.active {
  color: var(--text);
  background: rgba(122, 162, 255, 0.15);
}
</style>
