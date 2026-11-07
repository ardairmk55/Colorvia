type PreferenceKey = 'colorvia-theme' | 'colorvia-language' | 'colorvia-guide-seen'

/** Storage may be unavailable in private or restricted browser contexts. */
export function readPreference(key: PreferenceKey): string | null {
  try { return window.localStorage.getItem(key) } catch { return null }
}

export function writePreference(key: PreferenceKey, value: string): boolean {
  try { window.localStorage.setItem(key, value); return true } catch { return false }
}
