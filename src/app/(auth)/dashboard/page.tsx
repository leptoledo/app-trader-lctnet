"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { calculateMetrics } from "@/lib/analytics"
import { Trade } from "@/types"
import { Loader2, Calendar as CalendarIcon, ArrowRight, Share2, BarChart, Clock, TrendingUp, Sparkles, Filter, Plus, ChevronRight, Activity, Target } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { ReportHeader } from "@/components/report/report-header"
import { SummaryDonut } from "@/components/report/summary-donut"
import { StatsGrid } from "@/components/report/stats-grid"
import { EquityChart } from "@/components/equity-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter, getDateRangeFilter, DateRangePreset } from "@/components/date-range-filter"
import { SharedTradeCard } from "@/components/shared-trade-card"
import { calculateDailyMetrics, getMonthDays } from "@/lib/calendar"
import { analyzeByHour } from "@/lib/advanced-analytics"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { useAccounts } from "@/hooks/useAccounts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const { accounts } = useAccounts()
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
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('entry_date', { ascending: false })

        if (error) throw error

        const fetchedTrades = (data || []) as unknown as Trade[]
        setTrades(fetchedTrades)

      } catch (error: any) {
        toast.error('Falha ao carregar dashboard: ' + error.message)
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

    let filteredTrades = trades

    // Filtro de Conta
    if (selectedAccountId !== "all") {
      filteredTrades = filteredTrades.filter(t => t.account_id === selectedAccountId)
    }

    if (from || to) {
      filteredTrades = filteredTrades.filter(t => {
        const tradeDate = new Date(t.entry_date)
        const isAfterFrom = from ? tradeDate >= from : true
        const isBeforeTo = to ? tradeDate <= to : true
        return isAfterFrom && isBeforeTo
      })
    }
    setMetrics(calculateMetrics(filteredTrades))
  }, [trades, dateRange, customRange, selectedAccountId])

  if (loading) return <DashboardSkeleton />

  const dailyMetrics = calculateDailyMetrics(trades)
  const today = new Date();
  const currentMonthDays = getMonthDays(today.getFullYear(), today.getMonth()).filter((d: Date) => d.getMonth() === today.getMonth()).slice(0, 10);
  const hourlyData = analyzeByHour(trades)
  const recentTrades = trades.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col font-sans pb-12 transition-colors duration-500">

      {/* World-Class Dashboard Header */}
      <div className="bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-8 py-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 transition-all duration-500 shadow-sm gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-1">Visão Global</p>
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 hidden lg:block" />

          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full md:w-[220px] h-11 rounded-[1.25rem] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 shadow-sm font-black text-[10px] tracking-widest uppercase focus:ring-blue-500 transition-all group">
              <SelectValue placeholder="Contas" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950">
              <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest cursor-pointer py-3">Todas as Contas</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id} className="font-bold text-[10px] uppercase tracking-widest cursor-pointer py-3">
                  {acc.name} ({acc.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
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

          <Button asChild className="rounded-2xl h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 flex-shrink-0">
            <Link href="/trades/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Novo Trade
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-8 py-12 space-y-12">

        {/* 1. PERFORMANCE RIBBON */}
        <section className="animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]" suppressHydrationWarning>
                Consistência Diária • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
              <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">Performance Mensal</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
              <Link href="/calendar">Ver Calendário Criativo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {currentMonthDays.map((date: Date, idx: number) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayM = dailyMetrics.find((m: any) => m.date === dateStr);
              const isToday = dateStr === today.toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative border-2 rounded-[2rem] p-5 transition-all duration-500 cursor-pointer group hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between overflow-hidden h-32",
                    "bg-white dark:bg-slate-900/40 backdrop-blur-md",
                    "border-slate-100 dark:border-slate-800/60",
                    isToday ? "ring-2 ring-blue-500/30 border-blue-500/30 dark:bg-blue-500/[0.03]" : ""
                  )}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} suppressHydrationWarning>
                        {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className={cn("text-2xl font-black font-heading", isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white")} suppressHydrationWarning>
                        {date.getDate()}
                      </span>
                    </div>
                    {dayM && (
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-lg animate-pulse",
                        dayM.pnl >= 0 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                      )} />
                    )}
                  </div>

                  <div className={cn("text-sm font-black font-heading tracking-tight mt-auto relative z-10",
                    dayM ? (dayM.pnl >= 0 ? "text-emerald-500" : "text-red-500") : "text-slate-200 dark:text-slate-800"
                  )}>
                    {dayM ? `${dayM.pnl >= 0 ? '+' : '-'}$${Math.abs(dayM.pnl).toLocaleString()}` : "$0.00"}
                  </div>

                  {/* Highlight Glow for active cells */}
                  {dayM && (
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                      dayM.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"
                    )} />
                  )}
                </div>
              )
            })}
            <div className="bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 h-32 rounded-[2.5rem] p-4 flex items-center justify-center flex-col text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group">
              <ChevronRight className="h-8 w-8 mb-1 group-hover:translate-x-1 transition-transform group-hover:text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-blue-500">Mais dias</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT COLUMN: ACTIVITY & EQUITY */}
          <div className="lg:col-span-8 lg:sticky lg:top-32 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Crescimento</p>
                  <h2 className="text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">CURVA DE PATRIMÔNIO</h2>
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20 px-6 transition-all">SALDO</Button>
                  <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white px-6 transition-all">DRAWDOWN</Button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl h-[520px] relative overflow-hidden group">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 p-40 bg-blue-500/[0.03] rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-colors duration-1000 group-hover:bg-blue-500/10" />
                <EquityChart data={metrics.equityCurve} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Atividade Recente</p>
                  <h2 className="text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">Últimas Execuções</h2>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-blue-600">
                  <Link href="/trades">Ver Diário <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div className="lg:col-span-4 space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <section>
              <div className="flex flex-col mb-8 px-2">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-1">Índice de Eficiência</p>
                <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">Performance Elite</h2>
              </div>
              <div className="grid gap-8">
                {/* Profit Factor Card - High Impact */}
                <Card className="rounded-[3.5rem] border-none shadow-2xl bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden group">
                  {/* Luxury Background Effects */}
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/30 transition-all duration-1000" />
                  <div className="absolute bottom-0 left-0 p-24 bg-purple-600/10 rounded-full blur-[40px] -ml-16 -mb-16 pointer-events-none" />

                  <CardHeader className="pb-4 relative z-10 p-10 pt-12">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <CardTitle className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">FATOR DE LUCRO GLOBAL</CardTitle>
                    </div>
                    <div className="text-7xl font-heading font-black tracking-tighter text-white">
                      {metrics.profitFactor.toFixed(2)}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 px-10 pb-12 pt-0 space-y-8">
                    <div className="space-y-4">
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(metrics.profitFactor * 30, 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full shadow-[0_0_20px_rgba(59,130,246,0.6)] rounded-full"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                        <span className="text-slate-500 tracking-tighter">Mín: 1.0</span>
                        <span className="text-blue-400 tracking-tighter italic">Meta Ideal: &gt; 2.50</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                        Matematicamente robusto. Seu modelo apresenta uma vantagem estatística <span className="text-white font-black">considerável</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 p-8 group hover:-translate-y-1 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.2em]">Taxa de Acerto</p>
                      <Target className="h-4 w-4 text-emerald-500 opacity-50" />
                    </div>
                    <div className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">{metrics.winRate.toFixed(1)}%</div>
                    <div className="mt-5 h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${metrics.winRate}%` }}></div>
                    </div>
                  </Card>
                  <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/40 p-8 group hover:-translate-y-1 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.2em]">Volume Total</p>
                      <Activity className="h-4 w-4 text-blue-500 opacity-50" />
                    </div>
                    <div className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">{metrics.totalTrades}</div>
                    <div className="mt-5 text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-tight">
                      <TrendingUp className="h-3.5 w-3.5" /> <span className="italic">+12.4% no mês</span>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Hourly Analytics Section */}
            <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Delta Temporal</p>
                  <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">Vantagem Horária</h2>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <Card className="rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-md">
                <CardContent className="p-4 space-y-1">
                  {hourlyData.slice(0, 6).map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-[1.75rem] hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-mono text-xs font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all border border-slate-100 dark:border-slate-800">
                          {h.hour}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1">Delta de Tempo</p>
                          <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", h.pnl >= 0 ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${Math.min(Math.abs(h.pnl) / 500 * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className={cn("text-lg font-heading font-black tracking-tighter", h.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {h.pnl >= 0 ? '+' : '-'}${Math.abs(h.pnl).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic opacity-50">
                          RESULTADO LÍQUIDO
                        </div>
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
