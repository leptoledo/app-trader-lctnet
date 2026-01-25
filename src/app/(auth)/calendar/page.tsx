"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { calculateDailyMetrics, getMonthDays, DailyMetrics } from "@/lib/calendar"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, TrendingUp, Target, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function CalendarPage() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    useEffect(() => {
        async function fetchTrades() {
            try {
                const { data, error } = await supabase
                    .from('trades')
                    .select('*')
                    .order('exit_date', { ascending: false })

                if (error) throw error

                const fetchedTrades = (data || []) as unknown as Trade[]
                setTrades(fetchedTrades)
                setDailyMetrics(calculateDailyMetrics(fetchedTrades))
            } catch (error) {
                console.error('Erro ao carregar trades:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTrades()
    }, [])

    const days = getMonthDays(year, month)

    const getDayMetrics = (date: Date): DailyMetrics | undefined => {
        const dateStr = date.toISOString().split('T')[0]
        return dailyMetrics.find(m => m.date === dateStr)
    }

    const isCurrentMonth = (date: Date) => date.getMonth() === month

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const totalDays = days.length
    const weeksCount = Math.ceil(totalDays / 7)

    return (
        <div className="h-screen flex flex-col p-8 bg-slate-50 dark:bg-[#020617] transition-colors duration-500 overflow-hidden">

            {/* Header Section */}
            <div className="flex-none flex flex-col md:flex-row items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                        <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Consistência</p>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Calendário P&L</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-black min-w-[160px] text-center text-slate-900 dark:text-white font-heading px-4 border-x border-slate-100 dark:border-slate-800 uppercase tracking-widest transition-all">
                        {MONTHS[month]} <span className="text-blue-600 dark:text-blue-400 ml-1">{year}</span>
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="w-[1px] h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToToday}
                        className="h-10 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-black px-4 rounded-xl text-[10px] uppercase tracking-widest"
                    >
                        HOJE
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">

                {/* Calendar Grid Column */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700">

                    {/* Weekday Headers */}
                    <div className="flex-none grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days - Auto Fill Height */}
                    <div className={cn(
                        "flex-1 grid grid-cols-7 bg-slate-100 dark:bg-slate-800 gap-[1px]",
                        weeksCount === 6 ? "grid-rows-6" : "grid-rows-5"
                    )}>
                        {days.map((date, idx) => {
                            const metrics = getDayMetrics(date)
                            const isCurrent = isCurrentMonth(date)
                            const isToday = date.toDateString() === new Date().toDateString()
                            const hasActivity = metrics && metrics.trades > 0

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "relative group overflow-hidden bg-white dark:bg-[#0b1121] transition-all p-4 flex flex-col",
                                        !isCurrent && "bg-slate-50/50 dark:bg-slate-950/50 opacity-40",
                                        isToday && "ring-2 ring-inset ring-blue-500/50 bg-blue-500/[0.03]"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-xs font-black font-heading transition-colors",
                                            isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-400"
                                        )}>
                                            {date.getDate().toString().padStart(2, '0')}
                                        </span>
                                        {hasActivity && isCurrent && (
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shadow-sm animate-pulse",
                                                metrics.pnl >= 0 ? "bg-emerald-500" : "bg-red-500 shadow-red-500/20"
                                            )} />
                                        )}
                                    </div>

                                    {/* Metrics Display */}
                                    {metrics && isCurrent && hasActivity ? (
                                        <div className="mt-auto space-y-2 animate-in fade-in zoom-in-95 duration-500">
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-sm font-black font-heading tracking-tight",
                                                    metrics.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                                                )}>
                                                    {metrics.pnl >= 0 ? '+' : '-'}${Math.abs(Math.round(metrics.pnl)).toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {metrics.trades} {metrics.trades === 1 ? 'trade' : 'trades'}
                                                </span>
                                            </div>

                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", metrics.pnl >= 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Subtle Grid Accent */}
                                    <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="w-full lg:w-72 flex-none flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                    {(() => {
                        const monthMetrics = dailyMetrics.filter(m => {
                            const d = new Date(m.date)
                            return d.getMonth() === month && d.getFullYear() === year
                        })

                        const totalPnL = monthMetrics.reduce((sum, m) => sum + m.pnl, 0)
                        const totalTrades = monthMetrics.reduce((sum, m) => sum + m.trades, 0)
                        const totalWins = monthMetrics.reduce((sum, m) => sum + m.wins, 0)
                        const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0
                        const tradingDays = monthMetrics.filter(m => m.trades > 0).length

                        return (
                            <>
                                <Card className="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden group flex-none flex flex-col justify-center transition-all">
                                    <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 relative z-10">Resultado Mensal</p>
                                    <div className={cn(
                                        "text-4xl font-heading font-black tracking-tighter relative z-10",
                                        totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 relative z-10 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Eficiência</p>
                                            <p className="text-sm font-black text-emerald-400">{winRate.toFixed(1)}%</p>
                                        </div>
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-blue-400" />
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
                                    <Card className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group hover:-translate-y-1 transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sessões</p>
                                        </div>
                                        <div className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                            {totalTrades} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Execuções</span>
                                        </div>
                                    </Card>

                                    <Card className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group hover:-translate-y-1 transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <Target className="h-5 w-5" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Volume</p>
                                        </div>
                                        <div className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                            {tradingDays} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Dias Ativos</span>
                                        </div>
                                    </Card>

                                    <Card className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group hover:-translate-y-1 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sequência</p>
                                                <p className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">4 Dias Positivos</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <Button className="h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                    Extrair Relatório Completo
                                </Button>
                            </>
                        )
                    })()}
                </div>

            </div>
        </div>
    )
}
