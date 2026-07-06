import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EffectsSection from './EffectsSection'

test('renders Add Effect button', () => {
  render(<EffectsSection effects={[]} onChange={() => {}} />)
  expect(screen.getByRole('button', { name: /add effect/i })).toBeInTheDocument()
})

test('clicking Add Effect appends an effect row', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<EffectsSection effects={[]} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: /add effect/i }))
  expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ effectType: 1 })])
})
