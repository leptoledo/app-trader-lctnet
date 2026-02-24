"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Trade, TradeDirection, TradeStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Plus, Loader2, ArrowLeft, Search, Filter, X, MoreHorizontal, Info } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { calculatePnL } from "@/lib/pnl"
import { useRouter } from "next/navigation"

export default function TradesPage() {
    const router = useRouter()
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
    const [closeDialogOpen, setCloseDialogOpen] = useState(false)
    const [closingTrade, setClosingTrade] = useState<Trade | null>(null)
    const [closing, setClosing] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingTrade, setDeletingTrade] = useState<Trade | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [livePrices, setLivePrices] = useState<Record<string, number>>({})
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
    const [closeForm, setCloseForm] = useState({
        exitDate: "",
        exitPrice: "",
        commission: "",
        swap: ""
    })
    const [outlierThreshold, setOutlierThreshold] = useState(25)

    // Filters
    const [searchSymbol, setSearchSymbol] = useState("")
    const [filterDirection, setFilterDirection] = useState<TradeDirection | "ALL">("ALL")
    const [filterStatus, setFilterStatus] = useState<TradeStatus | "ALL">("ALL")

    useEffect(() => {
        fetchTrades()
        loadOutlierThreshold()
    }, [])

    useEffect(() => {
        const openSymbols = Array.from(new Set(trades.filter((t) => t.status === "OPEN").map((t) => t.symbol)))
        if (openSymbols.length === 0) return

        let intervalId: ReturnType<typeof setInterval> | null = null
        const controller = new AbortController()
        const fetchPrices = async () => {
            try {
                const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(openSymbols.join(","))}`, {
                    signal: controller.signal
                })
                if (!response.ok) return
                const payload = await response.json()
                if (payload?.data && typeof payload.data === "object") {
                    setLivePrices(payload.data)
                    setLastPriceUpdate(new Date())
                }
            } catch {
                // ignore price fetch errors
            }
        }

        fetchPrices()
        intervalId = setInterval(fetchPrices, 30000)
        return () => {
            if (intervalId) clearInterval(intervalId)
            controller.abort()
        }
    }, [trades])

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
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            toast.error("Erro ao carregar trades: " + message)
        } finally {
            setLoading(false)
        }
    }

    const loadOutlierThreshold = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data, error } = await supabase
                .from("profiles")
                .select("settings")
                .eq("id", user.id)
                .single()

            if (error) throw error
            const settings = (data?.settings as Record<string, unknown>) || {}
            const threshold = typeof settings.outlier_threshold_percent === "number"
                ? settings.outlier_threshold_percent
                : 25
            if (Number.isFinite(threshold) && threshold > 0) {
                setOutlierThreshold(threshold)
            }
        } catch {
            // Ignore settings load errors
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

    const getPnlPreview = () => {
        if (!closingTrade) return null
        const exit = Number(closeForm.exitPrice)
        if (!closeForm.exitPrice || Number.isNaN(exit)) return null
        const commission = closeForm.commission === "" ? 0 : Number(closeForm.commission)
        const swap = closeForm.swap === "" ? 0 : Number(closeForm.swap)
        if (Number.isNaN(commission) || Number.isNaN(swap)) return null
        const fees = commission + swap
        const { pnl_net } = calculatePnL({
            symbol: closingTrade.symbol,
            direction: closingTrade.direction,
            entryPrice: closingTrade.entry_price,
            exitPrice: exit,
            quantity: closingTrade.quantity,
            fees
        })
        return pnl_net
    }

    const isOutlierExitPrice = () => {
        if (!closingTrade) return false
        const exit = Number(closeForm.exitPrice)
        if (!closeForm.exitPrice || Number.isNaN(exit) || closingTrade.entry_price <= 0) return false
        const deviation = Math.abs(exit - closingTrade.entry_price) / closingTrade.entry_price
        if (outlierThreshold <= 0) return false
        return deviation > outlierThreshold / 100
    }

    const normalizeSymbol = (symbol?: string) => (symbol || "").trim().toUpperCase()

    const mapToQuoteSymbol = (symbol?: string) => {
        const normalized = normalizeSymbol(symbol)
        if (normalized === "GOLD" || normalized === "XAUUSD") return "XAU/USD"
        if (normalized === "XAGUSD") return "XAG/USD"
        if (normalized === "US30") return "US30"
        if (normalized === "NAS100") return "NAS100"
        if (normalized === "US100") return "US100"
        if (normalized === "US500") return "SPX500"
        if (normalized === "BTCUSD") return "BTC/USD"
        const forexMatches = normalized.match(/^([A-Z]{3})([A-Z]{3})$/)
        if (forexMatches) {
            return `${forexMatches[1]}/${forexMatches[2]}`
        }
        return normalized
    }

    const getOutlierPercent = (trade: Trade, overridePrice?: number | null) => {
        if (outlierThreshold <= 0) return null
        const referencePrice = overridePrice ?? trade.exit_price
        if (!referencePrice || trade.entry_price <= 0) return null
        const deviation = Math.abs(referencePrice - trade.entry_price) / trade.entry_price
        return deviation * 100
    }

    const getOutlierPrecision = (symbol?: string) => {
        const normalized = (symbol || "").toUpperCase()
        const isCrypto = /(BTC|ETH|SOL|XRP|ADA|DOGE|BNB|LTC|AVAX|DOT)/.test(normalized)
        if (isCrypto) return 2
        const isIndex = /(US30|NAS|NAS100|US100|SPX|US500|DJI|DAX|GER|UK|FRA|JPN)/.test(normalized)
        if (isIndex) return 1
        return 1
    }

    const getLivePriceForTrade = (trade: Trade) => {
        if (trade.status !== "OPEN") return undefined
        const symbol = mapToQuoteSymbol(trade.symbol)
        return livePrices[symbol]
    }

    const getLivePnL = (trade: Trade) => {
        const livePrice = getLivePriceForTrade(trade)
        if (!livePrice) return null
        const fees = (trade.commission || 0) + (trade.swap || 0)
        const { pnl_net } = calculatePnL({
            symbol: trade.symbol,
            direction: trade.direction,
            entryPrice: trade.entry_price,
            exitPrice: livePrice,
            quantity: trade.quantity,
            fees
        })
        return pnl_net
    }

    const getLiveRMultiple = (trade: Trade) => {
        const livePrice = getLivePriceForTrade(trade)
        if (!livePrice || !trade.stop_loss) return null
        const risk = Math.abs(trade.entry_price - trade.stop_loss)
        if (risk <= 0) return null
        const reward = trade.direction === "LONG"
            ? (livePrice - trade.entry_price)
            : (trade.entry_price - livePrice)
        return reward / risk
    }

    const closeDateInvalid = () => {
        if (!closingTrade || !closeForm.exitDate) return false
        const exit = new Date(closeForm.exitDate).getTime()
        const entry = new Date(closingTrade.entry_date).getTime()
        return exit < entry
    }

    const openCloseDialog = (trade: Trade) => {
        setClosingTrade(trade)
        setCloseForm({
            exitDate: trade.exit_date ? new Date(trade.exit_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            exitPrice: trade.exit_price ? trade.exit_price.toString() : "",
            commission: trade.commission != null ? trade.commission.toString() : "",
            swap: trade.swap != null ? trade.swap.toString() : ""
        })
        setCloseDialogOpen(true)
    }

    const handleDeleteTrade = async () => {
        if (!deletingTrade) return
        setDeleting(true)
        try {
            const { error } = await supabase.from("trades").delete().eq("id", deletingTrade.id)
            if (error) throw error
            toast.success("Trade excluído com sucesso.")
            setDeleteDialogOpen(false)
            setDeletingTrade(null)
            fetchTrades()
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            toast.error("Erro ao excluir trade: " + message)
        } finally {
            setDeleting(false)
        }
    }

    const getPriceDecimals = (symbol?: string) => {
        const normalized = (symbol || "").toUpperCase()
        if (normalized === "GOLD" || normalized === "XAUUSD") return 2

        const isIndex = /(US30|NAS|NAS100|US100|SPX|US500|DJI|DAX|GER|UK|FRA|JPN)/.test(normalized)
        if (isIndex) return 1

        const isCrypto = /(BTC|ETH|SOL|XRP|ADA|DOGE|BNB|LTC|AVAX|DOT)/.test(normalized)
        if (isCrypto) {
            return /(BTC|ETH)/.test(normalized) ? 2 : 3
        }

        return 5
    }

    const formatPrice = (value?: number | null, decimals = 5) => {
        if (value == null) return "-"
        const fixed = value.toFixed(decimals)
        return fixed.replace(/\.?0+$/, "")
    }

    const handleDuplicateTrade = async (trade: Trade) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Faça login para duplicar o trade.")
                return
            }

            const { data, error } = await supabase.from("trades").insert({
                user_id: user.id,
                account_id: trade.account_id,
                symbol: trade.symbol,
                direction: trade.direction,
                entry_date: new Date().toISOString(),
                entry_price: trade.entry_price,
                stop_loss: trade.stop_loss ?? null,
                take_profit: trade.take_profit ?? null,
                quantity: trade.quantity,
                ticket_id: null,
                commission: 0,
                swap: 0,
                fees: 0,
                setup_tags: trade.setup_tags ?? [],
                notes: trade.notes ?? "",
                status: "OPEN",
                exit_date: null,
                exit_price: null,
                pnl_gross: null,
                pnl_net: null,
                r_multiple: null,
                images: trade.images ?? []
            }).select("id").single()

            if (error) throw error
            toast.success("Trade duplicado com sucesso.")
            fetchTrades()
            if (data?.id) {
                router.push(`/trades/${data.id}/edit`)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            toast.error("Erro ao duplicar trade: " + message)
        }
    }

    const handleCloseTrade = async () => {
        if (!closingTrade) return
        if (!closeForm.exitDate || !closeForm.exitPrice) {
            toast.error("Preencha data e preço de saída para fechar o trade.")
            return
        }
        if (closeDateInvalid()) {
            toast.error("A data de saída não pode ser anterior à entrada.")
            return
        }

        const exitPrice = Number(closeForm.exitPrice)
        if (Number.isNaN(exitPrice) || exitPrice <= 0) {
            toast.error("Preço de saída inválido.")
            return
        }

        const commission = closeForm.commission === "" ? 0 : Number(closeForm.commission)
        const swap = closeForm.swap === "" ? 0 : Number(closeForm.swap)
        if (Number.isNaN(commission) || Number.isNaN(swap)) {
            toast.error("Comissão ou swap inválidos.")
            return
        }

        const fees = commission + swap
        const { pnl_gross: pnlGross, pnl_net: pnlNet } = calculatePnL({
            symbol: closingTrade.symbol,
            direction: closingTrade.direction,
            entryPrice: closingTrade.entry_price,
            exitPrice: exitPrice,
            quantity: closingTrade.quantity,
            fees
        })
        if (pnlGross == null || pnlNet == null) {
            toast.error("Não foi possível calcular o PnL com os dados informados.")
            return
        }

        let rMultiple: number | null = null
        if (closingTrade.stop_loss) {
            const risk = Math.abs(closingTrade.entry_price - closingTrade.stop_loss)
            if (risk > 0) {
                const reward = closingTrade.direction === "LONG"
                    ? (exitPrice - closingTrade.entry_price)
                    : (closingTrade.entry_price - exitPrice)
                rMultiple = reward / risk
            }
        }

        setClosing(true)
        try {
            const { error } = await supabase.from("trades").update({
                exit_date: new Date(closeForm.exitDate).toISOString(),
                exit_price: exitPrice,
                commission: commission,
                swap: swap,
                fees: fees,
                status: "CLOSED",
                pnl_gross: pnlGross,
                pnl_net: pnlNet,
                r_multiple: rMultiple
            }).eq("id", closingTrade.id)

            if (error) throw error
            toast.success("Trade fechado com sucesso!")
            setCloseDialogOpen(false)
            setClosingTrade(null)
            fetchTrades()
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            toast.error("Erro ao fechar trade: " + message)
        } finally {
            setClosing(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-7xl gap-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Link href="/"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Histórico</p>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Diário de Trades</h1>
                        </div>
                    </div>
                    <Button asChild className="rounded-lg bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white px-7 h-11 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 active:scale-95 border border-transparent dark:border-blue-500/30 flex-shrink-0">
                        <Link href="/trades/new" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Novo Trade
                        </Link>
                    </Button>
                </div>

                {/* Filters (Desktop) */}
                <div className="hidden md:block bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-6 duration-500 delay-75">
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                        <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Símbolo</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    placeholder="Ex: EURUSD"
                                    className="pl-12 h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950 focus:ring-blue-400 font-normal"
                                    value={searchSymbol}
                                    onChange={(e) => setSearchSymbol(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Direção</label>
                            <Select value={filterDirection} onValueChange={(v) => setFilterDirection(v as TradeDirection | "ALL")}>
                                <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950 font-normal">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="LONG">BUY (Long)</SelectItem>
                                    <SelectItem value="SHORT">SELL (Short)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Status</label>
                            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TradeStatus | "ALL")}>
                                <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950 font-normal">
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
                            {(searchSymbol || filterDirection !== "ALL" || filterStatus !== "ALL") ? (
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden md:block">
                                    {filteredTrades.length} registros
                                </span>
                            ) : null}
                            {(searchSymbol || filterDirection !== "ALL" || filterStatus !== "ALL") ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={clearFilters}
                                                className="h-10 w-10 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Limpar filtros</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Filters (Mobile Sheet) */}
                <div className="md:hidden flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="rounded-lg h-11 px-4">
                                <Filter className="h-4 w-4 mr-2" /> Filtros
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="p-4 rounded-t-2xl">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">Símbolo</label>
                                    <Input
                                        placeholder="Ex: EURUSD"
                                        className="h-10 rounded-lg border-slate-200 bg-white/90"
                                        value={searchSymbol}
                                        onChange={(e) => setSearchSymbol(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">Direção</label>
                                    <Select value={filterDirection} onValueChange={(v) => setFilterDirection(v as TradeDirection | "ALL")}>
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white/90 font-normal">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="ALL">Todas</SelectItem>
                                            <SelectItem value="LONG">BUY (Long)</SelectItem>
                                            <SelectItem value="SHORT">SELL (Short)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
                                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TradeStatus | "ALL")}>
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white/90 font-normal">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="ALL">Todos os Status</SelectItem>
                                            <SelectItem value="OPEN">Abertos</SelectItem>
                                            <SelectItem value="CLOSED">Fechados</SelectItem>
                                            <SelectItem value="PENDING">Pendentes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    {(searchSymbol || filterDirection !== "ALL" || filterStatus !== "ALL") ? (
                                        <>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                                {filteredTrades.length} registros
                                            </span>
                                            <Button variant="outline" onClick={clearFilters} className="rounded-lg h-10 px-4 text-slate-500">
                                                Limpar
                                            </Button>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-x-auto overflow-y-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Table className="min-w-[1200px]">
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] text-xs font-semibold text-slate-400 uppercase tracking-wider py-6 pl-8">Ticket</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entrada</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Símbolo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direção</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vol.</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preço Ent.</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">S/L - T/P</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saída</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preço Saída</TableHead>
                                <TableHead className={cn(
                                    "text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell",
                                    !trades.some((t) => t.status === "OPEN") ? "hidden" : ""
                                )}>
                                    Preço Atual
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell w-[88px]">Swap</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pr-8">Lucro (USD)</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Outlier</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">R</TableHead>
                                <TableHead className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-32 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> Carregando trades...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredTrades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-32 text-center text-slate-500 font-medium">
                                        Nenhum trade encontrado com os filtros atuais.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTrades.map((trade) => (
                                    <TableRow key={trade.id} className={cn(
                                        "group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors",
                                        trade.status === "OPEN" && getLivePriceForTrade(trade)
                                            ? "bg-emerald-500/[0.005]"
                                            : ""
                                    )}>
                                        <TableCell className="pl-8 py-4">
                                            <span className="font-mono text-xs text-slate-400 group-hover:text-blue-500 transition-colors">{trade.ticket_id || '-'}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {new Date(trade.entry_date).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-400 mt-0.5 font-semibold">
                                                {new Date(trade.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-heading font-semibold text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                                {trade.symbol}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider border",
                                                trade.direction === 'LONG'
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                            )}>
                                                {trade.direction === 'LONG' ? 'BUY' : 'SELL'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">{trade.quantity}</TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-900 dark:text-white">{formatPrice(trade.entry_price, getPriceDecimals(trade.symbol))}</TableCell>
                                        <TableCell className="text-[10px] text-slate-500">
                                            <div className="flex items-center gap-1"><span className="text-red-400 w-4 font-semibold">SL:</span> {trade.stop_loss || '-'}</div>
                                            <div className="flex items-center gap-1"><span className="text-emerald-400 w-4 font-semibold">TP:</span> {trade.take_profit || '-'}</div>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {trade.exit_date ? (
                                                <>
                                                    {new Date(trade.exit_date).toLocaleDateString()}
                                                    <span className="block text-[10px] text-slate-400 mt-0.5 font-semibold">
                                                        {new Date(trade.exit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-900 dark:text-white">{formatPrice(trade.exit_price, getPriceDecimals(trade.symbol))}</TableCell>
                                        <TableCell className={cn(
                                            "text-xs font-mono font-medium text-slate-900 dark:text-white hidden md:table-cell",
                                            !trades.some((t) => t.status === "OPEN") ? "hidden" : ""
                                        )}>
                                            {trade.status === "OPEN"
                                                ? (getLivePriceForTrade(trade)
                                                    ? formatPrice(getLivePriceForTrade(trade), getPriceDecimals(trade.symbol))
                                                    : "-")
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 hidden md:table-cell">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="text-orange-400 font-medium cursor-help">
                                                            {trade.swap ? trade.swap.toFixed(2) : '0.00'}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Swap</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-mono font-semibold text-sm pr-8",
                                            ((trade.status === "OPEN" ? (getLivePnL(trade) || 0) : (trade.pnl_net || 0)) > 0)
                                                ? "text-emerald-500"
                                                : ((trade.status === "OPEN" ? (getLivePnL(trade) || 0) : (trade.pnl_net || 0)) < 0)
                                                    ? "text-red-500"
                                                    : "text-slate-500"
                                        )}>
                                            {(() => {
                                                if (trade.status === "OPEN") {
                                                    const livePnL = getLivePnL(trade)
                                                    if (livePnL == null) return "0.00"
                                                    return (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="inline-flex items-center gap-2 cursor-help">
                                                                        {`${livePnL >= 0 ? "+" : ""}${livePnL.toFixed(2)}`}
                                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-600 uppercase">
                                                                            <span className="h-1.5 w-1.5 rounded-lg bg-emerald-500 animate-pulse" />
                                                                            Live
                                                                        </span>
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Preço atual: {getLivePriceForTrade(trade) ? formatPrice(getLivePriceForTrade(trade), getPriceDecimals(trade.symbol)) : "--"}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )
                                                }
                                                return trade.pnl_net ? (trade.pnl_net > 0 ? "+" : "") + trade.pnl_net.toFixed(2) : "0.00"
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <span className={cn(
                                                "text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider",
                                                trade.status === 'OPEN' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                    trade.status === 'CLOSED' ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700" :
                                                        "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                            )}>
                                                {trade.status === 'OPEN' ? 'ABERTO' : trade.status === 'CLOSED' ? 'FECHADO' : 'PEND.'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {(() => {
                                                if (outlierThreshold <= 0) {
                                                    return (
                                                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                            Off
                                                        </span>
                                                    )
                                                }

                                                const symbol = mapToQuoteSymbol(trade.symbol)
                                                const livePrice = trade.status === "OPEN" ? livePrices[symbol] : undefined
                                                const hasLive = trade.status === "OPEN" && livePrice != null
                                                const referencePrice = trade.status === "OPEN"
                                                    ? (livePrice ?? trade.entry_price)
                                                    : trade.exit_price
                                                const pct = getOutlierPercent(trade, referencePrice)
                                                if (pct == null) {
                                                    return (
                                                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                            --
                                                        </span>
                                                    )
                                                }

                                                const isOutlier = pct > outlierThreshold
                                                const precision = getOutlierPrecision(trade.symbol)
                                                return (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className={cn(
                                                                    "text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider border cursor-help",
                                                                    isOutlier
                                                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                                )}>
                                                                    {pct.toFixed(precision)}%
                                                                    {hasLive ? (
                                                                        <span className="ml-1 inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-600">
                                                                            <span className="h-1.5 w-1.5 rounded-lg bg-emerald-500 animate-pulse" />
                                                                            Live
                                                                        </span>
                                                                    ) : null}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Limite: {outlierThreshold}% • Entrada: {formatPrice(trade.entry_price, getPriceDecimals(trade.symbol))} • {trade.status === "OPEN" ? "Atual" : "Saída"}: {formatPrice(trade.status === "OPEN" ? (livePrice ?? trade.entry_price) : trade.exit_price, getPriceDecimals(trade.symbol))}{lastPriceUpdate ? ` • Atualizado: ${lastPriceUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-center hidden md:table-cell">
                                            {trade.status === "OPEN" ? (
                                                (() => {
                                                    const r = getLiveRMultiple(trade)
                                                    if (r == null) return (
                                                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                            --
                                                        </span>
                                                    )
                                                    const livePrice = getLivePriceForTrade(trade)
                                                    return (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 cursor-help">
                                                                        {r.toFixed(2)}R
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Risco: {(() => {
                                                                        if (!trade.stop_loss) return "--"
                                                                        const risk = trade.direction === "LONG"
                                                                            ? trade.entry_price - trade.stop_loss
                                                                            : trade.stop_loss - trade.entry_price
                                                                        return formatPrice(Math.abs(risk), getPriceDecimals(trade.symbol))
                                                                    })()} • Retorno: {(() => {
                                                                        if (!livePrice) return "--"
                                                                        const reward = trade.direction === "LONG"
                                                                            ? livePrice - trade.entry_price
                                                                            : trade.entry_price - livePrice
                                                                        return formatPrice(Math.abs(reward), getPriceDecimals(trade.symbol))
                                                                    })()}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )
                                                })()
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 cursor-help">
                                                                {trade.r_multiple != null ? `${trade.r_multiple.toFixed(2)}R` : "--"}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Risco: {(() => {
                                                                if (!trade.stop_loss) return "--"
                                                                const risk = trade.direction === "LONG"
                                                                    ? trade.entry_price - trade.stop_loss
                                                                    : trade.stop_loss - trade.entry_price
                                                                return formatPrice(Math.abs(risk), getPriceDecimals(trade.symbol))
                                                            })()} • Retorno: {(() => {
                                                                if (!trade.exit_price) return "--"
                                                                const reward = trade.direction === "LONG"
                                                                    ? trade.exit_price - trade.entry_price
                                                                    : trade.entry_price - trade.exit_price
                                                                return formatPrice(Math.abs(reward), getPriceDecimals(trade.symbol))
                                                            })()}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50"
                                                        aria-label="Mais ações"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="min-w-[200px]">
                                                    {trade.status === "OPEN" ? (
                                                        <DropdownMenuItem onClick={() => openCloseDialog(trade)}>
                                                            Fechar trade
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/trades/${trade.id}/edit`}>Editar</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicateTrade(trade)}>
                                                        Duplicar trade
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled className="gap-2 text-slate-400 md:hidden">
                                                        <Info className="h-4 w-4" />
                                                        Preço atual: {trade.status === "OPEN" ? (getLivePriceForTrade(trade) ? formatPrice(getLivePriceForTrade(trade), getPriceDecimals(trade.symbol)) : "--") : "--"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled className="gap-2 text-slate-400">
                                                        <Info className="h-4 w-4" />
                                                        Comissão: {trade.commission ? trade.commission.toFixed(2) : '0.00'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled className="gap-2 text-slate-400">
                                                        <Info className="h-4 w-4" />
                                                        Swap: {trade.swap ? trade.swap.toFixed(2) : '0.00'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setDeletingTrade(trade)
                                                            setDeleteConfirmText("")
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                        className="text-red-500"
                                                    >
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>

            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
                <DialogContent className="bg-white dark:bg-slate-950">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Fechar trade</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Informe preço e data de saída para calcular o resultado.
                        </DialogDescription>
                        <div className="mt-3">
                            <Link href="/settings" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                Ir para preferências
                            </Link>
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Data e Hora de Saída</label>
                            <Input
                                type="datetime-local"
                                value={closeForm.exitDate}
                                onChange={(event) => setCloseForm((prev) => ({ ...prev, exitDate: event.target.value }))}
                                className="h-11 rounded-xl border-slate-200 bg-white/90 font-normal"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Preço de Saída</label>
                            <Input
                                type="number"
                                step="any"
                                value={closeForm.exitPrice}
                                onChange={(event) => setCloseForm((prev) => ({ ...prev, exitPrice: event.target.value }))}
                                className="h-11 rounded-xl border-slate-200 bg-white/90 font-normal"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Comissão</label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={closeForm.commission}
                                    onChange={(event) => setCloseForm((prev) => ({ ...prev, commission: event.target.value }))}
                                    className="h-11 rounded-xl border-slate-200 bg-white/90 font-normal"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Swap</label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={closeForm.swap}
                                    onChange={(event) => setCloseForm((prev) => ({ ...prev, swap: event.target.value }))}
                                    className="h-11 rounded-xl border-slate-200 bg-white/90 font-normal"
                                />
                            </div>
                        </div>
                        {closingTrade ? (
                            <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-5 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">PNL Bruto</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {(() => {
                                                const exit = Number(closeForm.exitPrice)
                                                if (!closeForm.exitPrice || Number.isNaN(exit)) return "--"
                                                const { pnl_gross } = calculatePnL({
                                                    symbol: closingTrade.symbol,
                                                    direction: closingTrade.direction,
                                                    entryPrice: closingTrade.entry_price,
                                                    exitPrice: exit,
                                                    quantity: closingTrade.quantity,
                                                    fees: 0
                                                })
                                                if (pnl_gross == null) return "--"
                                                return `${pnl_gross >= 0 ? "+" : ""}${pnl_gross.toFixed(2)}`
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">Fees</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {(() => {
                                                const commission = closeForm.commission === "" ? 0 : Number(closeForm.commission)
                                                const swap = closeForm.swap === "" ? 0 : Number(closeForm.swap)
                                                if (Number.isNaN(commission) || Number.isNaN(swap)) return "--"
                                                const fees = commission + swap
                                                return `-${Math.abs(fees).toFixed(2)}`
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">PNL Líquido</span>
                                        <span className="font-mono font-bold">
                                            {(() => {
                                                const exit = Number(closeForm.exitPrice)
                                                const commission = closeForm.commission === "" ? 0 : Number(closeForm.commission)
                                                const swap = closeForm.swap === "" ? 0 : Number(closeForm.swap)
                                                if (!closeForm.exitPrice || Number.isNaN(exit) || Number.isNaN(commission) || Number.isNaN(swap)) return "--"
                                                const fees = commission + swap
                                                const { pnl_net } = calculatePnL({
                                                    symbol: closingTrade.symbol,
                                                    direction: closingTrade.direction,
                                                    entryPrice: closingTrade.entry_price,
                                                    exitPrice: exit,
                                                    quantity: closingTrade.quantity,
                                                    fees
                                                })
                                                if (pnl_net == null) return "--"
                                                const tone = pnl_net > 0 ? "text-emerald-600 dark:text-emerald-400" : pnl_net < 0 ? "text-red-500 dark:text-red-400" : "text-slate-900 dark:text-white"
                                                return <span className={tone}>{`${pnl_net >= 0 ? "+" : ""}${pnl_net.toFixed(2)}`}</span>
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">R-Múltiplo</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {(() => {
                                                if (!closingTrade.stop_loss) return "--"
                                                const exit = Number(closeForm.exitPrice)
                                                if (!closeForm.exitPrice || Number.isNaN(exit)) return "--"
                                                const risk = Math.abs(closingTrade.entry_price - closingTrade.stop_loss)
                                                if (risk <= 0) return "--"
                                                const reward = closingTrade.direction === "LONG"
                                                    ? (exit - closingTrade.entry_price)
                                                    : (closingTrade.entry_price - exit)
                                                return (reward / risk).toFixed(2)
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                {closeDateInvalid() ? (
                                    <div className="mt-3 text-[11px] text-red-500 font-medium">
                                        A data de saída precisa ser depois da entrada.
                                    </div>
                                ) : null}
                                {isOutlierExitPrice() ? (
                                    <div className="mt-2 text-[11px] text-amber-600 font-medium">
                                        Preço de saída muito distante da entrada (limite: {outlierThreshold}%). Confira se está correto.
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCloseDialogOpen(false)}
                            className="rounded-xl"
                            disabled={closing}
                        >
                            Cancelar
                        </Button>
                        {(() => {
                            const pnlPreview = getPnlPreview()
                            return (
                                <Button
                                    onClick={handleCloseTrade}
                                    className={cn(
                                        "rounded-xl text-white",
                                        pnlPreview == null
                                            ? "bg-[#2b7de9] hover:bg-[#256bd1]"
                                            : pnlPreview > 0
                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                : pnlPreview < 0
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-slate-500 hover:bg-slate-600"
                                    )}
                                    disabled={closing || closeDateInvalid()}
                                >
                                    {closing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Fechar trade
                                </Button>
                            )
                        })()}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white dark:bg-slate-950">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Excluir trade</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Esta ação não pode ser desfeita. O trade será removido permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-5 text-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">Ativo</span>
                            <span className="font-bold text-slate-900 dark:text-white">{deletingTrade?.symbol ?? "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400">Entrada</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{deletingTrade ? formatPrice(deletingTrade.entry_price, getPriceDecimals(deletingTrade.symbol)) : "-"}</span>
                        </div>
                    </div>
                    {deletingTrade?.status === "CLOSED" ? (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                Trade fechado. Para confirmar, digite <strong>EXCLUIR</strong>.
                            </p>
                            <Input
                                value={deleteConfirmText}
                                onChange={(event) => setDeleteConfirmText(event.target.value)}
                                placeholder="EXCLUIR"
                                className="h-11 rounded-xl border-slate-200 bg-white/90 font-normal"
                            />
                        </div>
                    ) : null}
                    <DialogFooter className="pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="rounded-xl"
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteTrade}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting || (deletingTrade?.status === "CLOSED" && deleteConfirmText.trim().toUpperCase() !== "EXCLUIR")}
                        >
                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Excluir trade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
