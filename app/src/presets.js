// Data tables for Leonida Cover Studio: export sizes, colour grades, lettering
// styles, frames, one-click presets, stickers and built-in sample photos.
// Everything here is original; the two JPG samples come from the make.fun kit
// (made with an image model for the competition, free to use) and the four SVG
// scenes are drawn for this app.

export const SIZES = [
  { id: 'square', name: 'Square', w: 1080, h: 1080, tag: 'Feed post' },
  { id: 'portrait', name: 'Portrait', w: 1080, h: 1350, tag: 'Feed post tall' },
  { id: 'landscape', name: 'Landscape', w: 1920, h: 1080, tag: 'Wide / banner' },
];

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

export const GRADES = [
  {
    id: 'sunset', name: 'Vice Sunset', swatch: ['#ff7e5f', '#7c3aed'],
    photoFilter: 'saturate(1.5) contrast(1.1) sepia(0.28) hue-rotate(-14deg)',
    overlay: ['rgba(255,110,60,0.16)', 'rgba(124,58,237,0.34)'], blend: 'overlay',
    vignette: 0.26,
  },
  {
    id: 'neon', name: 'Neon Nights', swatch: ['#ff2e88', '#22d3ee'],
    photoFilter: 'saturate(1.6) contrast(1.15) hue-rotate(-12deg)',
    overlay: ['rgba(255,46,136,0.16)', 'rgba(34,211,238,0.20)'], blend: 'soft-light',
    vignette: 0.3,
  },
  {
    id: 'teal', name: 'Miami Teal', swatch: ['#14b8a6', '#fb923c'],
    photoFilter: 'saturate(1.3) contrast(1.1) hue-rotate(6deg)',
    overlay: ['rgba(20,184,166,0.2)', 'rgba(251,146,60,0.22)'], blend: 'soft-light',
    vignette: 0.24,
  },
  {
    id: 'golden', name: 'Golden Hour', swatch: ['#fde047', '#f97316'],
    photoFilter: 'saturate(1.3) sepia(0.18) contrast(1.05)',
    overlay: ['rgba(253,224,71,0.12)', 'rgba(249,115,22,0.20)'], blend: 'soft-light',
    vignette: 0.22,
  },
  {
    id: 'noir', name: 'Palm Noir', swatch: ['#e5e7eb', '#111827'],
    photoFilter: 'grayscale(0.85) contrast(1.25) brightness(0.92)',
    overlay: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.34)'], blend: 'multiply',
    vignette: 0.38,
  },
  {
    id: 'bubblegum', name: 'Bubblegum', swatch: ['#f9a8d4', '#a855f7'],
    photoFilter: 'saturate(1.5) brightness(1.06) hue-rotate(8deg)',
    overlay: ['rgba(249,168,212,0.16)', 'rgba(168,85,247,0.22)'], blend: 'soft-light',
    vignette: 0.2,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export const LETTERINGS = [
  {
    id: 'outline', name: 'Outline Pop',
    fill: '#ffffff', stroke: '#111111', strokeScale: 0.16,
    shadow: 'rgba(0,0,0,0.55)', shadowBlur: 0, shadowY: 0.06, gradient: null,
  },
  {
    id: 'neon', name: 'Neon Glow',
    fill: '#fdf4ff', stroke: '#ff2e88', strokeScale: 0.07,
    shadow: '#ff2e88', shadowBlur: 0.35, shadowY: 0, gradient: null,
  },
  {
    id: 'gradient', name: 'Sunset Gradient',
    fill: null, stroke: '#1a0b2e', strokeScale: 0.14,
    shadow: 'rgba(0,0,0,0.5)', shadowBlur: 0, shadowY: 0.05,
    gradient: ['#fef08a', '#fb923c', '#f43f5e'],
  },
  {
    id: 'sticker', name: 'Sticker Bomb',
    fill: '#facc15', stroke: '#ffffff', strokeScale: 0.22,
    shadow: 'rgba(0,0,0,0.6)', shadowBlur: 0, shadowY: 0.07, gradient: null,
  },
  {
    id: 'chrome', name: 'Chrome',
    fill: null, stroke: '#0f172a', strokeScale: 0.12,
    shadow: 'rgba(0,0,0,0.45)', shadowBlur: 0, shadowY: 0.05,
    gradient: ['#f8fafc', '#cbd5e1', '#64748b'],
  },
];

export function letteringById(id) {
  return LETTERINGS.find((l) => l.id === id) || LETTERINGS[0];
}

export const FRAMES = [
  { id: 'comic', name: 'White Comic', color: '#ffffff', width: 10, outer: '#111111', outerWidth: 3, glow: null },
  { id: 'bold', name: 'Bold Black', color: '#111111', width: 16, outer: null, outerWidth: 0, glow: null },
  { id: 'neon', name: 'Neon Pink', color: '#ff2e88', width: 8, outer: null, outerWidth: 0, glow: '#ff2e88' },
  { id: 'gold', name: 'Gold', color: '#facc15', width: 8, outer: '#78350f', outerWidth: 2, glow: null },
  { id: 'thin', name: 'Thin White', color: '#ffffff', width: 4, outer: null, outerWidth: 0, glow: null },
  { id: 'none', name: 'No Frame', color: null, width: 0, outer: null, outerWidth: 0, glow: null },
];

export function frameById(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0];
}

