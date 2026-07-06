import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReplaceBackgroundSection from './ReplaceBackgroundSection'

test('renders enable checkbox when replaceBackground is null', () => {
  render(<ReplaceBackgroundSection replaceBackground={null} onChange={() => {}} />)
  expect(screen.getByLabelText(/Enable Replace Background/i)).toBeInTheDocument()
})

test('enabling creates replaceBackground object', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ReplaceBackgroundSection replaceBackground={null} onChange={onChange} />)
  await user.click(screen.getByLabelText(/Enable Replace Background/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ entryId: '' }))
})
