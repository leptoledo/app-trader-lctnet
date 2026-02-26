"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/hooks/useSubscription"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface AuthLayoutProps {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const router = useRouter()
    const { plan, loading: subLoading } = useSubscription()
    const [user, setUser] = useState<any>(null)
    const [publicName, setPublicName] = useState<string>("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUser() {
            // Demo mode check
            const urlDemo = new URLSearchParams(window.location.search).get("demo") === "true";
            const sessionDemo = typeof window !== 'undefined' ? sessionStorage.getItem('demo_mode') === 'true' : false;

            if (urlDemo) {
                sessionStorage.setItem("demo_mode", "true");
            }

            const isDemo = urlDemo || sessionDemo;

            if (isDemo) {
                setUser({ id: "demo-id", email: "trader@demonstracao.com", user_metadata: { name: "Trader Pro (Demo)" } });
                setPublicName("Trader Pro (Demo)");
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            try {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("username, settings")
                    .eq("id", user.id)
                    .single()

                const settings = (profile?.settings as Record<string, unknown>) || {}
                const nameFromSettings = (settings.public_name as string) || ""
                setPublicName(nameFromSettings || profile?.username || user.user_metadata?.name || "")
            } catch {
                // Ignore profile load constraints, fallback to metadata
                setPublicName(user.user_metadata?.name || "")
            }

            setUser(user)
            setLoading(false)
        }

        getUser()
    }, [router])

    if (loading || (!user && !(new URLSearchParams(window.location.search).get("demo") === "true" || (typeof window !== 'undefined' && sessionStorage.getItem('demo_mode') === 'true')) && subLoading)) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    const isDemoMode = typeof window !== 'undefined' && sessionStorage.getItem("demo_mode") === "true";

    const handleExitDemo = () => {
        sessionStorage.removeItem("demo_mode");
        window.location.href = "/"; // Force hard refresh to home
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#020617]">
            {isDemoMode && (
                <div className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between z-50 animate-in slide-in-from-top-2">
                    <span className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span> MODO DEMONSTRAÇÃO ATIVO</span>
                    <Button variant="ghost" size="sm" onClick={handleExitDemo} className="h-6 px-3 text-white hover:bg-white/20 hover:text-white rounded text-[10px] tracking-wider uppercase border border-white/20">
                        Sair da Demonstração
                    </Button>
                </div>
            )}
            <Topbar
                user={{
                    name: publicName,
                    email: user?.email,
                    avatar: user?.user_metadata?.avatar_url,
                    plan: plan.name
                }}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:flex w-[60px] shrink-0 relative z-50">
                    <Sidebar />
                </div>

                <main className="flex-1 overflow-y-auto bg-slate-50 border-l border-slate-200 dark:bg-[#0b1220] dark:border-slate-800">
                    <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0b1220]/80 backdrop-blur border-b border-slate-200/70 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center shadow-sm">
                                <span className="text-white text-[10px] font-bold tracking-tighter">LCT</span>
                            </div>
                            <span className="font-medium">LCTNET</span>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-md border-slate-200 dark:border-slate-700">
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[280px] bg-[#fbfcfd] dark:bg-[#0b1220] border-r-slate-200 dark:border-r-slate-800">
                                <Sidebar mode="mobile" />
                            </SheetContent>
                        </Sheet>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    )
}
