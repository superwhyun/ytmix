"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VideoCard } from "@/components/video-card"
import { AudioPlayer, RepeatMode } from "@/components/audio-player"
import { ExportDialog } from "@/components/export-dialog"
import { playlistStorage } from "@/lib/playlist-storage"
import { Play, Download, Shuffle, Trash2, Search, X } from "lucide-react"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

interface PlaylistManagerProps {
  playlist: Video[]
  setPlaylist: (playlist: Video[]) => void
}

export function PlaylistManager({ playlist, setPlaylist }: PlaylistManagerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [isShuffleMode, setIsShuffleMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(playlist)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPlaylist(items)
  }

  const removeVideo = (index: number) => {
    const newPlaylist = playlist.filter((_, i) => i !== index)
    setPlaylist(newPlaylist)

    if (currentVideoIndex === index) {
      setCurrentVideoIndex(null)
      setIsPlaying(false)
    } else if (currentVideoIndex !== null && currentVideoIndex > index) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }

  const playVideo = (index: number) => {
    setCurrentVideoIndex(index)
    setIsPlaying(true)
  }

  const playNext = () => {
    if (currentVideoIndex !== null) {
      if (isShuffleMode) {
        // 셔플 모드: 랜덤한 다음 곡 선택
        let randomIndex = Math.floor(Math.random() * playlist.length)
        while (randomIndex === currentVideoIndex && playlist.length > 1) {
          randomIndex = Math.floor(Math.random() * playlist.length)
        }
        setCurrentVideoIndex(randomIndex)
      } else if (currentVideoIndex < playlist.length - 1) {
        // 일반 모드: 다음 곡
        setCurrentVideoIndex(currentVideoIndex + 1)
      } else if (repeatMode === 'all') {
        // 전체 반복: 처음부터 다시 시작
        setCurrentVideoIndex(0)
      }
    }
  }

  const playPrevious = () => {
    if (currentVideoIndex !== null && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }

  const shufflePlaylist = () => {
    const shuffled = [...playlist].sort(() => Math.random() - 0.5)
    setPlaylist(shuffled)
    setCurrentVideoIndex(null)
    setIsPlaying(false)
  }

  const toggleShuffleMode = () => {
    setIsShuffleMode(!isShuffleMode)
  }

  const filteredPlaylist = playlist.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const clearPlaylist = () => {
    setPlaylist([])
    setCurrentVideoIndex(null)
    setIsPlaying(false)
    playlistStorage.clear()
  }

  const playAll = () => {
    if (playlist.length > 0) {
      setCurrentVideoIndex(0)
      setIsPlaying(true)
    }
  }

  if (playlist.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">플레이리스트가 비어있습니다</h3>
            <p className="text-muted-foreground">위에서 YouTube URL을 추가하여 플레이리스트를 만들어보세요</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Playlist Controls */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-card-foreground">플레이리스트 ({playlist.length}곡)</h2>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={playAll}
                disabled={playlist.length === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                전체 재생
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shufflePlaylist}
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                플레이리스트 셔플
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPlaylist}
                className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            disabled={playlist.length === 0}
            className="border-border text-foreground hover:bg-secondary hover:text-secondary-foreground"
          >
            <Download className="h-4 w-4 mr-2" />
            MP3 내보내기
          </Button>
        </div>
      </Card>

      {/* Search */}
      {playlist.length > 3 && (
        <Card className="p-4 bg-card border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="플레이리스트에서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredPlaylist.length}개 항목이 '{searchQuery}'와 일치합니다
            </div>
          )}
        </Card>
      )}

      {/* Current Playing Video */}
      {currentVideoIndex !== null && (
        <AudioPlayer
          video={playlist[currentVideoIndex]}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={playNext}
          onPrevious={playPrevious}
          canGoNext={isShuffleMode || currentVideoIndex < playlist.length - 1 || repeatMode === 'all'}
          canGoPrevious={currentVideoIndex > 0}
          repeatMode={repeatMode}
          setRepeatMode={setRepeatMode}
          isShuffleMode={isShuffleMode}
          setIsShuffleMode={setIsShuffleMode}
        />
      )}

      {/* Playlist */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {(searchQuery ? filteredPlaylist : playlist).map((video, displayIndex) => {
                const originalIndex = playlist.findIndex(v => v.id === video.id && v.title === video.title)
                return (
                  <Draggable key={video.id + originalIndex} draggableId={video.id + originalIndex} index={originalIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? "rotate-2 scale-105 shadow-lg" : ""
                        }`}
                      >
                        <VideoCard
                          video={video}
                          index={originalIndex}
                          isCurrentlyPlaying={currentVideoIndex === originalIndex && isPlaying}
                          onPlay={() => playVideo(originalIndex)}
                          onRemove={() => removeVideo(originalIndex)}
                        />
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Export Dialog */}
      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} playlist={playlist} />
    </div>
  )
}
