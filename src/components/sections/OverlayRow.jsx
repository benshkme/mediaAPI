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
