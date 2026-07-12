import { useState } from 'react'
import usePolling from '../hooks/usePolling'
import { getEntry } from '../api/kaltura'

const STATUS_LABELS = {
  submitting: 'Submitting…',
  converting: 'Converting…',
  ready: 'Ready',
  error: 'Error',
}

const KALTURA_READY_STATUS = 2
const KALTURA_ERROR_STATUS = 4

export default function ResultsPanel({ submission, onStatusUpdate }) {
  const [jsonOpen, setJsonOpen] = useState(true)

  usePolling(
    async () => {
      if (!submission?.ks || !submission?.entryId) return { done: true }
      const entry = await getEntry(submission.serviceUrl, submission.ks, submission.entryId)
      if (entry?.objectType === 'KalturaAPIException') {
        onStatusUpdate('error')
        return { done: true }
      }
      if (entry?.status === KALTURA_READY_STATUS) { onStatusUpdate('ready'); return { done: true } }
      if (entry?.status === KALTURA_ERROR_STATUS) { onStatusUpdate('error'); return { done: true } }
      return { done: false }
    },
    5000,
    submission?.status === 'converting'
  )

  if (!submission) return null

  const isApiError = submission.response?.objectType === 'KalturaAPIException'
  const statusLabel = STATUS_LABELS[submission.status] || submission.status

  return (
    <div className="results-panel">
      <h2>Results</h2>
      <div className={`status-badge status-badge--${submission.status}`}>{statusLabel}</div>

      {isApiError && (
        <div className="api-error">
          <strong>API Error [{submission.response.code}]:</strong> {submission.response.message}
        </div>
      )}

      {submission.response && !isApiError && (
        <div className="json-block">
          <button type="button" onClick={() => setJsonOpen(o => !o)}>
            API Response {jsonOpen ? '▲' : '▼'}
          </button>
          {jsonOpen && <pre>{JSON.stringify(submission.response, null, 2)}</pre>}
        </div>
      )}

      {submission.status === 'ready' && submission.entryId && (
        <div className="player-wrapper">
          <iframe
            title="Kaltura Player"
            src={`${submission.serviceUrl}/p/2/sp/2/embedIframeJs/uiconf_id/23449787/partner_id/2?iframeembed=true&entry_id=${submission.entryId}`}
            width="640"
            height="360"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
