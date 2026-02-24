"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tradeSchema, TradeFormValues } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAccounts } from "@/hooks/useAccounts"
import { Loader2, ArrowLeft, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NewTradePage() {
    const router = useRouter()
    const { accounts, loading: accountsLoading } = useAccounts()
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<TradeFormValues>({
        resolver: zodResolver(tradeSchema) as Resolver<TradeFormValues>,
        defaultValues: {
            symbol: "",
            direction: "LONG",
            entry_date: new Date().toISOString().slice(0, 16),
            ticket_id: "",
            setup_tags: "",
            notes: "",
            account_id: "",
            status: "OPEN"
        }
    })

    // Set default account when loaded
    useEffect(() => {
        if (!form.getValues("account_id") && accounts.length > 0) {
            form.setValue("account_id", accounts[0].id)
        }
    }, [accounts, form])

    const onSubmit = async (values: TradeFormValues) => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const tagsArray = values.setup_tags
                ? values.setup_tags.split(',').map(t => t.trim()).filter(Boolean)
                : []

            const { error } = await supabase.from('trades').insert({
                user_id: user.id,
                account_id: values.account_id,
                symbol: values.symbol,
                direction: values.direction,
                entry_date: new Date(values.entry_date).toISOString(),
                entry_price: values.entry_price,
                stop_loss: values.stop_loss || null,
                take_profit: values.take_profit || null,
                quantity: values.quantity,
                ticket_id: values.ticket_id || null,
                commission: values.commission || 0,
                swap: values.swap || 0,
                fees: (values.commission || 0) + (values.swap || 0),
                setup_tags: tagsArray,
                notes: values.notes,
                status: 'OPEN'
            })

            if (error) throw error

            toast.success("Trade registrado com sucesso!")
            router.push('/trades')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-2xl gap-8">

                {/* Header Section */}
                <div className="flex items-center gap-5 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl h-12 w-12 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <Link href="/trades"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                    </Button>
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Diário</p>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Nova Operação</h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Conta de Trading</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={accountsLoading}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm focus:ring-blue-500 hover:border-blue-500/50 transition-colors">
                                                        <SelectValue placeholder="Selecione a conta" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl">
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id} className="font-semibold py-3">{acc.name} ({acc.currency})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="entry_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Data e Hora</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm focus:ring-blue-500 hover:border-blue-500/50 transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="symbol"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Símbolo / Ativo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ex: XAUUSD, BTCUSD"
                                                    {...field}
                                                    className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm uppercase focus:ring-blue-500 hover:border-blue-500/50 transition-colors placeholder:font-normal"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="direction"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Direção</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm focus:ring-blue-500 hover:border-blue-500/50 transition-colors">
                                                        <SelectValue placeholder="Selecione a direção" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl">
                                                    <SelectItem value="LONG" className="font-semibold py-3 text-emerald-500">
                                                        <span className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4" /> COMPRA (LONG)
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="SHORT" className="font-semibold py-3 text-red-500">
                                                        <span className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 rotate-180" /> VENDA (SHORT)
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <FormField
                                    control={form.control}
                                    name="entry_price"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Preço Entrada</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => {
                                                        const next = event.target.value
                                                        field.onChange(next === "" ? undefined : next)
                                                    }}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500 font-mono"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stop_loss"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-red-400/80 uppercase tracking-[0.2em] ml-1">Stop Loss</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => {
                                                        const next = event.target.value
                                                        field.onChange(next === "" ? undefined : next)
                                                    }}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-red-50/10 dark:bg-red-500/5 font-semibold text-sm focus:ring-red-500 font-mono"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="take_profit"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-[0.2em] ml-1">Take Profit</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => {
                                                        const next = event.target.value
                                                        field.onChange(next === "" ? undefined : next)
                                                    }}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-emerald-50/10 dark:bg-emerald-500/5 font-semibold text-sm focus:ring-emerald-500 font-mono"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Volume (Lotes)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => {
                                                        const next = event.target.value
                                                        field.onChange(next === "" ? undefined : next)
                                                    }}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="commission"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Taxas/Comissão</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(event) => {
                                                        const next = event.target.value
                                                        field.onChange(next === "" ? undefined : next)
                                                    }}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ticket_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Ticket ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="#"
                                                    {...field}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <FormField
                                    control={form.control}
                                    name="setup_tags"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Setups / Estratégias</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ex: Breakout, Retest, SMC (separado por vírgula)"
                                                    {...field}
                                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Racional da Operação</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Descreva o motivo desta entrada..."
                                                    className="min-h-[140px] rounded-xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500 p-6 resize-none transition-all placeholder:font-normal"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 rounded-full bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white font-bold text-xs uppercase tracking-[0.3em] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-1 active:scale-95 border border-transparent dark:border-blue-500/30 disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : null}
                                REGISTRAR OPERAÇÃO
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
