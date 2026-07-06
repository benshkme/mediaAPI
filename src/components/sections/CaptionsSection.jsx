import { BORDER_STYLE, CAPTIONS_ALIGNMENT } from '../../constants/kaltura'

function makeCaptions() {
  return { captionAssetId: '', fontName: '', fontSize: '', primaryColour: '', outlineColour: '', backColour: '',
    borderStyle: '', shadow: '', bold: false, italic: false, underline: false, alignment: '' }
}

export default function CaptionsSection({ captions, onChange }) {
  const enabled = captions !== null
  const update = (key) => (e) => onChange({ ...captions, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <div>
      <div className="field">
        <label htmlFor="cap-enable">
          <input id="cap-enable" type="checkbox" checked={enabled}
            onChange={(e) => onChange(e.target.checked ? makeCaptions() : null)} />
          {' '}Enable Captions
        </label>
      </div>
      {enabled && (
        <div className="section-fields">
          <div className="field">
            <label htmlFor="cap-assetId">Caption Asset ID</label>
            <input id="cap-assetId" value={captions.captionAssetId} onChange={update('captionAssetId')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="cap-fontName">Font Name</label>
            <input id="cap-fontName" value={captions.fontName} onChange={update('fontName')} />
            <label htmlFor="cap-fontSize">Font Size</label>
            <input id="cap-fontSize" type="number" value={captions.fontSize} onChange={update('fontSize')} />
          </div>
          <div className="field field--inline">
            <label htmlFor="cap-primary">Primary Colour</label>
            <input id="cap-primary" value={captions.primaryColour} onChange={update('primaryColour')} placeholder="&H00FFFFFF" />
            <label htmlFor="cap-outline">Outline</label>
            <input id="cap-outline" value={captions.outlineColour} onChange={update('outlineColour')} />
            <label htmlFor="cap-back">Back</label>
            <input id="cap-back" value={captions.backColour} onChange={update('backColour')} />
          </div>
          <div className="field">
            <label htmlFor="cap-borderStyle">Border Style</label>
            <select id="cap-borderStyle" value={captions.borderStyle} onChange={update('borderStyle')}>
              <option value="">None</option>
              {Object.entries(BORDER_STYLE).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cap-shadow">Shadow</label>
            <input id="cap-shadow" type="number" value={captions.shadow} onChange={update('shadow')} />
          </div>
          <div className="field field--inline">
            <label><input type="checkbox" checked={captions.bold} onChange={update('bold')} /> Bold</label>
            <label><input type="checkbox" checked={captions.italic} onChange={update('italic')} /> Italic</label>
            <label><input type="checkbox" checked={captions.underline} onChange={update('underline')} /> Underline</label>
          </div>
          <div className="field">
            <label htmlFor="cap-alignment">Alignment</label>
            <select id="cap-alignment" value={captions.alignment} onChange={update('alignment')}>
              <option value="">None</option>
              {Object.entries(CAPTIONS_ALIGNMENT).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
