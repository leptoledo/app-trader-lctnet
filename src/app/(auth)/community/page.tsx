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
            <div className="flex h-screen w-full items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-7xl mx-auto w-full space-y-10">

                {/* Community Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Feed Social</p>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Comunidade Global</h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto overflow-hidden">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input placeholder="Buscar por símbolo..." className="h-12 pl-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500 font-medium text-xs shadow-sm" />
                        </div>
                        <Button className="h-12 w-full sm:w-auto px-8 rounded-lg bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 active:scale-95 border border-transparent dark:border-blue-500/30">
                            Convidar Amigos
                        </Button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
                    <Tabs defaultValue="trending" className="w-full" onValueChange={setFilter}>
                        <TabsList className="bg-transparent h-14 p-1 gap-2 md:gap-4 flex w-full">
                            <TabsTrigger
                                value="trending"
                                className="flex-1 md:flex-none h-full rounded-[1.5rem] px-6 flex items-center gap-3 font-semibold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-[#2b7de9] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-400"
                            >
                                <Flame className="h-4 w-4" /> <span className="hidden sm:inline">Em Alta</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="recent"
                                className="flex-1 md:flex-none h-full rounded-[1.5rem] px-6 flex items-center gap-3 font-semibold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-[#2b7de9] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-400"
                            >
                                <Timer className="h-4 w-4" /> <span className="hidden sm:inline">Mais Recentes</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="top-pnl"
                                className="flex-1 md:flex-none h-full rounded-[1.5rem] px-6 flex items-center gap-3 font-semibold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-[#2b7de9] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-400"
                            >
                                <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Top P&L</span>
                            </TabsTrigger>
                            <div className="ml-auto hidden md:flex items-center gap-2 pr-4">
                                <Globe className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">Sinc. ao Vivo</span>
                            </div>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Shared Trades Feed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {sharedTrades.length > 0 ? (
                        sharedTrades.map((t, idx) => (
                            <div key={idx} className="group transition-all duration-500 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 80}ms` }}>
                                <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-700">
                                    <SharedTradeCard
                                        symbol={t.symbol}
                                        direction={t.direction}
                                        pnl={t.pnl_net || 0}
                                        date={t.entry_date}
                                        miniChartData={[{ val: 10 + (idx % 5) }, { val: 20 - (idx % 3) }, { val: 15 + (idx % 7) }, { val: 30 }, { val: 25 + (idx % 4) }]}
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-950 shadow-sm flex items-center justify-center overflow-hidden">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Trader #{idx + 10}</span>
                                            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Membro PRO</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors group/btn">
                                            <Heart className="h-3.5 w-3.5 group-hover/btn:fill-current" />
                                            <span className="text-[10px] font-semibold tracking-tight">{12 + idx}</span>
                                            <div className="scale-90">
                                                <InfoTooltip text="Curtidas" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-semibold tracking-tight">{4 + (idx % 3)}</span>
                                            <div className="scale-90">
                                                <InfoTooltip text="Comentários" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Card className="col-span-full py-24 rounded-[3rem] bg-white/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Users className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                            </div>
                            <h3 className="text-2xl font-heading font-semibold text-slate-900 dark:text-white uppercase tracking-tight mb-2">Comunidade Silenciosa</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-8 max-w-sm mx-auto leading-relaxed">Seja o pioneiro e compartilhe sua primeira análise vencedora com o mundo hoje!</p>
                            <Button className="h-14 px-10 rounded-lg bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 active:scale-95 border border-transparent dark:border-blue-500/30">
                                Compartilhar Meu Primeiro Trade
                            </Button>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    )
}
