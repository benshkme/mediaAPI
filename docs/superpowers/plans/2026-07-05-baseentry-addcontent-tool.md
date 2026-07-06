# baseEntry.addContent Configuration Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure-frontend React SPA that lets Kaltura developers and QA engineers configure, submit, and review results of the `baseEntry.addContent` API.

**Architecture:** Vite + React SPA, no backend. All Kaltura API calls go directly from the browser. State lives in `App.jsx` via `useState` and is passed down as props. Each clip card hosts collapsible section components (one per Kaltura object type) plus a live SVG preview.

**Tech Stack:** Vite 5, React 18, plain CSS (no Tailwind), no external state library, no test framework beyond Vitest + @testing-library/react.

## Global Constraints

- Pure frontend — no backend, no proxy
- All API calls to `https://www.kaltura.com/api_v3/service/...` (configurable)
- Authentication via KS token pasted by user — never generate or store it
- Kaltura object names must match server source exactly (branch `West-23.2.0`)
- `KalturaOverlayAttributes` and `KalturaReplaceBackgroundAttributes` live inside `KalturaClipAttributes.mediaCompositionAttributesArray` (max 5 total)
- `KalturaRenderCaptionAttributes` max 1 per clip
- No saving/loading configs, no entry search

---

## File Map

```
src/
  api/
    kaltura.js          — buildPayload(), addContent(), getEntry()
  hooks/
    usePolling.js       — usePolling(fn, intervalMs, enabled)
  components/
    ConfigBar.jsx       — KS, serviceUrl, targetEntryId, targetResolution
    ClipCard.jsx        — one KalturaOperationResource card + collapsible sections + preview
    ClipPreview.jsx     — SVG live layout preview
    sections/
      BackgroundSection.jsx        — KalturaEntryResource fields
      OverlaysSection.jsx          — KalturaOverlayAttributes[] rows
      OverlayRow.jsx               — single overlay row
      ReplaceBackgroundSection.jsx — KalturaReplaceBackgroundAttributes
      EffectsSection.jsx           — KalturaEffect[] rows
      CaptionsSection.jsx          — KalturaRenderCaptionAttributes (max 1)
    ResultsPanel.jsx    — raw JSON, status badge, player
  constants/
    kaltura.js          — enums: OVERLAY_PLACEMENT, OVERLAY_SHAPE, EFFECT_TYPE, etc.
  App.jsx
  App.css
  main.jsx
index.html
vite.config.js
package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

**Interfaces:**
- Produces: running dev server at `http://localhost:5173` rendering `<App />`

- [ ] **Step 1: Initialise project**

```bash
cd /Users/david.benshushan/Programs/Claude/mediaAPI
npm create vite@latest . -- --template react
```

When prompted: select "React" → "JavaScript". Accept overwrite of existing files.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create test setup**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Replace App.jsx with skeleton**

```jsx
import './App.css'

export default function App() {
  return <div className="app"><h1>baseEntry.addContent Tool</h1></div>
}
```

- [ ] **Step 6: Replace App.css**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #222; }
.app { max-width: 1100px; margin: 0 auto; padding: 24px; }
h1 { font-size: 1.4rem; margin-bottom: 24px; }
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: "Local: http://localhost:5173" with no errors.

- [ ] **Step 8: Add test script to package.json and run tests**

Ensure `package.json` scripts includes:
```json
"test": "vitest run",
"test:watch": "vitest"
```

```bash
npm test
```
Expected: "No test files found" (passes with 0 tests).

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React project with Vitest"
```

---

### Task 2: Kaltura Constants & Enums

**Files:**
- Create: `src/constants/kaltura.js`
- Create: `src/constants/kaltura.test.js`

**Interfaces:**
- Produces:
  - `OVERLAY_PLACEMENT` — object mapping label → int value
  - `OVERLAY_SHAPE` — object mapping label → int value
  - `EFFECT_TYPE` — object mapping label → int value
  - `BORDER_STYLE` — object mapping label → int value
  - `CAPTIONS_ALIGNMENT` — object mapping label → int value
  - `CHAPTER_NAME_POLICY` — object mapping label → int value
  - `KALTURA_OBJECT_TYPES` — discriminator strings for each Kaltura subtype

- [ ] **Step 1: Write failing tests**

Create `src/constants/kaltura.test.js`:

```js
import {
  OVERLAY_PLACEMENT, OVERLAY_SHAPE, EFFECT_TYPE,
  BORDER_STYLE, CAPTIONS_ALIGNMENT, CHAPTER_NAME_POLICY,
  KALTURA_OBJECT_TYPES,
} from './kaltura'

test('EFFECT_TYPE has VIDEO_FADE_IN=1 and VIDEO_FADE_OUT=2', () => {
  expect(EFFECT_TYPE.VIDEO_FADE_IN).toBe(1)
  expect(EFFECT_TYPE.VIDEO_FADE_OUT).toBe(2)
})

test('BORDER_STYLE has correct values', () => {
  expect(BORDER_STYLE.OUTLINE_WITH_SHADOW).toBe(1)
  expect(BORDER_STYLE.OPAQUE_BOX).toBe(3)
})

test('CAPTIONS_ALIGNMENT has CENTER_RIGHT=11', () => {
  expect(CAPTIONS_ALIGNMENT.CENTER_RIGHT).toBe(11)
})

