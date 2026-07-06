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
