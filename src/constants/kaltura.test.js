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