test('KALTURA_OBJECT_TYPES has overlay and replaceBackground', () => {
  expect(KALTURA_OBJECT_TYPES.OVERLAY).toBe('KalturaOverlayAttributes')
  expect(KALTURA_OBJECT_TYPES.REPLACE_BACKGROUND).toBe('KalturaReplaceBackgroundAttributes')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './kaltura'"

- [ ] **Step 3: Create the constants file**

Create `src/constants/kaltura.js`:

```js
// KalturaMediaCompositionAlignment — confirmed from transcript; verify exact ints against server enum file
export const OVERLAY_PLACEMENT = {
  CENTER_RIGHT: 'CENTER_RIGHT',
  CENTER_LEFT: 'CENTER_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  TOP_LEFT: 'TOP_LEFT',
  TOP_CENTER: 'TOP_CENTER',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_CENTER: 'BOTTOM_CENTER',
  CENTER_CENTER: 'CENTER_CENTER',
}

// KalturaOverlayShape — confirm exact values from server enum file
export const OVERLAY_SHAPE = {
  RECTANGLE: 'RECTANGLE',
  RECTANGLE_ROUNDED: 'RECTANGLE_ROUNDED',
}

export const EFFECT_TYPE = {
  VIDEO_FADE_IN: 1,
  VIDEO_FADE_OUT: 2,
}

export const BORDER_STYLE = {
  OUTLINE_WITH_SHADOW: 1,
  OPAQUE_BOX: 3,
}

export const CAPTIONS_ALIGNMENT = {
  BOTTOM_LEFT: 1,
  BOTTOM_CENTER: 2,
  BOTTOM_RIGHT: 3,
  TOP_LEFT: 4,
  TOP_CENTER: 6,
  TOP_RIGHT: 7,
  CENTER_LEFT: 8,
  CENTER_CENTER: 10,
  CENTER_RIGHT: 11,
}

export const CHAPTER_NAME_POLICY = {
  BY_ENTRY_ID: 1,
  BY_ENTRY_NAME: 2,
  NUMERICAL: 3,
}

export const KALTURA_OBJECT_TYPES = {
  OVERLAY: 'KalturaOverlayAttributes',
  REPLACE_BACKGROUND: 'KalturaReplaceBackgroundAttributes',
  RENDER_CAPTION: 'KalturaRenderCaptionAttributes',
  EFFECT: 'KalturaEffect',
  ENTRY_RESOURCE: 'KalturaEntryResource',
  OPERATION_RESOURCES: 'KalturaOperationResources',
  OPERATION_RESOURCE: 'KalturaOperationResource',
  CLIP_ATTRIBUTES: 'KalturaClipAttributes',
}

export const KALTURA_DEFAULTS = {
  MARGINS_PERCENTAGE: 0.074,
  AUDIO_VOLUME: 1,
  SCALE_WIDTH: 0.48,
  SCALE_HEIGHT: 0.85,
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/constants/
git commit -m "feat: add Kaltura enums and object type constants"
```

---

### Task 3: API Module

**Files:**
- Create: `src/api/kaltura.js`
- Create: `src/api/kaltura.test.js`

**Interfaces:**
- Consumes: `KALTURA_OBJECT_TYPES` from `src/constants/kaltura.js`
- Produces:
  - `buildPayload(config, clips)` → plain object matching Kaltura REST multipart params
  - `addContent(serviceUrl, ks, targetEntryId, clips)` → `Promise<object>` (raw Kaltura response)
  - `getEntry(serviceUrl, ks, entryId)` → `Promise<object>`

- [ ] **Step 1: Write failing tests**

Create `src/api/kaltura.test.js`:

```js
import { buildPayload } from './kaltura'
import { KALTURA_OBJECT_TYPES } from '../constants/kaltura'

const minimalClip = {
  background: { entryId: 'e_abc', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
  overlays: [],
  replaceBackground: null,
  effects: [],
  captions: null,
}

test('buildPayload includes ks and targetEntryId', () => {
  const payload = buildPayload('myks', 'e_target', [minimalClip])
  expect(payload['ks']).toBe('myks')
  expect(payload['entryId']).toBe('e_target')
})

test('buildPayload sets background entryId on operationResource', () => {
  const payload = buildPayload('myks', 'e_target', [minimalClip])
  expect(payload['resource[resources][0][resource][entryId]']).toBe('e_abc')
})

test('buildPayload sets objectType on operationResources', () => {
  const payload = buildPayload('myks', 'e_target', [minimalClip])
  expect(payload['resource[objectType]']).toBe(KALTURA_OBJECT_TYPES.OPERATION_RESOURCES)
})

test('buildPayload includes overlay when present', () => {
  const clip = {
    ...minimalClip,
    overlays: [{
      entryId: 'e_ov1',
      placement: 'CENTER_RIGHT',
      shape: 'RECTANGLE',
      scaleBehavior: 'fit',
      scaleWidth: 0.48,
      scaleHeight: 0.85,
      marginWidth: 0.074,
      marginHeight: 0.074,
      audioVolume: 1,
      replaceBackground: null,
    }],
  }
  const payload = buildPayload('ks', 'e_t', [clip])
  const prefix = 'resource[resources][0][operationAttributes][0][mediaCompositionAttributesArray][0]'
  expect(payload[`${prefix}[objectType]`]).toBe(KALTURA_OBJECT_TYPES.OVERLAY)
  expect(payload[`${prefix}[resource][entryId]`]).toBe('e_ov1')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './kaltura'"

- [ ] **Step 3: Implement buildPayload**

Create `src/api/kaltura.js`:

```js
import { KALTURA_OBJECT_TYPES } from '../constants/kaltura'

export function buildPayload(ks, targetEntryId, clips) {
  const p = {}
  p['ks'] = ks
  p['entryId'] = targetEntryId
  p['resource[objectType]'] = KALTURA_OBJECT_TYPES.OPERATION_RESOURCES

  clips.forEach((clip, ci) => {
    const rp = `resource[resources][${ci}]`
    p[`${rp}[objectType]`] = KALTURA_OBJECT_TYPES.OPERATION_RESOURCE
    p[`${rp}[resource][objectType]`] = KALTURA_OBJECT_TYPES.ENTRY_RESOURCE
    p[`${rp}[resource][entryId]`] = clip.background.entryId

    if (clip.background.flavorParamsId) p[`${rp}[resource][flavorParamsId]`] = clip.background.flavorParamsId

    p[`${rp}[operationAttributes][0][objectType]`] = KALTURA_OBJECT_TYPES.CLIP_ATTRIBUTES

    const ap = `${rp}[operationAttributes][0]`
    if (clip.background.offset !== '') p[`${ap}[offset]`] = clip.background.offset
    if (clip.background.duration !== '') p[`${ap}[duration]`] = clip.background.duration
    if (clip.background.globalOffsetInDestination !== '') p[`${ap}[globalOffsetInDestination]`] = clip.background.globalOffsetInDestination
    if (clip.background.cropAlignment !== '') p[`${ap}[cropAlignment]`] = clip.background.cropAlignment

    // Effects
    clip.effects.forEach((effect, ei) => {
      const ep = `${ap}[effectArray][${ei}]`
      p[`${ep}[effectType]`] = effect.effectType
      if (effect.value) p[`${ep}[value]`] = effect.value
    })

    // Captions
    if (clip.captions) {
      const cp = `${ap}[captionAttributes][0]`
      p[`${cp}[objectType]`] = KALTURA_OBJECT_TYPES.RENDER_CAPTION
      const c = clip.captions
      if (c.captionAssetId) p[`${cp}[captionAssetId]`] = c.captionAssetId
      if (c.fontName) p[`${cp}[fontName]`] = c.fontName
      if (c.fontSize) p[`${cp}[fontSize]`] = c.fontSize
      if (c.primaryColour) p[`${cp}[primaryColour]`] = c.primaryColour
      if (c.outlineColour) p[`${cp}[outlineColour]`] = c.outlineColour
      if (c.backColour) p[`${cp}[backColour]`] = c.backColour
      if (c.borderStyle) p[`${cp}[borderStyle]`] = c.borderStyle
      if (c.shadow !== undefined && c.shadow !== '') p[`${cp}[shadow]`] = c.shadow
      if (c.bold) p[`${cp}[bold]`] = 1
      if (c.italic) p[`${cp}[italic]`] = 1
      if (c.underline) p[`${cp}[underline]`] = 1
      if (c.alignment) p[`${cp}[alignment]`] = c.alignment
    }

    // mediaCompositionAttributesArray: overlays + replaceBackground
    let mcIdx = 0

    clip.overlays.forEach((ov) => {
      const mp = `${ap}[mediaCompositionAttributesArray][${mcIdx}]`
      mcIdx++
      p[`${mp}[objectType]`] = KALTURA_OBJECT_TYPES.OVERLAY
      p[`${mp}[resource][objectType]`] = KALTURA_OBJECT_TYPES.ENTRY_RESOURCE
      p[`${mp}[resource][entryId]`] = ov.entryId
      if (ov.placement) p[`${mp}[overlayPlacement]`] = ov.placement
      if (ov.shape) p[`${mp}[overlayShape]`] = ov.shape
      p[`${mp}[overlayScaleAttribute][scaleBehavior]`] = ov.scaleBehavior || 'fit'
      p[`${mp}[overlayScaleAttribute][scalePercentage][widthPercentage]`] = ov.scaleWidth ?? 0.48
      p[`${mp}[overlayScaleAttribute][scalePercentage][heightPercentage]`] = ov.scaleHeight ?? 0.85
      p[`${mp}[marginsPercentage][widthPercentage]`] = ov.marginWidth ?? 0.074
      p[`${mp}[marginsPercentage][heightPercentage]`] = ov.marginHeight ?? 0.074
      p[`${mp}[audioAttributes][volume]`] = ov.audioVolume ?? 1

      if (ov.replaceBackground) {
        const rbp = `${mp}[resourceMediaCompositionAttributesArray][0]`
        p[`${rbp}[objectType]`] = KALTURA_OBJECT_TYPES.REPLACE_BACKGROUND
        p[`${rbp}[resource][objectType]`] = KALTURA_OBJECT_TYPES.ENTRY_RESOURCE
        p[`${rbp}[resource][entryId]`] = ov.replaceBackground.entryId
        if (ov.replaceBackground.backgroundColorCode) p[`${rbp}[backgroundColorCode]`] = ov.replaceBackground.backgroundColorCode
        if (ov.replaceBackground.foregroundScalePercentage !== '') p[`${rbp}[foregroundScalePercentage]`] = ov.replaceBackground.foregroundScalePercentage
        if (ov.replaceBackground.foregroundPositionX !== '') p[`${rbp}[foregroundPositionPercentage][x]`] = ov.replaceBackground.foregroundPositionX
        if (ov.replaceBackground.foregroundPositionY !== '') p[`${rbp}[foregroundPositionPercentage][y]`] = ov.replaceBackground.foregroundPositionY
        if (ov.replaceBackground.audioVolume !== '') p[`${rbp}[audioAttributes][volume]`] = ov.replaceBackground.audioVolume
      }
    })

    if (clip.replaceBackground) {
      const mp = `${ap}[mediaCompositionAttributesArray][${mcIdx}]`
      p[`${mp}[objectType]`] = KALTURA_OBJECT_TYPES.REPLACE_BACKGROUND
      p[`${mp}[resource][objectType]`] = KALTURA_OBJECT_TYPES.ENTRY_RESOURCE
      p[`${mp}[resource][entryId]`] = clip.replaceBackground.entryId
      if (clip.replaceBackground.backgroundColorCode) p[`${mp}[backgroundColorCode]`] = clip.replaceBackground.backgroundColorCode
      if (clip.replaceBackground.foregroundScalePercentage !== '') p[`${mp}[foregroundScalePercentage]`] = clip.replaceBackground.foregroundScalePercentage
      if (clip.replaceBackground.foregroundPositionX !== '') p[`${mp}[foregroundPositionPercentage][x]`] = clip.replaceBackground.foregroundPositionX
      if (clip.replaceBackground.foregroundPositionY !== '') p[`${mp}[foregroundPositionPercentage][y]`] = clip.replaceBackground.foregroundPositionY
      if (clip.replaceBackground.audioVolume !== '') p[`${mp}[audioAttributes][volume]`] = clip.replaceBackground.audioVolume
    }
  })

  return p
}

export async function addContent(serviceUrl, ks, targetEntryId, clips) {
  const payload = buildPayload(ks, targetEntryId, clips)
  const body = new URLSearchParams(payload)
  const url = `${serviceUrl}/api_v3/service/baseEntry/action/addContent`
  const res = await fetch(url, { method: 'POST', body })
  return res.json()
}

export async function getEntry(serviceUrl, ks, entryId) {
  const body = new URLSearchParams({ ks, entryId })
  const url = `${serviceUrl}/api_v3/service/baseEntry/action/get`
  const res = await fetch(url, { method: 'POST', body })
  return res.json()
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/api/
git commit -m "feat: add Kaltura API module with buildPayload, addContent, getEntry"
```

---

### Task 4: usePolling Hook

**Files:**
- Create: `src/hooks/usePolling.js`
- Create: `src/hooks/usePolling.test.js`

**Interfaces:**
- Produces: `usePolling(fn, intervalMs, enabled)` — calls `fn()` every `intervalMs` while `enabled` is true; stops when `fn` returns a truthy `done` flag or `enabled` becomes false

- [ ] **Step 1: Write failing tests**

Create `src/hooks/usePolling.test.js`:

```js
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import usePolling from './usePolling'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('calls fn on interval while enabled', async () => {
  const fn = vi.fn().mockResolvedValue({ done: false })
  renderHook(() => usePolling(fn, 1000, true))
  expect(fn).not.toHaveBeenCalled()
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(1)
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(2)
})

test('does not call fn when disabled', async () => {
  const fn = vi.fn().mockResolvedValue({ done: false })
  renderHook(() => usePolling(fn, 1000, false))
  await act(() => vi.advanceTimersByTimeAsync(2000))
  expect(fn).not.toHaveBeenCalled()
})

test('stops polling when fn returns done: true', async () => {
  let calls = 0
  const fn = vi.fn().mockImplementation(async () => {
    calls++
    return { done: calls >= 2 }
  })
  renderHook(() => usePolling(fn, 1000, true))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(2)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './usePolling'"

- [ ] **Step 3: Implement the hook**

Create `src/hooks/usePolling.js`:

```js
import { useEffect, useRef } from 'react'

export default function usePolling(fn, intervalMs, enabled) {
  const doneRef = useRef(false)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) return
    doneRef.current = false

    const id = setInterval(async () => {
      if (doneRef.current) return
      const result = await fnRef.current()
      if (result?.done) {
        doneRef.current = true
        clearInterval(id)
      }
    }, intervalMs)

    return () => clearInterval(id)
  }, [enabled, intervalMs])
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add usePolling hook"
```

---

### Task 5: App State & ConfigBar

**Files:**
- Create: `src/components/ConfigBar.jsx`
- Create: `src/components/ConfigBar.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces:
  - `ConfigBar({ config, onChange })` where `config = { ks, serviceUrl, targetEntryId, targetWidth, targetHeight }`
  - `App` top-level state shape:
    ```js
    config = { ks: '', serviceUrl: 'https://www.kaltura.com', targetEntryId: '', targetWidth: '', targetHeight: '' }
    clips = [ /* array of clip objects — shape defined in Task 6 */ ]
    submission = null | { status: 'submitting'|'converting'|'ready'|'error', response: object, entryId: string }
    ```

- [ ] **Step 1: Write failing tests**

Create `src/components/ConfigBar.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfigBar from './ConfigBar'

const defaultConfig = { ks: '', serviceUrl: 'https://www.kaltura.com', targetEntryId: '', targetWidth: '', targetHeight: '' }

test('renders KS input, service URL, target entry ID, and resolution fields', () => {
  render(<ConfigBar config={defaultConfig} onChange={() => {}} />)
  expect(screen.getByLabelText(/KS Token/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Service URL/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Target Entry ID/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Width/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
})

test('calls onChange with updated field when user types', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ConfigBar config={defaultConfig} onChange={onChange} />)
  await user.clear(screen.getByLabelText(/KS Token/i))
  await user.type(screen.getByLabelText(/KS Token/i), 'myks')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ ks: 'myks' }))
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "Cannot find module './ConfigBar'"

- [ ] **Step 3: Implement ConfigBar**

Create `src/components/ConfigBar.jsx`:

```jsx
export default function ConfigBar({ config, onChange }) {
  const update = (key) => (e) => onChange({ ...config, [key]: e.target.value })
  return (
    <div className="config-bar">
      <div className="field">
        <label htmlFor="ks">KS Token</label>
        <input id="ks" value={config.ks} onChange={update('ks')} placeholder="Paste your Kaltura session token" />
      </div>
      <div className="field">
        <label htmlFor="serviceUrl">Service URL</label>
        <input id="serviceUrl" value={config.serviceUrl} onChange={update('serviceUrl')} />
      </div>
      <div className="field">
        <label htmlFor="targetEntryId">Target Entry ID</label>
        <input id="targetEntryId" value={config.targetEntryId} onChange={update('targetEntryId')} placeholder="Draft entry ID" />
      </div>
      <div className="field field--inline">
        <label htmlFor="targetWidth">Width</label>
        <input id="targetWidth" type="number" value={config.targetWidth} onChange={update('targetWidth')} placeholder="1920" />
        <label htmlFor="targetHeight">Height</label>
        <input id="targetHeight" type="number" value={config.targetHeight} onChange={update('targetHeight')} placeholder="1080" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update App.jsx with full state**

```jsx
import { useState } from 'react'
import ConfigBar from './components/ConfigBar'
import './App.css'

function makeClip() {
  return {
    id: crypto.randomUUID(),
    background: { entryId: '', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
    overlays: [],
    replaceBackground: null,
    effects: [],
    captions: null,
  }
}

export default function App() {
  const [config, setConfig] = useState({
    ks: '',
    serviceUrl: 'https://www.kaltura.com',
    targetEntryId: '',
    targetWidth: '',
    targetHeight: '',
  })
  const [clips, setClips] = useState([makeClip()])
  const [submission, setSubmission] = useState(null)

  return (
    <div className="app">
      <h1>baseEntry.addContent Tool</h1>
      <ConfigBar config={config} onChange={setConfig} />
      <pre style={{ fontSize: 11, marginTop: 16 }}>{JSON.stringify({ config, clips }, null, 2)}</pre>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — 2 ConfigBar tests + prior tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/ConfigBar.jsx src/components/ConfigBar.test.jsx src/App.jsx
git commit -m "feat: add ConfigBar component and App state shape"
```

---

### Task 6: Clip Card & Section Scaffolding

**Files:**
- Create: `src/components/ClipCard.jsx`
- Create: `src/components/ClipCard.test.jsx`
- Create: `src/components/sections/BackgroundSection.jsx`
- Create: `src/components/sections/BackgroundSection.test.jsx`

**Interfaces:**
- Consumes: clip object shape from Task 5's `makeClip()`
- Produces:
  - `ClipCard({ clip, index, onChange, onRemove, targetWidth, targetHeight })` — renders a card with collapsible section placeholders
  - `BackgroundSection({ background, onChange, errors })` — renders KalturaEntryResource fields

- [ ] **Step 1: Write failing tests**

Create `src/components/ClipCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClipCard from './ClipCard'

const clip = {
  id: '1',
  background: { entryId: 'e_abc', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
  overlays: [], replaceBackground: null, effects: [], captions: null,
}

test('renders clip number heading', () => {
  render(<ClipCard clip={clip} index={0} onChange={() => {}} onRemove={() => {}} targetWidth="" targetHeight="" />)
  expect(screen.getByText(/Clip 1/i)).toBeInTheDocument()
})

test('calls onRemove when Remove button clicked', async () => {
  const user = userEvent.setup()
  const onRemove = vi.fn()
  render(<ClipCard clip={clip} index={0} onChange={() => {}} onRemove={onRemove} targetWidth="" targetHeight="" />)
  await user.click(screen.getByRole('button', { name: /remove/i }))
  expect(onRemove).toHaveBeenCalled()
})
```

Create `src/components/sections/BackgroundSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackgroundSection from './BackgroundSection'

const bg = { entryId: '', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' }

test('renders entry ID field', () => {
  render(<BackgroundSection background={bg} onChange={() => {}} errors={{}} />)
  expect(screen.getByLabelText(/Entry ID/i)).toBeInTheDocument()
})

test('calls onChange with updated entryId', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<BackgroundSection background={bg} onChange={onChange} errors={{}} />)
  await user.type(screen.getByLabelText(/Entry ID/i), 'e_xyz')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entryId: 'e_xyz' }))
})

test('shows error message when errors.entryId is set', () => {
  render(<BackgroundSection background={bg} onChange={() => {}} errors={{ entryId: 'Required' }} />)
  expect(screen.getByText('Required')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Create BackgroundSection**

Create `src/components/sections/BackgroundSection.jsx`:

```jsx
export default function BackgroundSection({ background, onChange, errors }) {
  const update = (key) => (e) => onChange({ ...background, [key]: e.target.value })
  return (
    <div className="section-fields">
      <div className="field">
        <label htmlFor="bg-entryId">Entry ID *</label>
        <input id="bg-entryId" value={background.entryId} onChange={update('entryId')} placeholder="e_xxxx" />
        {errors?.entryId && <span className="error">{errors.entryId}</span>}
      </div>
      <div className="field">
        <label htmlFor="bg-flavorParamsId">Flavor Params ID</label>
        <input id="bg-flavorParamsId" type="number" value={background.flavorParamsId} onChange={update('flavorParamsId')} />
      </div>
      <div className="field">
        <label htmlFor="bg-offset">Offset (ms)</label>
        <input id="bg-offset" type="number" value={background.offset} onChange={update('offset')} />
      </div>
      <div className="field">
        <label htmlFor="bg-duration">Duration (ms)</label>
        <input id="bg-duration" type="number" value={background.duration} onChange={update('duration')} />
      </div>
      <div className="field">
        <label htmlFor="bg-globalOffset">Global Offset in Destination (ms)</label>
        <input id="bg-globalOffset" type="number" value={background.globalOffsetInDestination} onChange={update('globalOffsetInDestination')} />
      </div>
      <div className="field">
        <label htmlFor="bg-cropAlignment">Crop Alignment (0–100)</label>
        <input id="bg-cropAlignment" type="number" min="0" max="100" value={background.cropAlignment} onChange={update('cropAlignment')} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ClipCard**

Create `src/components/ClipCard.jsx`:

```jsx
import { useState } from 'react'
import BackgroundSection from './sections/BackgroundSection'

function CollapsibleSection({ title, badge, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="collapsible">
      <button type="button" className="collapsible-header" onClick={() => setOpen(o => !o)}>
        <span>{title}{badge ? ` (${badge})` : ''}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  )
}

export default function ClipCard({ clip, index, onChange, onRemove, targetWidth, targetHeight, errors = {} }) {
  const updateBackground = (bg) => onChange({ ...clip, background: bg })

  return (
    <div className="clip-card">
      <div className="clip-card-header">
        <strong>Clip {index + 1}</strong>
        <button type="button" onClick={onRemove}>Remove</button>
      </div>
      <CollapsibleSection title="Background" badge={clip.background.entryId ? 1 : 0}>
        <BackgroundSection background={clip.background} onChange={updateBackground} errors={errors.background || {}} />
      </CollapsibleSection>
      <CollapsibleSection title="Overlays" badge={clip.overlays.length}>
        <p style={{ color: '#888', padding: 8 }}>Overlays — coming in next task</p>
      </CollapsibleSection>
      <CollapsibleSection title="Replace Background" badge={clip.replaceBackground ? 1 : 0}>
        <p style={{ color: '#888', padding: 8 }}>Replace Background — coming in next task</p>
      </CollapsibleSection>
      <CollapsibleSection title="Effects" badge={clip.effects.length}>
        <p style={{ color: '#888', padding: 8 }}>Effects — coming in next task</p>
      </CollapsibleSection>
      <CollapsibleSection title="Captions" badge={clip.captions ? 1 : 0}>
        <p style={{ color: '#888', padding: 8 }}>Captions — coming in next task</p>
      </CollapsibleSection>
    </div>
  )
}
```

- [ ] **Step 5: Wire ClipCard into App.jsx**

Replace the `<pre>` debug block in `App.jsx` with:

```jsx
import ClipCard from './components/ClipCard'

// inside return, replace <pre>:
<div className="clips">
  {clips.map((clip, i) => (
    <ClipCard
      key={clip.id}
      clip={clip}
      index={i}
      onChange={(updated) => setClips(clips.map((c) => c.id === updated.id ? updated : c))}
      onRemove={() => setClips(clips.filter((c) => c.id !== clip.id))}
      targetWidth={config.targetWidth}
      targetHeight={config.targetHeight}
    />
  ))}
</div>
<button type="button" onClick={() => setClips([...clips, makeClip()])}>+ Add Clip</button>
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS — all prior + 5 new tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add ClipCard with collapsible sections and BackgroundSection"
```

---

### Task 7: Remaining Section Components

**Files:**
- Create: `src/components/sections/OverlaysSection.jsx`
- Create: `src/components/sections/OverlayRow.jsx`
- Create: `src/components/sections/OverlayRow.test.jsx`
- Create: `src/components/sections/ReplaceBackgroundSection.jsx`
- Create: `src/components/sections/ReplaceBackgroundSection.test.jsx`
- Create: `src/components/sections/EffectsSection.jsx`
- Create: `src/components/sections/EffectsSection.test.jsx`
- Create: `src/components/sections/CaptionsSection.jsx`
- Create: `src/components/sections/CaptionsSection.test.jsx`
- Modify: `src/components/ClipCard.jsx`

**Interfaces:**
- Consumes: `OVERLAY_PLACEMENT`, `OVERLAY_SHAPE`, `EFFECT_TYPE`, `BORDER_STYLE`, `CAPTIONS_ALIGNMENT` from `src/constants/kaltura.js`
- Produces:
  - `OverlayRow({ overlay, index, onChange, onRemove })` where `overlay = { entryId, placement, shape, scaleBehavior, scaleWidth, scaleHeight, marginWidth, marginHeight, audioVolume, replaceBackground }`
  - `OverlaysSection({ overlays, onChange })` — add/remove overlay rows
  - `ReplaceBackgroundSection({ replaceBackground, onChange })` where `replaceBackground = null | { entryId, backgroundColorCode, foregroundScalePercentage, foregroundPositionX, foregroundPositionY, audioVolume }`
  - `EffectsSection({ effects, onChange })` where each effect = `{ effectType, value }`
  - `CaptionsSection({ captions, onChange })` where `captions = null | { captionAssetId, fontName, fontSize, primaryColour, outlineColour, backColour, borderStyle, shadow, bold, italic, underline, alignment }`

- [ ] **Step 1: Write failing tests**

Create `src/components/sections/OverlayRow.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OverlayRow from './OverlayRow'

const ov = { entryId: '', placement: 'CENTER_RIGHT', shape: 'RECTANGLE', scaleBehavior: 'fit',
  scaleWidth: 0.48, scaleHeight: 0.85, marginWidth: 0.074, marginHeight: 0.074, audioVolume: 1, replaceBackground: null }

test('renders entryId input and placement select', () => {
  render(<OverlayRow overlay={ov} index={0} onChange={() => {}} onRemove={() => {}} />)
  expect(screen.getByLabelText(/Entry ID/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Placement/i)).toBeInTheDocument()
})

test('calls onChange when entryId changes', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<OverlayRow overlay={ov} index={0} onChange={onChange} onRemove={() => {}} />)
  await user.type(screen.getByLabelText(/Entry ID/i), 'e_ov')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entryId: 'e_ov' }))
})
```

Create `src/components/sections/ReplaceBackgroundSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReplaceBackgroundSection from './ReplaceBackgroundSection'

test('renders enable checkbox when replaceBackground is null', () => {
  render(<ReplaceBackgroundSection replaceBackground={null} onChange={() => {}} />)
  expect(screen.getByLabelText(/Enable Replace Background/i)).toBeInTheDocument()
})

test('enabling creates replaceBackground object', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ReplaceBackgroundSection replaceBackground={null} onChange={onChange} />)
  await user.click(screen.getByLabelText(/Enable Replace Background/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ entryId: '' }))
})
```

Create `src/components/sections/EffectsSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EffectsSection from './EffectsSection'

