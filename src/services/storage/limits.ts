export class PaletteLimitError extends Error {
  constructor() {
    super('palette_limit_reached')
    this.name = 'PaletteLimitError'
  }
}

export const MAX_PALETTES = 500

export function assertPaletteCapacity(existingIds: string[], incomingIds: string[], limit = MAX_PALETTES): void {
  const existing = new Set(existingIds)
  const additions = new Set(incomingIds.filter(id => !existing.has(id)))
  if (existing.size + additions.size > limit) throw new PaletteLimitError()
}
