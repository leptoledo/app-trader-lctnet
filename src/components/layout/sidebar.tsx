"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    BarChart3,
    TrendingUp,
    BookOpen,
    Notebook,
    Plus,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Upload,
    Wallet
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"

interface SidebarProps {
    user?: {
        name?: string
        email?: string
        avatar?: string
        plan?: string
    }
    mode?: "desktop" | "mobile"
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendário", href: "/calendar", icon: Calendar },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Trades", href: "/trades", icon: TrendingUp },
    { name: "Diário", href: "/journal", icon: BookOpen },
    { name: "Notebook", href: "/notebook", icon: Notebook },
    { name: "Comunidade", href: "/community", icon: Users },
    { name: "Contas", href: "/accounts", icon: Wallet },
    { name: "Importar", href: "/import", icon: Upload },
]

export function Sidebar({ user, mode = "desktop" }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)
    const isMobile = mode === "mobile"

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            toast.success("Logout realizado com sucesso!")
            router.push('/login')
            router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            toast.error("Erro ao sair: " + message)
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white dark:bg-[#0b1220] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative z-20",
                isMobile ? "w-full" : collapsed ? "w-20" : "w-72"
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200 dark:border-slate-800">
                {(!collapsed || isMobile) && (
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-heading font-semibold text-slate-800 dark:text-white tracking-tight">
                            Trader<span className="text-blue-500">LCTNET</span>
                        </span>
                    </Link>
                )}
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn("h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white", collapsed && "mx-auto")}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                            title={collapsed && !isMobile ? item.name : undefined}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                            <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300")} />
                            {(!collapsed || isMobile) && <span>{item.name}</span>}
                        </Link>
                    )
                })}

                {/* New Trade Button */}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                        href="/trades/new"
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5",
                            "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        )}
                        title={collapsed ? "Novo Trade" : undefined}
                    >
                        <Plus className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>Novo Trade</span>}
                    </Link>
                </div>
            </nav>

            {/* User Profile */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                {(!collapsed || isMobile) ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <ModeToggle />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alternar Tema</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">
                                    {user?.name?.[0] || user?.email?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                    {user?.name || user?.email?.split("@")[0] || "Usuário"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                        {user?.plan || "Gratuito"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:border-slate-700 dark:hover:bg-slate-800"
                            asChild
                        >
                            <Link href="/settings">
                                <Settings className="h-4 w-4 mr-2" />
                                Configurações
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 items-center">
                        <ModeToggle />
                        <Button variant="ghost" size="icon" asChild className="opacity-70 hover:opacity-100">
                            <Link href="/settings">
                                <Settings className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 opacity-70 hover:opacity-100">
                            <LogOut className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {user?.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                )}
            </div>
        </div>
    )
}
