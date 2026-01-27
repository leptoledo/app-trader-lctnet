"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { Loader2, ArrowLeft, TrendingUp, Clock, DollarSign, BarChart3, ChevronRight, Sparkles, Filter } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import { analyzeByDayOfWeek, analyzeByHour, analyzeBySymbol, analyzeRMultiple } from "@/lib/advanced-analytics"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {
    const router = useRouter()
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                const { data, error } = await supabase
                    .from('trades')
                    .select('*')
                    .order('entry_date', { ascending: false })

                if (error) throw error

                const fetchedTrades = (data || []) as unknown as Trade[]
                setTrades(fetchedTrades)

            } catch (error: any) {
                toast.error('Falha ao carregar analytics: ' + error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const dayOfWeekData = analyzeByDayOfWeek(trades)
    const hourData = analyzeByHour(trades)
    const symbolData = analyzeBySymbol(trades)
    const rMultipleData = analyzeRMultiple(trades)

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-7xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" asChild className="rounded-2xl h-12 w-12 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                            <Link href="/"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Análise Profunda</p>
                            <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Analytics Avançado</h1>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Primary Analytics (Left Side) */}
                    <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-75">

                        {/* Day & Hour Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all hover:bg-white/80 dark:hover:bg-slate-900/60">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-heading font-semibold uppercase tracking-widest text-slate-900 dark:text-white leading-none">Consistência Diária</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-semibold text-slate-400 mt-1">Análise dos melhores dias operados</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="h-[240px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dayOfWeekData}>
                                                <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{data.day}</p>
                                                                    <p className={cn("text-sm font-semibold", data.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                                                                        ${data.pnl.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                                                    {dayOfWeekData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all hover:bg-white/80 dark:hover:bg-slate-900/60">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-heading font-semibold uppercase tracking-widest text-slate-900 dark:text-white leading-none">Vantagem Horária</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-semibold text-slate-400 mt-1">Janelas de performance intradiária</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="h-[240px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={hourData}>
                                                <XAxis dataKey="hour" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Hora: {data.hour}</p>
                                                                    <p className={cn("text-sm font-semibold", data.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                                                                        ${data.pnl.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                                                    {hourData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* R-Multiple Distribution (Large Chart) */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000" />
                            <CardHeader className="p-10 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center">
                                            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-heading font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Qualidade do R-Múltiplo</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-semibold text-slate-400 mt-1">Curva de distribuição de Risco vs Retorno</CardDescription>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-4">
                                <div className="h-[340px] pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={rMultipleData} layout="vertical" margin={{ left: 20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 800 }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] shadow-2xl">
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{data.label}</p>
                                                                <p className="text-lg font-semibold text-purple-500">{data.count} Trades</p>
                                                            </div>
                                                        )
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 12, 12, 0]} barSize={32}>
                                                {rMultipleData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#10b981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Leaderboard (Right Side) */}
                    <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden flex flex-col h-full min-h-[600px]">
                            <CardHeader className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="text-sm font-heading font-semibold uppercase tracking-widest text-slate-900 dark:text-white leading-none">Principais Ativos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                {symbolData.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                            <BarChart3 className="h-6 w-6" />
                                        </div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Dataset ausente</p>
                                    </div>
                                ) : (
                                    symbolData.map((item, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-lg hover:-translate-y-0.5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 group-hover:bg-[#2b7de9] transition-colors duration-500">
                                                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white">{idx + 1}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">{item.symbol}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.trades} execuções • {item.winRate.toFixed(1)}% WR</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "font-semibold text-sm tracking-tight",
                                                    item.pnl >= 0 ? "text-emerald-500" : "text-red-500"
                                                )}>
                                                    {item.pnl >= 0 ? '+' : '-'}${Math.abs(item.pnl).toLocaleString('en-US', { minimumFractionDigits: 1 })}
                                                </p>
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-tighter">Ver Detalhes</span>
                                                    <ChevronRight className="h-3 w-3 text-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                            <div className="p-8 mt-auto border-t border-slate-100 dark:border-slate-800/50">
                                <Button className="w-full h-14 rounded-2xl bg-[#2b7de9] hover:bg-[#256bd1] text-white font-semibold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all">
                                    Baixar Dataset em PDF
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    )
}
