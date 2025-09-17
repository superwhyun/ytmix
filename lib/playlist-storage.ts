interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

const STORAGE_KEY = 'ytmix-playlist'

export const playlistStorage = {
  save: (playlist: Video[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist))
    } catch (error) {
      console.error('Failed to save playlist to localStorage:', error)
    }
  },

  load: (): Video[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as Video[]
      }
    } catch (error) {
      console.error('Failed to load playlist from localStorage:', error)
    }
    return []
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear playlist from localStorage:', error)
    }
  }
}