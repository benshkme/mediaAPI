import { render, screen } from '@testing-library/react'
import ResultsPanel from './ResultsPanel'

test('renders nothing when submission is null', () => {
  const { container } = render(<ResultsPanel submission={null} />)
  expect(container.firstChild).toBeNull()
})

test('shows Submitting status badge', () => {
  render(<ResultsPanel submission={{ status: 'submitting', response: null, entryId: 'e_t', serviceUrl: 'https://www.kaltura.com', ks: 'ks' }} />)
  expect(screen.getByText(/Submitting/i)).toBeInTheDocument()
})

test('shows raw API response when present', () => {
  render(<ResultsPanel submission={{ status: 'converting', response: { id: 'e_t', status: 1 }, entryId: 'e_t', serviceUrl: 'https://www.kaltura.com', ks: 'ks' }} />)
  expect(screen.getByText(/"id"/)).toBeInTheDocument()
})

test('shows Kaltura API error message', () => {
  render(<ResultsPanel submission={{ status: 'error', response: { objectType: 'KalturaAPIException', code: 'INVALID_KS', message: 'Invalid KS' }, entryId: '', serviceUrl: '', ks: '' }} />)
  expect(screen.getByText(/Invalid KS/)).toBeInTheDocument()
})
