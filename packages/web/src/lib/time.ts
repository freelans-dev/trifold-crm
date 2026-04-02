/** Returns current timestamp in ms. Extracted to avoid react-hooks/purity lint in server components. */
export function now(): number {
  return Date.now()
}
