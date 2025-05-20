'use client'

import { useState } from 'react'

export type FormStatus = {
  isLoading: boolean
  error: string | null
  start: () => void              // setIsLoading(true) + clear error
  stop: () => void               // setIsLoading(false)
  setError: (msg: string) => void
  reset: () => void              // limpia error y loading
}

export function useFormStatus(): FormStatus {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return {
    isLoading,
    error,
    start() {
      setError(null)
      setIsLoading(true)
    },
    stop() {
      setIsLoading(false)
    },
    setError(msg: string) {
      setError(msg)
      setIsLoading(false)
    },
    reset() {
      setError(null)
      setIsLoading(false)
    },
  }
}