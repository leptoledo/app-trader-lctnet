"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || ""
    const ios = /iphone|ipad|ipod/i.test(ua)
    const nav = navigator as Navigator & { standalone?: boolean }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone

    // Use refs for initial values to avoid cascading renders
    const timer = setTimeout(() => {
      setIsIos(ios)
      setIsStandalone(standalone ?? false)
    }, 0)

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setDeferredPrompt(null))

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  if (isStandalone) return null
  if (!deferredPrompt && !isIos) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <>
      {deferredPrompt ? (
        <Button
          onClick={handleInstall}
          className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-emerald-500/20"
        >
          <Download className="h-4 w-4 mr-2" />
          Instalar App
        </Button>
      ) : (
        <Button
          onClick={() => setShowIosHelp(true)}
          className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-emerald-500/20"
        >
          <Download className="h-4 w-4 mr-2" />
          Instalar no iOS
        </Button>
      )}

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent className="rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar no iPhone/iPad</DialogTitle>
            <DialogDescription>
              No iOS, a instalação é feita pelo menu do Safari.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-slate-500">
            <p>1) Abra este site no Safari.</p>
            <p>2) Toque no botão de compartilhar.</p>
            <p>3) Escolha “Adicionar à Tela de Início”.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowIosHelp(false)} className="rounded-xl">Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
