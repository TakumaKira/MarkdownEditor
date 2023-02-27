export function fromISOStringToTimestamp(isoString: string): string {
  // TODO: Validation
  return isoString.slice(0, -5).replace('T', ' ')
}
