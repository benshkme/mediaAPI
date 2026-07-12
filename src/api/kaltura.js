import { KALTURA_OBJECT_TYPES } from '../constants/kaltura'

export function buildPayload(ks, targetEntryId, clips) {
  const p = {}
  p['format'] = '1'
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
  const body = new URLSearchParams({ ks, entryId, format: '1' })
  const url = `${serviceUrl}/api_v3/service/baseEntry/action/get`
  const res = await fetch(url, { method: 'POST', body })
  return res.json()
}