export const PANEL_FILTERS = [
  { id: 'none', name: 'No filter', filter: '' },
  { id: 'vivid', name: 'Vivid', filter: 'saturate(1.6) contrast(1.12)' },
  { id: 'mono', name: 'Mono', filter: 'grayscale(1) contrast(1.1)' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(0.7) contrast(1.05)' },
  { id: 'duo', name: 'Sunset duo', filter: 'sepia(0.45) saturate(2.2) hue-rotate(-18deg)' },
  { id: 'cool', name: 'Cool', filter: 'saturate(1.1) hue-rotate(18deg) brightness(1.05)' },
];

export function panelFilterById(id) {
  return PANEL_FILTERS.find((f) => f.id === id) || PANEL_FILTERS[0];
}

export const TITLE_COLORS = [
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'yellow', name: 'Yellow', value: '#fde047' },
  { id: 'pink', name: 'Pink', value: '#f9a8d4' },
  { id: 'cyan', name: 'Cyan', value: '#67e8f9' },
  { id: 'orange', name: 'Orange', value: '#fdba74' },
];

export const STICKERS = [
  { id: 'palm', name: 'Palm tree', file: 'stickers/palm.svg' },
  { id: 'sun', name: 'Smiling sun', file: 'stickers/sun.svg' },
  { id: 'flamingo', name: 'Flamingo', file: 'stickers/flamingo.svg' },
  { id: 'star', name: 'Star', file: 'stickers/star.svg' },
  { id: 'bolt', name: 'Lightning', file: 'stickers/bolt.svg' },
  { id: 'car', name: 'Lowrider', file: 'stickers/car.svg' },
];

export function stickerById(id) {
  return STICKERS.find((s) => s.id === id) || STICKERS[0];
}

export const SAMPLES = [
  { id: 'pier', name: 'Pier at dusk', file: 'samples/pier.jpg', kind: 'photo' },
  { id: 'boulevard', name: 'Boulevard', file: 'samples/boulevard.jpg', kind: 'photo' },
  { id: 'scene-sunset', name: 'Sunset palms', file: 'samples/scene-sunset.svg', kind: 'scene' },
  { id: 'scene-neon', name: 'Neon street', file: 'samples/scene-neon.svg', kind: 'scene' },
  { id: 'scene-beach', name: 'Beach day', file: 'samples/scene-beach.svg', kind: 'scene' },
  { id: 'scene-skyline', name: 'Skyline dusk', file: 'samples/scene-skyline.svg', kind: 'scene' },
];

