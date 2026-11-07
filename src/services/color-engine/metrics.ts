import { normalizeHex } from './colors.ts'

function channel(value: number) { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 }
export function colorMetrics(input: string) {
  const hex = normalizeHex(input) ?? '#000000'
  const rgb = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  const [r, g, b] = rgb.map(channel)
  const luminance = .2126 * r + .7152 * g + .0722 * b
  const whiteRatio = 1.05 / (luminance + .05)
  const blackRatio = (luminance + .05) / .05
  const max = Math.max(...rgb) / 255, min = Math.min(...rgb) / 255
  const delta = max - min
  let h = 0
  if (delta) { if (max === rgb[0] / 255) h = 60 * (((rgb[1] - rgb[2]) / 255 / delta) % 6); else if (max === rgb[1] / 255) h = 60 * ((rgb[2] - rgb[0]) / 255 / delta + 2); else h = 60 * ((rgb[0] - rgb[1]) / 255 / delta + 4) }
  const l = (max + min) / 2, s = delta ? delta / (1 - Math.abs(2 * l - 1)) : 0
  const text = whiteRatio >= blackRatio ? '#FFFFFF' : '#000000'
  const ratio = Math.max(whiteRatio, blackRatio)
  return { rgb: `rgb(${rgb.join(', ')})`, hsl: `hsl(${Math.round((h + 360) % 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`, text, ratio, whiteRatio, blackRatio, aaNormal: ratio >= 4.5, aaaNormal: ratio >= 7 }
}
