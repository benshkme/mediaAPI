import { EFFECT_TYPE } from '../../constants/kaltura'

export default function EffectsSection({ effects, onChange }) {
  const add = () => onChange([...effects, { effectType: EFFECT_TYPE.VIDEO_FADE_IN, value: '' }])
  const remove = (i) => onChange(effects.filter((_, idx) => idx !== i))
  const update = (i, key) => (e) => onChange(effects.map((ef, idx) => idx === i ? { ...ef, [key]: e.target.value } : ef))

  return (
    <div>
      {effects.map((ef, i) => (
        <div key={i} className="effect-row">
          <div className="field">
            <label htmlFor={`ef-${i}-type`}>Effect Type</label>
            <select id={`ef-${i}-type`} value={ef.effectType} onChange={update(i, 'effectType')}>
              {Object.entries(EFFECT_TYPE).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`ef-${i}-value`}>Value</label>
            <input id={`ef-${i}-value`} value={ef.value} onChange={update(i, 'value')} />
          </div>
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={add}>+ Add Effect</button>
    </div>
  )
}