test('renders Add Effect button', () => {
  render(<EffectsSection effects={[]} onChange={() => {}} />)
  expect(screen.getByRole('button', { name: /add effect/i })).toBeInTheDocument()
})

test('clicking Add Effect appends an effect row', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<EffectsSection effects={[]} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: /add effect/i }))
  expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ effectType: 1 })])
})
```

Create `src/components/sections/CaptionsSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CaptionsSection from './CaptionsSection'

test('renders enable checkbox when captions is null', () => {
  render(<CaptionsSection captions={null} onChange={() => {}} />)
  expect(screen.getByLabelText(/Enable Captions/i)).toBeInTheDocument()
})

test('enabling creates captions object with empty fields', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<CaptionsSection captions={null} onChange={onChange} />)
  await user.click(screen.getByLabelText(/Enable Captions/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ captionAssetId: '' }))
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement OverlayRow**

Create `src/components/sections/OverlayRow.jsx`:

```jsx
import { OVERLAY_PLACEMENT, OVERLAY_SHAPE } from '../../constants/kaltura'

export default function OverlayRow({ overlay, index, onChange, onRemove }) {
  const update = (key) => (e) => onChange({ ...overlay, [key]: e.target.value })
  const updateNum = (key) => (e) => onChange({ ...overlay, [key]: parseFloat(e.target.value) })

  return (
    <div className="overlay-row">
      <div className="field">
        <label htmlFor={`ov-${index}-entryId`}>Entry ID</label>
        <input id={`ov-${index}-entryId`} value={overlay.entryId} onChange={update('entryId')} placeholder="e_xxxx" />
      </div>
      <div className="field">
        <label htmlFor={`ov-${index}-placement`}>Placement</label>
        <select id={`ov-${index}-placement`} value={overlay.placement} onChange={update('placement')}>
          {Object.keys(OVERLAY_PLACEMENT).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`ov-${index}-shape`}>Shape</label>
        <select id={`ov-${index}-shape`} value={overlay.shape} onChange={update('shape')}>
          {Object.keys(OVERLAY_SHAPE).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`ov-${index}-scaleBehavior`}>Scale Behavior</label>
        <select id={`ov-${index}-scaleBehavior`} value={overlay.scaleBehavior} onChange={update('scaleBehavior')}>
          <option value="fit">Fit</option>
          <option value="fill">Fill</option>
        </select>
      </div>
      <div className="field field--inline">
        <label htmlFor={`ov-${index}-scaleWidth`}>Scale Width %</label>
        <input id={`ov-${index}-scaleWidth`} type="number" step="0.01" min="0" max="1" value={overlay.scaleWidth} onChange={updateNum('scaleWidth')} />
        <label htmlFor={`ov-${index}-scaleHeight`}>Scale Height %</label>
        <input id={`ov-${index}-scaleHeight`} type="number" step="0.01" min="0" max="1" value={overlay.scaleHeight} onChange={updateNum('scaleHeight')} />
      </div>
      <div className="field field--inline">
        <label htmlFor={`ov-${index}-marginWidth`}>Margin Width %</label>
        <input id={`ov-${index}-marginWidth`} type="number" step="0.001" min="0" max="1" value={overlay.marginWidth} onChange={updateNum('marginWidth')} />
        <label htmlFor={`ov-${index}-marginHeight`}>Margin Height %</label>
        <input id={`ov-${index}-marginHeight`} type="number" step="0.001" min="0" max="1" value={overlay.marginHeight} onChange={updateNum('marginHeight')} />
      </div>
      <div className="field">
        <label htmlFor={`ov-${index}-audio`}>Audio Volume (0–2)</label>
        <input id={`ov-${index}-audio`} type="number" step="0.1" min="0" max="2" value={overlay.audioVolume} onChange={updateNum('audioVolume')} />
      </div>
      <button type="button" onClick={onRemove}>Remove Overlay</button>
    </div>
  )
}
```

