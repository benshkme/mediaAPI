# Design: baseEntry.addContent Configuration Tool

**Date:** 2026-07-05  
**Status:** Approved

## Overview

A pure-frontend React SPA (Vite) that lets Kaltura developers and QA engineers visually configure, submit, and review results of the `baseEntry.addContent` API. No backend — all API calls go directly from the browser to the Kaltura API.

---

## Architecture

**Stack:** Vite + React, plain CSS or Tailwind, no external state library.

**API calls:**
- `baseEntry.addContent` — submit the configured request
- `baseEntry.get` — poll for conversion status after submission

All calls use the Kaltura REST API (`https://www.kaltura.com/api_v3/service/...`), authenticated via a KS (Kaltura Session) token the user pastes in.

**Three vertical zones:**
1. Config bar
2. Request builder
3. Results panel

---

## Data Model

The form maps directly to the `baseEntry.addContent` request structure, using Kaltura object names throughout. Source: `kaltura/server` repo, branch `West-23.2.0`.

```
Request
├── ks (string)
├── serviceUrl (string, default: https://www.kaltura.com)
├── targetEntryId (string)
└── resource: KalturaOperationResources
    ├── chapterNamePolicy (enum: KalturaChapterNamePolicy — BY_ENTRY_ID=1 | BY_ENTRY_NAME=2 | NUMERICAL=3)
    ├── dimensionsAttributes (KalturaDimensionsAttributes[] — target resolution/aspect ratio)
    └── resources: KalturaOperationResource[]
        └── KalturaOperationResource (one per clip/scene)
            ├── resource: KalturaEntryResource (background)
            │   ├── entryId (string, required)
            │   └── flavorParamsId (int, optional)
            └── operationAttributes: KalturaClipAttributes[]
                └── KalturaClipAttributes
                    ├── offset (int, ms, optional)
                    ├── duration (int, ms, optional)
                    ├── globalOffsetInDestination (int, ms, optional)
                    ├── cropAlignment (int, 0–100, optional)
                    ├── effectArray: KalturaEffect[]
                    │   └── KalturaEffect
                    │       ├── effectType (enum: KalturaEffectType — VIDEO_FADE_IN=1 | VIDEO_FADE_OUT=2)
                    │       └── value (string)
                    ├── captionAttributes: KalturaRenderCaptionAttributes[] (max 1)
                    │   └── KalturaRenderCaptionAttributes
                    │       ├── captionAssetId (string)
                    │       ├── fontName (string)
                    │       ├── fontSize (int)
                    │       ├── primaryColour (string, ASS hex e.g. &H00FFFFFF)
                    │       ├── outlineColour (string)
                    │       ├── backColour (string)
                    │       ├── borderStyle (enum: KalturaBorderStyle — OUTLINE_WITH_SHADOW=1 | OPAQUE_BOX=3)
                    │       ├── shadow (int)
                    │       ├── bold (bool)
                    │       ├── italic (bool)
                    │       ├── underline (bool)
                    │       └── alignment (enum: KalturaCaptionsAlignment — BOTTOM_LEFT=1 | BOTTOM_CENTER=2 | BOTTOM_RIGHT=3 | TOP_LEFT=4 | TOP_CENTER=6 | TOP_RIGHT=7 | CENTER_LEFT=8 | CENTER_CENTER=10 | CENTER_RIGHT=11)
                    └── mediaCompositionAttributesArray: KalturaMediaCompositionAttributes[] (max 5)
                        ├── KalturaOverlayAttributes (extends KalturaMediaCompositionAttributes)
                        │   ├── resource: KalturaContentResource (required — entryId, assetId, or document images)
                        │   ├── overlayPlacement (enum: KalturaMediaCompositionAlignment — values TBC from enum file)
                        │   ├── overlayShape (enum: KalturaOverlayShape — values TBC from enum file)
                        │   ├── overlayScaleAttribute: KalturaOverlayScaleAttribute
                        │   │   ├── scaleBehavior (fill | fit)
                        │   │   └── scalePercentage: KalturaDimensionsPercentage
                        │   │       ├── widthPercentage (float, 0–1)
                        │   │       └── heightPercentage (float, 0–1)
                        │   ├── marginsPercentage: KalturaDimensionsPercentage
                        │   │   ├── widthPercentage (float, default 0.074)
                        │   │   └── heightPercentage (float, default 0.074)
                        │   ├── audioAttributes: KalturaAudioAttributes
                        │   │   └── volume (float, 0–2)
                        │   └── resourceMediaCompositionAttributesArray (max 1, no nested KalturaOverlayAttributes)
                        │       └── KalturaReplaceBackgroundAttributes (for overlay's own background replacement)
                        └── KalturaReplaceBackgroundAttributes (extends KalturaMediaCompositionAttributes)
                            ├── resource: KalturaContentResource (required)
                            ├── backgroundColorCode (string, hex format 0xRRGGBB, optional)
                            ├── foregroundScalePercentage (float, 0–5, optional)
                            ├── foregroundPositionPercentage: KalturaPosition
                            │   ├── x (float, 0–1)
                            │   └── y (float, 0–1)
                            └── audioAttributes: KalturaAudioAttributes
                                └── volume (float, 0–2)
```

