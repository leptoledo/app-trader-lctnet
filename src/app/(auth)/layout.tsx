"use client"

import { Sidebar } from "@/components/layout/sidebar"
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
        <div className="flex h-screen overflow-hidden bg-[#f7f9fc] dark:bg-[#0b1220]">
            <div className="hidden md:flex">
                <Sidebar
                    user={{
                        name: user?.user_metadata?.name,
                        email: user?.email,
                        avatar: user?.user_metadata?.avatar_url,
                        plan: plan.name
                    }}
                />
            </div>

            <main className="flex-1 overflow-y-auto">
                <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0b1220]/80 backdrop-blur border-b border-slate-200/70 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">TraderLCTNET</div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[320px]">
                            <Sidebar
                                mode="mobile"
                                user={{
                                    name: user?.user_metadata?.name,
                                    email: user?.email,
                                    avatar: user?.user_metadata?.avatar_url,
                                    plan: plan.name
                                }}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
                {children}
            </main>
        </div>
    )
}