- [ ] **Step 4: Implement OverlaysSection**

Create `src/components/sections/OverlaysSection.jsx`:

```jsx
import { KALTURA_DEFAULTS } from '../../constants/kaltura'
import OverlayRow from './OverlayRow'

function makeOverlay() {
  return {
    entryId: '',
    placement: 'CENTER_RIGHT',
    shape: 'RECTANGLE',
    scaleBehavior: 'fit',
    scaleWidth: KALTURA_DEFAULTS.SCALE_WIDTH,
    scaleHeight: KALTURA_DEFAULTS.SCALE_HEIGHT,
    marginWidth: KALTURA_DEFAULTS.MARGINS_PERCENTAGE,
    marginHeight: KALTURA_DEFAULTS.MARGINS_PERCENTAGE,
    audioVolume: KALTURA_DEFAULTS.AUDIO_VOLUME,
    replaceBackground: null,
  }
}

export default function OverlaysSection({ overlays, onChange }) {
  const add = () => onChange([...overlays, makeOverlay()])
  const remove = (i) => onChange(overlays.filter((_, idx) => idx !== i))
  const update = (i, ov) => onChange(overlays.map((o, idx) => idx === i ? ov : o))

  return (
    <div>
      {overlays.map((ov, i) => (
        <OverlayRow key={i} overlay={ov} index={i} onChange={(updated) => update(i, updated)} onRemove={() => remove(i)} />
      ))}
      <button type="button" onClick={add}>+ Add Overlay</button>
    </div>
  )
}
```

