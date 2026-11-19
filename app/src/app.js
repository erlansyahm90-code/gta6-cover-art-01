// Leonida Cover Studio — editor logic.
// Wires the controls to the canvas engine (render.js): photo uploads and the
// built-in samples, per-panel crop/position (drag to pan, scroll to zoom),
// presets, grades, lettering, frames, stickers, the example gallery and the
// PNG export. Everything runs offline; photos are read on this machine only
// and never uploaded anywhere.
import { LAYOUTS, panelRects, maxPanels } from './layouts.js';
import {
  SIZES, sizeById, GRADES, LETTERINGS, FRAMES, PANEL_FILTERS, TITLE_COLORS,
  STICKERS, SAMPLES, PRESETS, presetById, GALLERY,
} from './presets.js';
import { renderCover, panelAt, stickerAt } from './render.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const assets = { photos: new Map(), stickers: new Map() };
const photoList = []; // { id, name, url, img }
let uploadCount = 0;

function blankPanel(photoId) {
  return { photoId: photoId || null, zoom: 1, panX: 0, panY: 0, filter: 'none' };
}

function defaultState() {
  const preset = PRESETS[0];
  return {
    size: 'square',
    layout: preset.layout,
    grade: preset.grade,
    lettering: preset.lettering,
    frame: preset.frame,
    title: preset.title,
    subtitle: preset.subtitle,
    badge: preset.badge,
    titleSize: 1,
    titleColor: preset.titleColor,
    panels: Array.from({ length: maxPanels() }, () => blankPanel()),
    stickers: preset.stickers.map((s) => ({ ...s })),
    selectedPanel: 0,
  };
}

const state = defaultState();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function loadSamples() {
  for (const s of SAMPLES) {
    try {
      const img = await loadImage(s.file);
      assets.photos.set(s.id, img);
      photoList.push({ id: s.id, name: s.name, url: s.file, img, sample: true });
    } catch { /* a missing sample is skipped, the rest still work */ }
  }
  for (const s of STICKERS) {
    try {
      assets.stickers.set(s.id, await loadImage(s.file));
    } catch { /* skip */ }
  }
}

function assignPhotos(ids) {
  const rects = panelRects(state.layout, 1000, 1000);
  rects.forEach((_, i) => {
    state.panels[i].photoId = ids[i % ids.length] || null;
    state.panels[i].zoom = 1;
    state.panels[i].panX = 0;
    state.panels[i].panY = 0;
  });
}

function applyPreset(preset, photos) {
  state.layout = preset.layout;
  state.grade = preset.grade;
  state.lettering = preset.lettering;
  state.frame = preset.frame;
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.badge = preset.badge;
  state.titleColor = preset.titleColor;
  state.titleSize = 1;
  state.stickers = preset.stickers.map((s) => ({ ...s }));
  if (photos) assignPhotos(photos);
  syncControls();
  requestRender();
}

// ---- rendering ----------------------------------------------------------

const canvas = $('#coverCanvas');
let renderQueued = false;
let firstRenderDone = false;

function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    try {
      renderCover(canvas, state, assets);
    } catch (err) {
      console.error('render failed', err);
    }
    if (!firstRenderDone) {
      firstRenderDone = true;
      document.documentElement.setAttribute('data-ready', '1');
    }
    updateExportLabel();
  });
}

function updateExportLabel() {
  const s = sizeById(state.size);
  $('#exportBtn').textContent = `Export PNG · ${s.w} × ${s.h}`;
  $('#sizeNote').textContent = `${s.name} — ${s.w} × ${s.h} px · ${s.tag}`;
}

// ---- control builders ---------------------------------------------------

function miniGrid(layoutId) {
  const rects = panelRects(layoutId, 100, 100);
  const cells = rects.map((r) => {
    const rot = r.rot ? ` transform: rotate(${r.rot}deg);` : '';
    return `<i style="left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%;${rot}"></i>`;
  }).join('');
  return `<span class="mini-grid">${cells}</span>`;
}

