"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { calculateMetrics } from "@/lib/analytics"
import { Trade } from "@/types"
import { Loader2, ArrowRight, TrendingUp, Plus, ChevronRight, Target, Activity } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


import { EquityChart } from "@/components/equity-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter, getDateRangeFilter, DateRangePreset } from "@/components/date-range-filter"
import { SharedTradeCard } from "@/components/shared-trade-card"
import { calculateDailyMetrics, formatLocalDateKey } from "@/lib/calendar"
import { analyzeByHour } from "@/lib/advanced-analytics"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { useAccounts } from "@/hooks/useAccounts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"
import { demoTrades } from "@/lib/demo-data"

const DemoTour = dynamic(() => import("@/components/demo-tour").then(mod => mod.DemoTour), { ssr: false })

export default function Dashboard() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRangePreset>("week")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const { accounts } = useAccounts()
  const [equityView, setEquityView] = useState<"balance" | "drawdown">("balance")
  const [customRange, setCustomRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })
  const [metrics, setMetrics] = useState({
    netPnL: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    avgWin: 0,
    runningTrades: 0,
    grossProfit: 0,
    grossLoss: 0,
    avgLoss: 0,
    equityCurve: [] as { date: string; equity: number }[]
  })
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const urlDemo = new URLSearchParams(window.location.search).get("demo") === "true";
        const sessionDemo = typeof window !== 'undefined' ? sessionStorage.getItem('demo_mode') === 'true' : false;
        const isDemo = urlDemo || sessionDemo;

        if (isDemo) {
          setUser({ id: "demo-id", email: "trader@demonstracao.com", user_metadata: { name: "Trader Pro (Demo)" } as any } as any)
          setTrades(demoTrades as any)
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user as any)

        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('entry_date', { ascending: false })

        if (error) throw error

        const fetchedTrades = (data || []) as unknown as Trade[]
        setTrades(fetchedTrades)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        toast.error('Falha ao carregar dashboard: ' + message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    let { from, to } = getDateRangeFilter(dateRange)

    if (dateRange === 'custom') {
      from = customRange.from || null
      to = customRange.to || null
    }

    let scopedTrades = trades

    // Filtro de Conta
    if (selectedAccountId !== "all") {
      scopedTrades = scopedTrades.filter(t => t.account_id === selectedAccountId)
    }

    if (from || to) {
      scopedTrades = scopedTrades.filter(t => {
        const tradeDate = new Date(t.entry_date)
        const isAfterFrom = from ? tradeDate >= from : true
        const isBeforeTo = to ? tradeDate <= to : true
        return isAfterFrom && isBeforeTo
      })
    }
    setMetrics(calculateMetrics(scopedTrades))
    setFilteredTrades(scopedTrades)
  }, [trades, dateRange, customRange, selectedAccountId])

  const calendarBaseDate = useMemo(() => {
    let { from, to } = getDateRangeFilter(dateRange)

    if (dateRange === 'custom') {
      from = customRange.from || null
      to = customRange.to || null
    }

    return to || from || new Date()
  }, [dateRange, customRange])

  const weekDays = useMemo(() => {
    const start = new Date(calendarBaseDate)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }, [calendarBaseDate])

  const equityChartData = useMemo(() => {
    if (equityView === "balance") return metrics.equityCurve
    if (!metrics.equityCurve.length) return metrics.equityCurve

    let peak = -Infinity
    return metrics.equityCurve.map(point => {
      peak = Math.max(peak, point.equity)
      return {
        date: point.date,
        equity: Math.max(peak - point.equity, 0)
      }
    })
  }, [equityView, metrics.equityCurve])

  if (loading) return <DashboardSkeleton />

  const dailyMetrics = calculateDailyMetrics(filteredTrades)
  const today = new Date();
  const hourlyData = analyzeByHour(filteredTrades)
  const recentTrades = filteredTrades.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#0b1220] flex flex-col font-sans pb-12 transition-colors duration-500">
      <DemoTour />
      {/* Clean Dashboard Header */}
      <div className="bg-white dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 gap-4 shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h1 className="text-xl font-medium text-slate-900 dark:text-white">Dashboard Overview</h1>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block" />

          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full md:w-[200px] h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm text-sm focus:ring-emerald-500 transition-colors">
              <SelectValue placeholder="Contas" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
              <SelectItem value="all" className="text-sm cursor-pointer py-2">Todas as Contas</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id} className="text-sm cursor-pointer py-2">
                  {acc.name} ({acc.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <div id="tour-date-filter">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              customFrom={customRange.from ? customRange.from.toISOString().split('T')[0] : ""}
              customTo={customRange.to ? customRange.to.toISOString().split('T')[0] : ""}
              onCustomChange={(from, to) => {
                setCustomRange({
                  from: from ? new Date(from) : undefined,
                  to: to ? new Date(to) : undefined
                })
              }}
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button id="tour-new-trade" asChild className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-sm font-medium shadow-sm transition-colors border border-transparent flex-shrink-0">
                  <Link href="/trades/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Novo Trade
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Registrar nova operação</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-6 py-8 space-y-8">

        {/* 1. PERFORMANCE RIBBON */}
        <section id="tour-consistency" className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
              Consistência Semanal
              <InfoTooltip text="Resumo diário" />
            </h2>
            <Button variant="ghost" size="sm" asChild className="h-8 rounded-md font-medium text-xs text-slate-500 hover:text-emerald-600 transition-colors">
              <Link href="/calendar">Ver Calendário <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {weekDays.map((date: Date, idx: number) => {
              const dateStr = formatLocalDateKey(date);
              const dayM = dailyMetrics.find((m) => m.date === dateStr);
              const isToday = dateStr === formatLocalDateKey(today);

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative rounded-md p-4 transition-colors cursor-pointer flex flex-col justify-between h-24 sm:h-28",
                    "bg-white dark:bg-[#0b1220]",
                    "border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm",
                    isToday ? "border-emerald-500/50 dark:border-emerald-500/50 ring-1 ring-emerald-500/10" : ""
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={cn("text-xs font-medium uppercase", isToday ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")} suppressHydrationWarning>
                        {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className={cn("text-lg font-medium", isToday ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white")} suppressHydrationWarning>
                        {date.getDate()}
                      </span>
                    </div>
                    {dayM && (
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        dayM.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"
                      )} />
                    )}
                  </div>

                  <div className={cn("text-sm font-medium tracking-tight mt-auto z-10",
                    dayM ? (dayM.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white") : "text-slate-400"
                  )}>
                    {dayM ? `${dayM.pnl >= 0 ? '+' : '-'}$${Math.abs(dayM.pnl).toLocaleString()}` : "$0.00"}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: ACTIVITY & EQUITY */}
          <div className="lg:col-span-8 lg:sticky lg:top-24 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <section id="tour-equity">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Curva de Patrimônio
                  <InfoTooltip text="Evolução acumulada do resultado" />
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEquityView("balance")}
                    className={cn(
                      "h-7 text-xs font-medium rounded px-3 transition-colors",
                      equityView === "balance"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Saldo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEquityView("drawdown")}
                    className={cn(
                      "h-7 text-xs font-medium rounded px-3 transition-colors",
                      equityView === "drawdown"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Drawdown
                  </Button>
                </div>
              </div>
              <div className="bg-white dark:bg-[#0b1220] p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
                <EquityChart data={equityChartData} />
              </div>
            </section>

            <section id="tour-recent-trades">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Últimos Trades
                  <InfoTooltip text="Últimos registros inseridos" />
                </h2>
                <Button variant="ghost" size="sm" asChild className="h-8 rounded-md font-medium text-xs text-slate-500 hover:text-emerald-600 transition-colors w-full sm:w-auto">
                  <Link href="/trades">Ver Diário <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTrades.map((t, i) => (
                  <SharedTradeCard
                    key={i}
                    symbol={t.symbol}
                    direction={t.direction}
                    pnl={t.pnl_net || 0}
                    date={t.entry_date}
                    miniChartData={[{ val: 10 + i }, { val: 20 }, { val: 15 + i * 2 }, { val: 30 }]}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ELITE PERFORMANCE ANALYTICS */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <section>
              <div className="flex flex-col mb-4">
                <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Estatísticas Principais
                  <InfoTooltip text="Indicadores de consistência e risco" />
                </h2>
              </div>
              <div className="grid gap-6">
                {/* Profit Factor Card - High Impact */}
                <Card id="tour-profit-factor" className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] relative overflow-hidden">
                  <CardHeader className="pb-4 p-6 overflow-hidden">
                    <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">FATOR DE LUCRO</CardTitle>
                    <div className="text-4xl lg:text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none mt-2">
                      {metrics.profitFactor.toFixed(2)}
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 space-y-6">
                    <div className="space-y-3">
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(metrics.profitFactor * 30, 100)}%` }}
                          className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 gap-3">
                        <span>Mín: 1.0</span>
                        <span>Meta Ideal: &gt; 2.50</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                  <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-widest">Taxa de Acerto</p>
                      <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{metrics.winRate.toFixed(1)}%</div>
                  </Card>

                  <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-widest">Volume Total</p>
                      <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{metrics.totalTrades}</div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Hourly Analytics Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Top Horários
                  <InfoTooltip text="Faixas de horário com melhor resultado" />
                </h2>
              </div>
              <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220]">
                <CardContent className="p-0">
                  {hourlyData.slice(0, 3).map((h, i) => (
                    <div key={i} className={cn("flex flex-col gap-2 p-5 transition-colors", i !== 0 && "border-t border-slate-100 dark:border-slate-800")}>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs font-semibold text-slate-500">
                          {h.hour}
                        </div>
                        <div className={cn("text-lg font-semibold tracking-tight", h.pnl >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-500")}>
                          {h.pnl >= 0 ? '+' : '-'}${Math.abs(h.pnl).toLocaleString()}
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", h.pnl >= 0 ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${Math.min(Math.abs(h.pnl) / 500 * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