- [ ] **Step 5: Implement ReplaceBackgroundSection**

Create `src/components/sections/ReplaceBackgroundSection.jsx`:

```jsx
function makeReplaceBackground() {
  return { entryId: '', backgroundColorCode: '', foregroundScalePercentage: '', foregroundPositionX: '', foregroundPositionY: '', audioVolume: '' }
}

export default function ReplaceBackgroundSection({ replaceBackground, onChange }) {
  const update = (key) => (e) => onChange({ ...replaceBackground, [key]: e.target.value })
  const enabled = replaceBackground !== null

  return (
    <div>
      <div className="field">
        <label htmlFor="rb-enable">
          <input id="rb-enable" type="checkbox" checked={enabled}
            onChange={(e) => onChange(e.target.checked ? makeReplaceBackground() : null)} />
          {' '}Enable Replace Background
        </label>
      </div>
      {enabled && (
        <div className="section-fields">
          <div className="field">
            <label htmlFor="rb-entryId">Resource Entry ID</label>
            <input id="rb-entryId" value={replaceBackground.entryId} onChange={update('entryId')} placeholder="e_xxxx" />
          </div>
          <div className="field">
            <label htmlFor="rb-colorCode">Background Color Code (0xRRGGBB)</label>
            <input id="rb-colorCode" value={replaceBackground.backgroundColorCode} onChange={update('backgroundColorCode')} placeholder="0xFF0000" />
          </div>
          <div className="field">
            <label htmlFor="rb-fgScale">Foreground Scale % (0–5)</label>
            <input id="rb-fgScale" type="number" step="0.1" min="0" max="5" value={replaceBackground.foregroundScalePercentage} onChange={update('foregroundScalePercentage')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="rb-fgX">Foreground Position X (0–1)</label>
            <input id="rb-fgX" type="number" step="0.01" min="0" max="1" value={replaceBackground.foregroundPositionX} onChange={update('foregroundPositionX')} />
            <label htmlFor="rb-fgY">Y (0–1)</label>
            <input id="rb-fgY" type="number" step="0.01" min="0" max="1" value={replaceBackground.foregroundPositionY} onChange={update('foregroundPositionY')} />
          </div>
          <div className="field">
            <label htmlFor="rb-audio">Audio Volume (0–2)</label>
            <input id="rb-audio" type="number" step="0.1" min="0" max="2" value={replaceBackground.audioVolume} onChange={update('audioVolume')} />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Implement EffectsSection**

Create `src/components/sections/EffectsSection.jsx`:

```jsx
import { EFFECT_TYPE } from '../../constants/kaltura'

