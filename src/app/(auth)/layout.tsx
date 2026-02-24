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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUser(user)
            setLoading(false)
        }

        getUser()
    }, [router])

    if (loading || subLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#020617]">
            <Topbar
                user={{
                    name: user?.user_metadata?.name,
                    email: user?.email,
                    avatar: user?.user_metadata?.avatar_url,
                    plan: plan.name
                }}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:flex">
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
