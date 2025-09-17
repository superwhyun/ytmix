"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { playlistSharing } from "@/lib/playlist-sharing"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Link, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Video {
  id: string
  title: string
  thumbnail: string
  url: string
  embedUrl: string
  author: string
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist: Video[]
}

export function ShareDialog({ open, onOpenChange, playlist }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const generateShareUrl = () => {
    if (playlist.length === 0) {
      toast({
        title: "플레이리스트가 비어있습니다",
        description: "공유할 비디오를 추가해주세요.",
        variant: "destructive"
      })
      return
    }

    const shareCheck = playlistSharing.canShare(playlist)
    if (!shareCheck.canShare) {
      toast({
        title: "공유할 수 없습니다",
        description: shareCheck.reason,
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const url = playlistSharing.encodeToUrl(playlist)
      setShareUrl(url)

      toast({
        title: "공유 링크가 생성되었습니다!",
        description: `${playlist.length}곡의 플레이리스트`
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // 2초 후 원래 상태로

      toast({
        title: "링크가 복사되었습니다!",
        description: "다른 곳에 붙여넣기 할 수 있습니다."
      })
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast({
        title: "링크가 복사되었습니다!",
        description: "다른 곳에 붙여넣기 할 수 있습니다."
      })
    }
  }

  const openInNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  const estimatedLength = playlist.length > 0 ? playlistSharing.estimateUrlLength(playlist) : 0
  const shareCheck = playlistSharing.canShare(playlist)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            플레이리스트 공유
          </DialogTitle>
          <DialogDescription>
            링크를 통해 다른 사람과 플레이리스트를 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 플레이리스트 정보 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">플레이리스트 정보</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">총 {playlist.length}곡</span>
                <span className="text-xs text-muted-foreground">
                  예상 URL 길이: {estimatedLength.toLocaleString()}자
                </span>
              </div>
            </div>
          </div>

          {/* 상태 알림 */}
          {!shareCheck.canShare && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {shareCheck.reason}
              </AlertDescription>
            </Alert>
          )}

          {playlist.length > 40 && shareCheck.canShare && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                플레이리스트가 큽니다. 일부 브라우저에서 링크가 작동하지 않을 수 있습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 공유 링크 생성 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">공유 링크</Label>
              <Button
                onClick={generateShareUrl}
                disabled={isGenerating || !shareCheck.canShare}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link className="h-4 w-4 mr-2" />
                {isGenerating ? "생성 중..." : "링크 생성"}
              </Button>
            </div>

            {shareUrl && (
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    value={shareUrl}
                    readOnly
                    className="min-h-[100px] text-sm font-mono bg-muted pr-12 resize-none overflow-auto"
                    placeholder="링크가 여기에 생성됩니다..."
                    style={{
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="ghost"
                    className={`absolute top-2 right-2 h-8 w-8 p-0 hover:bg-background/80 transition-colors ${
                      isCopied ? 'text-green-600 hover:text-green-700' : ''
                    }`}
                    title="클립보드에 복사"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className={`flex-1 transition-colors ${
                      isCopied ? 'border-green-600 text-green-600 hover:bg-green-50' : ''
                    }`}
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {isCopied ? '복사됨!' : '전체 링크 복사'}
                  </Button>
                  <Button
                    onClick={openInNewTab}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    새 탭에서 열기
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>💡 팁: 텍스트 영역 위의 복사 버튼을 클릭하거나 링크를 선택해서 복사할 수 있습니다.</p>
                </div>
              </div>
            )}
          </div>

          {/* 사용 안내 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">사용 방법</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 생성된 링크를 복사해서 다른 사람과 공유하세요</p>
              <p>• 링크를 받은 사람이 클릭하면 자동으로 플레이리스트가 로드됩니다</p>
              <p>• 최대 50곡까지 공유 가능합니다</p>
              <p>• 링크는 영구적으로 유효합니다</p>
            </div>
          </div>

          {shareUrl && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                공유 링크가 성공적으로 생성되었습니다! 이제 다른 사람과 플레이리스트를 공유할 수 있습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 닫기 버튼 */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}