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

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e)
      }
      return updated
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return { favorites, toggleFavorite, isFavorite, isLoaded }
}
