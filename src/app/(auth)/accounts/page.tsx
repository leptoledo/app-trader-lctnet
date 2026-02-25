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
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-white" />
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-[#0b1220] rounded-md flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <Landmark className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Gestão de Bancas</h1>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            if (isCreating) resetForm()
                            else setIsCreating(true)
                        }}
                        className={cn(
                            "h-10 px-4 rounded-md font-medium transition-colors shadow-sm",
                            isCreating
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-none border border-transparent"
                                : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white"
                        )}
                    >
                        {isCreating ? "Cancelar" : <><Plus className="h-4 w-4 mr-2" /> Nova Conta</>}
                    </Button>
                </div>

                {/* Account Creation Form */}
                {isCreating && (
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                        <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-slate-400" />
                                    <CardTitle className="text-lg font-medium text-slate-900 dark:text-white">
                                        {editingAccount ? 'Editar Configurações' : 'Configurar Nova Banca'}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-slate-500 text-xs">
                                    Defina os parâmetros financeiros da sua conta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleAction} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Identificação</label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                                                <Input
                                                    placeholder="Ex: Conta Real"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm focus:ring-slate-900 dark:focus:ring-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Moeda</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                                                <Select value={currency} onValueChange={setCurrency}>
                                                    <SelectTrigger className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm focus:ring-slate-900 dark:focus:ring-white transition-colors">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm">
                                                        <SelectItem value="USD" className="font-medium py-2 text-sm">Dólar (USD)</SelectItem>
                                                        <SelectItem value="BRL" className="font-medium py-2 text-sm">Real (BRL)</SelectItem>
                                                        <SelectItem value="EUR" className="font-medium py-2 text-sm">Euro (EUR)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Saldo de Partida</label>
                                            <div className="relative group">
                                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                                                <Input
                                                    type="number"
                                                    value={balance}
                                                    onChange={(e) => setBalance(e.target.value)}
                                                    className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm focus:ring-slate-900 dark:focus:ring-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingAccount ? "Salvar Alterações" : "Criar Conta")}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Account Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((acc: any, index: number) => (
                        <Card
                            key={acc.id}
                            className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 group overflow-hidden bg-white dark:bg-[#0b1220] animate-in fade-in slide-in-from-bottom-4 duration-700"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className="p-6 pb-4 flex justify-between items-start relative z-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-[#0b1220] rounded-md flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-800">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">{acc.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-slate-500 uppercase font-medium">{acc.currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Saldo Atual</p>
                                        <p className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: acc.currency }).format(acc.current_balance || acc.initial_balance)}
                                        </p>
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-md border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] p-1 min-w-[160px]">
                                            <DropdownMenuItem onClick={() => startEditing(acc)} className="rounded-sm font-medium text-xs cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900 mb-1">
                                                <Pencil className="h-3 w-3 mr-2 text-slate-500" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteConfirm(acc)} className="rounded-sm font-medium text-xs text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10 dark:text-red-500">
                                                <Trash2 className="h-3 w-3 mr-2" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/30 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-medium text-slate-500">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                    <span>Status: OK</span>
                                </div>
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Ativa
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Confirm Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="rounded-md p-6 max-w-sm border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] gap-6">
                        <DialogHeader className="space-y-4">
                            <div className="space-y-2 text-left">
                                <DialogTitle className="text-lg font-medium text-slate-900 dark:text-white">Excluir Conta</DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Você está prestes a apagar a conta <span className="text-slate-900 dark:text-white font-medium">{accountToDelete?.name}</span> e todo seu histórico. Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 h-10 rounded-md font-medium text-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={submitting}
                                className="flex-1 h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition-colors"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
