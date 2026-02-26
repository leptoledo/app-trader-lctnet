"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, MessageSquare, Settings, LogOut, Search, Bell, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TopbarProps {
    user?: {
        name?: string
        email?: string
        avatar?: string
        plan?: string
    }
}

export function Topbar({ user }: TopbarProps) {
    const pathname = usePathname()
    const router = useRouter()

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

    const currentPath = pathname?.split('/')[1] || "dashboard"
    const displayPath = currentPath.charAt(0).toUpperCase() + currentPath.slice(1)

    return (
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] flex items-center justify-between px-4 z-50 relative shrink-0">
            {/* Left side: Logo & Breadcrumbs */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center shadow-sm">
                        <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                </Link>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Trader Journal
                        <span className="text-[9px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full font-mono uppercase font-semibold">
                            {user?.plan || "Free"}
                        </span>
                    </span>
                    <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {displayPath}
                    </span>
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="hidden md:flex text-slate-500 hover:text-slate-900 text-[13px] h-8 font-medium" asChild>
                    <Link href="/feedback">Feedback</Link>
                </Button>

                <div className="hidden md:flex items-center w-56 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 mr-2 transition-colors hover:border-slate-300 cursor-pointer">
                    <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
                    <span className="text-[13px] text-slate-400 flex-1">Search...</span>
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1 font-mono text-[10px] font-medium text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <span className="text-[11px]">⌘</span>K
                    </kbd>
                </div>

                <div className="flex items-center gap-1 mr-2 border-l border-slate-200 dark:border-slate-800 pl-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full">
                        <Bell className="h-4 w-4" />
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold dark:bg-slate-800 dark:text-slate-300">
                                    {user?.name?.[0] || user?.email?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || user?.email?.split("@")[0] || "Usuário"}</p>
                                <p className="text-xs leading-none text-slate-500">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configurações</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/feedback" className="cursor-pointer">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Feedback</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
