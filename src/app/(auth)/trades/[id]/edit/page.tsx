"use client"

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tradeSchema, TradeFormValues } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAccounts } from "@/hooks/useAccounts"
import { Loader2, ArrowLeft, Trash2, Share2, Link as LinkIcon, Check, TrendingUp, Clock, Target, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { RiskRewardIndicator } from "@/components/risk-reward-indicator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { calculatePnL } from "@/lib/pnl"

export default function EditTradePage() {
    const router = useRouter()
    const params = useParams()
    const { accounts, loading: accountsLoading } = useAccounts()
    const [submitting, setSubmitting] = useState(false)
    const [loadingConfig, setLoadingConfig] = useState(true)
    const [images, setImages] = useState<string[]>([])
    const [isShared, setIsShared] = useState(false)
    const [shareToken, setShareToken] = useState<string | null>(null)
    const [copying, setCopying] = useState(false)
    const [publicName, setPublicName] = useState<string>("")
    const [confirmShareOpen, setConfirmShareOpen] = useState(false)
    const [shareConfirmLoading, setShareConfirmLoading] = useState(false)

    const form = useForm<TradeFormValues>({
        resolver: zodResolver(tradeSchema) as Resolver<TradeFormValues>,
        defaultValues: {
            symbol: "",
            direction: "LONG",
            entry_date: new Date().toISOString().slice(0, 16),
            entry_price: 0,
            quantity: 1,
            account_id: "",
            status: "OPEN",
            fees: 0,
            setup_tags: "",
            notes: ""
        }
    })

    // Load existing trade
    useEffect(() => {
        async function loadTrade() {
            try {
                const { data, error } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (error) throw error

                // Format dates for input[type="datetime-local"]
                const entryDate = data.entry_date ? new Date(data.entry_date).toISOString().slice(0, 16) : ''
                const exitDate = data.exit_date ? new Date(data.exit_date).toISOString().slice(0, 16) : ''

                form.reset({
                    ...data,
                    entry_date: entryDate,
                    exit_date: exitDate,
                    setup_tags: data.setup_tags ? data.setup_tags.join(', ') : '',
                    stop_loss: data.stop_loss || undefined,
                    take_profit: data.take_profit || undefined,
                    exit_price: data.exit_price || undefined,
                    fees: data.fees || 0
                })

                // Load images if exist
                if (data.images && Array.isArray(data.images)) {
                    setImages(data.images)
                }

                setIsShared(data.is_shared || false)
                setShareToken(data.share_token || null)
                setPublicName(data.public_name || "")

            } catch (error: any) {
                toast.error("Erro ao carregar trade")
                router.push('/trades')
            } finally {
                setLoadingConfig(false)
            }
        }
        loadTrade()
    }, [params.id, router, form])

    const calculatePnLForTrade = (values: TradeFormValues) => {
        if (values.status === 'CLOSED' && values.exit_price && values.entry_price) {
            const fees = values.fees || 0
            return calculatePnL({
                symbol: values.symbol,
                direction: values.direction,
                entryPrice: values.entry_price,
                exitPrice: values.exit_price,
                quantity: values.quantity,
                fees
            })
        }
        return { pnl_gross: null, pnl_net: null }
    }

    const onSubmit = async (values: TradeFormValues) => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const tagsArray = values.setup_tags
                ? values.setup_tags.split(',').map(t => t.trim()).filter(Boolean)
                : []

            const { pnl_gross, pnl_net } = calculatePnLForTrade(values)

            // Calculate R-Multiple if Closed
            let r_multiple = null
            if (values.status === 'CLOSED' && pnl_net !== null && values.stop_loss) {
                const risk = Math.abs(values.entry_price - values.stop_loss)
                if (risk > 0) {
                    const reward = values.direction === 'LONG'
                        ? (values.exit_price! - values.entry_price)
                        : (values.entry_price - values.exit_price!)

                    r_multiple = reward / risk
                }
            }

            const { error } = await supabase.from('trades').update({
                account_id: values.account_id,
                symbol: values.symbol,
                direction: values.direction,
                entry_date: new Date(values.entry_date).toISOString(),
                entry_price: values.entry_price,
                stop_loss: values.stop_loss || null,
                take_profit: values.take_profit || null,
                quantity: values.quantity,
                setup_tags: tagsArray,
                notes: values.notes,
                images: images, // Ensure images are updated too

                // Exit fields
                exit_date: values.exit_date ? new Date(values.exit_date).toISOString() : null,
                exit_price: values.exit_price || null,
                fees: values.fees || 0,
                status: values.status,
                pnl_gross: pnl_gross,
                pnl_net: pnl_net,
                r_multiple: r_multiple

            }).eq('id', params.id)

            if (error) throw error

            toast.success("Trade atualizado com sucesso!")
            router.push('/trades')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleShare = async () => {
        try {
            if (isShared) {
                await confirmShare()
                return
            }

            if (!isShared) {
                const values = form.getValues()
                if (values.status !== "CLOSED") {
                    toast.error("Feche o trade antes de compartilhar.")
                    return
                }
                if (!values.exit_price || !values.exit_date) {
                    toast.error("Preencha preço e data de saída para compartilhar.")
                    return
                }
            }

            setConfirmShareOpen(true)
        } catch (error: any) {
            toast.error("Erro ao preparar compartilhamento: " + error.message)
        }
    }

    const confirmShare = async () => {
        setShareConfirmLoading(true)
        try {
            const token = shareToken || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user && !isShared) {
                toast.error("Faça login para compartilhar.")
                return
            }
            const rawName = user?.user_metadata?.username
                || user?.user_metadata?.name
                || user?.user_metadata?.full_name
                || user?.email?.split("@")[0]
                || "Trader"
            const trimmedName = publicName.trim()
            let profileName = ""
            if (!trimmedName && user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("settings")
                    .eq("id", user.id)
                    .single()
                const settings = (data?.settings as Record<string, unknown>) || {}
                profileName = (settings.public_name as string) || ""
            }
            const finalName = (trimmedName || profileName || rawName).slice(0, 32)

            const { error } = await supabase
                .from('trades')
                .update({
                    is_shared: !isShared,
                    share_token: !isShared ? token : null,
                    shared_at: !isShared ? new Date().toISOString() : null,
                    public_name: !isShared ? finalName : null
                })
                .eq('id', params.id)

            if (error) throw error

            setIsShared(!isShared)
            setShareToken(!isShared ? token : null)
            setPublicName(!isShared ? finalName : "")
            setConfirmShareOpen(false)
            toast.success(isShared ? "Trade não é mais público" : "Trade compartilhado com sucesso!")
        } catch (error: any) {
            toast.error("Erro ao compartilhar: " + error.message)
        } finally {
            setShareConfirmLoading(false)
        }
    }

    const copyLink = () => {
        if (!shareToken) return
        const url = `${window.location.origin}/shared/${shareToken}`
        navigator.clipboard.writeText(url)
        setCopying(true)
        toast.info("Link copiado para a área de transferência!")
        setTimeout(() => setCopying(false), 2000)
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este trade?")) return
        const { error } = await supabase.from('trades').delete().eq('id', params.id)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Trade excluído")
            router.push('/trades')
            router.refresh()
        }
    }

    if (loadingConfig) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const tradeStatus = form.watch('status')

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-3xl gap-8">

                {/* Header with Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Link href="/trades"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Gerenciar Operação</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isShared && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyLink}
                                className="h-10 rounded-md border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-medium px-4 transition-colors"
                            >
                                {copying ? <Check className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                                Link
                            </Button>
                        )}
                        <Button
                            variant={isShared ? "default" : "outline"}
                            size="sm"
                            onClick={handleShare}
                            className={cn(
                                "h-10 rounded-md font-medium px-4 transition-colors",
                                isShared ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm shadow-emerald-500/20" : "border-slate-200 dark:border-slate-800"
                            )}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            {isShared ? "Público" : "Compartilhar"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="h-10 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Dialog open={confirmShareOpen} onOpenChange={setConfirmShareOpen}>
                    <DialogContent className="rounded-lg max-w-md">
                        <DialogHeader>
                            <DialogTitle>Compartilhar trade</DialogTitle>
                            <DialogDescription>
                                Confirme o nome público que aparecerá no link compartilhado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Nome Público</label>
                            <Input
                                value={publicName}
                                onChange={(e) => setPublicName(e.target.value)}
                                placeholder="Ex: TraderLCTNET"
                                className="h-11 rounded-xl"
                            />
                            <p className="text-xs text-slate-400">Máx. 32 caracteres.</p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmShareOpen(false)}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmShare}
                                disabled={shareConfirmLoading}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {shareConfirmLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="bg-white dark:bg-[#0b1220] p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nome Público (Opcional)</label>
                            <Input
                                value={publicName}
                                onChange={(e) => setPublicName(e.target.value)}
                                placeholder="Ex: TraderLCTNET"
                                className="mt-2 h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm"
                            />
                        </div>
                        <div className="text-xs text-slate-400 font-medium max-w-xs">
                            Este nome aparece na página pública do trade quando você compartilhar.
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0b1220] p-8 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                            {/* Status Selector - Modern Style */}
                            <div className="bg-slate-50 dark:bg-[#0b1220] p-6 rounded-md border border-slate-200 dark:border-slate-800 transition-colors">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-slate-400" />
                                                <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Estado da Operação</FormLabel>
                                            </div>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className={cn(
                                                        "h-10 rounded-md font-medium text-sm transition-colors",
                                                        field.value === 'CLOSED' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                                    <SelectItem value="OPEN" className="font-medium py-2">EM ABERTO (RUNNING)</SelectItem>
                                                    <SelectItem value="CLOSED" className="font-medium py-2 text-emerald-600">FECHADO (CLOSED)</SelectItem>
                                                    <SelectItem value="PENDING" className="font-medium py-2 text-slate-500">PENDENTE (WAITING)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="symbol"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Símbolo do Ativo</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm uppercase focus:ring-blue-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="direction"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Direção</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="LONG" className="font-medium py-2 text-emerald-600">COMPRA (LONG)</SelectItem>
                                                    <SelectItem value="SHORT" className="font-medium py-2 text-red-600">VENDA (SHORT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* EXIT SECTION - Refined Visuals */}
                            {tradeStatus === 'CLOSED' && (
                                <div className="p-6 rounded-md bg-emerald-500/5 border border-emerald-500/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-3 border-b border-emerald-500/10 pb-4">
                                        <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="font-medium text-emerald-700 dark:text-emerald-400 tracking-tight">Resultados de Encerramento</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="exit_date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Data/Hora Saída</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} className="h-10 rounded-md bg-white dark:bg-slate-950 border-emerald-500/20 font-medium text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="exit_price"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Preço de Saída</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="any" {...field} className="h-10 rounded-md bg-white dark:bg-slate-950 border-emerald-500/20 font-mono font-medium text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="fees"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Total de Taxas</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} className="h-10 rounded-md bg-white dark:bg-slate-950 border-emerald-500/20 font-mono font-medium text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* ORIGINAL ENTRY DETAILS */}
                            <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="entry_price"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Preço Entrada</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stop_loss"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Stop Loss</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-red-600 dark:text-red-400 font-medium text-sm font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="take_profit"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Take Profit</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-emerald-600 dark:text-emerald-400 font-medium text-sm font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-md border border-slate-200 dark:border-slate-800">
                                    <RiskRewardIndicator
                                        entryPrice={form.watch('entry_price') || 0}
                                        stopLoss={form.watch('stop_loss')}
                                        takeProfit={form.watch('take_profit')}
                                        direction={form.watch('direction')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volume Executado</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" {...field} className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 opacity-60">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Conta (Somente Leitura)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Diário & Revisão</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Como foi seu estado emocional? Seguiu o plano? O que aprendeu?"
                                                    className="min-h-[160px] rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 p-4 resize-y transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Upload Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-slate-400" />
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Evidências de Gráfico</label>
                                    </div>
                                    <div className="bg-white dark:bg-[#0b1220] p-6 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
                                        <ImageUpload images={images} onImagesChange={setImages} maxImages={3} />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
                                Salvar Alterações
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