function buildControls() {
  $('#sizeRow').innerHTML = SIZES.map((s) => (
    `<button class="chip size-chip" data-size="${s.id}" title="${s.tag}">${s.name}<small>${s.w}×${s.h}</small></button>`
  )).join('');
  $$('#sizeRow .size-chip').forEach((b) => b.addEventListener('click', () => {
    state.size = b.dataset.size;
    syncControls();
    requestRender();
  }));

  $('#layoutRow').innerHTML = LAYOUTS.map((l) => (
    `<button class="layout-card" data-layout="${l.id}" title="${l.desc}">${miniGrid(l.id)}<b>${l.name}</b></button>`
  )).join('');
  $$('#layoutRow .layout-card').forEach((b) => b.addEventListener('click', () => {
    state.layout = b.dataset.layout;
    state.selectedPanel = 0;
    syncControls();
    requestRender();
  }));

  $('#presetRow').innerHTML = PRESETS.map((p) => (
    `<button class="chip preset-chip" data-preset="${p.id}">${p.name}</button>`
  )).join('');
  $$('#presetRow .preset-chip').forEach((b) => b.addEventListener('click', () => {
    applyPreset(presetById(b.dataset.preset));
    showToast(`Preset “${presetById(b.dataset.preset).name}” applied`);
  }));

  $('#gradeRow').innerHTML = GRADES.map((g) => (
    `<button class="swatch" data-grade="${g.id}" title="${g.name}" style="background:linear-gradient(135deg,${g.swatch[0]},${g.swatch[1]})"><span>${g.name}</span></button>`
  )).join('');
  $$('#gradeRow .swatch').forEach((b) => b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    syncControls();
    requestRender();
  }));

  $('#letterRow').innerHTML = LETTERINGS.map((l) => (
    `<button class="chip letter-chip" data-lettering="${l.id}">${l.name}</button>`
  )).join('');
  $$('#letterRow .letter-chip').forEach((b) => b.addEventListener('click', () => {
    state.lettering = b.dataset.lettering;
    syncControls();
    requestRender();
  }));

  $('#frameRow').innerHTML = FRAMES.map((f) => (
    `<button class="chip frame-chip" data-frame="${f.id}">${f.name}</button>`
  )).join('');
  $$('#frameRow .frame-chip').forEach((b) => b.addEventListener('click', () => {
    state.frame = b.dataset.frame;
    syncControls();
    requestRender();
  }));

  $('#colorRow').innerHTML = TITLE_COLORS.map((c) => (
    `<button class="color-dot" data-color="${c.id}" title="${c.name}" style="background:${c.value}"></button>`
  )).join('');
  $$('#colorRow .color-dot').forEach((b) => b.addEventListener('click', () => {
    state.titleColor = b.dataset.color;
    syncControls();
    requestRender();
  }));

  $('#stickerRow').innerHTML = STICKERS.map((s) => (
    `<button class="sticker-btn" data-sticker="${s.id}" title="${s.name}"><img src="${s.file}" alt="${s.name}"></button>`
  )).join('');
  $$('#stickerRow .sticker-btn').forEach((b) => b.addEventListener('click', () => {
    addSticker(b.dataset.sticker);
  }));
  $('#clearStickers').addEventListener('click', () => {
    state.stickers = [];
    requestRender();
    showToast('Stickers cleared');
  });

  $('#filterSelect').innerHTML = PANEL_FILTERS.map((f) => (
    `<option value="${f.id}">${f.name}</option>`
  )).join('');
}

function syncControls() {
  $$('#sizeRow .size-chip').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  $$('#layoutRow .layout-card').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  $$('#gradeRow .swatch').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  $$('#letterRow .letter-chip').forEach((b) => b.classList.toggle('active', b.dataset.lettering === state.lettering));
  $$('#frameRow .frame-chip').forEach((b) => b.classList.toggle('active', b.dataset.frame === state.frame));
  $$('#colorRow .color-dot').forEach((b) => b.classList.toggle('active', b.dataset.color === state.titleColor));
  $('#titleInput').value = state.title;
  $('#subtitleInput').value = state.subtitle;
  $('#badgeInput').value = state.badge;
  $('#titleSizeRange').value = String(state.titleSize);
  $('#titleSizeVal').textContent = `${Math.round(state.titleSize * 100)}%`;
  syncPanelControls();
  renderPhotoTray();
  renderPanelStrip();
}

// ---- photos -------------------------------------------------------------

function renderPhotoTray() {
  const tray = $('#photoTray');
  tray.innerHTML = photoList.map((p) => (
    `<button class="photo-thumb" data-photo="${p.id}" title="${p.name}">
      <img src="${p.url}" alt="${p.name}"><span>${p.name}</span>
    </button>`
  )).join('');
  $$('#photoTray .photo-thumb').forEach((b) => b.addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    panel.photoId = b.dataset.photo;
    panel.zoom = 1;
    panel.panX = 0;
    panel.panY = 0;
    syncPanelControls();
    renderPanelStrip();
    requestRender();
  }));
}

