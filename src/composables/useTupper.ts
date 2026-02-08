import { ref, reactive } from 'vue'

// ==========================================
// Type definitions
// ==========================================

export interface BBox {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

export interface QuadrantResult {
  quadrant: string
  center: { x: number; y: number } | null
}

export interface EncodingResult {
  N: bigint
  k: bigint
  n: number
  w: number
}

export interface TupperResult {
  computed: boolean
  N: bigint | null
  k: bigint | null
  decodedGrid: number[][] | null
  bbox: BBox | null
  quadrant: string | null
  center: { x: number; y: number } | null
}

// ==========================================
// Pure math functions for Tupper's formula
// ==========================================

export function encodeBitmapToKN(bitmapTopOrigin: number[][]): EncodingResult {
  const n = bitmapTopOrigin.length
  const w = bitmapTopOrigin[0]?.length ?? 0
  if (!w) throw new Error('Bitmap width is 0')

  // Flip to bottom-origin (Tupper convention)
  const grid = [...bitmapTopOrigin].reverse()

  let N = 0n
  for (let x = 0; x < w; x++) {
    for (let row = 0; row < n; row++) {
      if (grid[row][x] === 1) {
        N |= 1n << BigInt(n * x + row)
      }
    }
  }

  return { N, k: BigInt(n) * N, n, w }
}

export function decodeGridFromK(k: bigint, n: number, w: number): number[][] {
  const bigN = k / BigInt(n)
  const grid: number[][] = Array.from({ length: n }, () => Array(w).fill(0) as number[])

  for (let x = 0; x < w; x++) {
    for (let row = 0; row < n; row++) {
      grid[row][x] = Number((bigN >> BigInt(n * x + row)) & 1n)
    }
  }

  return grid.reverse() // back to top-origin
}

export function computeBboxBottomOrigin(gridTopOrigin: number[][]): BBox | null {
  const gridBottom = [...gridTopOrigin].reverse()
  const n = gridBottom.length
  const w = gridBottom[0].length
  let xMin = Infinity
  let yMin = Infinity
  let xMax = -Infinity
  let yMax = -Infinity
  let any = false

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < w; x++) {
      if (gridBottom[y][x] === 1) {
        any = true
        xMin = Math.min(xMin, x)
        yMin = Math.min(yMin, y)
        xMax = Math.max(xMax, x)
        yMax = Math.max(yMax, y)
      }
    }
  }

  return any ? { xMin, yMin, xMax, yMax } : null
}

export function computeQuadrant(bbox: BBox | null, n: number, w: number): QuadrantResult {
  if (!bbox) return { quadrant: 'EMPTY', center: null }
  const cx = (bbox.xMin + bbox.xMax) / 2
  const cy = (bbox.yMin + bbox.yMax) / 2
  const xm = (w - 1) / 2
  const ym = (n - 1) / 2
  return {
    quadrant: (cy > ym ? 'TOP' : 'BOTTOM') + '-' + (cx > xm ? 'RIGHT' : 'LEFT'),
    center: { x: cx, y: cy }
  }
}

export function makeEmptyGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0) as number[])
}

export function formatBigInt(val: bigint | null | undefined): string {
  if (val === null || val === undefined) return '—'
  const s = val.toString()
  if (s.length <= 24) return s
  return s.slice(0, 10) + ' ... ' + s.slice(-10) + `  (${s.length} digits)`
}

export function formatBigIntFull(val: bigint | null | undefined): string {
  if (val === null || val === undefined) return '—'
  return val.toString()
}

// ==========================================
// Shared reactive state (singleton)
// ==========================================

const gridHeight = ref<number>(10)
const gridWidth = ref<number>(10)
const grid = ref<number[][]>(makeEmptyGrid(10, 10))
const gridVersion = ref<number>(0)

// Backing buffer: remembers ALL pixels even when the grid shrinks.
// Grows as needed, never loses data unless explicitly cleared or a template is loaded.
let bufferH = 10
let bufferW = 10
let buffer: number[][] = makeEmptyGrid(10, 10)

function syncToBuffer(): void {
  const h = gridHeight.value
  const w = gridWidth.value
  // Expand buffer if current grid is larger
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
  // Copy visible grid into buffer
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      buffer[r][c] = grid.value[r][c]
    }
  }
}

