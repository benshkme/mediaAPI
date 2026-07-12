import { useEffect, useRef } from 'react'

export default function usePolling(fn, intervalMs, enabled) {
  const doneRef = useRef(false)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) return
    doneRef.current = false

    const id = setInterval(async () => {
      if (doneRef.current) return
      try {
        const result = await fnRef.current()
        if (result?.done) {
          doneRef.current = true
          clearInterval(id)
        }
      } catch {
        doneRef.current = true
        clearInterval(id)
      }
    }, intervalMs)

    return () => clearInterval(id)
  }, [enabled, intervalMs])
}
