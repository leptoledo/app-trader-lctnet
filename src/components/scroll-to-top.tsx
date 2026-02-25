"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <Button
            variant="secondary"
            size="icon"
            className={cn(
                "fixed bottom-8 right-8 z-50 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
            )}
            onClick={scrollToTop}
            aria-label="Voltar para o topo"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    )
}
