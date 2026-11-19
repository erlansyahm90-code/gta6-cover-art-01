// Panel grid layouts for Leonida Cover Studio.
// Every layout is a function of the canvas size that returns panel rectangles
// in normalised 0..1 coordinates, so one layout works for square, portrait and
// landscape covers. A panel may carry a `rot` (degrees) for a tilted look.
export const LAYOUTS = [
  {
    id: 'hero-grid',
    name: 'Hero Grid',
    desc: 'One big hero photo, four supporting panels',
    panels() {
      return [
        { x: 0, y: 0, w: 0.615, h: 1 },
        { x: 0.63, y: 0, w: 0.37, h: 0.4925 },
        { x: 0.63, y: 0.5075, w: 0.37, h: 0.4925 },
        { x: 0, y: 0, w: 0, h: 0, hidden: true },
        { x: 0, y: 0, w: 0, h: 0, hidden: true },
      ].filter((p) => !p.hidden);
    },
  },
  {
    id: 'vice-strip',
    name: 'Vice Strip',
    desc: 'Wide hero on top, three panels below',
    panels() {
      return [
        { x: 0, y: 0, w: 1, h: 0.565 },
        { x: 0, y: 0.58, w: 0.3233, h: 0.42 },
        { x: 0.3383, y: 0.58, w: 0.3233, h: 0.42 },
        { x: 0.6767, y: 0.58, w: 0.3233, h: 0.42 },
      ];
    },
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    desc: 'Six equal panels, classic poster grid',
    panels() {
      const out = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          out.push({ x: c * 0.3383, y: r * 0.5075, w: 0.3233, h: 0.4925 });
        }
      }
      return out;
    },
  },
  {
    id: 'duo',
    name: 'Duo',
    desc: 'Two bold panels, split by the format',
    panels(w, h) {
      if (h > w) {
        return [
          { x: 0, y: 0, w: 1, h: 0.4925 },
          { x: 0, y: 0.5075, w: 1, h: 0.4925 },
        ];
      }
      return [
        { x: 0, y: 0, w: 0.4925, h: 1 },
        { x: 0.5075, y: 0, w: 0.4925, h: 1 },
      ];
    },
  },
  {
    id: 'quad',
    name: 'Quad',
    desc: 'Four square panels, two by two',
    panels() {
      return [
        { x: 0, y: 0, w: 0.4925, h: 0.4925 },
        { x: 0.5075, y: 0, w: 0.4925, h: 0.4925 },
        { x: 0, y: 0.5075, w: 0.4925, h: 0.4925 },
        { x: 0.5075, y: 0.5075, w: 0.4925, h: 0.4925 },
      ];
    },
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    desc: 'Full-bleed hero with two tilted insets',
    panels() {
      return [
        { x: 0, y: 0, w: 1, h: 1 },
        { x: 0.6, y: 0.05, w: 0.35, h: 0.32, rot: 4 },
        { x: 0.05, y: 0.58, w: 0.32, h: 0.3, rot: -5 },
      ];
    },
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function panelRects(layoutId, w, h) {
  return layoutById(layoutId).panels(w, h);
}

export function maxPanels() {
  return Math.max(...LAYOUTS.map((l) => l.panels(1000, 1000).length));
}
