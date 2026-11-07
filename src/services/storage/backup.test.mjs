import test from 'node:test'
import assert from 'node:assert/strict'
import { BackupValidationError, parsePaletteBackup, parsePaletteFile, paletteSignature, planPaletteRestore } from './backup.ts'

test('validates and normalizes a Colorvia backup', () => {
  const palettes = parsePaletteBackup(JSON.stringify({ format: 'colorvia-backup', version: 1, palettes: [{ name: '  Test  ', colors: ['#abc', '#123456'] }] }))
  assert.equal(palettes[0].name, 'Test')
  assert.deepEqual(palettes[0].colors, ['#AABBCC', '#123456'])
  assert.ok(palettes[0].createdAt > 0)
})

test('rejects malformed, oversized-name, and unsupported backup data', () => {
  assert.throws(() => parsePaletteBackup('{'), BackupValidationError)
  assert.throws(() => parsePaletteBackup(JSON.stringify({ format: 'colorvia-backup', version: 1, palettes: [{ name: 'x'.repeat(61), colors: ['#ffffff', '#000000'] }] })), BackupValidationError)
  assert.throws(() => parsePaletteBackup(JSON.stringify({ items: [] })), BackupValidationError)
})

test('requires a supported backup format and version', () => {
  assert.throws(() => parsePaletteBackup(JSON.stringify({ palettes: [] })), error => error.code === 'unsupported_format')
  assert.throws(() => parsePaletteBackup(JSON.stringify({ format: 'colorvia-backup', version: 2, palettes: [] })), error => error.code === 'unsupported_format')
})

test('rejects backups beyond the 500-palette limit', () => {
  const palettes = Array.from({ length: 501 }, (_, index) => ({ name: `Palette ${index}`, colors: ['#000000', '#FFFFFF'] }))
  assert.throws(() => parsePaletteBackup(JSON.stringify({ format: 'colorvia-backup', version: 1, palettes })), error => error.code === 'too_many')
})

test('rejects backup text larger than 2 MB before parsing', () => {
  assert.throws(() => parsePaletteBackup(' '.repeat(2 * 1024 * 1024 + 1)), error => error.code === 'too_large')
})

test('validates an individually imported palette', () => {
  assert.deepEqual(parsePaletteFile(JSON.stringify({ name: '  Sample  ', colors: ['#abc', '#123456'] })), {
    name: 'Sample',
    colors: ['#AABBCC', '#123456'],
  })
  assert.throws(() => parsePaletteFile(JSON.stringify({ name: ' ', colors: ['#abc', '#fff'] })), error => error.code === 'invalid_palette')
})

test('palette signatures ignore case and surrounding whitespace in names', () => {
  assert.equal(paletteSignature({ name: ' Warm ', colors: ['#aabbcc'] }), paletteSignature({ name: 'warm', colors: ['#AABBCC'] }))
})

test('restore planning updates matching palettes and skips duplicates', () => {
  const saved = [{ id: 'saved-1', name: 'Warm', colors: ['#AABBCC', '#FFFFFF'], createdAt: 1 }]
  const incoming = [
    { id: 'backup-1', name: 'warm', colors: ['#aabbcc', '#ffffff'], createdAt: 2 },
    { id: 'backup-2', name: 'Cool', colors: ['#000000', '#123456'], createdAt: 3 },
  ]
  const skippedPlan = planPaletteRestore(saved, incoming, 'skip', () => 'new-id')
  assert.equal(skippedPlan.skipped, 1)
  assert.deepEqual(skippedPlan.palettes.map(item => item.id), ['backup-2'])
  const mergePlan = planPaletteRestore(saved, incoming, 'merge', () => 'new-id')
  assert.equal(mergePlan.skipped, 0)
  assert.deepEqual(mergePlan.palettes.map(item => item.id), ['saved-1', 'backup-2'])
  assert.equal(mergePlan.palettes[0].createdAt, 2)
})