export const PRESETS = [
  {
    id: 'sunset-heist', name: 'Sunset Heist', layout: 'hero-grid', grade: 'sunset',
    lettering: 'outline', frame: 'comic', title: 'SUNSET HEIST',
    subtitle: 'LEONIDA  •  VICE CITY', badge: 'EST. 2026', titleColor: 'white',
    stickers: [{ id: 'sun', x: 0.88, y: 0.1, scale: 0.9 }, { id: 'palm', x: 0.08, y: 0.42, scale: 1.1 }],
  },
  {
    id: 'neon-nights', name: 'Neon Nights', layout: 'vice-strip', grade: 'neon',
    lettering: 'neon', frame: 'neon', title: 'NEON NIGHTS',
    subtitle: 'OCEAN DRIVE AFTER DARK', badge: 'LEONIDA', titleColor: 'pink',
    stickers: [{ id: 'bolt', x: 0.9, y: 0.08, scale: 0.8 }],
  },
  {
    id: 'beach-day', name: 'Beach Day', layout: 'mosaic', grade: 'golden',
    lettering: 'gradient', frame: 'comic', title: 'BEACH DAY',
    subtitle: 'VICE BEACH  •  LEONIDA', badge: 'SUMMER', titleColor: 'yellow',
    stickers: [{ id: 'flamingo', x: 0.1, y: 0.44, scale: 1.0 }, { id: 'sun', x: 0.9, y: 0.1, scale: 0.8 }],
  },
  {
    id: 'turbo-vice', name: 'Turbo Vice', layout: 'quad', grade: 'teal',
    lettering: 'sticker', frame: 'bold', title: 'TURBO VICE',
    subtitle: 'FULL THROTTLE IN LEONIDA', badge: 'V8', titleColor: 'yellow',
    stickers: [{ id: 'car', x: 0.84, y: 0.12, scale: 1.1 }, { id: 'bolt', x: 0.08, y: 0.55, scale: 0.9 }],
  },
  {
    id: 'most-wanted', name: 'Most Wanted', layout: 'duo', grade: 'noir',
    lettering: 'chrome', frame: 'bold', title: 'MOST WANTED',
    subtitle: 'LEONIDA COUNTY  •  REWARD $50,000', badge: 'WANTED', titleColor: 'white',
    stickers: [{ id: 'star', x: 0.9, y: 0.08, scale: 0.85 }],
  },
  {
    id: 'palm-noir', name: 'Palm Noir', layout: 'spotlight', grade: 'noir',
    lettering: 'outline', frame: 'thin', title: 'PALM NOIR',
    subtitle: 'MIDNIGHT IN VICE CITY', badge: 'NOIR', titleColor: 'white',
    stickers: [{ id: 'palm', x: 0.85, y: 0.55, scale: 1.2 }],
  },
  {
    id: 'bubblegum', name: 'Bubblegum', layout: 'mosaic', grade: 'bubblegum',
    lettering: 'sticker', frame: 'comic', title: 'BUBBLEGUM VICE',
    subtitle: 'SWEET LIKE THE SUNSET', badge: 'POP', titleColor: 'pink',
    stickers: [{ id: 'flamingo', x: 0.1, y: 0.44, scale: 0.9 }, { id: 'star', x: 0.88, y: 0.62, scale: 0.9 }],
  },
  {
    id: 'golden-hour', name: 'Golden Hour', layout: 'hero-grid', grade: 'golden',
    lettering: 'gradient', frame: 'gold', title: 'GOLDEN HOUR',
    subtitle: 'LEONIDA  •  6:47 PM', badge: '6:47 PM', titleColor: 'yellow',
    stickers: [{ id: 'sun', x: 0.88, y: 0.08, scale: 1.0 }],
  },
];

export function presetById(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS[0];
}

// Example covers for the gallery: each applies a preset, a layout, a size and
// a set of sample photos, so one click rebuilds a finished cover.
export const GALLERY = [
  { preset: 'sunset-heist', size: 'landscape', photos: ['pier', 'scene-sunset', 'boulevard', 'scene-skyline', 'scene-neon', 'pier'] },
  { preset: 'neon-nights', size: 'square', photos: ['scene-neon', 'boulevard', 'pier', 'scene-skyline'] },
  { preset: 'beach-day', size: 'portrait', photos: ['scene-beach', 'pier', 'scene-sunset', 'boulevard', 'scene-beach', 'scene-neon'] },
  { preset: 'turbo-vice', size: 'square', photos: ['boulevard', 'scene-neon', 'pier', 'scene-skyline'] },
];
