# Tupper's Self-Referential Formula Explorer

An interactive web playground for **Tupper's self-referential formula** — the remarkable mathematical expression that can plot _itself_ (and any other bitmap you can imagine).

Draw pixel art, encode it into a unique **k** value, decode it back, and explore the infinite Tupper plane — all in your browser.

Parts of this codebase were developed with the help of [Cursor](https://www.cursor.com/), an AI-powered code editor.

## The Formula

Tupper's self-referential formula was introduced by **Jeff Tupper** in his 2001 SIGGRAPH paper _"Reliable Two-Dimensional Graphing Methods for Mathematical Curves and Surfaces."_ What started as a footnote demonstration of reliable plotting became one of the most beloved curiosities in recreational mathematics. The formula is a universal bitmap decoder — feed it the right constant **k** and it will plot _any_ black-and-white image, including a picture of **itself**. You can learn more about Jeff Tupper and his work at [his university page](https://www.dgp.toronto.edu/public_user/mooncake/jeff.html).

## Inspiration

This project was sparked by [this Instagram reel](https://www.instagram.com/reel/DUV5O6wDPlK) by [Joaquin Bermejo](https://www.instagram.com/joa5to/) that beautifully demonstrates how Tupper's formula works. The video shows the mind-blowing idea that a single formula, when evaluated at the right y-offset, produces a bitmap of _the formula itself_. That was too cool not to build an interactive tool around.

The goal was to go beyond a static demo: let people **draw** anything, see its k value, and then **explore** the Tupper plane around it — zooming out to discover what other patterns live nearby.

## How the formula works

The formula is deceptively simple:

```
1/2 < ⌊ mod( ⌊y/n⌋ · 2^(−n⌊x⌋ − mod(⌊y⌋, n)), 2 ) ⌋
```

For each pixel `(x, y)`:

1. **Your drawing is a number** — every pixel grid is flattened column-by-column (bottom to top, left to right) into a binary number **N**. Multiply by `n` (the grid height) to get `k = n × N`.
2. **The formula reads one bit at a time** — it divides `y` by `n` to recover **N**, then uses `x` and `y mod n` to calculate the exact bit index.
3. **The "magic" is choosing the right k** — the formula itself is a universal bitmap decoder. What makes it _self-referential_ is that someone found the exact k whose output is a picture of the formula. A 543-digit number.

## Technical highlights

### BigInt arithmetic

Tupper k values are hundreds (sometimes thousands) of digits long. This project uses JavaScript's native `BigInt` for all encoding, decoding, and Tupper-plane evaluation — no external math libraries needed.

### Tupper plane exploration

The "Explore nearby" feature dynamically evaluates Tupper's formula for coordinates _outside_ the user's grid. A `TupperPlane` class caches reversed binary representations of band-offset N values, enabling smooth real-time pan and zoom across the infinite plane.

### Canvas rendering

Two rendering modes:

- **Fitted** — dynamic canvas sizing that matches the editor, with k-relative Y-axis labels.
- **Explore** — fixed 860×460 canvas with pan/zoom, band separators, grid highlight, red axis lines at the true x=0 and y=0, and extended Tupper-plane pixel evaluation.

## Features

- **Adjustable grid** — any size from 1×1 up to 60×106
- **Multiple input modes** — draw, import k, paste a text grid (1s and 0s), or type words rendered as pixel art
- **Built-in templates** — smiley, heart, Tupper's own formula, Euler's identity
- **Explore mode** — pan and zoom the Tupper plane, see neighboring bands and axis lines
- **Copy & export** — copy k / n / w values, export as PNG, SVG, or plain text
- **Live formula display** — the Tupper formula in the playground updates with your current `n`
- **Live coordinates** — exact X/Y axis values on both canvases

## Local setup

### Prerequisites

- **Node.js** 22.14.0 (see `.nvmrc`)
- **pnpm** 10.13.1

### Install and run

```bash
# Clone the repo
git clone https://github.com/<your-username>/tupper-formula-plot-thyself.git
cd tupper-formula-plot-thyself

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:5174`.

### Available scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Start the Vite dev server                          |
| `pnpm build`        | Type-check with `vue-tsc` and build for production |
| `pnpm preview`      | Preview the production build locally               |
| `pnpm type-check`   | Run TypeScript type checking only                  |
| `pnpm format`       | Format all source files with Prettier              |
| `pnpm format:check` | Check formatting without modifying files           |

### Tech stack

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript** (strict mode)
- **Vite 7** (dev server + build)
- **Vue Router 5** (hash mode)
- **Prettier** (code formatting)
- **HTML Canvas API** (bitmap rendering)
- **JavaScript BigInt** (arbitrary-precision arithmetic)

## Deployment

The app is currenlty been deployed automatically to **GitHub Pages** on every push to `master` via a GitHub Actions workflow (`.github/workflows/deploy.yml`).

Live site: [https://baelfire18.github.io/tupper-formula-plot-thyself/](https://baelfire18.github.io/tupper-formula-plot-thyself/)

To enable it on your own fork:

1. Go to **Settings → Pages** in your GitHub repo
2. Set **Source** to **GitHub Actions**
3. Push to `master` — the workflow will build and deploy automatically

## License

This project is licensed under the [MIT License](./LICENSE).
