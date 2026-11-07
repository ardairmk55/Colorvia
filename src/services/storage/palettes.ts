import { openDB, type IDBPDatabase } from 'idb'
import { assertPaletteCapacity, MAX_PALETTES, PaletteLimitError } from './limits'
export { PaletteLimitError } from './limits'
export type SavedPalette = { id: string; name: string; colors: string[]; createdAt: number }
let database: Promise<IDBPDatabase> | undefined
const db = () => database ??= openDB('colorvia-local', 1, {
  upgrade(database) { if (!database.objectStoreNames.contains('palettes')) database.createObjectStore('palettes', { keyPath: 'id' }) },
  blocked() { database = undefined },
  blocking() { database = undefined },
})
export async function getPalettes(): Promise<SavedPalette[]> {
  return (await db()).getAll('palettes') as Promise<SavedPalette[]>
}
export async function savePalette(palette: SavedPalette): Promise<void> {
  const database = await db()
  const transaction = database.transaction('palettes', 'readwrite')
  try {
    const keys = await transaction.store.getAllKeys()
    try {
      assertPaletteCapacity(keys.map(String), [palette.id])
    } catch (error) {
      transaction.abort()
      await transaction.done.catch(() => undefined)
      throw error
    }
    await transaction.store.put(palette)
    await transaction.done
  } catch (error) {
    if (error instanceof PaletteLimitError) throw error
    await transaction.done.catch(() => undefined)
    throw error
  }
}
export async function savePalettes(palettes: SavedPalette[]): Promise<void> {
  const database = await db()
  const transaction = database.transaction('palettes', 'readwrite')
  try {
    const keys = await transaction.store.getAllKeys()
    try {
      assertPaletteCapacity(keys.map(String), palettes.map(palette => palette.id), MAX_PALETTES)
    } catch (error) {
      transaction.abort()
      await transaction.done.catch(() => undefined)
      throw error
    }
    await Promise.all([...palettes.map(palette => transaction.store.put(palette)), transaction.done])
  } catch (error) {
    if (error instanceof PaletteLimitError) throw error
    await transaction.done.catch(() => undefined)
    throw error
  }
}
export async function replacePalettes(palettes: SavedPalette[]): Promise<void> {
  const database = await db()
  const transaction = database.transaction('palettes', 'readwrite')
  await transaction.store.clear()
  await Promise.all([...palettes.map(palette => transaction.store.put(palette)), transaction.done])
}
export async function deletePalette(id: string): Promise<void> {
  await (await db()).delete('palettes', id)
}
