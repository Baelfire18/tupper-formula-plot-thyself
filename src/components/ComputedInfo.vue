<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTupper, formatBigInt, formatBigIntFull } from '../composables/useTupper'

const tupper = useTupper()
const copied = ref<boolean>(false)
const importK = ref<string>('')
const importN = ref<number>(17)
const importW = ref<number>(106)
const importError = ref<string>('')

const kFull = computed<string>(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  return formatBigIntFull(tupper.result.k)
})

const kAbbr = computed<string>(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  return formatBigInt(tupper.result.k)
})

const nAbbr = computed<string>(() => {
  if (!tupper.result.computed || tupper.result.N === null) return '—'
  return formatBigInt(tupper.result.N)
})

const yRange = computed<string>(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  const k = tupper.result.k
  const n = tupper.gridHeight.value
  return `[${formatBigInt(k)},  ${formatBigInt(k + BigInt(n))})`
})

const bboxStr = computed<string>(() => {
  if (!tupper.result.computed) return '—'
  const b = tupper.result.bbox
  if (!b) return 'EMPTY'
  return `(${b.xMin}, ${b.yMin}, ${b.xMax}, ${b.yMax})`
})

const centerStr = computed<string>(() => {
  if (!tupper.result.computed) return '—'
  const c = tupper.result.center
  if (!c) return '—'
  return `(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`
})

const onCells = computed<number>(() => {
  return tupper.countOnCells()
})

const totalCells = computed<number>(() => {
  return tupper.gridHeight.value * tupper.gridWidth.value
})

async function copyK(): Promise<void> {
  if (!tupper.result.computed || tupper.result.k === null) return
  try {
    await navigator.clipboard.writeText(tupper.result.k.toString())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = tupper.result.k!.toString()
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
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
  }
}

function downloadPNG(): void {
  const canvas = document.querySelector('.decoded-preview canvas') as HTMLCanvasElement | null
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `tupper-k-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <div class="card">
    <h2>Computed Info</h2>
    <div class="stats" v-if="tupper.result.computed">
      <div class="kv-grid">
        <div class="k">n (height)</div>
        <div class="v mono">{{ tupper.gridHeight }}</div>

        <div class="k">width</div>
        <div class="v mono">{{ tupper.gridWidth }}</div>

        <div class="k">cells (on / total)</div>
        <div class="v mono">{{ onCells }} / {{ totalCells }}</div>

        <div class="k has-tip">
          N (packed)
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Your bitmap as one big integer. Each pixel = one bit, packed column-by-column, bottom to top.</span>
        </div>
        <div class="v mono">{{ nAbbr }}</div>

        <div class="k has-tip">
          k = n · N
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">The y-axis position where the formula reproduces your drawing. This is the number that makes Tupper's formula "plot" your bitmap.</span>
        </div>
        <div class="v mono">{{ kAbbr }}</div>

        <div class="k has-tip">
          y-range
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">The vertical strip [k, k+n) on the y-axis. Graph the formula over this range to see your bitmap.</span>
        </div>
        <div class="v mono">{{ yRange }}</div>

        <div class="k has-tip">
          bbox
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Bounding box (xMin, yMin, xMax, yMax) — the tightest rectangle around all "on" pixels, in bottom-origin coords.</span>
        </div>
        <div class="v mono">{{ bboxStr }}</div>

        <div class="k has-tip">
          center
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Center point (x, y) of the bounding box — the middle of your drawing within the grid.</span>
        </div>
        <div class="v mono">{{ centerStr }}</div>

        <div class="k has-tip">
          quadrant
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Which area of the grid the drawing is concentrated in, based on its center point.</span>
        </div>
        <div class="v mono">{{ tupper.result.quadrant }}</div>
      </div>

      <div class="action-row">
        <button class="btn-action" @click="copyK" :disabled="!tupper.result.computed">
          {{ copied ? '✓ Copied!' : 'Copy k' }}
        </button>
        <button class="btn-action" @click="downloadPNG">Download PNG</button>
      </div>

      <div class="k-full-section" v-if="kFull.length > 30">
        <div class="k-full-label">Full k value:</div>
        <div class="k-full-value mono">{{ kFull }}</div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Draw something in the editor, then click <span class="pill">Compute k</span> to see results.</p>
    </div>

    <div class="import-section">
      <h3>Import k value</h3>
      <div class="import-row">
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
        placeholder="Paste k value here..."
        class="import-textarea mono"
      />
      <div class="import-actions">
        <button class="btn-action" @click="decodeImport">Decode k</button>
      </div>
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

h2 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text);
}

h3 {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}

.stats {
  display: grid;
  gap: 12px;
}

.kv-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 6px 10px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.12);
}

.k {
  color: var(--muted);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.v {
  font-size: 12px;
  word-break: break-all;
  line-height: 1.4;
  color: var(--text);
}

/* Tooltip system */
.has-tip {
  position: relative;
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: rgba(122, 162, 255, 0.15);
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  cursor: help;
  flex-shrink: 0;
  line-height: 1;
  border: 1px solid rgba(122, 162, 255, 0.25);
  transition: all 0.2s;
}

.tip-icon:hover,
.tip-icon:focus {
  background: rgba(122, 162, 255, 0.3);
  border-color: rgba(122, 162, 255, 0.5);
}

.tooltip {
  display: none;
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  z-index: 50;
  width: 260px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #1a2340;
  border: 1px solid rgba(122, 162, 255, 0.3);
  color: var(--text);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.tip-icon:hover + .tooltip,
.tip-icon:focus + .tooltip {
  display: block;
}

.mono {
  font-family: var(--font-mono);
}

.action-row {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(122, 162, 255, 0.12);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(122, 162, 255, 0.22);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.k-full-section {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.12);
}

.k-full-label {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 6px;
  font-weight: 600;
}

.k-full-value {
  font-size: 11px;
  word-break: break-all;
  line-height: 1.5;
  color: var(--text);
  max-height: 120px;
  overflow-y: auto;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

.empty-state .pill {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
}

.import-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.import-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.import-row label {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.import-row input {
  width: 80px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--text);
  outline: none;
  font-size: 13px;
  font-family: var(--font-mono);
}

.import-row input:focus {
  border-color: rgba(122, 162, 255, 0.7);
}

.import-textarea {
  width: 100%;
  min-height: 60px;
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

.import-actions {
  margin-top: 8px;
}

.import-error {
  margin-top: 6px;
  color: #ff6b6b;
  font-size: 12px;
}
</style>
