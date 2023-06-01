export function fromISOStringToTimestamp(isoString: string): string {
  return isoString.slice(0, -5).replace('T', ' ')
}
