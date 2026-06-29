'use client'

import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'toolify-favorites'

export function useFavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when favorites changes, only after initial load
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e)
    }
  }, [favorites, isLoaded])

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    )
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return { favorites, toggleFavorite, isFavorite, isLoaded }
}