function renderPanelStrip() {
  const rects = panelRects(state.layout, 1000, 1000);
  const strip = $('#panelStrip');
  strip.innerHTML = rects.map((_, i) => {
    const p = state.panels[i];
    const photo = photoList.find((x) => x.id === p.photoId);
    const img = photo ? `<img src="${photo.url}" alt="">` : '<em>+</em>';
    return `<button class="panel-cell ${i === state.selectedPanel ? 'active' : ''}" data-panel="${i}">${img}<span>Panel ${i + 1}</span></button>`;
  }).join('');
  $$('#panelStrip .panel-cell').forEach((b) => b.addEventListener('click', () => {
    state.selectedPanel = Number(b.dataset.panel);
    syncPanelControls();
    renderPanelStrip();
  }));
  $('#panelCount').textContent = `${rects.length} panels`;
}

function syncPanelControls() {
  const rects = panelRects(state.layout, 1000, 1000);
  if (state.selectedPanel >= rects.length) state.selectedPanel = 0;
  const p = state.panels[state.selectedPanel];
  const photo = photoList.find((x) => x.id === p.photoId);
  $('#panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${rects.length}`;
  $('#panelPhotoName').textContent = photo ? photo.name : 'No photo yet — pick one below';
  $('#zoomRange').value = String(p.zoom);
  $('#zoomVal').textContent = `${Math.round(p.zoom * 100)}%`;
  $('#filterSelect').value = p.filter;
}

async function addUploadedFiles(files) {
  const images = [...files].filter((f) => f.type.startsWith('image/'));
  if (!images.length) {
    showToast('That file is not an image — try a JPG, PNG or WebP');
    return;
  }
  for (const file of images) {
    uploadCount += 1;
    const id = `up-${uploadCount}`;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      assets.photos.set(id, img);
      photoList.push({ id, name: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'Upload', url, img });
    } catch {
      URL.revokeObjectURL(url);
    }
  }
  // The newest upload fills the selected panel straight away.
  const last = photoList[photoList.length - 1];
  if (last) {
    const panel = state.panels[state.selectedPanel];
    panel.photoId = last.id;
    panel.zoom = 1;
    panel.panX = 0;
    panel.panY = 0;
  }
  syncPanelControls();
  renderPhotoTray();
  renderPanelStrip();
  requestRender();
  showToast(`${images.length} photo${images.length > 1 ? 's' : ''} added — drag to reposition, scroll to zoom`);
}

// ---- stickers -----------------------------------------------------------

const STICKER_SPOTS = [
  { x: 0.88, y: 0.12 }, { x: 0.1, y: 0.1 }, { x: 0.85, y: 0.6 },
  { x: 0.12, y: 0.65 }, { x: 0.5, y: 0.08 }, { x: 0.5, y: 0.85 },
];

function addSticker(id) {
  const spot = STICKER_SPOTS[state.stickers.length % STICKER_SPOTS.length];
  state.stickers.push({ id, x: spot.x, y: spot.y, scale: 1 });
  requestRender();
  showToast(`${STICKERS.find((s) => s.id === id).name} added — drag it on the cover`);
}

// ---- canvas pointer interaction ----------------------------------------

const wrap = $('#previewWrap');
let drag = null; // { kind: 'photo'|'sticker', index, moved, lastX, lastY }

function canvasPoint(ev) {
  const r = canvas.getBoundingClientRect();
  return { nx: (ev.clientX - r.left) / r.width, ny: (ev.clientY - r.top) / r.height };
}

canvas.addEventListener('pointerdown', (ev) => {
  canvas.setPointerCapture(ev.pointerId);
  const { nx, ny } = canvasPoint(ev);
  const sIdx = stickerAt(state, nx, ny);
  if (sIdx >= 0) {
    drag = { kind: 'sticker', index: sIdx, moved: false, lastX: ev.clientX, lastY: ev.clientY };
    return;
  }
  const pIdx = panelAt(state, nx, ny);
  if (pIdx >= 0) {
    state.selectedPanel = pIdx;
    syncPanelControls();
    renderPanelStrip();
    drag = { kind: 'photo', index: pIdx, moved: false, lastX: ev.clientX, lastY: ev.clientY };
  }
});

canvas.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  const dx = ev.clientX - drag.lastX;
  const dy = ev.clientY - drag.lastY;
  drag.lastX = ev.clientX;
  drag.lastY = ev.clientY;
  if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
  const r = canvas.getBoundingClientRect();
  if (drag.kind === 'sticker') {
    const s = state.stickers[drag.index];
    s.x = Math.min(0.98, Math.max(0.02, s.x + dx / r.width));
    s.y = Math.min(0.98, Math.max(0.02, s.y + dy / r.height));
  } else {
    const p = state.panels[drag.index];
    p.panX = Math.min(1, Math.max(-1, p.panX + (dx / r.width) * 2.2));
    p.panY = Math.min(1, Math.max(-1, p.panY + (dy / r.height) * 2.2));
  }
  requestRender();
});

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

