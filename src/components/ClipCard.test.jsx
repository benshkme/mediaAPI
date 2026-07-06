import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClipCard from './ClipCard'

const clip = {
  id: '1',
  background: { entryId: 'e_abc', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' },
  overlays: [], replaceBackground: null, effects: [], captions: null,
}

test('renders clip number heading', () => {
  render(<ClipCard clip={clip} index={0} onChange={() => {}} onRemove={() => {}} targetWidth="" targetHeight="" />)
  expect(screen.getByText(/Clip 1/i)).toBeInTheDocument()
})

test('calls onRemove when Remove button clicked', async () => {
  const user = userEvent.setup()
  const onRemove = vi.fn()
  render(<ClipCard clip={clip} index={0} onChange={() => {}} onRemove={onRemove} targetWidth="" targetHeight="" />)
  await user.click(screen.getByRole('button', { name: /remove/i }))
  expect(onRemove).toHaveBeenCalled()
})
