"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PlaylistManager } from "@/components/playlist-manager"
import { playlistStorage } from "@/lib/playlist-storage"
import { useToast } from "@/hooks/use-toast"
import { Music, Plus } from "lucide-react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [playlist, setPlaylist] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedPlaylist = playlistStorage.load()
    setPlaylist(savedPlaylist)
  }, [])

  useEffect(() => {
    playlistStorage.save(playlist)
  }, [playlist])

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,                    // youtube.com/watch?v=VIDEO_ID
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                               // youtu.be/VIDEO_ID
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,                     // youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,                         // youtube.com/v/VIDEO_ID
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,                 // youtube.com/watch?other_params&v=VIDEO_ID
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,                // m.youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,                    // youtube.com/shorts/VIDEO_ID
      /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/                       // youtube.com/live/VIDEO_ID
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  const addToPlaylist = async () => {
    if (!url.trim()) return

    const videoId = extractVideoId(url)
    if (!videoId) {
      toast({
        title: "유효하지 않은 URL",
        description: "유효한 YouTube URL을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // YouTube oEmbed API를 사용하여 비디오 정보 가져오기
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      )
      const data = await response.json()

      const getThumbnailUrl = (videoId: string) => {
        // 먼저 maxresdefault를 시도하고, 실패하면 hqdefault로 fallback
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      }

      const newVideo = {
        id: videoId,
        title: data.title,
        thumbnail: getThumbnailUrl(videoId),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        author: data.author_name,
      }

      setPlaylist((prev) => [...prev, newVideo])
      setUrl("")
      toast({
        title: "비디오가 추가되었습니다!",
        description: newVideo.title,
      })
    } catch (error) {
      console.error("비디오 정보를 가져오는데 실패했습니다:", error)
      toast({
        title: "오류 발생",
        description: "비디오 정보를 가져오는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addToPlaylist()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Music className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">YouTube Playlist Maker</h1>
                <p className="text-sm text-muted-foreground">나만의 음악 플레이리스트를 만들어보세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* URL Input Section */}
        <Card className="p-6 mb-8 bg-card border-border">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground mb-2">YouTube URL 추가</h2>
              <p className="text-sm text-muted-foreground">YouTube 비디오 URL을 입력하여 플레이리스트에 추가하세요</p>
            </div>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                onClick={addToPlaylist}
                disabled={isLoading || !url.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Playlist Manager */}
        <PlaylistManager playlist={playlist} setPlaylist={setPlaylist} />
      </main>
    </div>
  )
}
