"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Settings } from "lucide-react"
import Image from "next/image"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

export type RepeatMode = 'off' | 'all' | 'one'

interface AudioPlayerProps {
  video: Video
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  repeatMode: RepeatMode
  setRepeatMode: (mode: RepeatMode) => void
  isShuffleMode: boolean
  setIsShuffleMode: (shuffle: boolean) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function AudioPlayer({
  video,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  repeatMode,
  setRepeatMode,
  isShuffleMode,
  setIsShuffleMode,
}: AudioPlayerProps) {
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedControl, setShowSpeedControl] = useState(false)
  const [isUserSeeking, setIsUserSeeking] = useState(false)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const speedControlRef = useRef<HTMLDivElement>(null)
  const isInitializingRef = useRef(false)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    console.log("[v0] Video changed, resetting progress bar")
    setCurrentTime(0)
    setDuration(0)
  }, [video.id])

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT) {
        initializePlayer()
        return
      }

      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.body.appendChild(script)

      window.onYouTubeIframeAPIReady = initializePlayer
    }

    const initializePlayer = () => {
      if (isInitializingRef.current) return
      isInitializingRef.current = true

      if (playerRef.current) {
        playerRef.current.destroy()
      }

      console.log("[v0] Initializing player for video:", video.id, "isPlaying:", isPlaying)

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log("[v0] YouTube player ready for:", video.id)

            // duration 설정을 위한 재시도 로직
            const updateDuration = () => {
              try {
                const videoDuration = event.target.getDuration()
                if (videoDuration && videoDuration > 0) {
                  setDuration(videoDuration)
                  setCurrentTime(0)
                  console.log("[v0] Duration set:", videoDuration)
                } else {
                  // duration이 아직 준비되지 않았으면 잠시 후 재시도
                  setTimeout(updateDuration, 500)
                }
              } catch (error) {
                console.error("[v0] Error getting duration:", error)
                setTimeout(updateDuration, 1000)
              }
            }

            updateDuration()
            isInitializingRef.current = false

            if (isPlaying) {
              console.log("[v0] Starting playback")
              event.target.playVideo()
            } else {
              console.log("[v0] Pausing video")
              event.target.pauseVideo()
            }
          },
          onStateChange: (event: any) => {
            console.log("[v0] Player state changed:", event.data, "for video:", video.id)
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log("[v0] Video ended, checking repeat mode")
              if (repeatMode === 'one') {
                // 한 곡 반복: 현재 곡을 다시 재생
                event.target.seekTo(0)
                event.target.playVideo()
              } else if (repeatMode === 'all' || isShuffleMode) {
                // 전체 반복 또는 셔플 모드
                if (canGoNext) {
                  onNext()
                } else if (repeatMode === 'all') {
                  // 마지막 곡이면 처음부터 다시 시작
                  onNext() // playlist-manager에서 처리
                } else {
                  setIsPlaying(false)
                }
              } else {
                // 반복 없음
                if (canGoNext) {
                  onNext()
                } else {
                  setIsPlaying(false)
                }
              }
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              // 재생 시작 시 duration이 설정되지 않았다면 다시 시도
              if (duration === 0) {
                try {
                  const videoDuration = event.target.getDuration()
                  if (videoDuration && videoDuration > 0) {
                    setDuration(videoDuration)
                    console.log("[v0] Duration updated on playing:", videoDuration)
                  }
                } catch (error) {
                  console.error("[v0] Error updating duration on play:", error)
                }
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            }
          },
        },
      })
    }

    loadYouTubeAPI()

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      isInitializingRef.current = false
    }
  }, [video.id])

  useEffect(() => {
    if (playerRef.current && !isInitializingRef.current) {
      console.log("[v0] Updating playback state:", isPlaying)
      if (isPlaying) {
        playerRef.current.playVideo()
        // 재생 시작할 때 즉시 시간 업데이트
        setTimeout(() => {
          if (playerRef.current) {
            try {
              const current = playerRef.current.getCurrentTime()
              const total = playerRef.current.getDuration()
              if (current >= 0 && total > 0) {
                setCurrentTime(current)
                setDuration(total)
                console.log('[v0] Immediate time update on play:', current, '/', total)
              }
            } catch (error) {
              console.error('[v0] Error getting immediate time:', error)
            }
          }
        }, 100)
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }, [isPlaying])

  const updateTime = useCallback(() => {
    if (playerRef.current &&
        typeof playerRef.current.getCurrentTime === 'function' &&
        typeof playerRef.current.getDuration === 'function' &&
        !isUserSeeking) {
      try {
        const playerState = playerRef.current.getPlayerState()

        // 플레이어가 재생 중인지 확인
        if (playerState === window.YT?.PlayerState?.PLAYING) {
          const current = playerRef.current.getCurrentTime()
          const total = playerRef.current.getDuration()

          // YouTube API가 유효한 값을 반환하는지 확인
          if (typeof current === 'number' && typeof total === 'number' &&
              !isNaN(current) && !isNaN(total) && total > 0) {

            // 소수점 둘째자리까지만 반올림하여 부드러운 업데이트
            const roundedCurrent = Math.round(current * 100) / 100

            setCurrentTime(roundedCurrent)
            if (duration !== total) {
              setDuration(total)
            }

            // 로깅 빈도 줄이기 (10초마다)
            if (Math.floor(current) % 10 === 0 && Math.floor(current) !== Math.floor(currentTime)) {
              console.log(`[v0] Time update: ${current.toFixed(1)}s / ${total.toFixed(1)}s`)
            }
          }
        }
      } catch (error) {
        console.error('[v0] Error getting time info:', error)
      }
    }

    // 재생 중이면 다음 프레임에 다시 업데이트
    if (isPlaying && !isUserSeeking) {
      animationFrameRef.current = requestAnimationFrame(updateTime)
    }
  }, [isPlaying, duration, currentTime, isUserSeeking])

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      console.log('[v0] Starting smooth time updates')
      animationFrameRef.current = requestAnimationFrame(updateTime)
    } else {
      console.log('[v0] Stopping time updates, isPlaying:', isPlaying)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, updateTime])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedControlRef.current && !speedControlRef.current.contains(event.target as Node)) {
        setShowSpeedControl(false)
      }
    }

    if (showSpeedControl) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSpeedControl])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute()
        playerRef.current.setVolume(volume[0])
      } else {
        playerRef.current.mute()
      }
    }
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    console.log('[v0] Seeking to:', newTime)

    // 시킹 중임을 표시하여 자동 업데이트 방지
    setIsUserSeeking(true)
    setCurrentTime(newTime)

    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true)

      // 시킹 완료 후 자동 업데이트 재개
      setTimeout(() => {
        setIsUserSeeking(false)
        if (playerRef.current) {
          try {
            const actualTime = playerRef.current.getCurrentTime()
            setCurrentTime(actualTime)
            console.log('[v0] Seek completed, actual time:', actualTime)
          } catch (error) {
            console.error('[v0] Error confirming seek:', error)
          }
        }
      }, 300)
    } else {
      setIsUserSeeking(false)
    }
  }

  // 시킹 시작할 때 호출
  const handleSeekStart = () => {
    setIsUserSeeking(true)
  }

  // 시킹 끝날 때 호출
  const handleSeekEnd = () => {
    setTimeout(() => setIsUserSeeking(false), 100)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (playerRef.current) {
      playerRef.current.setVolume(value[0])
    }
    setIsMuted(value[0] === 0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="h-4 w-4" />
      case 'all':
        return <Repeat className="h-4 w-4" />
      default:
        return <Repeat className="h-4 w-4" />
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed)
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed)
    }
    setShowSpeedControl(false)
  }

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  return (
    <Card className="p-6 bg-card border-border sticky top-20 z-40 shadow-lg">
      <div className="space-y-4">
        {/* Video Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground line-clamp-1">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.author}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            className="w-full transition-all duration-75 ease-out"
            onValueChange={handleSeek}
            onValueCommit={handleSeekEnd}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsShuffleMode(!isShuffleMode)}
              className={`h-8 w-8 p-0 ${
                isShuffleMode ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={togglePlay}
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onNext}
              disabled={!canGoNext}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cycleRepeatMode}
              className={`h-8 w-8 p-0 ${
                repeatMode !== 'off' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {getRepeatIcon()}
            </Button>
          </div>

          {/* Volume and Speed Control */}
          <div className="flex items-center gap-2">
            {/* Speed Control */}
            <div className="relative" ref={speedControlRef}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {showSpeedControl && (
                <div className="absolute bottom-full mb-2 right-0 bg-popover border border-border rounded-md shadow-lg p-2 z-50 min-w-[120px]">
                  <div className="text-xs text-muted-foreground mb-2">재생 속도</div>
                  <div className="grid grid-cols-2 gap-1">
                    {speedOptions.map((speed) => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={playbackRate === speed ? "default" : "ghost"}
                        onClick={() => handleSpeedChange(speed)}
                        className="h-8 text-xs"
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Volume Control */}
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={isMuted ? [0] : volume}
              max={100}
              step={1}
              className="w-20"
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        <div ref={containerRef} className="hidden" />
      </div>
    </Card>
  )
}
