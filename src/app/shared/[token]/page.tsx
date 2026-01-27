"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trade } from "@/types"
import { Loader2, Calendar, TrendingUp, TrendingDown, Clock, Tag, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EquityChart } from "@/components/equity-chart"
import { cn } from "@/lib/utils"

export default function SharedTradePage() {
    const params = useParams()
    const [trade, setTrade] = useState<Trade | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSharedTrade() {
            try {
                const { data, error } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('share_token', params.token)
                    .eq('is_shared', true)
                    .single()

                if (error) throw error
                setTrade(data as any)

                // Track view
                await supabase.rpc('increment_shared_view', { token: params.token })
            } catch (error) {
                console.error("Erro ao carregar trade compartilhado:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.token) fetchSharedTrade()
    }, [params.token])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!trade) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-500">Este trade não existe ou não está mais compartilhado.</p>
            </div>
        )
    }

    const isWin = (trade.pnl_net || 0) >= 0

    const username = trade.public_name || "Trader"

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Public Header */}
                <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-left w-full">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl font-bold">
                            {username[0]}
                        </div>
                        <div>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Shared Trade</p>
                            <h1 className="text-3xl font-black text-gray-900 leading-tight">
                                {trade.symbol} <span className={cn("text-lg font-bold", trade.direction === "LONG" ? "text-emerald-500" : "text-amber-500")}>({trade.direction})</span>
                            </h1>
                            <p className="text-sm text-gray-400">by @{username}</p>
                        </div>
                    </div>
                    <div className="bg-gray-900 text-white p-6 rounded-2xl min-w-[200px] text-center">
                        <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Net PnL</p>
                        <div className={cn("text-3xl font-black", isWin ? "text-emerald-400" : "text-red-400")}>
                            {isWin ? '+' : ''}${trade.pnl_net?.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Trade Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-none shadow-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Entry Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900">${trade.entry_price}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(trade.entry_date).toLocaleDateString()} at {new Date(trade.entry_date).toLocaleTimeString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                                <ExternalLink className="h-3 w-3" /> Exit Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-gray-900">${trade.exit_price || 'Open'}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {trade.exit_date ? `${new Date(trade.exit_date).toLocaleDateString()} at ${new Date(trade.exit_date).toLocaleTimeString()}` : 'Trade is still running'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-none shadow-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                                <Tag className="h-3 w-3" /> Setup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1">
                            {trade.setup_tags?.map((t, i) => (
                                <Badge key={i} variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 text-[10px]">{t}</Badge>
                            )) || <span className="text-xs text-gray-400 italic">No tags</span>}
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis / Screenshots */}
                {trade.images && trade.images.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 px-2">Análise Gráfica</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {trade.images.map((img, i) => (
                                <div key={i} className="bg-white p-2 rounded-3xl border shadow-sm overflow-hidden">
                                    <img src={img} alt={`Trade analysis ${i + 1}`} className="w-full h-auto rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Notes */}
                {trade.notes && (
                    <section className="bg-white p-8 rounded-3xl border shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 underline decoration-emerald-500 decoration-4 underline-offset-8">Relatório do Diário</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                            "{trade.notes}"
                        </p>
                    </section>
                )}

                {/* Call to Action */}
                <div className="text-center pt-8">
                    <p className="text-sm text-gray-400 mb-4">Wanna journal your trades like this?</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-emerald-200">
                        Join TraderJournal Today
                    </Button>
                </div>

                <footer className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-12">
                    Protected by TraderJournal • {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    )
}
