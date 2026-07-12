import { useState } from 'react'
import ConfigBar from './components/ConfigBar'
import ClipCard from './components/ClipCard'
import ResultsPanel from './components/ResultsPanel'
import { addContent } from './api/kaltura'
import './App.css'

function makeClip() {
  return {
    id: crypto.randomUUID(),
    background: { entryId: '', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
    overlays: [],
    replaceBackground: null,
    effects: [],
    captions: null,
  }
}

function validate(config, clips) {
  const errors = {}
  if (!config.ks) errors.ks = 'KS Token is required'
  if (!config.targetEntryId) errors.targetEntryId = 'Target Entry ID is required'
  clips.forEach((clip, i) => {
    if (!clip.background.entryId) {
      errors[`clip_${i}_bg`] = 'Background Entry ID is required'
    }
  })
  return errors
}

export default function App() {
  const [config, setConfig] = useState({
    ks: '', serviceUrl: 'https://www.kaltura.com', targetEntryId: '', targetWidth: '', targetHeight: '',
    partnerId: '', uiconfId: '23449787',
  })
  const [clips, setClips] = useState([makeClip()])
  const [submission, setSubmission] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const handleSubmit = async () => {
    const errors = validate(config, clips)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmission({ status: 'submitting', response: null, entryId: config.targetEntryId, serviceUrl: config.serviceUrl, ks: config.ks, partnerId: config.partnerId, uiconfId: config.uiconfId })
    try {
      const response = await addContent(config.serviceUrl, config.ks, config.targetEntryId, clips)
      const isError = response?.objectType === 'KalturaAPIException'
      setSubmission(s => ({ ...s, status: isError ? 'error' : 'converting', response }))
    } catch (e) {
      setSubmission(s => ({ ...s, status: 'error', response: { message: e.message } }))
    }
  }

  const canSubmit = config.ks && config.targetEntryId && clips.length > 0 && clips.every(c => c.background.entryId)

  return (
    <div className="app">
      <h1>baseEntry.addContent Tool</h1>
      <ConfigBar config={config} onChange={setConfig} />
      {formErrors.ks && <span className="error">{formErrors.ks}</span>}
      {formErrors.targetEntryId && <span className="error">{formErrors.targetEntryId}</span>}

      <div className="clips">
        {clips.map((clip, i) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            index={i}
            onChange={(updated) => setClips(clips.map(c => c.id === updated.id ? updated : c))}
            onRemove={() => setClips(clips.filter(c => c.id !== clip.id))}
            targetWidth={config.targetWidth}
            targetHeight={config.targetHeight}
            errors={{ background: formErrors[`clip_${i}_bg`] ? { entryId: formErrors[`clip_${i}_bg`] } : {} }}
          />
        ))}
      </div>
      <button type="button" onClick={() => setClips([...clips, makeClip()])}>+ Add Clip</button>

      <button
        type="button"
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!canSubmit || submission?.status === 'submitting' || submission?.status === 'converting'}
      >
        Submit
      </button>

      <ResultsPanel
        submission={submission}
        onStatusUpdate={(status) => setSubmission(s => ({ ...s, status }))}
      />
    </div>
  )
}
