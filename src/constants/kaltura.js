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
