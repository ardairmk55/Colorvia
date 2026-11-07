import test from 'node:test'
import assert from 'node:assert/strict'
import { generateHarmony, normalizeHex } from './colors.ts'

test('normalizes short and long HEX values and rejects malformed input', () => {
  assert.equal(normalizeHex('abc'), '#AABBCC')
  assert.equal(normalizeHex('#12abEF'), '#12ABEF')
  assert.equal(normalizeHex(null), null)
  assert.equal(normalizeHex('#12'), null)
})

test('each harmony creates five normalized colors', () => {
  for (const mode of ['analogous', 'complementary', 'triadic', 'monochrome']) {
    const colors = generateHarmony('#336699', mode)
    assert.equal(colors.length, 5)
    assert.ok(colors.every(color => /^#[0-9A-F]{6}$/.test(color.hex)))
    assert.equal(new Set(colors.map(color => color.id)).size, 5)
  }
})
