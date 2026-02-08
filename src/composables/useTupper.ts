import { reactive } from 'vue'
import type { Grid, TupperResult } from '../types'
import { useGridState } from './useGridState'
import {
  encodeBitmapToKN,
  decodeGridFromK,
  computeBboxBottomOrigin,
  computeQuadrant,
} from '../utils/tupper-math'
import { gridToTxt, gridToSvg } from '../utils/export'

// ============================================
// Module-level singleton result state
// ============================================

const result = reactive<TupperResult>({
  computed: false,
  N: null,
  k: null,
  decodedGrid: null,
  bbox: null,
  quadrant: null,
  center: null,
})

// ============================================
// Facade composable (singleton pattern)
//
// Combines grid state management with Tupper
// formula computation and result tracking.
// ============================================

export function useTupper() {
  const gridState = useGridState()

  // ------------------------------------------
  // Result management
  // ------------------------------------------

  function clearResult(): void {
    result.computed = false
    result.N = null
    result.k = null
    result.decodedGrid = null
    result.bbox = null
    result.quadrant = null
    result.center = null
  }

  // ------------------------------------------
  // Wrapped grid operations (clear result too)
  // ------------------------------------------

  function setGridSize(h: number, w: number): void {
    gridState.setGridSize(h, w)
    clearResult()
  }

  function loadTemplate(templateGrid: Grid): void {
    gridState.loadTemplate(templateGrid)
    clearResult()
  }

  function loadFromK(kStr: string, n: number, w: number, autoCompute = false): boolean {
    const ok = gridState.loadGridFromK(kStr, n, w)
    if (!ok) return false

    if (autoCompute) {
      try {
        const k = BigInt(kStr.trim())
        const bigN = k / BigInt(n)
        const bbox = computeBboxBottomOrigin(gridState.grid.value)
        const q = computeQuadrant(bbox, n, w)

        result.computed = true
        result.N = bigN
        result.k = k
        result.decodedGrid = gridState.grid.value.map(row => [...row])
        result.bbox = bbox
        result.quadrant = q.quadrant
        result.center = q.center
      } catch {
        clearResult()
      }
    } else {
      clearResult()
    }

    return true
  }

  function clearGrid(): void {
    gridState.clearGrid()
    clearResult()
  }

  function randomGrid(): void {
    gridState.randomGrid()
    clearResult()
  }

  // ------------------------------------------
  // Tupper formula computation
  // ------------------------------------------

  function compute(): void {
    const n = gridState.gridHeight.value
    const w = gridState.gridWidth.value
    const { N, k } = encodeBitmapToKN(gridState.grid.value)
    const decodedGrid = decodeGridFromK(k, n, w)
    const bbox = computeBboxBottomOrigin(gridState.grid.value)
    const q = computeQuadrant(bbox, n, w)

    result.computed = true
    result.N = N
    result.k = k
    result.decodedGrid = decodedGrid
    result.bbox = bbox
    result.quadrant = q.quadrant
    result.center = q.center

    gridState.gridVersion.value++
  }

  // ------------------------------------------
  // Export helpers
  // ------------------------------------------

  function exportAsTxt(): string {
    return gridToTxt(gridState.grid.value)
  }

  function exportAsSvg(): string {
    return gridToSvg(gridState.grid.value)
  }

  // ------------------------------------------
  // Public API
  // ------------------------------------------

  return {
    // Grid state (pass-through from useGridState)
    grid: gridState.grid,
    gridHeight: gridState.gridHeight,
    gridWidth: gridState.gridWidth,
    gridVersion: gridState.gridVersion,

    // Result state
    result,

    // Grid operations (wrapped with clearResult where needed)
    setGridSize,
    loadTemplate,
    loadFromK,
    clearGrid,
    randomGrid,

    // Grid operations (pass-through, no result clearing needed)
    toggleCell: gridState.toggleCell,
    invertGrid: gridState.invertGrid,
    countOnCells: gridState.countOnCells,

    // Computation
    compute,
    clearResult,

    // Export
    exportAsTxt,
    exportAsSvg,
  }
}
