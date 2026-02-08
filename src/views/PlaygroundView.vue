<script setup lang="ts">
import { onMounted } from 'vue'
import { useTupper } from '../composables/useTupper'
import { TEMPLATES } from '../data/templates'
import GridControls from '../components/GridControls.vue'
import TemplateSelector from '../components/TemplateSelector.vue'
import BitmapEditor from '../components/BitmapEditor.vue'
import DecodedPreview from '../components/DecodedPreview.vue'
import ComputedInfo from '../components/ComputedInfo.vue'

const tupper = useTupper()

onMounted(() => {
  // Load smiley by default if grid is empty (first visit)
  if (!tupper.result.computed) {
    tupper.loadTemplate(TEMPLATES[0].grid)
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
        <BitmapEditor />
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

@media (max-width: 960px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
