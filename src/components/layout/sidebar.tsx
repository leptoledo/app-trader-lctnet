"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    BarChart3,
    TrendingUp,
    BookOpen,
    Notebook,
    Users,
    Upload,
    Wallet,
} from "lucide-react"

interface SidebarProps {
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

export function Sidebar({ mode = "desktop" }: SidebarProps) {
    const pathname = usePathname()
    const isMobile = mode === "mobile"

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-[#fbfcfd] dark:bg-[#0b1220] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative z-20 shrink-0",
                isMobile ? "w-full" : "w-64"
            )}
        >
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <div className="mb-4 px-3">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Geral</p>
                </div>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-1.5 text-sm rounded-md transition-all duration-200 group relative",
                                isActive
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-colors", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500")} />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