canvas.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const { nx, ny } = canvasPoint(ev);
  const pIdx = panelAt(state, nx, ny);
  if (pIdx < 0) return;
  const p = state.panels[pIdx];
  p.zoom = Math.min(2.5, Math.max(1, p.zoom + (ev.deltaY < 0 ? 0.08 : -0.08)));
  if (pIdx === state.selectedPanel) syncPanelControls();
  requestRender();
}, { passive: false });

document.addEventListener('keydown', (ev) => {
  if (ev.target.matches('input, textarea, select')) return;
  const p = state.panels[state.selectedPanel];
  const step = 0.08;
  if (ev.key === 'ArrowLeft') p.panX = Math.max(-1, p.panX - step);
  else if (ev.key === 'ArrowRight') p.panX = Math.min(1, p.panX + step);
  else if (ev.key === 'ArrowUp') p.panY = Math.max(-1, p.panY - step);
  else if (ev.key === 'ArrowDown') p.panY = Math.min(1, p.panY + step);
  else if (ev.key === '+' || ev.key === '=') p.zoom = Math.min(2.5, p.zoom + 0.1);
  else if (ev.key === '-') p.zoom = Math.max(1, p.zoom - 0.1);
  else return;
  ev.preventDefault();
  syncPanelControls();
  requestRender();
});

// ---- caption + panel controls -------------------------------------------

$('#titleInput').addEventListener('input', (ev) => { state.title = ev.target.value; requestRender(); });
$('#subtitleInput').addEventListener('input', (ev) => { state.subtitle = ev.target.value; requestRender(); });
$('#badgeInput').addEventListener('input', (ev) => { state.badge = ev.target.value; requestRender(); });
$('#titleSizeRange').addEventListener('input', (ev) => {
  state.titleSize = Number(ev.target.value);
  $('#titleSizeVal').textContent = `${Math.round(state.titleSize * 100)}%`;
  requestRender();
});
$('#zoomRange').addEventListener('input', (ev) => {
  state.panels[state.selectedPanel].zoom = Number(ev.target.value);
  $('#zoomVal').textContent = `${Math.round(state.panels[state.selectedPanel].zoom * 100)}%`;
  requestRender();
});
$('#filterSelect').addEventListener('change', (ev) => {
  state.panels[state.selectedPanel].filter = ev.target.value;
  requestRender();
});
$('#fillAllBtn').addEventListener('click', () => {
  const src = state.panels[state.selectedPanel].photoId;
  if (!src) { showToast('Pick a photo for this panel first'); return; }
  panelRects(state.layout, 1000, 1000).forEach((_, i) => {
    state.panels[i].photoId = src;
  });
  renderPanelStrip();
  requestRender();
  showToast('One photo across every panel');
});
$('#clearPanelBtn').addEventListener('click', () => {
  const p = state.panels[state.selectedPanel];
  p.photoId = null;
  p.zoom = 1;
  p.panX = 0;
  p.panY = 0;
  syncPanelControls();
  renderPanelStrip();
  requestRender();
});

// ---- uploads ------------------------------------------------------------

$('#uploadInput').addEventListener('change', (ev) => {
  addUploadedFiles(ev.target.files);
  ev.target.value = '';
});
$('#dropZone').addEventListener('click', () => $('#uploadInput').click());
for (const evName of ['dragover', 'dragenter']) {
  wrap.addEventListener(evName, (ev) => { ev.preventDefault(); wrap.classList.add('dropping'); });
  $('#dropZone').addEventListener(evName, (ev) => { ev.preventDefault(); $('#dropZone').classList.add('dropping'); });
}
for (const evName of ['dragleave', 'drop']) {
  wrap.addEventListener(evName, () => wrap.classList.remove('dropping'));
  $('#dropZone').addEventListener(evName, () => $('#dropZone').classList.remove('dropping'));
}
wrap.addEventListener('drop', (ev) => {
  ev.preventDefault();
  addUploadedFiles(ev.dataTransfer.files);
});
$('#dropZone').addEventListener('drop', (ev) => {
  ev.preventDefault();
  addUploadedFiles(ev.dataTransfer.files);
});

// ---- surprise + reset ---------------------------------------------------

const SURPRISE_TITLES = [
  'MIDNIGHT RUN', 'VICE ROYALE', 'PALM HEIST', 'NEON GETAWAY',
  'SUNSET OUTLAWS', 'TURBO HEARTS', 'VICE CITY KIDS', 'HOT PURSUIT',
];

