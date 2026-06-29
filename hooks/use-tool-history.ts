'use client'

import { useEffect, useState, useCallback } from 'react'

const HISTORY_KEY = 'toolify-recent'
const MAX_HISTORY = 5

export function useToolHistory() {
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(HISTORY_KEY)
        if (stored) {
          setRecentIds(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Failed to parse tool history from localStorage', e)
      }
      setIsLoaded(true)
    })
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  // Save to localStorage when recentIds changes, only after initial load
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(recentIds))
    } catch (e) {
      console.error('Failed to save tool history to localStorage', e)
    }
  }, [recentIds, isLoaded])

  const addToHistory = useCallback((toolId: string) => {
    setRecentIds((prev) => {
      const updated = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_HISTORY)
      return updated
    })
  }, [])

  return { recentIds, addToHistory }
}
