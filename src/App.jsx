import { useState } from 'react'
import ConfigBar from './components/ConfigBar'
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
      <pre style={{ fontSize: 11, marginTop: 16 }}>{JSON.stringify({ config, clips }, null, 2)}</pre>
    </div>
  )
}
