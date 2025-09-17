interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

interface SharedPlaylist {
  videos: {
    id: string
    title: string
    author: string
  }[]
  created: number
  version: number
}

export const playlistSharing = {
  // 플레이리스트를 URL 해시로 인코딩
  encodeToUrl: (playlist: Video[]): string => {
    if (playlist.length > 50) {
      throw new Error('플레이리스트는 최대 50곡까지 공유할 수 있습니다.')
    }

    const sharedData: SharedPlaylist = {
      videos: playlist.map(video => ({
        id: video.id,
        title: video.title,
        author: video.author
      })),
      created: Date.now(),
      version: 1
    }

    try {
      const jsonString = JSON.stringify(sharedData)
      const base64 = btoa(encodeURIComponent(jsonString))
      const currentUrl = window.location.origin + window.location.pathname
      return `${currentUrl}#shared=${base64}`
    } catch (error) {
      throw new Error('플레이리스트 인코딩에 실패했습니다.')
    }
  },

  // URL 해시에서 플레이리스트 디코딩
  decodeFromUrl: (url?: string): Video[] | null => {
    try {
      const urlToUse = url || window.location.hash
      const match = urlToUse.match(/#shared=(.+)/)

      if (!match) return null

      const base64 = match[1]
      const jsonString = decodeURIComponent(atob(base64))
      const sharedData: SharedPlaylist = JSON.parse(jsonString)

      // 버전 체크
      if (sharedData.version !== 1) {
        console.warn('지원하지 않는 플레이리스트 버전입니다.')
        return null
      }

      // 비디오 데이터를 전체 Video 객체로 복원
      return sharedData.videos.map(video => ({
        id: video.id,
        title: video.title,
        author: video.author,
        thumbnail: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`
      }))
    } catch (error) {
      console.error('플레이리스트 디코딩 실패:', error)
      return null
    }
  },

  // URL 길이 체크
  estimateUrlLength: (playlist: Video[]): number => {
    const sharedData: SharedPlaylist = {
      videos: playlist.map(video => ({
        id: video.id,
        title: video.title,
        author: video.author
      })),
      created: Date.now(),
      version: 1
    }

    try {
      const jsonString = JSON.stringify(sharedData)
      const base64 = btoa(encodeURIComponent(jsonString))
      const baseUrl = window.location.origin + window.location.pathname
      return `${baseUrl}#shared=${base64}`.length
    } catch (error) {
      return Infinity
    }
  },

  // 공유 가능한지 체크
  canShare: (playlist: Video[]): { canShare: boolean, reason?: string } => {
    if (playlist.length === 0) {
      return { canShare: false, reason: '플레이리스트가 비어있습니다.' }
    }

    if (playlist.length > 50) {
      return { canShare: false, reason: '플레이리스트가 너무 큽니다. (최대 50곡)' }
    }

    const urlLength = playlistSharing.estimateUrlLength(playlist)
    if (urlLength > 8000) {
      return { canShare: false, reason: 'URL이 너무 깁니다. 곡 수를 줄여주세요.' }
    }

    return { canShare: true }
  }
}