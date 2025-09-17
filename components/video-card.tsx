"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, X, GripVertical } from "lucide-react"
import Image from "next/image"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

interface VideoCardProps {
  video: Video
  index: number
  isCurrentlyPlaying: boolean
  onPlay: () => void
  onRemove: () => void
}

export function VideoCard({ video, index, isCurrentlyPlaying, onPlay, onRemove }: VideoCardProps) {
  return (
    <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
          <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">{index + 1}</span>
        </div>

        {/* Thumbnail */}
        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover"
            sizes="96px"
            onError={(e) => {
              // maxresdefault 실패 시 hqdefault로 재시도
              const target = e.target as HTMLImageElement
              if (target.src.includes("maxresdefault")) {
                target.src = target.src.replace("maxresdefault", "hqdefault")
              } else if (target.src.includes("hqdefault")) {
                // hqdefault도 실패하면 기본 썸네일 사용
                target.src = target.src.replace("hqdefault", "default")
              }
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={onPlay}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-black"
            >
              {isCurrentlyPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-card-foreground line-clamp-2 text-sm leading-tight">{video.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{video.author}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPlay}
            className={`h-8 w-8 p-0 ${
              isCurrentlyPlaying
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {isCurrentlyPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
