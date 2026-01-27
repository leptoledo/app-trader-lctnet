"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { calculateDailyMetrics, getMonthDays, DailyMetrics } from "@/lib/calendar"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, TrendingUp, Target, Clock, Zap, MoreHorizontal, FileDown, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

    const getMonthTrades = () => {
        return trades.filter((trade) => {
            const date = trade.exit_date ? new Date(trade.exit_date) : new Date(trade.entry_date)
            return date.getMonth() === month && date.getFullYear() === year
        })
    }

    const handleExportCsv = () => {
        const monthTrades = getMonthTrades().filter((trade) => trade.status === "CLOSED")
        const headers = [
            "ticket_id",
            "symbol",
            "direction",
            "entry_date",
            "exit_date",
            "entry_price",
            "exit_price",
            "quantity",
            "pnl_gross",
            "pnl_net",
            "fees",
            "r_multiple",
            "spread",
            "commission",
            "swap",
            "status"
        ]

        const rows = monthTrades.map((trade) => [
            trade.ticket_id ?? "",
            trade.symbol,
            trade.direction,
            trade.entry_date,
            trade.exit_date ?? "",
            trade.entry_price,
            trade.exit_price ?? "",
            trade.quantity,
            trade.pnl_gross ?? "",
            trade.pnl_net ?? "",
            trade.fees ?? "",
            trade.r_multiple ?? "",
            "",
            trade.commission ?? "",
            trade.swap ?? "",
            trade.status
        ])

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(",")
            )
            .join("\n")

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `trades-${MONTHS[month].toLowerCase()}-${year}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleExportPdf = () => {
        const monthTrades = getMonthTrades().filter((trade) => trade.status === "CLOSED")
        const monthMetrics = dailyMetrics.filter(m => {
            const d = new Date(m.date)
            return d.getMonth() === month && d.getFullYear() === year
        })

        const totalPnL = monthMetrics.reduce((sum, m) => sum + m.pnl, 0)
        const totalTrades = monthMetrics.reduce((sum, m) => sum + m.trades, 0)
        const totalWins = monthMetrics.reduce((sum, m) => sum + m.wins, 0)
        const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0

        const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório ${MONTHS[month]} ${year}</title>
    <style>
      body { font-family: "Roboto", Arial, sans-serif; color: #0f172a; padding: 32px; background: #f8fafc; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .brand { font-weight: 800; letter-spacing: 0.12em; font-size: 11px; color: #256bd1; text-transform: uppercase; }
      h1 { font-size: 22px; margin: 4px 0 0; }
      .summary { margin: 10px 0 18px; font-size: 12px; color: #475569; }
      .card { background: #ffffff; border-radius: 16px; padding: 16px; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06); }
      .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
      .stat { background: #f1f5f9; border-radius: 12px; padding: 12px; font-size: 12px; color: #334155; }
      .stat strong { display: block; font-size: 16px; color: #0f172a; margin-top: 6px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border-radius: 14px; overflow: hidden; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
      th { background: #eff6ff; color: #1e40af; font-weight: 700; }
      tr:last-child td { border-bottom: none; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">TraderLCTNET</div>
        <h1>Relatório mensal - ${MONTHS[month]} ${year}</h1>
      </div>
      <div class="summary">Gerado em ${new Date().toLocaleDateString()}</div>
    </div>
    <div class="card stats">
      <div class="stat">PnL total<strong>${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toFixed(2)}</strong></div>
      <div class="stat">Trades<strong>${totalTrades}</strong></div>
      <div class="stat">Win rate<strong>${winRate.toFixed(1)}%</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Ticket</th>
          <th>Ativo</th>
          <th>Direção</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th>Preço Ent.</th>
          <th>Preço Saída</th>
          <th>Qtd.</th>
          <th>PNL Líquido</th>
          <th>Fees</th>
          <th>R</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${monthTrades
            .map((trade) => `
          <tr>
            <td>${trade.ticket_id ?? ""}</td>
            <td>${trade.symbol}</td>
            <td>${trade.direction}</td>
            <td>${trade.entry_date}</td>
            <td>${trade.exit_date ?? ""}</td>
            <td>${trade.entry_price}</td>
            <td>${trade.exit_price ?? ""}</td>
            <td>${trade.quantity}</td>
            <td>${trade.pnl_net ?? ""}</td>
            <td>${trade.fees ?? ""}</td>
            <td>${trade.r_multiple ?? ""}</td>
            <td>${trade.status}</td>
          </tr>
        `)
            .join("")}
      </tbody>
    </table>
  </body>
</html>
        `

        const printWindow = window.open("", "_blank")
        if (!printWindow) return
        printWindow.document.open()
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1220]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const totalDays = days.length
    const weeksCount = Math.ceil(totalDays / 7)

    return (
        <div className="h-screen flex flex-col p-8 bg-[#f7f9fc] dark:bg-[#0b1220] transition-colors duration-500 overflow-hidden">

            {/* Header Section */}
            <div className="flex-none flex flex-col md:flex-row items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                        <CalendarIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Consistência</p>
                        <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Calendário P&L</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-semibold min-w-[160px] text-center text-slate-900 dark:text-white font-heading px-4 border-x border-slate-100 dark:border-slate-800 uppercase tracking-widest transition-all">
                        {MONTHS[month]} <span className="text-blue-500 dark:text-blue-400 ml-1">{year}</span>
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
                        className="h-10 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 font-semibold px-4 rounded-xl text-[10px] uppercase tracking-widest"
                    >
                        HOJE
                    </Button>
                    </div>
                    <TooltipProvider>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-2xl border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-xl"
                                    aria-label="Mais opções"
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[220px]">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuItem className="gap-2" onClick={handleExportPdf}>
                                            <FileDown className="h-4 w-4 text-slate-400" />
                                            Extrair Relatório Completo
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>Gera um relatório mensal em PDF</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuItem className="gap-2" onClick={handleExportCsv}>
                                            <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                                            Exportar CSV
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>Baixa os trades do mês em CSV</TooltipContent>
                                </Tooltip>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipProvider>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-8 min-h-0">

                {/* Calendar Grid Column */}
                <div className="flex-none flex flex-col bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700">

                    {/* Weekday Headers */}
                    <div className="flex-none grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days - Auto Fill Height */}
                    <div className={cn(
                        "grid grid-cols-7 bg-slate-100 dark:bg-slate-800 gap-[1px]",
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
                                            "text-xs font-semibold font-heading transition-colors",
                                            isToday ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-400"
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
                                                    "text-sm font-semibold font-heading tracking-tight",
                                                    metrics.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                                                )}>
                                                    {metrics.pnl >= 0 ? '+' : '-'}${Math.abs(Math.round(metrics.pnl)).toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
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

                {/* Info Section (below calendar) */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
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
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0">
                                <Card className="order-1 min-w-[240px] snap-start p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group transition-all lg:min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Resultado Mensal</p>
                                    </div>
                                    <div className={cn(
                                        "text-3xl font-heading font-semibold tracking-tight",
                                        totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                                    )}>
                                        {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="mt-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                        Eficiência <span className="ml-2 text-emerald-500">{winRate.toFixed(1)}%</span>
                                    </div>
                                </Card>

                                <Card className="order-2 min-w-[240px] snap-start p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group transition-all lg:min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sessões</p>
                                    </div>
                                    <div className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">
                                        {totalTrades} <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest ml-1">Execuções</span>
                                    </div>
                                </Card>

                                <Card className="order-3 min-w-[240px] snap-start p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group transition-all lg:min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Volume</p>
                                    </div>
                                    <div className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">
                                        {tradingDays} <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest ml-1">Dias Ativos</span>
                                    </div>
                                </Card>

                                <Card className="order-4 min-w-[240px] snap-start p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl group transition-all flex items-center justify-between lg:min-w-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sequência</p>
                                            <p className="text-xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">4 Dias Positivos</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })()}
                </div>

            </div>
        </div>
    )
}
