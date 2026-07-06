import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfigBar from './ConfigBar'

const defaultConfig = { ks: '', serviceUrl: 'https://www.kaltura.com', targetEntryId: '', targetWidth: '', targetHeight: '' }

test('renders KS input, service URL, target entry ID, and resolution fields', () => {
  render(<ConfigBar config={defaultConfig} onChange={() => {}} />)
  expect(screen.getByLabelText(/KS Token/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Service URL/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Target Entry ID/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Width/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
})

test('calls onChange with updated field when user types', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn((newConfig) => {
    // Re-render with updated config to simulate parent state update
    rerender(<ConfigBar config={newConfig} onChange={onChange} />)
  })
  const { rerender } = render(<ConfigBar config={defaultConfig} onChange={onChange} />)
  await user.clear(screen.getByLabelText(/KS Token/i))
  await user.type(screen.getByLabelText(/KS Token/i), 'myks')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ ks: 'myks' }))
})
