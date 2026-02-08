<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTupper } from '../composables/useTupper'

const tupper = useTupper()
const heightInput = ref<number>(tupper.gridHeight.value)
const widthInput = ref<number>(tupper.gridWidth.value)

watch([() => tupper.gridHeight.value, () => tupper.gridWidth.value], ([h, w]) => {
  heightInput.value = h
  widthInput.value = w
})

function applySize(): void {
  const h = Math.max(1, Math.min(60, Number(heightInput.value) || 10))
  const w = Math.max(1, Math.min(200, Number(widthInput.value) || 10))
  heightInput.value = h
  widthInput.value = w
  tupper.setGridSize(h, w)
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Enter') applySize()
}
</script>

<template>
  <div class="controls-card card">
    <h2>Grid Size</h2>
    <div class="row">
      <label>
        Height (n)
        <input
          v-model.number="heightInput"
          type="number"
          min="1"
          max="60"
          @keydown="onKeyDown"
          @blur="applySize"
        />
      </label>
      <label>
        Width
        <input
          v-model.number="widthInput"
          type="number"
          min="1"
          max="200"
          @keydown="onKeyDown"
          @blur="applySize"
        />
      </label>
    </div>
    <div class="actions">
      <button class="btn-secondary" @click="tupper.clearGrid()">Clear</button>
      <button class="btn-secondary" @click="tupper.invertGrid()">Invert</button>
      <button class="btn-secondary" @click="tupper.randomGrid()">Random</button>
      <button class="btn-primary" @click="tupper.compute()">Compute k</button>
    </div>
    <div class="hint">
      <strong>How it works:</strong> Column-major packing, bottom→top. Click
      <span class="pill">Compute k</span> to encode your drawing and verify the
      decoded result.
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

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

label {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input[type="number"] {
  width: 100px;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--text);
  outline: none;
  font-size: 14px;
  font-family: var(--font-mono);
}

input[type="number"]:focus {
  border-color: rgba(122, 162, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(122, 162, 255, 0.18);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  transition: all 0.2s;
}

.btn-primary {
  background: rgba(122, 162, 255, 0.2);
  border-color: rgba(122, 162, 255, 0.35);
}

.btn-primary:hover {
  background: rgba(122, 162, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hint {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 12px;
}

.pill {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
}
</style>
