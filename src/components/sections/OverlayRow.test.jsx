import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OverlayRow from './OverlayRow'

const ov = { entryId: '', placement: 'CENTER_RIGHT', shape: 'RECTANGLE', scaleBehavior: 'fit',
  scaleWidth: 0.48, scaleHeight: 0.85, marginWidth: 0.074, marginHeight: 0.074, audioVolume: 1, replaceBackground: null }

test('renders entryId input and placement select', () => {
  render(<OverlayRow overlay={ov} index={0} onChange={() => {}} onRemove={() => {}} />)
  expect(screen.getByLabelText(/Entry ID/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Placement/i)).toBeInTheDocument()
})

test('calls onChange when entryId changes', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn((updated) => {
    rerender(<OverlayRow overlay={updated} index={0} onChange={onChange} onRemove={() => {}} />)
  })
  const { rerender } = render(<OverlayRow overlay={ov} index={0} onChange={onChange} onRemove={() => {}} />)
  await user.type(screen.getByLabelText(/Entry ID/i), 'e_ov')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entryId: 'e_ov' }))
})
