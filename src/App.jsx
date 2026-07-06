import { useState } from 'react'
import ConfigBar from './components/ConfigBar'
import ClipCard from './components/ClipCard'
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

export default function App() {
  const [config, setConfig] = useState({
    ks: '',
    serviceUrl: 'https://www.kaltura.com',
    targetEntryId: '',
    targetWidth: '',
    targetHeight: '',
  })
  const [clips, setClips] = useState([makeClip()])
  const [submission, setSubmission] = useState(null)

  return (
    <div className="app">
      <h1>baseEntry.addContent Tool</h1>
      <ConfigBar config={config} onChange={setConfig} />
      <div className="clips">
        {clips.map((clip, i) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            index={i}
            onChange={(updated) => setClips(clips.map((c) => c.id === updated.id ? updated : c))}
            onRemove={() => setClips(clips.filter((c) => c.id !== clip.id))}
            targetWidth={config.targetWidth}
            targetHeight={config.targetHeight}
          />
        ))}
      </div>
      <button type="button" onClick={() => setClips([...clips, makeClip()])}>+ Add Clip</button>
    </div>
  )
}
