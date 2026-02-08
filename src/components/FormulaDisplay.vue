<script setup lang="ts">
import { useTupper } from '../composables/useTupper'

const { gridHeight } = useTupper()
</script>

<template>
  <div class="formula-bar">
    <div class="formula">
      <span class="f-half">1/2</span>
      <span class="f-op">&lt;</span>
      <span class="f-floor">
        mod(
        <span class="f-inner">y / {{ gridHeight }}</span>
        &middot; 2<sup class="f-exp">
          &minus;{{ gridHeight }}
          <span class="f-inner">x</span>
          &minus; mod(
          <span class="f-inner">y</span>
          , {{ gridHeight }})
        </sup>
        , 2)
      </span>
    </div>
  </div>
</template>

<style scoped>
.formula-bar {
  padding: 14px 20px;
  border-radius: 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
  overflow-x: auto;
}

.formula {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  line-height: 2;
  white-space: nowrap;
}

.f-half {
  font-size: 22px;
}

.f-op {
  color: var(--muted);
  font-size: 20px;
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

.f-inner::before {
  content: '⌊';
  color: var(--accent);
  font-size: 0.9em;
}

.f-inner::after {
  content: '⌋';
  color: var(--accent);
  font-size: 0.9em;
}

.f-exp {
  font-size: 0.65em;
  color: var(--muted);
}
</style>
