const { PNG } = require('pngjs')
const fs = require('fs')
const path = require('path')

// ── Smiley grid (from templates.ts) ──
const grid = [
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
]

const n = grid.length
const w = grid[0].length

// ── Colors ──
function parseHex(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const BG = parseHex('#0f1730')
const ON = parseHex('#ffe14a')
const OFF = parseHex('#1c2752')
const GRID_C = parseHex('#2a376b')
const MUTED = parseHex('#a9b4e6')
const FRAME = parseHex('#3d5199')

// ── Layout ──
const cellSize = 36
const leftPad = 50
const topPad = 36
const rightPad = 50
const bottomPad = 20

const imgW = leftPad + w * cellSize + rightPad
const imgH = topPad + n * cellSize + bottomPad

const png = new PNG({ width: imgW, height: imgH })

function setPixel(x, y, r, g, b) {
  if (x < 0 || x >= imgW || y < 0 || y >= imgH) return
  const idx = (imgW * y + x) << 2
  png.data[idx] = r
  png.data[idx + 1] = g
  png.data[idx + 2] = b
  png.data[idx + 3] = 255
}

function fillRect(x0, y0, rw, rh, color) {
  for (let y = y0; y < y0 + rh; y++)
    for (let x = x0; x < x0 + rw; x++)
      setPixel(x, y, color[0], color[1], color[2])
}

function drawVLine(x, y0, y1, color) {
  for (let y = y0; y <= y1; y++) setPixel(x, y, color[0], color[1], color[2])
}

function drawHLine(y, x0, x1, color) {
  for (let x = x0; x <= x1; x++) setPixel(x, y, color[0], color[1], color[2])
}

function strokeRect(x0, y0, rw, rh, color, lw) {
  for (let i = 0; i < lw; i++) {
    drawHLine(y0 + i, x0, x0 + rw - 1, color)
    drawHLine(y0 + rh - 1 - i, x0, x0 + rw - 1, color)
    drawVLine(x0 + i, y0, y0 + rh - 1, color)
    drawVLine(x0 + rw - 1 - i, y0, y0 + rh - 1, color)
  }
}

// ── Tiny 3x5 font for axis labels ──
const GLYPHS = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  'x': [[0,0,0],[1,0,1],[0,1,0],[1,0,1],[0,0,0]],
  'y': [[0,0,0],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
}

function drawGlyph(ch, cx, cy, color, s) {
  const g = GLYPHS[ch]
  if (!g) return
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[0].length; c++)
      if (g[r][c]) fillRect(cx + c * s, cy + r * s, s, s, color)
}

function drawStr(str, cx, cy, color, s) {
  let x = cx
  for (const ch of str) {
    drawGlyph(ch, x, cy, color, s)
    x += 4 * s
  }
}

function strWidth(str, s) {
  return str.length * 4 * s - s
}

// Arrow bitmaps
const ARROW_UP = [[0,1,0],[1,1,1],[0,1,0],[0,1,0],[0,1,0]]
const ARROW_RIGHT = [[0,0,0],[0,0,1],[1,1,1],[0,0,1],[0,0,0]]

function drawBmp(bmp, cx, cy, color, s) {
  for (let r = 0; r < bmp.length; r++)
    for (let c = 0; c < bmp[0].length; c++)
      if (bmp[r][c]) fillRect(cx + c * s, cy + r * s, s, s, color)
}

// ── Render ──
const S = 2 // pixel scale for font

// Background
fillRect(0, 0, imgW, imgH, BG)

// Cells
for (let r = 0; r < n; r++)
  for (let c = 0; c < w; c++)
    fillRect(leftPad + c * cellSize, topPad + r * cellSize, cellSize, cellSize, grid[r][c] ? ON : OFF)

// Grid lines
for (let c = 0; c <= w; c++)
  drawVLine(leftPad + c * cellSize, topPad, topPad + n * cellSize, GRID_C)
for (let r = 0; r <= n; r++)
  drawHLine(topPad + r * cellSize, leftPad, leftPad + w * cellSize, GRID_C)

// Frame
strokeRect(leftPad - 2, topPad - 2, w * cellSize + 4, n * cellSize + 4, FRAME, 2)

// X-axis labels (top)
for (let x = 0; x < w; x++) {
  const str = String(x)
  const px = leftPad + x * cellSize + Math.floor(cellSize / 2) - Math.floor(strWidth(str, S) / 2)
  drawStr(str, px, topPad - 18, MUTED, S)
}

// "x →" at top right
const xArrowX = leftPad + w * cellSize + 8
drawGlyph('x', xArrowX, topPad - 18, MUTED, S)
drawBmp(ARROW_RIGHT, xArrowX + 10, topPad - 18, MUTED, S)

// Y-axis labels (left, bottom-origin values)
for (let i = 0; i < n; i++) {
  const bottomRow = n - 1 - i
  const str = String(bottomRow)
  const px = leftPad - 8 - strWidth(str, S)
  const py = topPad + i * cellSize + Math.floor(cellSize / 2) - 5
  drawStr(str, px, py, MUTED, S)
}

// "↑" then "y" vertically on the left
drawBmp(ARROW_UP, 8, topPad + 2, MUTED, S)
drawGlyph('y', 7, topPad + 16, MUTED, S)

// ── Write file ──
const outPath = path.join(__dirname, '..', 'public', 'preview.png')
const buffer = PNG.sync.write(png)
fs.writeFileSync(outPath, buffer)
console.log(`Written to ${outPath} (${imgW}x${imgH})`)
