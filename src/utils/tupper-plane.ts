/**
 * Evaluates Tupper's self-referential formula for arbitrary coordinates
 * in the Tupper plane. Caches reversed binary representations of band N
 * values for fast per-pixel lookups.
 */
export class TupperPlane {
  private cachedN: bigint | null = null
  private cachedGridN = 0
  private readonly bandBitsCache = new Map<number, string>()

  /**
   * Synchronise the cache with the current k / n values.
   * Call once per draw before any `pixelOn` lookups.
   */
  sync(k: bigint | null, computed: boolean, n: number): void {
    if (k === null || !computed) {
      this.cachedN = null
      this.bandBitsCache.clear()
      return
    }
    const newN = k / BigInt(n)
    if (newN !== this.cachedN || n !== this.cachedGridN) {
      this.cachedN = newN
      this.cachedGridN = n
      this.bandBitsCache.clear()
    }
  }

  /**
   * Evaluate Tupper's formula at world coordinate (col, dispRow).
   *
   * @param col   — column (x ≥ 0)
   * @param dispRow — display row (top-origin, 0 = top of user's grid)
   */
  pixelOn(col: number, dispRow: number): boolean {
    if (col < 0 || this.cachedN === null) return false
    const n = this.cachedGridN
    const v = n - 1 - dispRow
    const bandOffset = Math.floor(v / n)
    const rowInBand = ((v % n) + n) % n
    const bitIndex = n * col + rowInBand
    const bits = this.getBandBits(bandOffset)
    return bitIndex >= 0 && bitIndex < bits.length && bits[bitIndex] === '1'
  }

  /** Clear all cached data */
  clear(): void {
    this.cachedN = null
    this.cachedGridN = 0
    this.bandBitsCache.clear()
  }

  // ── private ───────────────────────────────────────────────

  /** Reversed binary string for band at offset d from our N (LSB-first) */
  private getBandBits(offset: number): string {
    if (this.cachedN === null) return ''
    if (this.bandBitsCache.has(offset)) return this.bandBitsCache.get(offset)!
    const bandN = this.cachedN + BigInt(offset)
    if (bandN < 0n) {
      this.bandBitsCache.set(offset, '')
      return ''
    }
    const reversed = bandN.toString(2).split('').reverse().join('')
    this.bandBitsCache.set(offset, reversed)
    return reversed
  }
}
