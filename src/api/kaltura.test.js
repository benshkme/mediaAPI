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
