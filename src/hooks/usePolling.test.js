import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import usePolling from './usePolling'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('calls fn on interval while enabled', async () => {
  const fn = vi.fn().mockResolvedValue({ done: false })
  renderHook(() => usePolling(fn, 1000, true))
  expect(fn).not.toHaveBeenCalled()
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(1)
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(2)
})

test('does not call fn when disabled', async () => {
  const fn = vi.fn().mockResolvedValue({ done: false })
  renderHook(() => usePolling(fn, 1000, false))
  await act(() => vi.advanceTimersByTimeAsync(2000))
  expect(fn).not.toHaveBeenCalled()
})

test('stops polling when fn returns done: true', async () => {
  let calls = 0
  const fn = vi.fn().mockImplementation(async () => {
    calls++
    return { done: calls >= 2 }
  })
  renderHook(() => usePolling(fn, 1000, true))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  await act(() => vi.advanceTimersByTimeAsync(1001))
  expect(fn).toHaveBeenCalledTimes(2)
})
