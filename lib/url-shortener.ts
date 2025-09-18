interface ShortenResponse {
  success: boolean
  shortUrl?: string
  error?: string
}

export const urlShortener = {
  // bit.ly API를 사용한 URL 단축
  shortenWithBitly: async (longUrl: string, accessToken?: string): Promise<ShortenResponse> => {
    if (!accessToken) {
      return { success: false, error: 'Bitly access token이 필요합니다.' }
    }

    try {
      const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          long_url: longUrl,
          domain: 'bit.ly'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: `Bitly API 오류: ${error.message || response.statusText}`
        }
      }

      const data = await response.json()
      return { success: true, shortUrl: data.link }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  },

  // TinyURL을 사용한 URL 단축 (무료, 토큰 불필요)
  shortenWithTinyUrl: async (longUrl: string): Promise<ShortenResponse> => {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)

      if (!response.ok) {
        return { success: false, error: 'TinyURL 서비스에 연결할 수 없습니다.' }
      }

      const shortUrl = await response.text()

      if (shortUrl.startsWith('Error') || !shortUrl.includes('tinyurl.com')) {
        return { success: false, error: 'URL 단축에 실패했습니다.' }
      }

      return { success: true, shortUrl: shortUrl.trim() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  },

  // is.gd를 사용한 URL 단축 (무료, 토큰 불필요)
  shortenWithIsGd: async (longUrl: string): Promise<ShortenResponse> => {
    try {
      const response = await fetch('https://is.gd/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `format=simple&url=${encodeURIComponent(longUrl)}`
      })

      if (!response.ok) {
        return { success: false, error: 'is.gd 서비스에 연결할 수 없습니다.' }
      }

      const shortUrl = await response.text()

      if (shortUrl.includes('Error') || !shortUrl.includes('is.gd')) {
        return { success: false, error: 'URL 단축에 실패했습니다.' }
      }

      return { success: true, shortUrl: shortUrl.trim() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  },

  // 여러 서비스를 순차적으로 시도하는 함수
  shortenUrl: async (longUrl: string, bitlyToken?: string): Promise<ShortenResponse> => {
    // 1. bit.ly 시도 (토큰이 있는 경우)
    if (bitlyToken) {
      const bitlyResult = await urlShortener.shortenWithBitly(longUrl, bitlyToken)
      if (bitlyResult.success) {
        return bitlyResult
      }
    }

    // 2. TinyURL 시도
    const tinyUrlResult = await urlShortener.shortenWithTinyUrl(longUrl)
    if (tinyUrlResult.success) {
      return tinyUrlResult
    }

    // 3. is.gd 시도
    const isGdResult = await urlShortener.shortenWithIsGd(longUrl)
    if (isGdResult.success) {
      return isGdResult
    }

    // 모든 서비스 실패
    return {
      success: false,
      error: '모든 URL 단축 서비스가 실패했습니다. 원본 URL을 사용하세요.'
    }
  }
}