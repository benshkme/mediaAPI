function makeReplaceBackground() {
  return { entryId: '', backgroundColorCode: '', foregroundScalePercentage: '', foregroundPositionX: '', foregroundPositionY: '', audioVolume: '' }
}

export default function ReplaceBackgroundSection({ replaceBackground, onChange }) {
  const update = (key) => (e) => onChange({ ...replaceBackground, [key]: e.target.value })
  const enabled = replaceBackground !== null

  return (
    <div>
      <div className="field">
        <label htmlFor="rb-enable">
          <input id="rb-enable" type="checkbox" checked={enabled}
            onChange={(e) => onChange(e.target.checked ? makeReplaceBackground() : null)} />
          {' '}Enable Replace Background
        </label>
      </div>
      {enabled && (
        <div className="section-fields">
          <div className="field">
            <label htmlFor="rb-entryId">Resource Entry ID</label>
            <input id="rb-entryId" value={replaceBackground.entryId} onChange={update('entryId')} placeholder="e_xxxx" />
          </div>
          <div className="field">
            <label htmlFor="rb-colorCode">Background Color Code (0xRRGGBB)</label>
            <input id="rb-colorCode" value={replaceBackground.backgroundColorCode} onChange={update('backgroundColorCode')} placeholder="0xFF0000" />
          </div>
          <div className="field">
            <label htmlFor="rb-fgScale">Foreground Scale % (0–5)</label>
            <input id="rb-fgScale" type="number" step="0.1" min="0" max="5" value={replaceBackground.foregroundScalePercentage} onChange={update('foregroundScalePercentage')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="rb-fgX">Foreground Position X (0–1)</label>
            <input id="rb-fgX" type="number" step="0.01" min="0" max="1" value={replaceBackground.foregroundPositionX} onChange={update('foregroundPositionX')} />
            <label htmlFor="rb-fgY">Y (0–1)</label>
            <input id="rb-fgY" type="number" step="0.01" min="0" max="1" value={replaceBackground.foregroundPositionY} onChange={update('foregroundPositionY')} />
          </div>
          <div className="field">
            <label htmlFor="rb-audio">Audio Volume (0–2)</label>
            <input id="rb-audio" type="number" step="0.1" min="0" max="2" value={replaceBackground.audioVolume} onChange={update('audioVolume')} />
          </div>
        </div>
      )}
    </div>
  )
}
