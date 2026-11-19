// Canvas rendering engine for Leonida Cover Studio.
// renderCover(canvas, state, assets) draws one finished cover at the export
// size: a procedural Vice City backdrop (sunset sky, striped sun, skyline and
// palm silhouettes), the photo panels of the chosen layout, the colour grade,
// stickers and the bold caption lettering. The same function paints the live
// preview, the gallery thumbnails and the exported PNG.
import { panelRects } from './layouts.js';
import {
  sizeById, gradeById, letteringById, frameById, panelFilterById, TITLE_COLORS,
} from './presets.js';

export function coverSize(state) {
  return sizeById(state.size);
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawPalmSilhouette(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(6, -60, 4, -110, 12, -160);
  ctx.stroke();
  const fronds = [
    [-95, -150, -150, -170, -160, -140],
    [-70, -205, -60, -235, -35, -225],
    [10, -235, 45, -250, 60, -225],
    [75, -195, 130, -200, 145, -175],
    [95, -140, 150, -125, 155, -100],
    [-105, -105, -150, -80, -145, -60],
  ];
  for (const [cx, cy, tx, ty, ex, ey] of fronds) {
    ctx.beginPath();
    ctx.moveTo(12, -160);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.quadraticCurveTo(ex, ey, 12, -152);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(2, -150, 8, 0, Math.PI * 2);
  ctx.arc(22, -146, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSkyline(ctx, w, h, color) {
  // Deterministic skyline: heights come from a fixed table, not Math.random,
  // so every render of the same cover is identical.
  const towers = [0.16, 0.26, 0.2, 0.34, 0.24, 0.3, 0.18, 0.38, 0.22, 0.28, 0.2, 0.32, 0.24];
  const base = h * 0.86;
  ctx.fillStyle = color;
  const step = w / towers.length;
  towers.forEach((t, i) => {
    const th = t * h;
    ctx.fillRect(i * step + step * 0.08, base - th, step * 0.84, th + h * 0.14);
  });
  ctx.fillStyle = '#ffd166';
  towers.forEach((t, i) => {
    const th = t * h;
    const rows = Math.floor(th / (h * 0.045));
    for (let r = 0; r < rows; r++) {
      if ((i * 3 + r) % 3 === 0) {
        ctx.fillRect(i * step + step * 0.3, base - th + h * 0.03 + r * h * 0.045, step * 0.16, h * 0.014);
      }
    }
  });
}

function drawBackdrop(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.45, '#7597de');
  sky.addColorStop(0.72, '#ff7e5f');
  sky.addColorStop(1, '#feb47b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Striped retro sun, centred.
  const cx = w * 0.5;
  const cy = h * 0.42;
  const r = Math.min(w, h) * 0.22;
  const sunGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sunGrad.addColorStop(0, '#ffe259');
  sunGrad.addColorStop(1, '#ffa751');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff7e5f';
  const stripes = [0.08, 0.26, 0.46, 0.68];
  stripes.forEach((f, i) => {
    const y = cy + r * f;
    const half = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
    ctx.fillRect(cx - half, y, half * 2, r * (0.05 + i * 0.02));
  });

  // Sea band with light streaks.
  const sea = ctx.createLinearGradient(0, h * 0.62, 0, h);
  sea.addColorStop(0, '#ff9a8b');
  sea.addColorStop(1, '#3b1055');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = 'rgba(255,209,148,0.7)';
  for (let i = 0; i < 5; i++) {
    const y = h * (0.66 + i * 0.06);
    const sw = w * (0.1 + (i % 3) * 0.05);
    ctx.fillRect(cx - sw / 2, y, sw, h * 0.008);
  }

  drawSkyline(ctx, w, h, '#1a0b2e');
  drawPalmSilhouette(ctx, w * 0.06, h * 0.98, Math.min(w, h) / 900, '#12081f');
  drawPalmSilhouette(ctx, w * 0.94, h * 0.98, Math.min(w, h) / 1000, '#12081f');
  if (grade.id === 'noir') {
    ctx.fillStyle = 'rgba(10,10,20,0.35)';
    ctx.fillRect(0, 0, w, h);
  }
}

function drawPanelPhoto(ctx, rect, panel, img, grade, frame, w, h) {
  const x = rect.x * w;
  const y = rect.y * h;
  const pw = rect.w * w;
  const ph = rect.h * h;
  if (pw <= 0 || ph <= 0) return;
  ctx.save();
  if (rect.rot) {
    ctx.translate(x + pw / 2, y + ph / 2);
    ctx.rotate((rect.rot * Math.PI) / 180);
    ctx.translate(-(x + pw / 2), -(y + ph / 2));
  }
  const radius = Math.min(pw, ph) * 0.02;
  roundedRectPath(ctx, x, y, pw, ph, radius);
  ctx.save();
  ctx.clip();
  if (img) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const zoom = panel.zoom || 1;
    const base = Math.max(pw / iw, ph / ih);
    const dw = iw * base * zoom;
    const dh = ih * base * zoom;
    const slackX = Math.max(0, (dw - pw) / 2);
    const slackY = Math.max(0, (dh - ph) / 2);
    const dx = x + (pw - dw) / 2 + (panel.panX || 0) * slackX;
    const dy = y + (ph - dh) / 2 + (panel.panY || 0) * slackY;
    const filter = [panelFilterById(panel.filter).filter, grade.photoFilter].filter(Boolean).join(' ');
    ctx.filter = filter || 'none';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + ph);
    g.addColorStop(0, '#3b2a63');
    g.addColorStop(1, '#1a0b2e');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `600 ${Math.round(Math.min(pw, ph) * 0.09)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', x + pw / 2, y + ph / 2);
  }
  ctx.restore();

  if (frame.width > 0 && frame.color) {
    if (frame.glow) {
      ctx.shadowColor = frame.glow;
      ctx.shadowBlur = w * 0.012;
    }
    roundedRectPath(ctx, x, y, pw, ph, radius);
    ctx.lineWidth = (frame.width / 1080) * w;
    ctx.strokeStyle = frame.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (frame.outer) {
      roundedRectPath(ctx, x, y, pw, ph, radius);
      ctx.lineWidth = (frame.outerWidth / 1080) * w;
      ctx.strokeStyle = frame.outer;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

function drawGradeOverlay(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.overlay[0]);
  g.addColorStop(1, grade.overlay[1]);
  ctx.save();
  ctx.globalCompositeOperation = grade.blend;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawStickers(ctx, state, assets, w, h) {
  for (const s of state.stickers) {
    const img = assets.stickers.get(s.id);
    if (!img) continue;
    const size = Math.min(w, h) * 0.16 * (s.scale || 1);
    const x = s.x * w - size / 2;
    const y = s.y * h - size / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.04;
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }
}

function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, "Arial Black", sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size = Math.round(size * 0.94);
    ctx.font = `${size}px Anton, "Arial Black", sans-serif`;
  }
  return size;
}

function drawTitleBlock(ctx, state, w, h) {
  const lettering = letteringById(state.lettering);
  const titleColor = (TITLE_COLORS.find((c) => c.id === state.titleColor) || TITLE_COLORS[0]).value;
  const margin = w * 0.045;

  // Badge pill, top-left, slightly tilted.
  if (state.badge) {
    ctx.save();
    ctx.translate(margin + w * 0.055, h * 0.045);
    ctx.rotate(-0.03);
    ctx.font = `${Math.round(w * 0.02)}px "Bebas Neue", sans-serif`;
    const bw = ctx.measureText(state.badge.toUpperCase()).width + w * 0.03;
    const bh = h * 0.042;
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.badge.toUpperCase(), 0, bh * 0.06);
    ctx.restore();
  }

  // Bottom scrim so the caption always reads over photos.
  const scrimH = h * 0.36;
  const scrim = ctx.createLinearGradient(0, h - scrimH, 0, h);
  scrim.addColorStop(0, 'rgba(8,4,20,0)');
  scrim.addColorStop(0.55, 'rgba(8,4,20,0.55)');
  scrim.addColorStop(1, 'rgba(8,4,20,0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h - scrimH, w, scrimH);

  // Accent rule above the title.
  const title = (state.title || 'LEONIDA').toUpperCase();
  const maxW = w - margin * 2;
  const baseSize = Math.min(w * 0.115, h * 0.16) * (state.titleSize || 1);
  const size = fitTitleFont(ctx, title, maxW, baseSize);
  const titleY = h - h * 0.115;
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(margin, titleY - size * 1.18, w * 0.12, Math.max(3, h * 0.008));
  ctx.fillStyle = '#facc15';
  ctx.fillRect(margin + w * 0.12, titleY - size * 1.18, w * 0.05, Math.max(3, h * 0.008));

  ctx.save();
  ctx.font = `${size}px Anton, "Arial Black", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  if (lettering.shadowBlur > 0) {
    ctx.shadowColor = lettering.shadow;
    ctx.shadowBlur = size * lettering.shadowBlur;
  } else if (lettering.shadowY) {
    ctx.shadowColor = lettering.shadow;
    ctx.shadowOffsetY = size * lettering.shadowY;
  }
  let fill = lettering.fill || titleColor;
  if (lettering.gradient) {
    const g = ctx.createLinearGradient(0, titleY - size, 0, titleY);
    lettering.gradient.forEach((c, i) => g.addColorStop(i / (lettering.gradient.length - 1), c));
    fill = g;
  }
  ctx.lineWidth = size * lettering.strokeScale;
  ctx.strokeStyle = lettering.stroke;
  ctx.strokeText(title, margin, titleY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = fill;
  ctx.fillText(title, margin, titleY);
  ctx.restore();

  // Subtitle in Bebas Neue with wide tracking.
  if (state.subtitle) {
    const subSize = Math.max(18, size * 0.3);
    ctx.save();
    ctx.font = `${Math.round(subSize)}px "Bebas Neue", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.28)}px`; } catch { /* older canvas: ignore */ }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowOffsetY = Math.round(subSize * 0.08);
    ctx.fillText(state.subtitle.toUpperCase(), margin, h - h * 0.045);
    ctx.restore();
  }

  // Bottom-right corner mark.
  ctx.save();
  ctx.font = `${Math.round(w * 0.016)}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(w * 0.004)}px`; } catch { /* ignore */ }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LEONIDA COVER STUDIO', w - margin, h - h * 0.028);
  ctx.restore();
}

function drawVignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function renderCover(canvas, state, assets) {
  const { w, h } = coverSize(state);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const frame = frameById(state.frame);
  drawBackdrop(ctx, w, h, grade);
  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || {};
    const img = panel.photoId ? assets.photos.get(panel.photoId) : null;
    drawPanelPhoto(ctx, rect, panel, img || null, grade, frame, w, h);
  });
  drawGradeOverlay(ctx, w, h, grade);
  drawStickers(ctx, state, assets, w, h);
  drawTitleBlock(ctx, state, w, h);
  drawVignette(ctx, w, h, grade.vignette);
  return canvas;
}

// Hit-testing for the editor: which panel (index) sits under a normalised point.
export function panelAt(state, nx, ny) {
  const { w, h } = coverSize(state);
  const rects = panelRects(state.layout, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h) return i;
  }
  return -1;
}

// Hit-testing for stickers: returns the sticker index, or -1.
export function stickerAt(state, nx, ny) {
  const { w, h } = coverSize(state);
  const half = (Math.min(w, h) * 0.16) / 2;
  for (let i = state.stickers.length - 1; i >= 0; i--) {
    const s = state.stickers[i];
    const size = half * 2 * (s.scale || 1);
    const dx = Math.abs(nx * w - s.x * w);
    const dy = Math.abs(ny * h - s.y * h);
    if (dx <= size / 2 && dy <= size / 2) return i;
  }
  return -1;
}
