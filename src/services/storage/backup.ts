import { normalizeHex } from '../color-engine/colors.ts'
import { MAX_PALETTES } from './limits.ts'
import type { SavedPalette } from './palettes'

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024
export type BackupErrorCode = 'invalid_json' | 'unsupported_format' | 'too_large' | 'too_many' | 'invalid_palette'
export class BackupValidationError extends Error {
  readonly code: BackupErrorCode
  constructor(code: BackupErrorCode) { super(code); this.code = code }
}

function assertBackupSize(text: string) {
  if (text.length > MAX_BACKUP_BYTES || new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) {
    throw new BackupValidationError('too_large')
  }
}

export function parsePaletteFile(text: string): { name?: string; colors: string[] } {
  assertBackupSize(text)
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new BackupValidationError('invalid_json') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackupValidationError('unsupported_format')
  const item = value as { name?: unknown; colors?: unknown }
  const name = typeof item.name === 'string' ? item.name.trim() : undefined
  if (item.name !== undefined && (typeof item.name !== 'string' || !name || name.length > 60 || [...name].some(character => character.charCodeAt(0) < 32))) {
    throw new BackupValidationError('invalid_palette')
  }
  if (!Array.isArray(item.colors) || item.colors.length < 2 || item.colors.length > 10 || !item.colors.every(color => typeof color === 'string' && normalizeHex(color))) {
    throw new BackupValidationError('invalid_palette')
  }
  return { name, colors: item.colors.map(color => normalizeHex(color as string)!) }
}

export function parsePaletteBackup(text: string): SavedPalette[] {
  assertBackupSize(text)

  let value: unknown
  try { value = JSON.parse(text) } catch { throw new BackupValidationError('invalid_json') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackupValidationError('unsupported_format')
  const backup = value as { format?: unknown; version?: unknown; palettes?: unknown }
  if (backup.format !== 'colorvia-backup' || backup.version !== 1 || !Array.isArray(backup.palettes)) {
    throw new BackupValidationError('unsupported_format')
  }
  const raw = backup.palettes
  if (raw.length > MAX_PALETTES) throw new BackupValidationError('too_many')
  if (!raw.every((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))) throw new BackupValidationError('invalid_palette')
  return raw.map(item => {
    const name = typeof item.name === 'string' ? item.name.trim() : ''
    const colors = item.colors
    if (!name || name.length > 60 || [...name].some(character => character.charCodeAt(0) < 32) || !Array.isArray(colors) || colors.length < 2 || colors.length > 10 || !colors.every(c => typeof c === 'string' && normalizeHex(c))) throw new BackupValidationError('invalid_palette')
    const createdAt = Number(item.createdAt)
    return { id: typeof item.id === 'string' ? item.id : '', name, colors: colors.map(c => normalizeHex(c as string)!), createdAt: Number.isFinite(createdAt) && createdAt > 0 ? createdAt : Date.now() }
  })
}

export function paletteSignature(palette: Pick<SavedPalette, 'name' | 'colors'>): string {
  return `${palette.name.trim().toLocaleLowerCase()}|${palette.colors.map(c => normalizeHex(c)?.toUpperCase() ?? c).join(',')}`
}

export type RestoreStrategy = 'merge' | 'skip' | 'replace'
export function planPaletteRestore(saved: SavedPalette[], incoming: SavedPalette[], strategy: RestoreStrategy, createId: () => string) {
  const byId = new Map(saved.map(item => [item.id, item]))
  const bySignature = new Map(saved.map(item => [paletteSignature(item), item]))
  const palettes: SavedPalette[] = []
  let skipped = 0
  for (const item of incoming) {
    const match = byId.get(item.id) || bySignature.get(paletteSignature(item))
    if (strategy === 'replace') {
      palettes.push({ ...item, id: item.id || createId() })
      continue
    }
    if (match && strategy === 'skip') {
      skipped++
      continue
    }
    if (match) {
      palettes.push({ ...item, id: match.id })
      continue
    }
    const next = { ...item, id: item.id && !byId.has(item.id) ? item.id : createId() }
    byId.set(next.id, next)
    bySignature.set(paletteSignature(next), next)
    palettes.push(next)
  }
  return { palettes, skipped }
}
