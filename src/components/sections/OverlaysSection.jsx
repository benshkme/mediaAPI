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
