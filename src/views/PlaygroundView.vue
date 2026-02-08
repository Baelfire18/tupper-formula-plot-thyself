<script setup lang="ts">
import { onMounted } from 'vue'
import { useTupper } from '../composables/useTupper'
import { GRID_TEMPLATES } from '../data/templates'
import GridControls from '../components/GridControls.vue'
import TemplateSelector from '../components/TemplateSelector.vue'
import FormulaDisplay from '../components/FormulaDisplay.vue'
import BitmapEditor from '../components/BitmapEditor.vue'
import DecodedPreview from '../components/DecodedPreview.vue'
import ComputedInfo from '../components/ComputedInfo.vue'

const tupper = useTupper()

onMounted(() => {
  if (!tupper.result.computed && tupper.countOnCells() === 0) {
    tupper.loadTemplate(GRID_TEMPLATES[0].grid)
  }
})
</script>

<template>
  <div class="playground">
    <div class="playground-layout">
      <aside class="sidebar">
        <GridControls />
        <TemplateSelector />
      </aside>
      <main class="main-area">
        <FormulaDisplay />
        <BitmapEditor />

        <!-- Big prominent compute button -->
        <button class="plot-btn" @click="tupper.compute()">
          <span class="plot-btn-icon">&#9654;</span>
          <span class="plot-btn-text">
            <span class="plot-btn-title">Plot It!</span>
            <span class="plot-btn-sub">Encode drawing &amp; generate preview</span>
          </span>
        </button>

        <DecodedPreview class="decoded-preview" />
        <ComputedInfo />
      </main>
    </div>
  </div>
</template>

<style scoped>
.playground {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 20px 40px;
}

.playground-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  align-items: start;
}

.sidebar {
  display: grid;
  gap: 14px;
  position: sticky;
  top: 72px;
}

.main-area {
  display: grid;
  gap: 14px;
}

/* Plot button */
.plot-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  padding: 16px 24px;
  border-radius: 14px;
  border: 2px solid rgba(122, 162, 255, 0.4);
  background: linear-gradient(135deg, rgba(122, 162, 255, 0.18), rgba(91, 125, 217, 0.12));
  color: var(--text);
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 20px rgba(122, 162, 255, 0.12);
}

.plot-btn:hover {
  background: linear-gradient(135deg, rgba(122, 162, 255, 0.28), rgba(91, 125, 217, 0.2));
  border-color: rgba(122, 162, 255, 0.6);
  box-shadow: 0 8px 28px rgba(122, 162, 255, 0.22);
  transform: translateY(-1px);
}

.plot-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 12px rgba(122, 162, 255, 0.15);
}

.plot-btn-icon {
  font-size: 22px;
  color: var(--accent);
  flex-shrink: 0;
}

.plot-btn-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.plot-btn-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.plot-btn-sub {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
}

@media (max-width: 960px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
