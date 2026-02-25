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
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
            </div>
        )
    }

    const totalDays = days.length
    const weeksCount = Math.ceil(totalDays / 7)

    return (
        <div className="h-screen flex flex-col p-6 lg:p-8 bg-slate-50 dark:bg-[#0b1220] transition-colors duration-500 overflow-hidden">

            {/* Header Section */}
            <div className="flex-none flex flex-col md:flex-row items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-500 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-[#0b1220] rounded-md flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800">
                        <CalendarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Calendário</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] p-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPreviousMonth}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[140px] text-center text-slate-900 dark:text-white px-2 transition-colors">
                            {MONTHS[month]} <span className="text-slate-500 dark:text-slate-400 ml-1">{year}</span>
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNextMonth}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToToday}
                            className="h-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white font-medium px-3 rounded-md text-xs transition-colors"
                        >
                            Hoje
                        </Button>
                    </div>
                    <TooltipProvider>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white shadow-sm transition-colors"
                                    aria-label="Mais opções"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
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
            <div className="flex-1 flex flex-col gap-6 min-h-0 max-w-[1600px] w-full mx-auto">

                {/* Calendar Grid Column */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#0b1220] rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-left-8 duration-700">

                    {/* Weekday Headers */}
                    <div className="flex-none grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1220]">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days - Auto Fill Height */}
                    <div className={cn(
                        "flex-1 grid grid-cols-7 bg-slate-200 dark:bg-slate-800 gap-[1px]",
                        weeksCount === 6 ? "grid-rows-6" : weeksCount === 4 ? "grid-rows-4" : "grid-rows-5"
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
                                        "relative group overflow-hidden bg-white dark:bg-[#0b1220] transition-colors p-3 flex flex-col",
                                        !isCurrent && "bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600",
                                        isToday && "ring-1 ring-inset ring-slate-400 dark:ring-slate-600 bg-slate-50 dark:bg-slate-900"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isToday ? "text-slate-900 dark:text-white" : isCurrent ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"
                                        )}>
                                            {date.getDate().toString()}
                                        </span>
                                        {hasActivity && isCurrent && (
                                            <div className={cn(
                                                "w-2 h-2 rounded-lg shadow-sm animate-pulse",
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

                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-lg transition-all duration-1000", metrics.pnl >= 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")}
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
                <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 max-w-[1600px] mx-auto">
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
                                <Card className="order-1 min-w-[240px] snap-start p-4 sm:p-5 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm group transition-colors lg:min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Resultado Mensal</p>
                                    </div>
                                    <div className={cn(
                                        "text-3xl font-medium tracking-tight mt-1",
                                        totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-500"
                                    )}>
                                        {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-slate-500">
                                        Eficiência <span className="ml-1 text-slate-900 dark:text-white font-semibold">{winRate.toFixed(1)}%</span>
                                    </div>
                                </Card>

                                <Card className="order-2 min-w-[240px] snap-start p-4 sm:p-5 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm group transition-colors lg:min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sessões</p>
                                    </div>
                                    <div className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">
                                        {totalTrades} <span className="text-sm text-slate-500 font-normal ml-1">Execuções</span>
                                    </div>
                                </Card>

                                <Card className="order-3 min-w-[240px] snap-start p-4 sm:p-5 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm group transition-colors lg:min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <Target className="h-4 w-4" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Volume</p>
                                    </div>
                                    <div className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">
                                        {tradingDays} <span className="text-sm text-slate-500 font-normal ml-1">Dias Ativos</span>
                                    </div>
                                </Card>

                                <Card className="order-4 min-w-[240px] snap-start p-4 sm:p-5 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm group transition-colors lg:min-w-0 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sequência</p>
                                            <p className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">4 Dias Positivos</p>
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
