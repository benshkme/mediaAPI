import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CaptionsSection from './CaptionsSection'

test('renders enable checkbox when captions is null', () => {
  render(<CaptionsSection captions={null} onChange={() => {}} />)
  expect(screen.getByLabelText(/Enable Captions/i)).toBeInTheDocument()
})

test('enabling creates captions object with empty fields', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<CaptionsSection captions={null} onChange={onChange} />)
  await user.click(screen.getByLabelText(/Enable Captions/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ captionAssetId: '' }))
})
