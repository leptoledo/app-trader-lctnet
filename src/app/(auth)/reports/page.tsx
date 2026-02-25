"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { calculateMetrics } from "@/lib/analytics"
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts"
import { analyzeByDayOfWeek, analyzeBySymbol } from "@/lib/advanced-analytics"
import { cn } from "@/lib/utils"
import { useAccounts } from "@/hooks/useAccounts"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
    const { accounts } = useAccounts()
    const [selectedAccountId, setSelectedAccountId] = useState<string>("")
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        netPnL: 0,
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        grossProfit: 0,
        grossLoss: 0,
        runningTrades: 0,
        equityCurve: [] as { date: string; equity: number }[]
    })

    // Set default selected account when accounts load
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id)
        }
    }, [accounts, selectedAccountId])

    const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0]
    const currentBalance = selectedAccount ? (selectedAccount.current_balance || selectedAccount.initial_balance) : 0

    // Filter trades by selected account
    // Note: In a real scenario, we might want to refetch or filter the trades list based on account_id if the API supports it, 
    // or filter the 'fetchedTrades' in memory. For now, we keeps trades global as per initial implementation, 
    // focusing on the CARD update request.

    useEffect(() => {
        async function fetchData() {
            try {
                let query = supabase
                    .from('trades')
                    .select('*')
                    .order('entry_date', { ascending: false })

                if (selectedAccountId) {
                    query = query.eq('account_id', selectedAccountId)
                }

                const { data, error } = await query

                if (error) throw error

                const fetchedTrades = (data || []) as unknown as Trade[]

                setTrades(fetchedTrades)
                setMetrics(calculateMetrics(fetchedTrades))
            } catch (error) {
                console.error('Erro ao carregar trades:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedAccountId])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    const dayOfWeekData = analyzeByDayOfWeek(trades)
    const symbolData = analyzeBySymbol(trades)

    const formatLargeNumber = (num: number) => {
        const abs = Math.abs(num);
        if (abs >= 1000000) return `${num < 0 ? '-' : ''}$${(abs / 1000000).toFixed(1)}M`;
        if (abs >= 1000) return `${num < 0 ? '-' : ''}$${(abs / 1000).toFixed(0)}K`;
        return `${num < 0 ? '-' : ''}$${abs.toFixed(2)}`;
    }

    let maxDrawdown = 0
    let peak = 0
    metrics.equityCurve.forEach(p => {
        if (p.equity > peak) peak = p.equity
        const dd = peak > 0 ? (peak - p.equity) : 0
        if (dd > maxDrawdown) maxDrawdown = dd
    })

    const closedTrades = trades.filter(t => t.status === 'CLOSED')
    const pnlDistribution = [
        { range: '< -$100', count: closedTrades.filter(t => (t.pnl_net || 0) < -100).length },
        { range: '-$100 a -$50', count: closedTrades.filter(t => (t.pnl_net || 0) >= -100 && (t.pnl_net || 0) < -50).length },
        { range: '-$50 a $0', count: closedTrades.filter(t => (t.pnl_net || 0) >= -50 && (t.pnl_net || 0) < 0).length },
        { range: '$0 a $50', count: closedTrades.filter(t => (t.pnl_net || 0) >= 0 && (t.pnl_net || 0) < 50).length },
        { range: '$50 a $100', count: closedTrades.filter(t => (t.pnl_net || 0) >= 50 && (t.pnl_net || 0) < 100).length },
        { range: '> $100', count: closedTrades.filter(t => (t.pnl_net || 0) >= 100).length },
    ].filter(d => d.count > 0)

    return (
        <div className="p-8 pb-12 bg-slate-50 dark:bg-[#0b1220] min-h-screen transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto space-y-8">
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Relatórios Avançados</h1>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-top-6 duration-500 delay-75">
                    <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] relative overflow-hidden">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                                    <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Saldo Atual</h2>
                                        {accounts.length > 0 && (
                                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                                <SelectTrigger className="h-7 w-auto gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium px-3 focus:ring-0 transition-colors">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id} className="focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                                                            {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                                            ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {selectedAccount?.currency || 'USD'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Conta Selecionada</p>
                                    <p className="text-lg font-medium text-slate-800 dark:text-white truncate max-w-[150px]">{selectedAccount?.name || 'Carregando...'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">P&L Total</CardTitle>
                            <InfoTooltip text="Resultado líquido total" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn(
                                "text-2xl font-semibold tracking-tight mt-1",
                                metrics.netPnL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-500 dark:text-red-500"
                            )}>
                                {formatLargeNumber(metrics.netPnL)}
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                {metrics.totalTrades} trades fechados
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Taxa de Acerto</CardTitle>
                            <InfoTooltip text="% de trades vencedores" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{metrics.winRate.toFixed(1)}%</div>
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                Média Win: <span className="text-emerald-600 dark:text-emerald-500">${metrics.avgWin.toFixed(2)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Profit Factor</CardTitle>
                            <InfoTooltip text="Lucro bruto / perda bruta" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{metrics.profitFactor.toFixed(2)}</div>
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                Ideal: <span className="text-emerald-600 dark:text-emerald-500">&gt; 1.5</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Max Drawdown</CardTitle>
                            <InfoTooltip text="Maior queda acumulada" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-red-500/90 dark:text-red-500 mt-1">-{formatLargeNumber(maxDrawdown)}</div>
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                Máxima queda acumulada
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <Card className="md:col-span-2 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="p-6">
                            <CardTitle className="text-lg font-medium text-slate-900 dark:text-white">Curva de Patrimônio</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Evolução do resultado acumulado</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metrics.equityCurve}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={11}
                                            minTickGap={50}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={11}
                                            tickFormatter={formatLargeNumber}
                                            width={50}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0b1220',
                                                borderColor: '#1e293b',
                                                color: '#f8fafc',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                            }}
                                            itemStyle={{ color: '#10b981' }}
                                            formatter={(value: any) => [`$${parseFloat(value || 0).toFixed(2)}`, 'Patrimônio']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="equity"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Performance por Dia</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Resultados por dia da semana</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dayOfWeekData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                                        <XAxis
                                            dataKey="day"
                                            fontSize={11}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={11}
                                            tickFormatter={formatLargeNumber}
                                            width={40}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b', opacity: 0.1 }}
                                            contentStyle={{
                                                backgroundColor: '#0b1220',
                                                borderColor: '#1e293b',
                                                color: '#f8fafc',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                            }}
                                            formatter={(value: any) => [`$${parseFloat(value || 0).toFixed(2)}`, 'P&L']}
                                        />
                                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                            {dayOfWeekData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Distribuição de Resultados</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Frequência de faixas de P&L</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pnlDistribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                                        <XAxis
                                            type="number"
                                            fontSize={11}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            dataKey="range"
                                            type="category"
                                            fontSize={10}
                                            width={80}
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b', opacity: 0.1 }}
                                            contentStyle={{
                                                backgroundColor: '#0b1220',
                                                borderColor: '#1e293b',
                                                color: '#f8fafc',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                            }}
                                            formatter={(value: any) => [value, 'Trades']}
                                        />
                                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Performance por Símbolo</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Ranking dos ativos mais lucrativos</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {symbolData.slice(0, 10).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-500">#{idx + 1}</div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-slate-900 dark:text-white">{item.symbol}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    {item.trades} trades • <span className={item.winRate >= 50 ? "text-emerald-500" : "text-amber-500"}>{item.winRate.toFixed(0)}% win</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "font-semibold font-mono",
                                                item.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                                            )}>
                                                {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
