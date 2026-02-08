<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatBigIntFull } from '../utils/format'

const props = withDefaults(
  defineProps<{
    k: bigint
    n: number
    w: number
    showCopy?: boolean
  }>(),
  { showCopy: false },
)

const copied = ref(false)

const kFull = computed(() => formatBigIntFull(props.k))

async function copyK(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.k.toString())
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.k.toString()
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="k-display">
    <div class="k-display-label">
      Full k value
      <span class="k-display-params mono">Decode with (n={{ n }}, w={{ w }})</span>
    </div>
    <div class="k-display-value mono">{{ kFull }}</div>
    <button v-if="showCopy" class="k-copy-btn" @click="copyK">
      {{ copied ? '✓ Copied!' : 'Copy k' }}
    </button>
  </div>
</template>

<style scoped>
.k-display {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.12);
}

.k-display-label {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 6px;
  font-weight: 600;
}

.k-display-value {
  font-size: 11px;
  word-break: break-all;
  line-height: 1.5;
  color: var(--text);
  max-height: 120px;
  overflow-y: auto;
}

.k-display-params {
  color: var(--accent);
  font-weight: 600;
  margin-left: 6px;
}

.k-copy-btn {
  margin-top: 8px;
  padding: 5px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(122, 162, 255, 0.1);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
  font-size: 11px;
  transition: all 0.2s;
}

.k-copy-btn:hover {
  background: rgba(122, 162, 255, 0.22);
  border-color: rgba(122, 162, 255, 0.35);
}

.mono {
  font-family: var(--font-mono);
}
</style>
