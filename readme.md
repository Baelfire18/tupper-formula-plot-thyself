# tupper-formula-plot-thyself

src/
├── types/
│ └── index.ts # All enums, type aliases, and interfaces
├── constants/
│ ├── colors.ts # CANVAS_COLORS theme (no more duplication)
│ └── grid.ts # MAX_GRID_HEIGHT, MAX_GRID_WIDTH, cell sizes, etc.
├── utils/
│ ├── tupper-math.ts # Pure functions: encode, decode, bbox, quadrant
│ ├── format.ts # formatBigInt, formatBigIntFull
│ ├── canvas.ts # Shared: computeCellSize, drawCells, drawGridLines, drawBboxOverlay, screenToCell
│ └── export.ts # gridToTxt, gridToSvg, downloadBlob, downloadCanvasAsPng
├── composables/
│ ├── useGridState.ts # Grid state, buffer system, grid manipulation (pure state)
│ └── useTupper.ts # Facade: combines grid state + Tupper computation + result tracking
├── data/
│ ├── templates.ts # GridTemplate[] + FormulaTemplate (typed with shared interfaces)
│ └── pixelfont.ts # FontGlyph definitions + renderTextToGrid (typed with shared types)
├── components/ # All updated to use new imports
└── views/ # All updated to use new imports
