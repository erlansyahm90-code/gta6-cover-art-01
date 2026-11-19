# Leonida Cover Studio — GTA-style Cover Art Maker

![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/erlansyahm90-code/gta6-cover-art-01/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/erlansyahm90-code/gta6-cover-art-01/reward.svg)

An entry for the [make.fun GTA 6 Cover Art competition](https://make.fun/c/gta6-cover-art-01/):
a web app that turns your own photos and a caption into bold multi-panel cover art
in the style of GTA 6's posters — Vice City sunsets, neon nights, big caption
lettering — exported as a PNG ready to post.

## What it does

- **Any photo, any panel** — upload your own photos (or use the six built-in
  samples and hand-drawn scenes), assign a different photo to each panel or fill
  every panel with one photo, then drag to reposition and scroll to zoom each one.
- **Six poster layouts** — Hero Grid, Vice Strip, Mosaic, Duo, Quad and Spotlight
  (full-bleed hero with tilted insets), each adapting to the export size.
- **Eight one-click presets** — Sunset Heist, Neon Nights, Beach Day, Turbo Vice,
  Most Wanted, Palm Noir, Bubblegum and Golden Hour set layout, grade, lettering,
  frame, caption and stickers in one click.
- **Six colour grades, five lettering styles, six frames** — Vice Sunset, Neon
  Nights, Miami Teal, Golden Hour, Palm Noir, Bubblegum; Outline Pop, Neon Glow,
  Sunset Gradient, Sticker Bomb, Chrome; White Comic, Bold Black, Neon Pink,
  Gold, Thin White, none.
- **Stickers** — six original stickers (palm, sun, flamingo, star, lightning,
  lowrider) you can add and drag anywhere on the cover.
- **Per-panel filters and zoom**, a live preview, an example-cover gallery, and a
  Surprise Me button.
- **Fast export** — one click downloads the cover as a PNG in 1080 × 1080,
  1080 × 1350 or 1920 × 1080.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step, no network request.
Photos are read on your own machine and never uploaded. Everything ships
offline: the display fonts (Anton and Bebas Neue, SIL Open Font License, under
`app/fonts/`) and all artwork are files in this repository.

## Originality

All art in this app is original and drawn for this entry. No Rockstar Games
logo, wordmark, official artwork, character or font is used; "GTA-style"
describes the poster look only. The two JPG sample photos under `app/samples/`
were made with an image model for the make.fun kit and are free to use.

## Layout of this repository

- `app/` — the web app (`index.html`, `style.css`, `src/`, `fonts/`,
  `samples/`, `stickers/`)
- `screenshots/` — four screenshots: the exported landscape cover, the editor
  with photos loaded, and the portrait and square exports
- `main.ts` — the entry program: copies `app/` + `screenshots/` to `/output`
  and writes `dossier.json`
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged
- `serve.ts` — tiny local static server for development

## License

MIT — see [LICENSE](LICENSE).