function gridFromBuffer(h: number, w: number): number[][] {
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

function resetBuffer(h: number, w: number, source: number[][]): void {
  bufferH = h
  bufferW = w
  buffer = source.map(row => [...row])
}

const result = reactive<TupperResult>({
  computed: false,
  N: null,
  k: null,
  decodedGrid: null,
  bbox: null,
  quadrant: null,
  center: null
})

// ==========================================
// Composable (singleton pattern)
// ==========================================

export function useTupper() {
  function setGridSize(h: number, w: number): void {
    const newH = Math.max(1, Math.min(60, h))
    const newW = Math.max(1, Math.min(200, w))

    // Save current drawing into the buffer before resizing
    syncToBuffer()

    gridHeight.value = newH
    gridWidth.value = newW
    // Restore from buffer: pixels outside the old size stay as 0,
    // pixels that were cropped earlier come back when expanding
    grid.value = gridFromBuffer(newH, newW)
    clearResult()
    gridVersion.value++
  }

  function loadTemplate(templateGrid: number[][]): void {
    const n = templateGrid.length
    const w = templateGrid[0].length
    gridHeight.value = n
    gridWidth.value = w
    grid.value = templateGrid.map(row => [...row])
    resetBuffer(n, w, grid.value)
    gridVersion.value++
    compute()
  }

  function loadFromK(kStr: string, n: number, w: number): boolean {
    try {
      const k = BigInt(kStr.trim())
      gridHeight.value = n
      gridWidth.value = w
      grid.value = decodeGridFromK(k, n, w)
      resetBuffer(n, w, grid.value)
      gridVersion.value++

      const bigN = k / BigInt(n)
      const bbox = computeBboxBottomOrigin(grid.value)
      const q = computeQuadrant(bbox, n, w)

      result.computed = true
      result.N = bigN
      result.k = k
      result.decodedGrid = grid.value.map(row => [...row])
      result.bbox = bbox
      result.quadrant = q.quadrant
      result.center = q.center
      return true
    } catch (e) {
      console.error('Failed to decode k:', e)
      return false
    }
  }

  function toggleCell(r: number, c: number, force: number | null = null): void {
    const n = gridHeight.value
    const w = gridWidth.value
    if (r < 0 || r >= n || c < 0 || c >= w) return
    if (force !== null) {
      grid.value[r][c] = force
    } else {
      grid.value[r][c] = grid.value[r][c] ? 0 : 1
    }
    // Keep buffer in sync
    if (r < bufferH && c < bufferW) {
      buffer[r][c] = grid.value[r][c]
    }
    gridVersion.value++
  }

  function clearGrid(): void {
    grid.value = makeEmptyGrid(gridHeight.value, gridWidth.value)
    resetBuffer(gridHeight.value, gridWidth.value, grid.value)
    clearResult()
    gridVersion.value++
  }

  function invertGrid(): void {
    for (let r = 0; r < gridHeight.value; r++) {
      for (let c = 0; c < gridWidth.value; c++) {
        grid.value[r][c] = grid.value[r][c] ? 0 : 1
      }
    }
    syncToBuffer()
    gridVersion.value++
  }

  function randomGrid(): void {
    for (let r = 0; r < gridHeight.value; r++) {
      for (let c = 0; c < gridWidth.value; c++) {
        grid.value[r][c] = Math.random() > 0.55 ? 1 : 0
      }
    }
    syncToBuffer()
    gridVersion.value++
    compute()
  }

  function clearResult(): void {
    result.computed = false
    result.N = null
    result.k = null
    result.decodedGrid = null
    result.bbox = null
    result.quadrant = null
    result.center = null
  }

  function compute(): void {
    const n = gridHeight.value
    const w = gridWidth.value
    const { N, k } = encodeBitmapToKN(grid.value)
    const decodedGrid = decodeGridFromK(k, n, w)
    const bbox = computeBboxBottomOrigin(grid.value)
    const q = computeQuadrant(bbox, n, w)

    result.computed = true
    result.N = N
    result.k = k
    result.decodedGrid = decodedGrid
    result.bbox = bbox
    result.quadrant = q.quadrant
    result.center = q.center

    gridVersion.value++
  }

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
    gridHeight,
    gridWidth,
    grid,
    gridVersion,
    result,
    setGridSize,
    loadTemplate,
    loadFromK,
    toggleCell,
    clearGrid,
    invertGrid,
    randomGrid,
    compute,
    countOnCells,
    formatBigInt,
    formatBigIntFull
  }
}
