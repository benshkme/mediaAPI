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
