import test from 'node:test'
import assert from 'node:assert/strict'
import { assertPaletteCapacity, MAX_PALETTES, PaletteLimitError } from './limits.ts'

test('enforces the palette limit while allowing updates to existing IDs', () => {
  const existing = Array.from({ length: MAX_PALETTES }, (_, index) => `palette-${index}`)
  assert.doesNotThrow(() => assertPaletteCapacity(existing, ['palette-0']))
  assert.throws(() => assertPaletteCapacity(existing, ['new-palette']), PaletteLimitError)
})

test('counts unique incoming IDs once when checking capacity', () => {
  const existing = Array.from({ length: MAX_PALETTES - 1 }, (_, index) => `palette-${index}`)
  assert.doesNotThrow(() => assertPaletteCapacity(existing, ['new-palette', 'new-palette']))
  assert.throws(() => assertPaletteCapacity(existing, ['new-palette', 'another-palette']), PaletteLimitError)
})
