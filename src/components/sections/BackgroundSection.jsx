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
