import { ref } from 'vue'
import type { Grid } from '../types'
import { DEFAULT_GRID_SIZE, MAX_GRID_HEIGHT, MAX_GRID_WIDTH } from '../constants/grid'
import { makeEmptyGrid, decodeGridFromK } from '../utils/tupper-math'

// ============================================
// Module-level singleton state
// ============================================

const gridHeight = ref(DEFAULT_GRID_SIZE)
const gridWidth = ref(DEFAULT_GRID_SIZE)
const grid = ref<Grid>(makeEmptyGrid(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE))
const gridVersion = ref(0)

// Backing buffer: remembers ALL pixels even when the grid shrinks.
// Grows as needed, never loses data unless explicitly cleared or a template is loaded.
let bufferH = DEFAULT_GRID_SIZE
let bufferW = DEFAULT_GRID_SIZE
let buffer: Grid = makeEmptyGrid(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE)

// ============================================
// Buffer helpers (private)
// ============================================

function syncToBuffer(): void {
  const h = gridHeight.value
  const w = gridWidth.value

  if (h > bufferH || w > bufferW) {
    const newBH = Math.max(bufferH, h)
    const newBW = Math.max(bufferW, w)
    const newBuf = makeEmptyGrid(newBH, newBW)
    for (let r = 0; r < bufferH; r++) {
      for (let c = 0; c < bufferW; c++) {
        newBuf[r][c] = buffer[r][c]
      }
    }
    buffer = newBuf
    bufferH = newBH
    bufferW = newBW
  }

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      buffer[r][c] = grid.value[r][c]
    }
  }
}

function gridFromBuffer(h: number, w: number): Grid {
  const g = makeEmptyGrid(h, w)
  const copyH = Math.min(h, bufferH)
  const copyW = Math.min(w, bufferW)
  for (let r = 0; r < copyH; r++) {
    for (let c = 0; c < copyW; c++) {
      g[r][c] = buffer[r][c]
    }
  }
  return g
}

function resetBuffer(h: number, w: number, source: Grid): void {
  bufferH = h
  bufferW = w
  buffer = source.map((row) => [...row])
}

// ============================================
// Composable (singleton pattern)
// ============================================

export function useGridState() {
  /**
   * Resize the grid, preserving drawn pixels via the backing buffer.
   * Does NOT clear the compute result — the facade handles that.
   */
  function setGridSize(h: number, w: number): void {
    const newH = Math.max(1, Math.min(MAX_GRID_HEIGHT, h))
    const newW = Math.max(1, Math.min(MAX_GRID_WIDTH, w))
    syncToBuffer()
    gridHeight.value = newH
    gridWidth.value = newW
    grid.value = gridFromBuffer(newH, newW)
    gridVersion.value++
  }

  /**
   * Load a predefined template grid, replacing the current drawing.
   */
  function loadTemplate(templateGrid: Grid): void {
    const n = templateGrid.length
    const w = templateGrid[0].length
    gridHeight.value = n
    gridWidth.value = w
    grid.value = templateGrid.map((row) => [...row])
    resetBuffer(n, w, grid.value)
    gridVersion.value++
  }

  /**
   * Decode a k value and load the resulting grid.
   * Returns whether the operation succeeded.
   */
  function loadGridFromK(kStr: string, n: number, w: number): boolean {
    try {
      const k = BigInt(kStr.trim())
      gridHeight.value = n
      gridWidth.value = w
      grid.value = decodeGridFromK(k, n, w)
      resetBuffer(n, w, grid.value)
      gridVersion.value++
      return true
    } catch (e) {
      console.error('Failed to decode k:', e)
      return false
    }
  }

  /** Toggle a single cell on/off, or force a specific value. */
  function toggleCell(r: number, c: number, force: number | null = null): void {
    const n = gridHeight.value
    const w = gridWidth.value
    if (r < 0 || r >= n || c < 0 || c >= w) return

    if (force !== null) {
      grid.value[r][c] = force
    } else {
      grid.value[r][c] = grid.value[r][c] ? 0 : 1
    }

    if (r < bufferH && c < bufferW) {
      buffer[r][c] = grid.value[r][c]
    }
    gridVersion.value++
  }

  /** Clear the grid to all 0s. */
  function clearGrid(): void {
    grid.value = makeEmptyGrid(gridHeight.value, gridWidth.value)
    resetBuffer(gridHeight.value, gridWidth.value, grid.value)
    gridVersion.value++
  }

  /** Invert all cells (0 → 1, 1 → 0). */
  function invertGrid(): void {
    for (let r = 0; r < gridHeight.value; r++) {
      for (let c = 0; c < gridWidth.value; c++) {
        grid.value[r][c] = grid.value[r][c] ? 0 : 1
      }
    }
    syncToBuffer()
    gridVersion.value++
  }

  /** Fill the grid with random values. */
  function randomGrid(): void {
    for (let r = 0; r < gridHeight.value; r++) {
      for (let c = 0; c < gridWidth.value; c++) {
        grid.value[r][c] = Math.random() > 0.55 ? 1 : 0
      }
    }
    syncToBuffer()
    gridVersion.value++
  }

  /** Count the number of "on" cells in the current grid. */
  function countOnCells(): number {
    let count = 0
    for (let r = 0; r < gridHeight.value; r++) {
      for (let c = 0; c < gridWidth.value; c++) {
        if (grid.value[r][c]) count++
      }
    }
    return count
  }

  return {
    grid,
    gridHeight,
    gridWidth,
    gridVersion,
    setGridSize,
    loadTemplate,
    loadGridFromK,
    toggleCell,
    clearGrid,
    invertGrid,
    randomGrid,
    countOnCells,
  }
}
