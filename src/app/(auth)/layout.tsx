"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/hooks/useSubscription"

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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
                user={{
                    name: user?.user_metadata?.name,
                    email: user?.email,
                    avatar: user?.user_metadata?.avatar_url,
                    plan: plan.name
                }}
            />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
