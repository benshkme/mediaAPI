import { useState } from 'react'
import BackgroundSection from './sections/BackgroundSection'
import OverlaysSection from './sections/OverlaysSection'
import ReplaceBackgroundSection from './sections/ReplaceBackgroundSection'
import EffectsSection from './sections/EffectsSection'
import CaptionsSection from './sections/CaptionsSection'

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
    </div>
  )
}
