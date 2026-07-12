# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm test         # Run Vitest test suite (single run)
npm run test:watch  # Run Vitest in watch mode
npm run build    # Production build
```

## Architecture

Pure-frontend React SPA (Vite). No backend. All Kaltura API calls go directly from the browser using `fetch` with `URLSearchParams`-encoded POST bodies.

**State** lives entirely in `App.jsx` via `useState` and is passed down as props — no context, no external store.

**Key data shape** — a clip object:
```js
{
  id: string,                     // crypto.randomUUID()
  background: KalturaEntryResource fields,
  overlays: KalturaOverlayAttributes[],
  replaceBackground: KalturaReplaceBackgroundAttributes | null,
  effects: KalturaEffect[],
  captions: KalturaRenderCaptionAttributes | null,
}
```

**Payload serialization** (`src/api/kaltura.js` → `buildPayload`) converts the clip array into Kaltura's flat `param[nested][index][field]` POST param format expected by `baseEntry.addContent`.

**Extensibility** — adding a new Kaltura object type to a clip:
1. Add a new file in `src/components/sections/`
2. Add a new `CollapsibleSection` in `ClipCard.jsx`
3. Update `buildPayload` in `src/api/kaltura.js`
4. Add any new enums to `src/constants/kaltura.js`

## Kaltura API Notes

- Source of truth for object names: `kaltura/server` repo, branch `West-23.2.0`, path `api_v3/lib/types/resource/operations/`
- `KalturaOverlayAttributes` and `KalturaReplaceBackgroundAttributes` are subtypes of `KalturaMediaCompositionAttributes` — they go in `KalturaClipAttributes.mediaCompositionAttributesArray` (max 5 total)
- `KalturaMediaCompositionAlignment` and `KalturaOverlayShape` enum integer values should be confirmed from the server enum files — current constants use string keys as placeholders
- Kaltura REST API returns HTTP 200 even for errors; check `response.objectType === 'KalturaAPIException'`
