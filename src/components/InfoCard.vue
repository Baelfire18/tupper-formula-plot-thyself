<script setup lang="ts">
defineProps<{
  icon: string
  title: string
}>()
</script>

<template>
  <div class="info-card">
    <div class="info-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p><slot /></p>
  </div>
</template>

<style scoped>
.info-card {
  padding: 24px 20px;
  border-radius: 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}

.info-card:hover {
  border-color: rgba(122, 162, 255, 0.3);
}

.info-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.info-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.info-card p {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.6;
}

.info-card :deep(code) {
  background: rgba(122, 162, 255, 0.12);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
