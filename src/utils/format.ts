/**
 * Format a BigInt for abbreviated display.
 * Shows first 10 and last 10 digits with total digit count for large numbers.
 */
export function formatBigInt(val: bigint | null | undefined): string {
  if (val === null || val === undefined) return '—'
  const s = val.toString()
  if (s.length <= 24) return s
  return s.slice(0, 10) + ' ... ' + s.slice(-10) + `  (${s.length} digits)`
}

/**
 * Format a BigInt as its full string representation.
 */
export function formatBigIntFull(val: bigint | null | undefined): string {
  if (val === null || val === undefined) return '—'
  return val.toString()
}
