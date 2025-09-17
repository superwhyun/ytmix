"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Music, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist: Video[]
}

export function ExportDialog({ open, onOpenChange, playlist }: ExportDialogProps) {
  const [fileName, setFileName] = useState("my-playlist")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [selectedVideos, setSelectedVideos] = useState<string[]>(playlist.map((v) => v.id))
  const [mergeIntoSingle, setMergeIntoSingle] = useState(true)

  const handleVideoToggle = (videoId: string) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const handleSelectAll = () => {
    setSelectedVideos(playlist.map((v) => v.id))
  }

  const handleDeselectAll = () => {
    setSelectedVideos([])
  }

  const simulateExport = async () => {
    setIsExporting(true)
    setExportStatus("processing")
    setExportProgress(0)

    const selectedPlaylist = playlist.filter((video) => selectedVideos.includes(video.id))

    try {
      // Simulate processing each video
      for (let i = 0; i < selectedPlaylist.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setExportProgress(((i + 1) / selectedPlaylist.length) * 100)
      }

      // Create a simple text file with playlist info as a demo
      const playlistData = selectedPlaylist
        .map((video, index) => `${index + 1}. ${video.title} - ${video.author}\n   URL: ${video.url}`)
        .join("\n\n")

      const blob = new Blob(
        [
          `YouTube Playlist Export\n${"=".repeat(30)}\n\n` +
            `Playlist Name: ${fileName}\n` +
            `Total Videos: ${selectedPlaylist.length}\n` +
            `Export Type: ${mergeIntoSingle ? "Single MP3 File" : "Individual MP3 Files"}\n\n` +
            `Videos:\n${playlistData}\n\n` +
            `Note: This is a demo export. In a real implementation, this would contain actual MP3 audio data.`,
        ],
        { type: "text/plain" },
      )

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus("success")
    } catch (error) {
      setExportStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  const resetDialog = () => {
    setExportStatus("idle")
    setExportProgress(0)
    setSelectedVideos(playlist.map((v) => v.id))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) {
          setTimeout(resetDialog, 300)
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            MP3 내보내기
          </DialogTitle>
          <DialogDescription>
            선택한 비디오들을 MP3 파일로 내보냅니다. 개별 파일 또는 하나의 긴 파일로 저장할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">파일명</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="my-playlist"
                disabled={isExporting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="merge"
                checked={mergeIntoSingle}
                onCheckedChange={(checked) => setMergeIntoSingle(checked as boolean)}
                disabled={isExporting}
              />
              <Label htmlFor="merge" className="text-sm">
                하나의 긴 MP3 파일로 합치기
              </Label>
            </div>
          </div>

          {/* Video Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                내보낼 비디오 선택 ({selectedVideos.length}/{playlist.length})
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isExporting}
                  className="text-xs bg-transparent"
                >
                  전체 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={isExporting}
                  className="text-xs bg-transparent"
                >
                  전체 해제
                </Button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
              {playlist.map((video) => (
                <div key={video.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedVideos.includes(video.id)}
                    onCheckedChange={() => handleVideoToggle(video.id)}
                    disabled={isExporting}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>내보내는 중...</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Status Messages */}
          {exportStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">플레이리스트가 성공적으로 내보내졌습니다!</AlertDescription>
            </Alert>
          )}

          {exportStatus === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                내보내기 중 오류가 발생했습니다. 다시 시도해주세요.
              </AlertDescription>
            </Alert>
          )}

          {/* Demo Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>데모 버전:</strong> 실제 MP3 변환 기능은 서버 측 처리가 필요합니다. 현재는 플레이리스트 정보가
              포함된 텍스트 파일이 다운로드됩니다.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              취소
            </Button>
            <Button
              onClick={simulateExport}
              disabled={isExporting || selectedVideos.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "내보내는 중..." : "내보내기"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
