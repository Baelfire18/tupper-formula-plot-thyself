<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTupper } from '../composables/useTupper'
import { formatBigInt, formatBigIntFull } from '../utils/format'
import { downloadBlob, downloadCanvasAsPng } from '../utils/export'

const tupper = useTupper()
const copied = ref(false)
const copiedN = ref(false)
const copiedW = ref(false)

const kFull = computed(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  return formatBigIntFull(tupper.result.k)
})

const kAbbr = computed(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  return formatBigInt(tupper.result.k)
})

const nAbbr = computed(() => {
  if (!tupper.result.computed || tupper.result.N === null) return '—'
  return formatBigInt(tupper.result.N)
})

const yRange = computed(() => {
  if (!tupper.result.computed || tupper.result.k === null) return '—'
  const k = tupper.result.k
  const n = tupper.gridHeight.value
  return `[${formatBigInt(k)},  ${formatBigInt(k + BigInt(n))})`
})

const bboxStr = computed(() => {
  if (!tupper.result.computed) return '—'
  const b = tupper.result.bbox
  if (!b) return 'EMPTY'
  return `(${b.xMin}, ${b.yMin}, ${b.xMax}, ${b.yMax})`
})

const centerStr = computed(() => {
  if (!tupper.result.computed) return '—'
  const c = tupper.result.center
  if (!c) return '—'
  return `(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`
})

const onCells = computed(() => tupper.countOnCells())

const totalCells = computed(() => tupper.gridHeight.value * tupper.gridWidth.value)

async function writeToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

async function copyK(): Promise<void> {
  if (!tupper.result.computed || tupper.result.k === null) return
  await writeToClipboard(tupper.result.k.toString())
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function copyN(): Promise<void> {
  await writeToClipboard(tupper.gridHeight.value.toString())
  copiedN.value = true
  setTimeout(() => {
    copiedN.value = false
  }, 2000)
}

async function copyW(): Promise<void> {
  await writeToClipboard(tupper.gridWidth.value.toString())
  copiedW.value = true
  setTimeout(() => {
    copiedW.value = false
  }, 2000)
}

function downloadPNG(): void {
  const canvas = document.querySelector('.decoded-preview canvas') as HTMLCanvasElement | null
  if (!canvas) return
  downloadCanvasAsPng(canvas, `tupper-k-${Date.now()}.png`)
}

function downloadSVG(): void {
  const svg = tupper.exportAsSvg()
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `tupper-k-${Date.now()}.svg`)
}

function downloadTXT(): void {
  const txt = tupper.exportAsTxt()
  downloadBlob(new Blob([txt], { type: 'text/plain' }), `tupper-k-${Date.now()}.txt`)
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
          <span class="tooltip">Your bitmap as one big integer. Each pixel = one bit, packed column-by-column, bottom
            to top.</span>
        </div>
        <div class="v mono">{{ nAbbr }}</div>

        <div class="k has-tip">
          k = n · N
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">The y-axis position where the formula reproduces your drawing. This is the number that
            makes Tupper's formula "plot" your bitmap.</span>
        </div>
        <div class="v mono">{{ kAbbr }}</div>

        <div class="k has-tip">
          y-range
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">The vertical strip [k, k+n) on the y-axis. Graph the formula over this range to see
            your bitmap.</span>
        </div>
        <div class="v mono">{{ yRange }}</div>

        <div class="k has-tip">
          bbox
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Bounding box (xMin, yMin, xMax, yMax) — the tightest rectangle around all "on" pixels,
            in bottom-origin coords.</span>
        </div>
        <div class="v mono">{{ bboxStr }}</div>

        <div class="k has-tip">
          center
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Center point (x, y) of the bounding box — the middle of your drawing within the
            grid.</span>
        </div>
        <div class="v mono">{{ centerStr }}</div>

        <div class="k has-tip">
          quadrant
          <button class="tip-icon" type="button">?</button>
          <span class="tooltip">Which area of the grid the drawing is concentrated in, based on its center point.</span>
        </div>
        <div class="v mono">{{ tupper.result.quadrant }}</div>
      </div>

      <!-- Actions -->
      <div class="action-section">
        <h3>Export</h3>
        <div class="action-row">
          <button class="btn-action" @click="copyK">
            {{ copied ? '✓ Copied!' : 'Copy k' }}
          </button>
          <button class="btn-action" @click="copyN">
            {{ copiedN ? '✓ Copied!' : `Copy n (${tupper.gridHeight.value})` }}
          </button>
          <button class="btn-action" @click="copyW">
            {{ copiedW ? '✓ Copied!' : `Copy w (${tupper.gridWidth.value})` }}
          </button>
          <button class="btn-action" @click="downloadPNG">PNG</button>
          <button class="btn-action" @click="downloadSVG">SVG</button>
          <button class="btn-action" @click="downloadTXT">TXT</button>
        </div>
      </div>

      <div class="k-full-section" v-if="kFull.length > 30">
        <div class="k-full-label">
          Full k value
          <span class="k-full-params mono">Decode with (n={{ tupper.gridHeight }}, w={{ tupper.gridWidth }})</span>
        </div>
        <div class="k-full-value mono">{{ kFull }}</div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>
        Draw something in the editor, then click <strong>Plot It!</strong> to encode and see the
        results.
      </p>
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
  font-size: 12px;
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
  padding: 0;
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

.tip-icon:hover+.tooltip,
.tip-icon:focus+.tooltip {
  display: block;
}

.mono {
  font-family: var(--font-mono);
}

/* Actions */
.action-section {
  border-top: 1px solid var(--border);
  padding-top: 10px;
}

.action-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(122, 162, 255, 0.1);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(122, 162, 255, 0.22);
  border-color: rgba(122, 162, 255, 0.35);
}

/* k full value */
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

.k-full-params {
  color: var(--accent);
  font-weight: 600;
  margin-left: 6px;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}
</style>
