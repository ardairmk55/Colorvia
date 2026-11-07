import test from 'node:test'
import assert from 'node:assert/strict'
import { colorMetrics } from './metrics.ts'

test('computes WCAG contrast for black and white', () => {
  const black = colorMetrics('#000000')
  const white = colorMetrics('#FFFFFF')
  assert.equal(black.whiteRatio, 21)
  assert.equal(black.blackRatio, 1)
  assert.equal(black.text, '#FFFFFF')
  assert.equal(black.aaNormal, true)
  assert.equal(white.whiteRatio, 1)
  assert.equal(white.blackRatio, 21)
  assert.equal(white.text, '#000000')
  assert.equal(white.aaaNormal, true)
})

test('normalizes shorthand and returns the strongest text contrast', () => {
  const metrics = colorMetrics('#abc')
  assert.match(metrics.rgb, /^rgb\(170, 187, 204\)$/)
  assert.match(metrics.hsl, /^hsl\(210, 25%, 73%\)$/)
  assert.equal(metrics.text, '#000000')
  assert.equal(metrics.ratio, metrics.blackRatio)
})
