"use client"

import { useState } from "react"
import { useAccounts } from "@/hooks/useAccounts"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wallet, Trash2, ArrowLeft, Loader2, Landmark, MoreVertical, Pencil, Sparkles, ShieldCheck, Globe, CreditCard } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function AccountsPage() {
    const { accounts, loading, refreshAccounts } = useAccounts() as any
    const [isCreating, setIsCreating] = useState(false)
    const [editingAccount, setEditingAccount] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)

    // Deletion State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<any>(null)

    // Form State
    const [name, setName] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [balance, setBalance] = useState("10000")

    const resetForm = () => {
        setName("")
        setCurrency("USD")
        setBalance("10000")
        setIsCreating(false)
        setEditingAccount(null)
    }

    const startEditing = (acc: any) => {
        setEditingAccount(acc)
        setName(acc.name)
        setCurrency(acc.currency)
        setBalance(acc.initial_balance.toString())
        setIsCreating(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return toast.error("Nome da conta é obrigatório")

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Não autenticado")

            if (editingAccount) {
                const { error } = await supabase
                    .from('accounts')
                    .update({
                        name: name.trim(),
                        currency,
                        initial_balance: parseFloat(balance),
                    })
                    .eq('id', editingAccount.id)
                if (error) throw error
                toast.success("Conta atualizada!")
            } else {
                const { error } = await supabase.from('accounts').insert({
                    user_id: user.id,
                    name: name.trim(),
                    currency,
                    initial_balance: parseFloat(balance),
                    current_balance: parseFloat(balance)
                })
                if (error) throw error
                toast.success("Conta criada!")
            }

            resetForm()
            if (refreshAccounts) refreshAccounts()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!accountToDelete) return

        setSubmitting(true)
        try {
            const { error } = await supabase.from('accounts').delete().eq('id', accountToDelete.id)
            if (error) throw error

            toast.success("Conta removida com sucesso!")
            setIsDeleteDialogOpen(false)
            setAccountToDelete(null)
            if (refreshAccounts) refreshAccounts()
        } catch (error: any) {
            toast.error("Erro ao excluir: " + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteConfirm = (acc: any) => {
        setAccountToDelete(acc)
        setIsDeleteDialogOpen(true)
    }

    if (loading && accounts.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1220]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-5xl mx-auto w-full space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                            <Landmark className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Tesouraria</p>
                            <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Gestão de Bancas</h1>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            if (isCreating) resetForm()
                            else setIsCreating(true)
                        }}
                        className={cn(
                            "h-12 px-6 rounded-xl font-semibold transition-all shadow-lg",
                            isCreating
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-none"
                                : "bg-[#2b7de9] hover:bg-[#256bd1] text-white shadow-blue-500/20"
                        )}
                    >
                        {isCreating ? "Cancelar" : <><Plus className="h-5 w-5 mr-2" /> Nova Conta</>}
                    </Button>
                </div>

                {/* Account Creation Form */}
                {isCreating && (
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden relative">
                            {/* Card Accent */}
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-2xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">
                                        {editingAccount ? 'Editar Configurações' : 'Configurar Nova Banca'}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-widest mt-2">
                                    Defina os parâmetros financeiros da sua nova sub-conta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 relative z-10">
                                <form onSubmit={handleAction} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Identificação</label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    placeholder="Ex: MT5 Forex Real"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Moeda Base</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                                                <Select value={currency} onValueChange={setCurrency}>
                                                    <SelectTrigger className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500 transition-all text-slate-900 dark:text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                                        <SelectItem value="USD" className="font-semibold py-3 text-sm">Dólar (USD)</SelectItem>
                                                        <SelectItem value="BRL" className="font-semibold py-3 text-sm">Real (BRL)</SelectItem>
                                                        <SelectItem value="EUR" className="font-semibold py-3 text-sm">Euro (EUR)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Saldo de Partida</label>
                                            <div className="relative group">
                                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    type="number"
                                                    value={balance}
                                                    onChange={(e) => setBalance(e.target.value)}
                                                    className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/30 font-semibold text-sm focus:ring-blue-500 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-16 rounded-[2rem] bg-[#2b7de9] hover:bg-[#256bd1] text-white font-semibold text-lg shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingAccount ? "ATUALIZAR CONFIGURAÇÕES" : "FINALIZAR E CRIAR CONTA")}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Account Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {accounts.map((acc: any, index: number) => (
                        <Card
                            key={acc.id}
                            className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 duration-700"
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.03] rounded-bl-[6rem] -mr-12 -mt-12 pointer-events-none group-hover:bg-blue-500/[0.06] transition-all duration-700" />

                            <div className="p-10 flex justify-between items-start relative z-10">
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/80 rounded-[2rem] flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-[#2b7de9] group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                            <Wallet className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{acc.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-[0.1em] rounded-md border border-slate-200/50 dark:border-slate-700">
                                                    {acc.currency}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Conta Principal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Saldo Atual</p>
                                        <p className="text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tighter">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: acc.currency }).format(acc.current_balance || acc.initial_balance)}
                                        </p>
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-12 h-12 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                                <MoreVertical className="h-6 w-6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 p-3 min-w-[200px]">
                                            <DropdownMenuItem onClick={() => startEditing(acc)} className="rounded-xl font-semibold uppercase text-[10px] tracking-widest cursor-pointer py-3 px-4 focus:bg-slate-50 dark:focus:bg-slate-900 mb-1">
                                                <Pencil className="h-4 w-4 mr-3 text-blue-500" /> Editar Definições
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteConfirm(acc)} className="rounded-xl font-semibold uppercase text-[10px] tracking-widest text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300 cursor-pointer py-3 px-4 focus:bg-red-50 dark:focus:bg-red-900/20">
                                                <Trash2 className="h-4 w-4 mr-3" /> Encerrar Conta
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 dark:bg-slate-800/20 px-10 py-5 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400/80 relative z-10">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    <span>Sinc: OK</span>
                                </div>
                                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Monitorada
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Confirm Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="rounded-[3rem] p-10 max-w-md border-none shadow-2xl bg-white dark:bg-slate-950">
                        <DialogHeader className="space-y-8">
                            <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2 ring-8 ring-red-50 dark:ring-red-500/[0.03]">
                                <Trash2 className="h-12 w-12" />
                            </div>
                            <div className="space-y-3">
                                <DialogTitle className="text-3xl font-heading font-semibold text-center text-slate-900 dark:text-white tracking-tight">Encerrar Conta?</DialogTitle>
                                <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-semibold text-lg leading-relaxed">
                                    Você está prestes a apagar permanentemente a conta <span className="text-red-600 dark:text-red-400 underline">"{accountToDelete?.name}"</span>.
                                    <span className="block mt-2 text-slate-600 dark:text-slate-300">Todos os dados e estatísticas vinculados serão perdidos.</span>
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-4 mt-10">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 h-14 rounded-2xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-widest text-xs"
                            >
                                CANCELAR
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={submitting}
                                className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold tracking-widest uppercase text-xs shadow-xl shadow-red-500/20"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONFIRMAR EXCLUSÃO"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
