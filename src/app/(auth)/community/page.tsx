"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { Loader2, Users, Flame, Timer, TrendingUp, Search, User, Heart, MessageSquare, Globe } from "lucide-react"
import { SharedTradeCard } from "@/components/shared-trade-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"

export default function CommunityPage() {
    const [sharedTrades, setSharedTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("trending")

    useEffect(() => {
        async function fetchCommunityTrades() {
            setLoading(true)
            try {
                // Try primary query with sharing features
                const { data, error } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('is_shared', true)
                    .order('shared_at', { ascending: false })
                    .limit(20)

                // Fallback for demo/missing migrations
                if (error && error.message?.includes('column')) {
                    console.warn("Colunas de compartilhamento ausentes, usando fallback...")
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('trades')
                        .select('*')
                        .order('entry_date', { ascending: false })
                        .limit(20)

                    if (fallbackError) throw fallbackError
                    setSharedTrades(fallbackData || [])
                    return
                } else if (error) {
                    throw error
                }

                setSharedTrades(data || [])
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                console.error("Erro na comunidade:", message)
                // Fallback to mock data on error for demo purposes
                setSharedTrades([
                    { id: '1', symbol: 'EURUSD', direction: 'LONG', pnl_net: 150, entry_date: new Date().toISOString(), status: 'CLOSED' } as Trade,
                    { id: '2', symbol: 'BTCUSD', direction: 'SHORT', pnl_net: -50, entry_date: new Date(Date.now() - 86400000).toISOString(), status: 'CLOSED' } as Trade,
                    { id: '3', symbol: 'AAPL', direction: 'LONG', pnl_net: 320, entry_date: new Date(Date.now() - 172800000).toISOString(), status: 'CLOSED' } as Trade,
                    { id: '4', symbol: 'XAUUSD', direction: 'LONG', pnl_net: 85, entry_date: new Date(Date.now() - 259200000).toISOString(), status: 'CLOSED' } as Trade,
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchCommunityTrades()
    }, [filter])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-white" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                {/* Community Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-[#0b1220] rounded-md flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800">
                            <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Comunidade Global</h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                            <Input placeholder="Buscar por símbolo..." className="h-10 pl-10 rounded-md bg-white dark:bg-[#0b1220] border-slate-200 dark:border-slate-800 focus:ring-slate-900 dark:focus:ring-white font-medium text-sm shadow-sm" />
                        </div>
                        <Button className="h-10 w-full sm:w-auto px-6 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm transition-colors shadow-sm">
                            Convidar Amigos
                        </Button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="inline-block animate-in fade-in slide-in-from-top-6 duration-700 delay-100 w-full md:w-auto">
                    <Tabs defaultValue="trending" className="w-full" onValueChange={setFilter}>
                        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-md h-11 gap-1 flex w-full">
                            <TabsTrigger
                                value="trending"
                                className="flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-[#0b1220] dark:data-[state=active]:text-white text-slate-500 data-[state=active]:shadow-sm"
                            >
                                <Flame className="h-4 w-4" /> <span className="hidden sm:inline">Em Alta</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="recent"
                                className="flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-[#0b1220] dark:data-[state=active]:text-white text-slate-500 data-[state=active]:shadow-sm"
                            >
                                <Timer className="h-4 w-4" /> <span className="hidden sm:inline">Mais Recentes</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="top-pnl"
                                className="flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-[#0b1220] dark:data-[state=active]:text-white text-slate-500 data-[state=active]:shadow-sm"
                            >
                                <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Top P&L</span>
                            </TabsTrigger>
                            <div className="ml-auto hidden md:flex items-center gap-2 px-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Live Sync</span>
                            </div>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Shared Trades Feed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sharedTrades.length > 0 ? (
                        sharedTrades.map((t, idx) => (
                            <div key={idx} className="group transition-all duration-500 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 80}ms` }}>
                                <SharedTradeCard
                                    symbol={t.symbol}
                                    direction={t.direction}
                                    pnl={t.pnl_net || 0}
                                    date={t.entry_date}
                                    miniChartData={[{ val: 10 + (idx % 5) }, { val: 20 - (idx % 3) }, { val: 15 + (idx % 7) }, { val: 30 }, { val: 25 + (idx % 4) }]}
                                />

                                <div className="mt-3 flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-none flex items-center justify-center overflow-hidden">
                                            <User className="h-3 w-3 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-900 dark:text-white tracking-tight">Trader #{idx + 10}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group/btn">
                                            <Heart className="h-3.5 w-3.5 group-hover/btn:fill-current group-hover/btn:text-red-500" />
                                            <span className="text-xs font-medium tracking-tight">{12 + idx}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group/btn">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium tracking-tight">{4 + (idx % 3)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Card className="col-span-full py-20 rounded-md bg-white dark:bg-[#0b1220] border border-dashed border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-700 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-md flex items-center justify-center mb-6">
                                <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight mb-2">Comunidade Silenciosa</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">Seja o pioneiro e compartilhe sua primeira análise vencedora com o mundo hoje!</p>
                            <Button className="h-10 px-8 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm transition-colors shadow-sm w-auto">
                                Compartilhar Trade
                            </Button>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    )
}
