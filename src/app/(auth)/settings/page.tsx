"use client"

import { useSubscription } from "@/hooks/useSubscription"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, CreditCard, Shield, User, Crown, ArrowLeft, Loader2, Sparkles, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { plan, loading, isFree } = useSubscription()

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020617] p-8 transition-colors duration-500">
            <div className="max-w-6xl mx-auto w-full space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                            <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Preferências</p>
                            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-75">
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-1">
                            <Button variant="ghost" className="w-full justify-between h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                <span className="flex items-center"><User className="h-4 w-4 mr-3" /> Perfil Geral</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                <CreditCard className="h-4 w-4 mr-3 text-slate-400" /> Faturamento
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                <Shield className="h-4 w-4 mr-3 text-slate-400" /> Segurança
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">

                        {/* Subscription Status Card */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">

                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000" />

                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                            Status da Conta
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Controle de limites e plano contratado.</CardDescription>
                                    </div>
                                    <Badge className={cn(
                                        "uppercase font-black text-[10px] px-4 py-2 rounded-xl tracking-widest border shadow-sm",
                                        isFree
                                            ? "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
                                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                                    )}>
                                        Nível: {plan.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10 relative z-10">

                                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group-hover:border-blue-500/20">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                            <Crown className="h-8 w-8 fill-white/10" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">Plano {plan.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                                                {isFree ? "Você está usando a versão base com limites reduzidos." : "Acesso total habilitado para este período."}
                                            </p>
                                        </div>
                                    </div>
                                    {isFree && (
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-8 font-black uppercase tracking-tighter text-xs shadow-xl shadow-blue-500/20 w-fit" asChild>
                                            <Link href="/pricing" className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" /> Evoluir Plano
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 ml-1">
                                        <Sparkles className="h-4 w-4 text-slate-400" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Métricas de Utilização</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trades / Mês</p>
                                                    <p className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                                                        12 <span className="text-sm text-slate-500 font-medium">de {plan.limits.tradesPerMonth === 999999 ? '∞' : plan.limits.tradesPerMonth}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full w-[12%] rounded-full shadow-sm"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contas Conectadas</p>
                                                    <p className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                                                        1 <span className="text-sm text-slate-500 font-medium">de {plan.limits.accounts}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[100%] rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </div>
    )
}
