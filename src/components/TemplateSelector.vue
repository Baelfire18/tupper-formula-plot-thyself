<script setup lang="ts">
import type { GridTemplate } from '../types'
import { useTupper } from '../composables/useTupper'
import { GRID_TEMPLATES, TUPPER_FORMULA, EULER_IDENTITY } from '../data/templates'

const tupper = useTupper()

function loadTemplate(template: GridTemplate): void {
  tupper.loadTemplate(template.grid)
}

function loadTupperFormula(): void {
  tupper.loadFromK(TUPPER_FORMULA.k, TUPPER_FORMULA.n, TUPPER_FORMULA.w)
}

function loadEulerIdentity(): void {
  tupper.loadFromK(EULER_IDENTITY.k, EULER_IDENTITY.n, EULER_IDENTITY.w)
}
</script>

<template>
  <div class="card">
    <h2>Templates</h2>
    <div class="template-grid">
      <button
        v-for="t in GRID_TEMPLATES"
        :key="t.id"
        class="template-btn"
        :title="t.name"
        @click="loadTemplate(t)"
      >
        <span class="template-icon">{{ t.icon }}</span>
        <span class="template-name">{{ t.name }}</span>
      </button>
      <button
        class="template-btn formula-btn"
        title="Load the famous Tupper self-referential formula (106×17)"
        @click="loadTupperFormula"
      >
        <span class="template-icon formula-icon">f(x)</span>
        <span class="template-name">Tupper's Formula</span>
      </button>
      <button
        class="template-btn formula-btn"
        title="Load Euler's identity: e^(iπ) + 1 = 0 (106×17)"
        @click="loadEulerIdentity"
      >
        <span class="template-icon formula-icon">e^(iπ)</span>
        <span class="template-name">Euler's Identity</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

h2 {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--text);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.template-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  color: var(--text);
  transition: all 0.2s;
}

.template-btn:hover {
  background: rgba(122, 162, 255, 0.12);
  border-color: rgba(122, 162, 255, 0.3);
  transform: translateY(-1px);
}

.template-icon {
  font-size: 20px;
  line-height: 1;
}

.formula-icon {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.template-name {
  font-size: 10px;
  color: var(--muted);
  text-align: center;
  line-height: 1.2;
}

.formula-btn {
  grid-column: span 3;
  flex-direction: row;
  gap: 10px;
  padding: 10px 14px;
  border-color: rgba(122, 162, 255, 0.2);
  background: rgba(122, 162, 255, 0.06);
}

.formula-btn .template-name {
  font-size: 12px;
}
</style>
