"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Trade, TradeDirection, TradeStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, Loader2, ArrowLeft, Search, Filter, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])

    // Filters
    const [searchSymbol, setSearchSymbol] = useState("")
    const [filterDirection, setFilterDirection] = useState<TradeDirection | "ALL">("ALL")
    const [filterStatus, setFilterStatus] = useState<TradeStatus | "ALL">("ALL")

    useEffect(() => {
        fetchTrades()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [trades, searchSymbol, filterDirection, filterStatus])

    const fetchTrades = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .order('entry_date', { ascending: false })

            if (error) throw error

            setTrades((data as unknown as Trade[]) || [])
        } catch (error: any) {
            toast.error("Erro ao carregar trades: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let result = [...trades]

        if (searchSymbol) {
            result = result.filter(t => t.symbol.toLowerCase().includes(searchSymbol.toLowerCase()))
        }

        if (filterDirection !== "ALL") {
            result = result.filter(t => t.direction === filterDirection)
        }

        if (filterStatus !== "ALL") {
            result = result.filter(t => t.status === filterStatus)
        }

        setFilteredTrades(result)
    }

    const clearFilters = () => {
        setSearchSymbol("")
        setFilterDirection("ALL")
        setFilterStatus("ALL")
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020617] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-7xl gap-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Link href="/"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Histórico</p>
                            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Diário de Trades</h1>
                        </div>
                    </div>
                    <Button asChild className="rounded-xl h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                        <Link href="/trades/new" className="gap-2">
                            <Plus className="h-5 w-5" /> Novo Trade
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-6 duration-500 delay-75">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-full md:w-1/4 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Símbolo</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Ex: EURUSD"
                                    className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-blue-500 font-medium"
                                    value={searchSymbol}
                                    onChange={(e) => setSearchSymbol(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/4 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Direção</label>
                            <Select value={filterDirection} onValueChange={(v) => setFilterDirection(v as TradeDirection | "ALL")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="LONG">BUY (Long)</SelectItem>
                                    <SelectItem value="SHORT">SELL (Short)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-1/4 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TradeStatus | "ALL")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="ALL">Todos os Status</SelectItem>
                                    <SelectItem value="OPEN">Abertos</SelectItem>
                                    <SelectItem value="CLOSED">Fechados</SelectItem>
                                    <SelectItem value="PENDING">Pendentes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                                {filteredTrades.length} registros
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearFilters}
                                title="Limpar Filtros"
                                className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] text-xs font-bold text-slate-400 uppercase tracking-wider py-6 pl-8">Ticket</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entrada</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Símbolo</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direção</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vol.</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preço Ent.</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">S/L - T/P</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saída</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preço Saída</TableHead>
                                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Swap/Comm</TableHead>
                                <TableHead className="text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-8">Lucro (USD)</TableHead>
                                <TableHead className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-32 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> Carregando trades...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredTrades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-32 text-center text-slate-500 font-medium">
                                        Nenhum trade encontrado com os filtros atuais.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTrades.map((trade) => (
                                    <TableRow key={trade.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <span className="font-mono text-xs text-slate-400 group-hover:text-blue-500 transition-colors">{trade.ticket_id || '-'}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {new Date(trade.entry_date).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-400 mt-0.5 font-bold">
                                                {new Date(trade.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-heading font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                                {trade.symbol}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border",
                                                trade.direction === 'LONG'
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                            )}>
                                                {trade.direction === 'LONG' ? 'BUY' : 'SELL'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">{trade.quantity}</TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-900 dark:text-white">{trade.entry_price.toFixed(5)}</TableCell>
                                        <TableCell className="text-[10px] text-slate-500">
                                            <div className="flex items-center gap-1"><span className="text-red-400 w-4 font-bold">SL:</span> {trade.stop_loss || '-'}</div>
                                            <div className="flex items-center gap-1"><span className="text-emerald-400 w-4 font-bold">TP:</span> {trade.take_profit || '-'}</div>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {trade.exit_date ? (
                                                <>
                                                    {new Date(trade.exit_date).toLocaleDateString()}
                                                    <span className="block text-[10px] text-slate-400 mt-0.5 font-bold">
                                                        {new Date(trade.exit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-900 dark:text-white">{trade.exit_price?.toFixed(5) || '-'}</TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            <div title="Comissão" className="text-red-400 font-medium">-{trade.commission ? trade.commission.toFixed(2) : '0.00'}</div>
                                            <div title="Swap" className="text-orange-400 font-medium">{trade.swap ? trade.swap.toFixed(2) : '0.00'}</div>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-mono font-bold text-sm pr-8",
                                            (trade.pnl_net || 0) > 0 ? "text-emerald-500" : (trade.pnl_net || 0) < 0 ? "text-red-500" : "text-slate-500"
                                        )}>
                                            {trade.pnl_net ? (trade.pnl_net > 0 ? '+' : '') + trade.pnl_net.toFixed(2) : '0.00'}
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                                                trade.status === 'OPEN' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                    trade.status === 'CLOSED' ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700" :
                                                        "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                            )}>
                                                {trade.status === 'OPEN' ? 'ABERTO' : trade.status === 'CLOSED' ? 'FECHADO' : 'PEND.'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </div>
    )
}
