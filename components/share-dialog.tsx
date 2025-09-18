"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { playlistSharing } from "@/lib/playlist-sharing"
import { urlShortener } from "@/lib/url-shortener"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Link, AlertCircle, CheckCircle, ExternalLink, Zap } from "lucide-react"
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
  const [shortUrl, setShortUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isShortening, setIsShortening] = useState(false)
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
      setShortUrl("") // 새로운 링크 생성시 단축링크 초기화

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

  const generateShortUrl = async () => {
    if (!shareUrl) {
      toast({
        title: "먼저 공유 링크를 생성해주세요",
        description: "긴 링크를 먼저 만든 후 단축할 수 있습니다.",
        variant: "destructive"
      })
      return
    }

    setIsShortening(true)

    try {
      const result = await urlShortener.shortenUrl(shareUrl)

      if (result.success && result.shortUrl) {
        setShortUrl(result.shortUrl)
        toast({
          title: "단축 링크가 생성되었습니다!",
          description: "훨씬 짧은 링크로 공유할 수 있습니다."
        })
      } else {
        toast({
          title: "단축 링크 생성 실패",
          description: result.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "단축 링크 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsShortening(false)
    }
  }

  const copyToClipboard = async (url: string = shareUrl) => {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // 2초 후 원래 상태로

      toast({
        title: "링크가 복사되었습니다!",
        description: "다른 곳에 붙여넣기 할 수 있습니다."
      })
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = url
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

  const openInNewTab = (url: string = shareUrl) => {
    window.open(url, '_blank')
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

          {/* 링크 생성 버튼 */}
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button
                onClick={generateShareUrl}
                disabled={isGenerating || !shareCheck.canShare}
                size="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link className="h-4 w-4 mr-2" />
                {isGenerating ? "생성 중..." : "공유 링크 생성"}
              </Button>
              {shareUrl && (
                <Button
                  onClick={generateShortUrl}
                  disabled={isShortening}
                  size="default"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isShortening ? "단축 중..." : "단축 링크 생성"}
                </Button>
              )}
            </div>

            {/* 일반 공유 링크 */}
            {shareUrl && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">공유 링크</Label>
                <div className="relative">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="pr-12 font-mono text-sm bg-muted"
                  />
                  <Button
                    onClick={() => copyToClipboard(shareUrl)}
                    size="sm"
                    variant="ghost"
                    className={`absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/80 transition-colors ${
                      isCopied ? 'text-green-600 hover:text-green-700' : ''
                    }`}
                    title="복사"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* 단축 링크 */}
            {shortUrl && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-green-700">단축 링크 ✨</Label>
                <div className="relative">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="pr-12 bg-green-50 border-green-200 text-green-800 font-mono"
                  />
                  <Button
                    onClick={() => copyToClipboard(shortUrl)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-green-100 text-green-600"
                    title="복사"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  <p>🎉 단축 링크가 생성되었습니다! 더 쉽게 공유할 수 있습니다.</p>
                </div>
              </div>
            )}
          </div>

          {/* 사용 안내 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">사용 방법</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 링크를 복사해서 다른 사람과 공유하세요</p>
              <p>• 받은 사람이 클릭하면 자동으로 플레이리스트가 로드됩니다</p>
              <p>• 최대 50곡까지 공유 가능합니다</p>
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