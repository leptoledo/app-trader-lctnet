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
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-3xl gap-8">

                {/* Header Section */}
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Button variant="ghost" size="icon" asChild className="rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Link href="/trades"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-medium text-slate-900 dark:text-white-white tracking-tight">Nova Operação</h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-[#0b1220] p-8 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Conta de Trading</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={accountsLoading}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 transition-colors">
                                                        <SelectValue placeholder="Selecione a conta" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-md">
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id} className="font-medium py-2">{acc.name} ({acc.currency})</SelectItem>
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Data e Hora</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 transition-colors"
                                                />
                                            </FormControl>
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
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Símbolo / Ativo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ex: XAUUSD, EURUSD"
                                                    {...field}
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm uppercase focus:ring-blue-500 transition-colors"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Direção</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 transition-colors">
                                                        <SelectValue placeholder="Selecione a direção" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-md">
                                                    <SelectItem value="LONG" className="font-medium py-2 text-emerald-600 dark:text-emerald-500">
                                                        COMPRA (LONG)
                                                    </SelectItem>
                                                    <SelectItem value="SHORT" className="font-medium py-2 text-red-600 dark:text-red-500">
                                                        VENDA (SHORT)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <FormField
                                    control={form.control}
                                    name="entry_price"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Preço Entrada</FormLabel>
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
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 font-mono"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Stop Loss</FormLabel>
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
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 font-mono text-red-600 dark:text-red-400"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Take Profit</FormLabel>
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
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 font-mono text-emerald-600 dark:text-emerald-400"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volume (Lotes)</FormLabel>
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
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Taxas/Comissão</FormLabel>
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
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">ID Plataforma</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="#"
                                                    {...field}
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <FormField
                                    control={form.control}
                                    name="setup_tags"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Estratégias/Regras</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ex: Breakout, Retest (separado por vírgula)"
                                                    {...field}
                                                    className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500"
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
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Racional da Operação</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Descreva o motivo da entrada..."
                                                    className="min-h-[140px] rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 font-medium text-sm focus:ring-blue-500 p-4 resize-y transition-colors"
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
                                className="w-full h-11 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
                                Salvar Operação
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