> **Note:** `KalturaMediaCompositionAlignment` and `KalturaOverlayShape` enum values are defined in separate enum files not yet fetched. Confirm exact values from `kaltura/server` during implementation; from the transcript they include positions like `CENTER_RIGHT`, `CENTER_LEFT`, and shapes like `RECTANGLE`, `RECTANGLE_ROUNDED`.

---

## Layout

### Config Bar (top)
- KS token input (text, full width)
- Service URL input (default: `https://www.kaltura.com`)
- Target Entry ID input
- Target resolution input (width × height, optional — used for preview aspect ratio; defaults to 16:9)

### Request Builder (middle)
A vertical list of **clip cards** (`KalturaOperationAttributes`). Each card contains collapsible sections — one per Kaltura object type — so future API additions are added as a new section with no structural changes needed:

| Section | Kaltura Object | Contents |
|---|---|---|
| Background | `KalturaEntryResource` | Entry ID, flavorParamsId, offset, duration, globalOffsetInDestination, cropAlignment |
| Overlays | `KalturaOverlayAttributes[]` (in `mediaCompositionAttributesArray`) | Add/remove rows: resource (entry ID), placement (enum), shape (enum), scale behavior + width/height %, margins width/height %, audio volume |
| Replace Background | `KalturaReplaceBackgroundAttributes` (in `mediaCompositionAttributesArray`) | Resource entry ID, backgroundColorCode, foregroundScalePercentage, foregroundPosition x/y, audio volume |
| Effects | `KalturaEffect[]` (in `effectArray`) | Add/remove rows: effectType (VIDEO_FADE_IN / VIDEO_FADE_OUT), value |
| Captions | `KalturaRenderCaptionAttributes` (max 1, in `captionAttributes`) | captionAssetId, fontName, fontSize, primaryColour, outlineColour, backColour, borderStyle, shadow, bold, italic, underline, alignment |

Each section is **collapsible** and shows a count badge when populated (e.g., "Overlays (2)"). Adding a new Kaltura object type in the future = adding a new collapsible section component.

"Add Clip" button appends a new empty card at the bottom.

### Clip Preview (inside each clip card)
A live SVG canvas rendered inside each clip card, updated on every input change:
- Background frame drawn at the correct aspect ratio (from target resolution, fallback 16:9)
- Each overlay drawn as a labeled rectangle at the specified position and dimensions (using widthPercent/heightPercent with Kaltura defaults as fallback)
- Margins respected
- Colors: background = dark gray, overlays = semi-transparent colored rectangles with entry ID label

### Submit Button
Below the clip list. Disabled if required fields are missing (KS, targetEntryId, at least one clip with a background entry ID). Shows inline validation errors on fields before allowing submission.

### Results Panel (bottom, appears after submit)
1. **Raw API response** — collapsible JSON block
2. **Conversion status** — badge polling `baseEntry.get` every 5 seconds; states: Submitted → Converting → Ready / Error
3. **Embedded player** — Kaltura iframe player rendered once status is Ready, using targetEntryId

---

## Clip Preview Details

- Rendered as an SVG element inside the clip card
- Aspect ratio determined by: target resolution field if set → else 16:9
- Background: a filled rectangle representing the main video frame
- Overlays: positioned rectangles calculated from:
  - `widthPercent` / `heightPercent` (user input or Kaltura defaults — to be confirmed from API schema during implementation)
  - `marginPercent` (user input or default 0.074)
  - `position` enum maps to anchor point (e.g., center-right = right-center of frame)
- Labels: each overlay rectangle labeled with its entry ID (truncated) and position
- Updates on every relevant input change (no debounce needed for SVG)

---

## Error Handling

- **Kaltura API errors** (HTTP 200 with error object in body): shown prominently in results panel with `code` and `message`
- **Network failures**: inline error near Submit button
- **Client-side validation**: inline field errors for missing KS, missing targetEntryId, missing background entry ID per clip — validated on submit attempt

---

## File Structure (planned)

```
src/
  components/
    ConfigBar.jsx
    ClipCard.jsx                  ← container for one KalturaOperationAttributes
    sections/
      BackgroundSection.jsx       ← KalturaEntryResource (offset, duration, etc.)
      OverlaysSection.jsx         ← KalturaOverlayAttributes[] (placement, shape, scale, audio, margins)
      ReplaceBackgroundSection.jsx ← KalturaReplaceBackgroundAttributes (resource, color, scale, position)
      EffectsSection.jsx          ← KalturaEffect[] (VIDEO_FADE_IN / VIDEO_FADE_OUT)
      CaptionsSection.jsx         ← KalturaRenderCaptionAttributes (font, color, alignment, etc.)
    OverlayRow.jsx
    ClipPreview.jsx               ← SVG live preview
    ResultsPanel.jsx
  hooks/
    usePolling.js                 ← polls baseEntry.get until Ready/Error
  api/
    kaltura.js                    ← baseEntry.addContent + baseEntry.get calls
  App.jsx
```

The `sections/` pattern is the extensibility point: each Kaltura object type is its own self-contained section component. Adding a new API feature = adding a new file in `sections/` and registering it in `ClipCard`.

---

## Out of Scope

- Entry search/browsing (users type entry IDs manually)
- Authentication via partner ID + admin secret (users provide KS directly)
- Saving/loading configurations
