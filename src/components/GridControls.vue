<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTupper } from '../composables/useTupper'

const tupper = useTupper()
const heightInput = ref<number>(tupper.gridHeight.value)
const widthInput = ref<number>(tupper.gridWidth.value)

const mode = ref<'draw' | 'import'>('draw')
const importK = ref<string>('')
const importN = ref<number>(17)
const importW = ref<number>(106)
const importError = ref<string>('')

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

function decodeImport(): void {
  importError.value = ''
  if (!importK.value.trim()) {
    importError.value = 'Please enter a k value'
    return
  }
  const n = Math.max(1, Math.min(60, Number(importN.value) || 17))
  const w = Math.max(1, Math.min(200, Number(importW.value) || 106))
  const ok = tupper.loadFromK(importK.value, n, w)
  if (!ok) {
    importError.value = 'Invalid k value. Must be a valid integer.'
  } else {
    importError.value = ''
  }
}
</script>

<template>
  <div class="card">
    <!-- Tab switcher -->
    <div class="tab-bar">
      <button
        class="tab"
        :class="{ active: mode === 'draw' }"
        @click="mode = 'draw'"
      >
        Draw
      </button>
      <button
        class="tab"
        :class="{ active: mode === 'import' }"
        @click="mode = 'import'"
      >
        Import k
      </button>
    </div>

    <!-- Draw mode -->
    <div v-if="mode === 'draw'" class="tab-content">
      <div class="size-row">
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
      </div>
    </div>

    <!-- Import mode -->
    <div v-else class="tab-content">
      <div class="size-row">
        <label>
          n (height)
          <input v-model.number="importN" type="number" min="1" max="60" />
        </label>
        <label>
          width
          <input v-model.number="importW" type="number" min="1" max="200" />
        </label>
      </div>
      <textarea
        v-model="importK"
        placeholder="Paste a k value here..."
        class="import-textarea mono"
      />
      <button class="btn-decode" @click="decodeImport">
        Load into editor
      </button>
      <div v-if="importError" class="import-error">{{ importError }}</div>
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

/* Tabs */
.tab-bar {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 12px;
}

.tab {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text);
}

.tab.active {
  background: rgba(122, 162, 255, 0.18);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Content */
.tab-content {
  display: grid;
  gap: 10px;
}

.size-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

label {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input[type="number"] {
  width: 100px;
  padding: 8px 10px;
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
}

.btn-secondary {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.06);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Import mode */
.import-textarea {
  width: 100%;
  min-height: 70px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--text);
  outline: none;
  resize: vertical;
  font-size: 11px;
  line-height: 1.5;
}

.import-textarea:focus {
  border-color: rgba(122, 162, 255, 0.7);
}

.btn-decode {
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid rgba(122, 162, 255, 0.35);
  background: rgba(122, 162, 255, 0.15);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-decode:hover {
  background: rgba(122, 162, 255, 0.25);
}

.import-error {
  color: #ff6b6b;
  font-size: 12px;
}

.mono {
  font-family: var(--font-mono);
}
</style>
