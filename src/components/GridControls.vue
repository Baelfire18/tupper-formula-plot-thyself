<script setup lang="ts">
import { ref, watch } from 'vue'
import { InputMode } from '../types'
import { MAX_GRID_HEIGHT, MAX_GRID_WIDTH } from '../constants/grid'
import { useTupper } from '../composables/useTupper'
import { renderTextToGrid } from '../data/pixelfont'

const tupper = useTupper()
const heightInput = ref<number>(tupper.gridHeight.value)
const widthInput = ref<number>(tupper.gridWidth.value)

const mode = ref<InputMode>(InputMode.Draw)

// Import k state
const importK = ref('')
const importError = ref('')

// Text import state
const textInput = ref('')
const textError = ref('')

// Type text state
const typeInput = ref('')
const typeError = ref('')

watch([() => tupper.gridHeight.value, () => tupper.gridWidth.value], ([h, w]) => {
  heightInput.value = h
  widthInput.value = w
})

function applySize(): void {
  const h = Math.max(1, Math.min(MAX_GRID_HEIGHT, Number(heightInput.value) || 10))
  const w = Math.max(1, Math.min(MAX_GRID_WIDTH, Number(widthInput.value) || 10))
  heightInput.value = h
  widthInput.value = w
  tupper.setGridSize(h, w)
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Enter') applySize()
}

/** Infer minimum width from k and n: width = ceil(bitLength(k / n) / n) */
function inferWidthFromK(kStr: string, n: number): number {
  try {
    const k = BigInt(kStr.trim())
    const N = k / BigInt(n)
    if (N <= 0n) return 1
    const bits = N.toString(2).length
    return Math.max(1, Math.ceil(bits / n))
  } catch {
    return 1
  }
}

function decodeImport(): void {
  importError.value = ''
  if (!importK.value.trim()) {
    importError.value = 'Please enter a k value'
    return
  }
  const n = Math.max(1, Math.min(MAX_GRID_HEIGHT, Number(heightInput.value) || 17))
  const w = Math.min(MAX_GRID_WIDTH, inferWidthFromK(importK.value, n))
  const ok = tupper.loadFromK(importK.value, n, w)
  if (!ok) {
    importError.value = 'Invalid k value. Must be a valid integer.'
  } else {
    importError.value = ''
  }
}

function loadFromText(): void {
  textError.value = ''
  const raw = textInput.value.trim()
  if (!raw) {
    textError.value = 'Please paste a grid (rows of 1s and 0s).'
    return
  }

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) {
    textError.value = 'Could not find any rows. Use one row per line with 1s and 0s.'
    return
  }

  const parsed: number[][] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let cells: number[]

    if (line.includes(',')) {
      cells = line
        .split(',')
        .map((v) => v.trim())
        .map((v) => (v === '1' ? 1 : 0))
    } else if (line.includes(' ')) {
      cells = line.split(/\s+/).map((v) => (v === '1' ? 1 : 0))
    } else {
      cells = line.split('').map((ch) => (ch === '1' ? 1 : 0))
    }

    if (cells.length === 0) {
      textError.value = `Row ${i + 1} is empty.`
      return
    }
    parsed.push(cells)
  }

  const w = parsed[0].length
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].length !== w) {
      textError.value = `Row widths don't match: row 1 has ${w} columns but row ${i + 1} has ${parsed[i].length}. All rows must be the same width.`
      return
    }
  }

  const h = parsed.length
  if (h > MAX_GRID_HEIGHT) {
    textError.value = `Too many rows (${h}). Maximum height is ${MAX_GRID_HEIGHT}.`
    return
  }
  if (w > MAX_GRID_WIDTH) {
    textError.value = `Too many columns (${w}). Maximum width is ${MAX_GRID_WIDTH}.`
    return
  }

  tupper.loadTemplate(parsed)
  textError.value = ''
}

function loadFromType(): void {
  typeError.value = ''
  if (!typeInput.value.trim()) {
    typeError.value = 'Type something first!'
    return
  }

  const result = renderTextToGrid(typeInput.value)

  if (result.height > MAX_GRID_HEIGHT) {
    typeError.value = `The rendered text is too tall (${result.height} rows). Maximum is ${MAX_GRID_HEIGHT}.`
    return
  }
  if (result.width > MAX_GRID_WIDTH) {
    typeError.value = `"${typeInput.value}" is too long — it needs ${result.width} columns but the max is ${MAX_GRID_WIDTH}. Try shorter text.`
    return
  }

  tupper.loadTemplate(result.grid)
  typeError.value = ''
}
</script>