export default function EffectsSection({ effects, onChange }) {
  const add = () => onChange([...effects, { effectType: EFFECT_TYPE.VIDEO_FADE_IN, value: '' }])
  const remove = (i) => onChange(effects.filter((_, idx) => idx !== i))
  const update = (i, key) => (e) => onChange(effects.map((ef, idx) => idx === i ? { ...ef, [key]: e.target.value } : ef))

  return (
    <div>
      {effects.map((ef, i) => (
        <div key={i} className="effect-row">
          <div className="field">
            <label htmlFor={`ef-${i}-type`}>Effect Type</label>
            <select id={`ef-${i}-type`} value={ef.effectType} onChange={update(i, 'effectType')}>
              {Object.entries(EFFECT_TYPE).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`ef-${i}-value`}>Value</label>
            <input id={`ef-${i}-value`} value={ef.value} onChange={update(i, 'value')} />
          </div>
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={add}>+ Add Effect</button>
    </div>
  )
}
```

- [ ] **Step 7: Implement CaptionsSection**

Create `src/components/sections/CaptionsSection.jsx`:

```jsx
import { BORDER_STYLE, CAPTIONS_ALIGNMENT } from '../../constants/kaltura'

function makeCaptions() {
  return { captionAssetId: '', fontName: '', fontSize: '', primaryColour: '', outlineColour: '', backColour: '',
    borderStyle: '', shadow: '', bold: false, italic: false, underline: false, alignment: '' }
}

export default function CaptionsSection({ captions, onChange }) {
  const enabled = captions !== null
  const update = (key) => (e) => onChange({ ...captions, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <div>
      <div className="field">
        <label htmlFor="cap-enable">
          <input id="cap-enable" type="checkbox" checked={enabled}
            onChange={(e) => onChange(e.target.checked ? makeCaptions() : null)} />
          {' '}Enable Captions
        </label>
      </div>
      {enabled && (
        <div className="section-fields">
          <div className="field">
            <label htmlFor="cap-assetId">Caption Asset ID</label>
            <input id="cap-assetId" value={captions.captionAssetId} onChange={update('captionAssetId')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="cap-fontName">Font Name</label>
            <input id="cap-fontName" value={captions.fontName} onChange={update('fontName')} />
            <label htmlFor="cap-fontSize">Font Size</label>
            <input id="cap-fontSize" type="number" value={captions.fontSize} onChange={update('fontSize')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="cap-primary">Primary Colour</label>
            <input id="cap-primary" value={captions.primaryColour} onChange={update('primaryColour')} placeholder="&H00FFFFFF" />
            <label htmlFor="cap-outline">Outline</label>
            <input id="cap-outline" value={captions.outlineColour} onChange={update('outlineColour')} />
            <label htmlFor="cap-back">Back</label>
            <input id="cap-back" value={captions.backColour} onChange={update('backColour')} />
          </div>
          <div className="field">
            <label htmlFor="cap-borderStyle">Border Style</label>
            <select id="cap-borderStyle" value={captions.borderStyle} onChange={update('borderStyle')}>
              <option value="">None</option>
              {Object.entries(BORDER_STYLE).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cap-shadow">Shadow</label>
            <input id="cap-shadow" type="number" value={captions.shadow} onChange={update('shadow')} />
          </div>
          <div className="field field--inline">
            <label><input type="checkbox" checked={captions.bold} onChange={update('bold')} /> Bold</label>
            <label><input type="checkbox" checked={captions.italic} onChange={update('italic')} /> Italic</label>
            <label><input type="checkbox" checked={captions.underline} onChange={update('underline')} /> Underline</label>
          </div>
          <div className="field">
            <label htmlFor="cap-alignment">Alignment</label>
            <select id="cap-alignment" value={captions.alignment} onChange={update('alignment')}>
              <option value="">None</option>
              {Object.entries(CAPTIONS_ALIGNMENT).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Wire all sections into ClipCard**

Replace the placeholder `<p>` lines in `src/components/ClipCard.jsx` with real imports and components:

```jsx
import { useState } from 'react'
import BackgroundSection from './sections/BackgroundSection'
import OverlaysSection from './sections/OverlaysSection'
import ReplaceBackgroundSection from './sections/ReplaceBackgroundSection'
import EffectsSection from './sections/EffectsSection'
import CaptionsSection from './sections/CaptionsSection'

// Replace the placeholder CollapsibleSection bodies:
<CollapsibleSection title="Overlays" badge={clip.overlays.length}>
  <OverlaysSection overlays={clip.overlays} onChange={(overlays) => onChange({ ...clip, overlays })} />
</CollapsibleSection>
<CollapsibleSection title="Replace Background" badge={clip.replaceBackground ? 1 : 0}>
  <ReplaceBackgroundSection replaceBackground={clip.replaceBackground} onChange={(rb) => onChange({ ...clip, replaceBackground: rb })} />
</CollapsibleSection>
<CollapsibleSection title="Effects" badge={clip.effects.length}>
  <EffectsSection effects={clip.effects} onChange={(effects) => onChange({ ...clip, effects })} />
</CollapsibleSection>
<CollapsibleSection title={`Captions`} badge={clip.captions ? 1 : 0}>
  <CaptionsSection captions={clip.captions} onChange={(captions) => onChange({ ...clip, captions })} />
</CollapsibleSection>
```

- [ ] **Step 9: Run all tests**

```bash
npm test
```
Expected: PASS — all tests.

- [ ] **Step 10: Commit**

```bash
git add src/components/sections/ src/components/ClipCard.jsx
git commit -m "feat: implement all clip section components (overlays, replace bg, effects, captions)"
```

---

### Task 8: Clip Preview (SVG)

**Files:**
- Create: `src/components/ClipPreview.jsx`
- Create: `src/components/ClipPreview.test.jsx`
- Modify: `src/components/ClipCard.jsx`

**Interfaces:**
- Consumes: `clip` (same shape), `targetWidth` (string|number), `targetHeight` (string|number)
- Produces: `ClipPreview({ clip, targetWidth, targetHeight })` — an SVG showing background frame + overlay rectangles

- [ ] **Step 1: Write failing tests**

Create `src/components/ClipPreview.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import ClipPreview from './ClipPreview'

const clip = {
  background: { entryId: 'e_bg', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
  overlays: [], replaceBackground: null, effects: [], captions: null,
}

test('renders an svg element', () => {
  const { container } = render(<ClipPreview clip={clip} targetWidth="" targetHeight="" />)
  expect(container.querySelector('svg')).not.toBeNull()
})

test('renders overlay rect when overlay is present', () => {
  const clipWithOverlay = {
    ...clip,
    overlays: [{
      entryId: 'e_ov', placement: 'CENTER_RIGHT', shape: 'RECTANGLE',
      scaleBehavior: 'fit', scaleWidth: 0.48, scaleHeight: 0.85,
      marginWidth: 0.074, marginHeight: 0.074, audioVolume: 1, replaceBackground: null,
    }],
  }
  const { container } = render(<ClipPreview clip={clipWithOverlay} targetWidth="1920" targetHeight="1080" />)
  const rects = container.querySelectorAll('rect')
  expect(rects.length).toBeGreaterThan(1)
})

test('uses 16:9 aspect ratio when no targetWidth/Height given', () => {
  const { container } = render(<ClipPreview clip={clip} targetWidth="" targetHeight="" />)
  const svg = container.querySelector('svg')
  expect(svg.getAttribute('viewBox')).toBe('0 0 320 180')
})

test('uses target resolution aspect ratio when given', () => {
  const { container } = render(<ClipPreview clip={clip} targetWidth="1280" targetHeight="720" />)
  const svg = container.querySelector('svg')
  expect(svg.getAttribute('viewBox')).toBe('0 0 320 180')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 3: Implement ClipPreview**

Create `src/components/ClipPreview.jsx`:

```jsx
import { KALTURA_DEFAULTS } from '../constants/kaltura'

const PREVIEW_W = 320

const PLACEMENT_ANCHOR = {
  CENTER_RIGHT:   { hAlign: 'right',  vAlign: 'center' },
  CENTER_LEFT:    { hAlign: 'left',   vAlign: 'center' },
  TOP_RIGHT:      { hAlign: 'right',  vAlign: 'top' },
  TOP_LEFT:       { hAlign: 'left',   vAlign: 'top' },
  TOP_CENTER:     { hAlign: 'center', vAlign: 'top' },
  BOTTOM_RIGHT:   { hAlign: 'right',  vAlign: 'bottom' },
  BOTTOM_LEFT:    { hAlign: 'left',   vAlign: 'bottom' },
  BOTTOM_CENTER:  { hAlign: 'center', vAlign: 'bottom' },
  CENTER_CENTER:  { hAlign: 'center', vAlign: 'center' },
}

const OVERLAY_COLORS = ['#4a90d9', '#e67e22', '#27ae60', '#8e44ad', '#e74c3c']

function computeOverlayRect(ov, fw, fh) {
  const scaleW = ov.scaleWidth ?? KALTURA_DEFAULTS.SCALE_WIDTH
  const scaleH = ov.scaleHeight ?? KALTURA_DEFAULTS.SCALE_HEIGHT
  const marginW = ov.marginWidth ?? KALTURA_DEFAULTS.MARGINS_PERCENTAGE
  const marginH = ov.marginHeight ?? KALTURA_DEFAULTS.MARGINS_PERCENTAGE

  const rw = scaleW * fw
  const rh = scaleH * fh
  const mw = marginW * fw
  const mh = marginH * fh

  const anchor = PLACEMENT_ANCHOR[ov.placement] || PLACEMENT_ANCHOR.CENTER_RIGHT

  let x, y
  if (anchor.hAlign === 'left') x = mw
  else if (anchor.hAlign === 'right') x = fw - rw - mw
  else x = (fw - rw) / 2

  if (anchor.vAlign === 'top') y = mh
  else if (anchor.vAlign === 'bottom') y = fh - rh - mh
  else y = (fh - rh) / 2

  return { x, y, w: rw, h: rh }
}

export default function ClipPreview({ clip, targetWidth, targetHeight }) {
  const aspectRatio = (targetWidth && targetHeight)
    ? parseInt(targetWidth) / parseInt(targetHeight)
    : 16 / 9

  const fw = PREVIEW_W
  const fh = Math.round(fw / aspectRatio)

  return (
    <svg viewBox={`0 0 ${fw} ${fh}`} width={fw} height={fh} style={{ display: 'block', border: '1px solid #ccc' }}>
      {/* Background frame */}
      <rect x={0} y={0} width={fw} height={fh} fill="#2c2c2c" />
      {clip.background.entryId && (
        <text x={fw / 2} y={fh / 2} textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize={10}>
          {clip.background.entryId}
        </text>
      )}

      {/* Overlay rectangles */}
      {clip.overlays.map((ov, i) => {
        if (!ov.entryId) return null
        const { x, y, w, h } = computeOverlayRect(ov, fw, fh)
        const color = OVERLAY_COLORS[i % OVERLAY_COLORS.length]
        const rx = ov.shape === 'RECTANGLE_ROUNDED' ? 8 : 0
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={color} fillOpacity={0.5} stroke={color} strokeWidth={1} rx={rx} />
            <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={9}>
              {ov.entryId.length > 10 ? ov.entryId.slice(0, 10) + '…' : ov.entryId}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 4: Add ClipPreview to ClipCard**

In `src/components/ClipCard.jsx`, import and render the preview below the card header:

```jsx
import ClipPreview from './ClipPreview'

// Inside ClipCard return, add after the header div:
<ClipPreview clip={clip} targetWidth={targetWidth} targetHeight={targetHeight} />
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: PASS — all tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/ClipPreview.jsx src/components/ClipPreview.test.jsx src/components/ClipCard.jsx
git commit -m "feat: add SVG live clip preview"
```

---

### Task 9: Submit, Validation & Results Panel

**Files:**
- Create: `src/components/ResultsPanel.jsx`
- Create: `src/components/ResultsPanel.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `addContent`, `getEntry` from `src/api/kaltura.js`; `usePolling` from `src/hooks/usePolling.js`
- Produces: `ResultsPanel({ submission })` where `submission = { status, response, entryId, serviceUrl, ks }`

- [ ] **Step 1: Write failing tests**

Create `src/components/ResultsPanel.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import ResultsPanel from './ResultsPanel'

test('renders nothing when submission is null', () => {
  const { container } = render(<ResultsPanel submission={null} />)
  expect(container.firstChild).toBeNull()
})

test('shows Submitting status badge', () => {
  render(<ResultsPanel submission={{ status: 'submitting', response: null, entryId: 'e_t', serviceUrl: 'https://www.kaltura.com', ks: 'ks' }} />)
  expect(screen.getByText(/Submitting/i)).toBeInTheDocument()
})

test('shows raw API response when present', () => {
  render(<ResultsPanel submission={{ status: 'converting', response: { id: 'e_t', status: 1 }, entryId: 'e_t', serviceUrl: 'https://www.kaltura.com', ks: 'ks' }} />)
  expect(screen.getByText(/"id"/)).toBeInTheDocument()
})

test('shows Kaltura API error message', () => {
  render(<ResultsPanel submission={{ status: 'error', response: { objectType: 'KalturaAPIException', code: 'INVALID_KS', message: 'Invalid KS' }, entryId: '', serviceUrl: '', ks: '' }} />)
  expect(screen.getByText(/Invalid KS/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 3: Implement ResultsPanel**

Create `src/components/ResultsPanel.jsx`:

```jsx
import { useState } from 'react'
import usePolling from '../hooks/usePolling'
import { getEntry } from '../api/kaltura'

const STATUS_LABELS = {
  submitting: 'Submitting…',
  converting: 'Converting…',
  ready: 'Ready',
  error: 'Error',
}

const KALTURA_READY_STATUS = 2
const KALTURA_ERROR_STATUS = 4

export default function ResultsPanel({ submission, onStatusUpdate }) {
  const [pollStatus, setPollStatus] = useState(null)
  const [jsonOpen, setJsonOpen] = useState(true)

  usePolling(
    async () => {
      if (!submission?.ks || !submission?.entryId) return { done: true }
      const entry = await getEntry(submission.serviceUrl, submission.ks, submission.entryId)
      if (entry?.objectType === 'KalturaAPIException') {
        onStatusUpdate('error')
        return { done: true }
      }
      setPollStatus(entry?.status)
      if (entry?.status === KALTURA_READY_STATUS) { onStatusUpdate('ready'); return { done: true } }
      if (entry?.status === KALTURA_ERROR_STATUS) { onStatusUpdate('error'); return { done: true } }
      return { done: false }
    },
    5000,
    submission?.status === 'converting'
  )

  if (!submission) return null

  const isApiError = submission.response?.objectType === 'KalturaAPIException'
  const statusLabel = STATUS_LABELS[submission.status] || submission.status

  return (
    <div className="results-panel">
      <h2>Results</h2>
      <div className={`status-badge status-badge--${submission.status}`}>{statusLabel}</div>

      {isApiError && (
        <div className="api-error">
          <strong>API Error [{submission.response.code}]:</strong> {submission.response.message}
        </div>
      )}

      {submission.response && (
        <div className="json-block">
          <button type="button" onClick={() => setJsonOpen(o => !o)}>
            API Response {jsonOpen ? '▲' : '▼'}
          </button>
          {jsonOpen && <pre>{JSON.stringify(submission.response, null, 2)}</pre>}
        </div>
      )}

      {submission.status === 'ready' && submission.entryId && (
        <div className="player-wrapper">
          <iframe
            title="Kaltura Player"
            src={`${submission.serviceUrl}/p/2/sp/2/embedIframeJs/uiconf_id/23449787/partner_id/2?iframeembed=true&entry_id=${submission.entryId}`}
            width="640"
            height="360"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Wire submission into App.jsx**

Update `src/App.jsx` — add validation, submit handler, and ResultsPanel:

```jsx
import { useState } from 'react'
import ConfigBar from './components/ConfigBar'
import ClipCard from './components/ClipCard'
import ResultsPanel from './components/ResultsPanel'
import { addContent } from './api/kaltura'
import './App.css'

function makeClip() {
  return {
    id: crypto.randomUUID(),
    background: { entryId: '', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
    overlays: [],
    replaceBackground: null,
    effects: [],
    captions: null,
  }
}

function validate(config, clips) {
  const errors = {}
  if (!config.ks) errors.ks = 'KS Token is required'
  if (!config.targetEntryId) errors.targetEntryId = 'Target Entry ID is required'
  clips.forEach((clip, i) => {
    if (!clip.background.entryId) {
      errors[`clip_${i}_bg`] = 'Background Entry ID is required'
    }
  })
  return errors
}

export default function App() {
  const [config, setConfig] = useState({
    ks: '', serviceUrl: 'https://www.kaltura.com', targetEntryId: '', targetWidth: '', targetHeight: '',
  })
  const [clips, setClips] = useState([makeClip()])
  const [submission, setSubmission] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const handleSubmit = async () => {
    const errors = validate(config, clips)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmission({ status: 'submitting', response: null, entryId: config.targetEntryId, serviceUrl: config.serviceUrl, ks: config.ks })
    try {
      const response = await addContent(config.serviceUrl, config.ks, config.targetEntryId, clips)
      const isError = response?.objectType === 'KalturaAPIException'
      setSubmission(s => ({ ...s, status: isError ? 'error' : 'converting', response }))
    } catch (e) {
      setSubmission(s => ({ ...s, status: 'error', response: { message: e.message } }))
    }
  }

  const canSubmit = config.ks && config.targetEntryId && clips.some(c => c.background.entryId)

  return (
    <div className="app">
      <h1>baseEntry.addContent Tool</h1>
      <ConfigBar config={config} onChange={setConfig} />
      {formErrors.ks && <span className="error">{formErrors.ks}</span>}
      {formErrors.targetEntryId && <span className="error">{formErrors.targetEntryId}</span>}

      <div className="clips">
        {clips.map((clip, i) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            index={i}
            onChange={(updated) => setClips(clips.map(c => c.id === updated.id ? updated : c))}
            onRemove={() => setClips(clips.filter(c => c.id !== clip.id))}
            targetWidth={config.targetWidth}
            targetHeight={config.targetHeight}
            errors={{ background: formErrors[`clip_${i}_bg`] ? { entryId: formErrors[`clip_${i}_bg`] } : {} }}
          />
        ))}
      </div>
      <button type="button" onClick={() => setClips([...clips, makeClip()])}>+ Add Clip</button>

      <button
        type="button"
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!canSubmit || submission?.status === 'submitting' || submission?.status === 'converting'}
      >
        Submit
      </button>

      <ResultsPanel
        submission={submission}
        onStatusUpdate={(status) => setSubmission(s => ({ ...s, status }))}
      />
    </div>
  )
}
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```
Expected: PASS — all tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/ResultsPanel.jsx src/components/ResultsPanel.test.jsx src/App.jsx
git commit -m "feat: add submission flow, validation, and results panel with polling player"
```

---

### Task 10: Styling & CSS Polish

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- No new logic — visual polish only.

- [ ] **Step 1: Replace App.css with full stylesheet**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; color: #1a1a1a; font-size: 14px; }

.app { max-width: 1100px; margin: 0 auto; padding: 24px; }
h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 20px; }
h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; }

.config-bar { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; }

.field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
.field--inline { flex-direction: row; align-items: center; gap: 8px; }
.field label { font-size: 12px; font-weight: 500; color: #555; }
.field input, .field select { border: 1px solid #ccc; border-radius: 4px; padding: 6px 8px; font-size: 13px; width: 100%; }
.field input:focus, .field select:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,.15); }
.error { color: #dc3545; font-size: 12px; margin-top: 2px; }

.clips { display: flex; flex-direction: column; gap: 16px; margin-bottom: 12px; }

.clip-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
.clip-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #eee; }
.clip-card-header strong { font-size: 14px; }
.clip-card-header button { font-size: 12px; color: #dc3545; background: none; border: none; cursor: pointer; }

.collapsible { border-bottom: 1px solid #eee; }
.collapsible:last-child { border-bottom: none; }
.collapsible-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 500; color: #333; }
.collapsible-header:hover { background: #f8f9fa; }
.collapsible-body { padding: 12px 16px; border-top: 1px solid #f0f0f0; }

.section-fields { display: flex; flex-wrap: wrap; gap: 10px; }

.overlay-row { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 10px; margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
.effect-row { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 8px; }

button[type=button] { padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 13px; }
button[type=button]:hover { background: #f0f0f0; }

.submit-btn { display: block; margin: 16px 0; padding: 10px 28px; background: #007bff; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { background: #aaa; cursor: not-allowed; }
.submit-btn:hover:not(:disabled) { background: #0056b3; }

.results-panel { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-top: 20px; }
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.status-badge--submitting, .status-badge--converting { background: #fff3cd; color: #856404; }
.status-badge--ready { background: #d1e7dd; color: #0f5132; }
.status-badge--error { background: #f8d7da; color: #842029; }

.api-error { background: #f8d7da; border: 1px solid #f5c2c7; border-radius: 4px; padding: 10px 14px; margin-bottom: 12px; color: #842029; font-size: 13px; }
.json-block { margin-bottom: 12px; }
.json-block pre { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 12px; font-size: 11px; overflow: auto; max-height: 300px; margin-top: 8px; }
.player-wrapper { margin-top: 16px; }
.player-wrapper iframe { border: none; border-radius: 4px; }
```

- [ ] **Step 2: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Config bar renders with all fields
- "Add Clip" adds a new card
- Each clip card has collapsible sections
- SVG preview appears inside each card
- Submit button is disabled when KS/entryId are empty
- Clicking a section header expands/collapses it

- [ ] **Step 3: Run full test suite one final time**

```bash
npm test
```
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.css
git commit -m "feat: add full CSS styling"
```

---

### Task 11: Write CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```bash
cat > CLAUDE.md << 'EOF'
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
EOF
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```
