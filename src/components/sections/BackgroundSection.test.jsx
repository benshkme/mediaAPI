import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackgroundSection from './BackgroundSection'

const bg = { entryId: '', flavorParamsId: '', offset: '', duration: '', globalOffsetInDestination: '', cropAlignment: '' }

test('renders entry ID field', () => {
  render(<BackgroundSection background={bg} onChange={() => {}} errors={{}} />)
  expect(screen.getByLabelText(/Entry ID/i)).toBeInTheDocument()
})

test('calls onChange with updated entryId', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn((newBg) => {
    rerender(<BackgroundSection background={newBg} onChange={onChange} errors={{}} />)
  })
  const { rerender } = render(<BackgroundSection background={bg} onChange={onChange} errors={{}} />)
  await user.type(screen.getByLabelText(/Entry ID/i), 'e_xyz')
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entryId: 'e_xyz' }))
})

test('shows error message when errors.entryId is set', () => {
  render(<BackgroundSection background={bg} onChange={() => {}} errors={{ entryId: 'Required' }} />)
  expect(screen.getByText('Required')).toBeInTheDocument()
})