<template>
  <div class="card">
    <!-- Tab switcher -->
    <div class="tab-bar">
      <button
        class="tab"
        :class="{ active: mode === InputMode.Draw }"
        @click="mode = InputMode.Draw"
      >
        Draw
      </button>
      <button
        class="tab"
        :class="{ active: mode === InputMode.Import }"
        @click="mode = InputMode.Import"
      >
        Import k
      </button>
      <button
        class="tab"
        :class="{ active: mode === InputMode.Text }"
        @click="mode = InputMode.Text"
      >
        Text
      </button>
      <button
        class="tab"
        :class="{ active: mode === InputMode.Type }"
        @click="mode = InputMode.Type"
      >
        Type
      </button>
    </div>

    <!-- Draw mode -->
    <div v-if="mode === InputMode.Draw" class="tab-content">
      <div class="size-row">
        <label>
          Height (n)
          <input
            v-model.number="heightInput"
            type="number"
            min="1"
            :max="MAX_GRID_HEIGHT"
            @keydown="onKeyDown"
            @blur="applySize"
          />
        </label>
        <label>
          Width
          <div class="width-row">
            <input
              v-model.number="widthInput"
              type="number"
              min="1"
              :max="MAX_GRID_WIDTH"
              @keydown="onKeyDown"
              @blur="applySize"
            />
            <button
              class="btn-square"
              title="Set width = height (square grid)"
              @click="widthInput = heightInput; applySize()"
            >
              n×n
            </button>
          </div>
        </label>
      </div>
      <div class="actions">
        <button class="btn-secondary" @click="tupper.clearGrid()">Clear</button>
        <button class="btn-secondary" @click="tupper.invertGrid()">Invert</button>
        <button class="btn-secondary" @click="tupper.randomGrid()">Random</button>
      </div>
    </div>

    <!-- Import k mode -->
    <div v-if="mode === InputMode.Import" class="tab-content">
      <div class="size-row">
        <label>
          Height (n)
          <input v-model.number="heightInput" type="number" min="1" :max="MAX_GRID_HEIGHT" />
        </label>
        <span class="width-hint">Width is inferred from k</span>
      </div>
      <textarea
        v-model="importK"
        placeholder="Paste a k value here..."
        class="import-textarea mono"
      />
      <button class="btn-decode" @click="decodeImport">Load into editor</button>
      <div v-if="importError" class="error-msg">{{ importError }}</div>
    </div>

    <!-- Type mode -->
    <div v-if="mode === InputMode.Type" class="tab-content">
      <p class="text-hint">
        Type any text and it will be rendered as <strong>pixel art</strong> using a built-in 5×7
        font. Size is auto-calculated.
      </p>
      <input
        v-model="typeInput"
        type="text"
        placeholder="i love u"
        class="type-input"
        @keydown.enter="loadFromType"
      />
      <button class="btn-decode" @click="loadFromType">Load into editor</button>
      <div v-if="typeError" class="error-msg">{{ typeError }}</div>
    </div>

    <!-- Text mode -->
    <div v-if="mode === InputMode.Text" class="tab-content">
      <p class="text-hint">
        Paste rows of <strong>1</strong>s and <strong>0</strong>s. One row per line. Supports:
        <code>1,0,1</code> or <code>1 0 1</code> or <code>101</code>. Height and width are detected
        automatically.
      </p>
      <textarea
        v-model="textInput"
        placeholder="0,0,1,1,1,1,0,0
0,1,0,0,0,0,1,0
1,0,1,0,0,1,0,1
1,0,0,1,1,0,0,1
0,1,0,0,0,0,1,0
0,0,1,1,1,1,0,0"
        class="import-textarea mono"
      />
      <button class="btn-decode" @click="loadFromText">Load into editor</button>
      <div v-if="textError" class="error-msg">{{ textError }}</div>
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
  padding: 8px 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
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

input[type='number'] {
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

input[type='number']:focus {
  border-color: rgba(122, 162, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(122, 162, 255, 0.18);
}

.width-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.width-row input[type='number'] {
  flex: 1;
  min-width: 0;
}

.btn-square {
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-square:hover {
  background: rgba(122, 162, 255, 0.15);
  color: var(--text);
  border-color: rgba(122, 162, 255, 0.3);
}

.width-hint {
  font-size: 11px;
  color: var(--muted);
  align-self: flex-end;
  padding-bottom: 10px;
  opacity: 0.7;
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

/* Shared import / text styles */
.import-textarea {
  width: 100%;
  min-height: 80px;
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

.error-msg {
  color: #ff6b6b;
  font-size: 12px;
  line-height: 1.4;
}

.text-hint {
  margin: 0;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.5;
}

.text-hint code {
  background: rgba(122, 162, 255, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
}

.type-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--text);
  outline: none;
  font-size: 15px;
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
}

.type-input:focus {
  border-color: rgba(122, 162, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(122, 162, 255, 0.18);
}

.type-input::placeholder {
  color: var(--muted);
  opacity: 0.5;
}

.mono {
  font-family: var(--font-mono);
}
</style>
