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

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    } else {
      setShowIosHelp(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleInstall}
        className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-4 h-9 text-sm font-medium border-0 shadow-none transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Instalar App
      </Button>

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent className="rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle>{isIos ? "Instalar no iPhone/iPad" : "Instalar Aplicativo PWA"}</DialogTitle>
            <DialogDescription>
              {isIos
                ? "No iOS, a instalação é feita de forma manual pelo menu do Safari."
                : "Seu navegador já suporta a instalação deste Web App ou ainda está carregando a permissão!"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            {isIos ? (
              <div className="flex flex-col gap-1">
                <p>1) Abra este site diretamente no <b>Safari</b>.</p>
                <p>2) Na barra de navegação embaixo, toque no botão de compartilhar.</p>
                <p>3) Role a lista de opções e escolha “<b>Adicionar à Tela de Início</b>”.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p>
                  1) Fique atento à barra de endereços do seu navegador, na parte de cima da tela.
                </p>
                <p>
                  2) Procure por um botão em formato de <Download className="inline h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded mx-1 p-0.5" /> (Download ou Instalar).
                </p>
                <p className="mt-2 text-xs opacity-80 border-t border-slate-200 dark:border-slate-800 pt-2">
                  Dica Alternativa: Você também pode abrir o menu de "três pontinhos" do seu navegador (Google Chrome, Edge, etc) e clicar em <b>"Instalar Aplicativo"</b> / "Adicionar à Tela Inicial".
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowIosHelp(false)} className="rounded-md">Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
