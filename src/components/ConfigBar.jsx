export default function ConfigBar({ config, onChange }) {
  const update = (key) => (e) => onChange({ ...config, [key]: e.target.value })
  return (
    <div className="config-bar">
      <div className="field">
        <label htmlFor="ks">KS Token</label>
        <input id="ks" value={config.ks} onChange={update('ks')} placeholder="Paste your Kaltura session token" />
      </div>
      <div className="field">
        <label htmlFor="serviceUrl">Service URL</label>
        <input id="serviceUrl" value={config.serviceUrl} onChange={update('serviceUrl')} />
      </div>
      <div className="field">
        <label htmlFor="partnerId">Partner ID</label>
        <input id="partnerId" value={config.partnerId} onChange={update('partnerId')} placeholder="e.g. 1234567" />
      </div>
      <div className="field">
        <label htmlFor="uiconfId">Player UI Conf ID</label>
        <input id="uiconfId" value={config.uiconfId} onChange={update('uiconfId')} placeholder="e.g. 23449787" />
      </div>
      <div className="field">
        <label htmlFor="targetEntryId">Target Entry ID</label>
        <input id="targetEntryId" value={config.targetEntryId} onChange={update('targetEntryId')} placeholder="Draft entry ID" />
      </div>
      <div className="field field--inline">
        <label htmlFor="targetWidth">Width</label>
        <input id="targetWidth" type="number" value={config.targetWidth} onChange={update('targetWidth')} placeholder="1920" />
        <label htmlFor="targetHeight">Height</label>
        <input id="targetHeight" type="number" value={config.targetHeight} onChange={update('targetHeight')} placeholder="1080" />
      </div>
    </div>
  )
}