$('#surpriseBtn').addEventListener('click', () => {
  const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
  const ids = SAMPLES.map((s) => s.id).sort(() => Math.random() - 0.5);
  applyPreset(preset, ids);
  state.title = SURPRISE_TITLES[Math.floor(Math.random() * SURPRISE_TITLES.length)];
  syncControls();
  requestRender();
  showToast(`Surprise: “${preset.name}” + “${state.title}”`);
});

$('#resetBtn').addEventListener('click', () => {
  const fresh = defaultState();
  Object.assign(state, fresh);
  assignPhotos(['pier', 'scene-sunset', 'boulevard', 'scene-skyline', 'scene-neon', 'pier']);
  syncControls();
  requestRender();
  showToast('Back to the Sunset Heist starter');
});

// ---- export -------------------------------------------------------------

function slug(text) {
  return (text || 'cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'cover';
}

$('#exportBtn').addEventListener('click', () => {
  renderCover(canvas, state, assets);
  canvas.toBlob((blob) => {
    if (!blob) { showToast('Export failed — try again'); return; }
    const s = sizeById(state.size);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-cover-${slug(state.title)}-${s.id}-${s.w}x${s.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    showToast(`PNG exported — ${s.w} × ${s.h}, ready to post`);
  }, 'image/png');
});

// ---- gallery ------------------------------------------------------------

function renderGallery() {
  const off = document.createElement('canvas');
  const gal = $('#galleryRow');
  gal.innerHTML = '';
  GALLERY.forEach((g, i) => {
    const preset = presetById(g.preset);
    const thumbState = {
      ...defaultState(),
      size: g.size,
      layout: preset.layout,
      grade: preset.grade,
      lettering: preset.lettering,
      frame: preset.frame,
      title: preset.title,
      subtitle: preset.subtitle,
      badge: preset.badge,
      titleColor: preset.titleColor,
      stickers: preset.stickers.map((s) => ({ ...s })),
    };
    const rects = panelRects(thumbState.layout, 1000, 1000);
    rects.forEach((_, pi) => {
      thumbState.panels[pi].photoId = g.photos[pi % g.photos.length];
    });
    renderCover(off, thumbState, assets);
    const s = sizeById(g.size);
    const thumb = document.createElement('canvas');
    thumb.width = 300;
    thumb.height = Math.round((300 * s.h) / s.w);
    thumb.getContext('2d').drawImage(off, 0, 0, thumb.width, thumb.height);
    const btn = document.createElement('button');
    btn.className = 'gallery-item';
    btn.title = `Use this cover: ${preset.name} (${s.name})`;
    btn.appendChild(thumb);
    const label = document.createElement('span');
    label.textContent = `${preset.name} · ${s.name}`;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state.size = g.size;
      applyPreset(preset, g.photos);
      showToast(`Gallery cover “${preset.name}” loaded — edit it or export it`);
    });
    gal.appendChild(btn);
    void i;
  });
}

// ---- toast --------------------------------------------------------------

let toastTimer = 0;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ---- shot mode (for the maker's screenshots) ----------------------------
// ?shot=cover renders the cover alone, full-bleed, for cover screenshots.
// ?shot=editor shows the editor with a sample photo already loaded.
// Extra params: photo (one sample for every panel), photos (comma-separated
// samples, one per panel), caption, subtitle, preset, size, layout, grade.

function applyShotParams() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  if (q.get('preset')) applyPreset(presetById(q.get('preset')));
  if (q.get('size')) state.size = q.get('size');
  if (q.get('layout')) state.layout = q.get('layout');
  if (q.get('grade')) state.grade = q.get('grade');
  if (q.get('caption')) state.title = q.get('caption');
  if (q.get('subtitle')) state.subtitle = q.get('subtitle');
  const photo = q.get('photo');
  if (photo && assets.photos.has(photo)) {
    assignPhotos([photo]);
  }
  const photos = q.get('photos');
  if (photos) {
    const ids = photos.split(',').map((s) => s.trim()).filter((id) => assets.photos.has(id));
    if (ids.length) assignPhotos(ids);
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }
  syncControls();
}

// ---- boot ---------------------------------------------------------------

async function boot() {
  buildControls();
  assignPhotos(['pier', 'scene-sunset', 'boulevard', 'scene-skyline', 'scene-neon', 'pier']);
  syncControls();
  try {
    await Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('100px "Bebas Neue"'),
      loadSamples(),
    ]);
  } catch { /* fonts/samples fall back gracefully */ }
  applyShotParams();
  renderGallery();
  requestRender();
}

boot();
