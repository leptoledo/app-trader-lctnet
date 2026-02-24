"use client"

import { useState } from "react"
import { useSubscription } from "@/hooks/useSubscription"
import { useAccounts } from "@/hooks/useAccounts"
import { BROKER_ADAPTERS, parseTradesCSV } from "@/lib/importers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileType, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Zap, Sparkles, FileSpreadsheet, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ImportPage() {
    const router = useRouter()
    const { isAtLeast, loading: subLoading } = useSubscription()
    const { accounts } = useAccounts()
    const [selectedAdapter, setSelectedAdapter] = useState("generic")
    const [selectedAccount, setSelectedAccount] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [previewTrades, setPreviewTrades] = useState<any[]>([])
    const [previewCount, setPreviewCount] = useState(0)

    const canImport = isAtLeast('pro')

    const parseFile = async (f: File, adapter: string) => {
        try {
            const trades = await parseTradesCSV(f, adapter)
            setPreviewTrades(trades)
            setPreviewCount(trades.length)
        } catch (error: any) {
            toast.error("Erro ao ler arquivo: " + error.message)
            setPreviewCount(0)
            setPreviewTrades([])
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            await parseFile(selectedFile, selectedAdapter)
        }
    }

    const onAdapterChange = async (newAdapter: string) => {
        setSelectedAdapter(newAdapter)
        if (file) {
            await parseFile(file, newAdapter)
        }
    }

    if (subLoading) return (
        <div className="flex h-screen items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1220]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    )

    const handleImport = async () => {
        if (!file || !selectedAccount) {
            toast.error("Selecione um arquivo e uma conta")
            return
        }

        setImporting(true)
        try {
            const trades = await parseTradesCSV(file, selectedAdapter)
            const { data: { user } } = await supabase.auth.getUser()

            const tradesWithAccount = trades.map(t => ({
                ...t,
                account_id: selectedAccount,
                user_id: user?.id
            }))

            const { error } = await supabase.from('trades').insert(tradesWithAccount)

            if (error) throw error

            toast.success(`${trades.length} trades importados com sucesso!`)
            router.push('/trades')
            router.refresh()
        } catch (error: any) {
            toast.error(`Erro na importação: ${error.message}`)
        } finally {
            setImporting(false)
        }
    }

    if (!canImport) {
        return (
            <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
                <div className="max-w-3xl mx-auto w-full pt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-16 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl relative overflow-hidden group">

                        {/* Decorative Background Glows */}
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-lg blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-1000" />
                        <div className="absolute bottom-0 left-0 p-24 bg-emerald-500/10 rounded-lg blur-3xl -ml-12 -mb-12" />

                        <div className="relative z-10 space-y-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/30 transform group-hover:rotate-6 transition-transform duration-500">
                                <Zap className="h-12 w-12 text-white fill-white/20" />
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.4em]">Recurso Exclusivo</p>
                                <h1 className="text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Importação em Massa</h1>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg max-w-lg mx-auto leading-relaxed">
                                A sincronização automática via CSV é o segredo dos traders de alta performance.
                                <span className="block mt-2 text-blue-500 dark:text-blue-400 font-semibold">Funcionalidade exclusiva do plano PRO.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Button size="lg" className="bg-[#2b7de9] hover:bg-[#256bd1] rounded-lg h-16 px-12 font-semibold uppercase tracking-tighter text-lg shadow-xl shadow-blue-500/20 w-full sm:w-auto" asChild>
                                    <Link href="/pricing" className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" /> Fazer Upgrade Hoje
                                    </Link>
                                </Button>
                                <Button variant="ghost" className="rounded-lg h-16 px-8 font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800/50 w-full sm:w-auto" asChild>
                                    <Link href="/trades">Voltar para Trades</Link>
                                </Button>
                            </div>

                            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {[
                                    { icon: Zap, title: "Zero Esforço", desc: "Arraste e solte seu extrato" },
                                    { icon: ShieldCheck, title: "100% Seguro", desc: "Seus dados criptografados" },
                                    { icon: Sparkles, title: "Insights Pro", desc: "Análise avançada após carga" }
                                ].map((feature, i) => (
                                    <div key={i} className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                        <feature.icon className="h-5 w-5 text-blue-500 mb-2" />
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase mb-1">{feature.title}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-7xl gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" asChild className="rounded-lg h-12 w-12 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                            <Link href="/trades"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Automação</p>
                            <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Sync Histórico</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Input Controls */}
                    <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-75">

                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-10">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">1. Fonte de Dados</label>
                                    <Select value={selectedAdapter} onValueChange={onAdapterChange}>
                                        <SelectTrigger className="h-14 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm transition-all focus:ring-blue-500">
                                            <SelectValue placeholder="Selecione o formato" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                            {BROKER_ADAPTERS.map(adapter => (
                                                <SelectItem key={adapter.id} value={adapter.id} className="font-semibold py-3">{adapter.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">2. Conta de Destino</label>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                        <SelectTrigger className="h-14 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-semibold text-sm transition-all focus:ring-blue-500">
                                            <SelectValue placeholder="Escolha a conta" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id} className="font-semibold py-3">{acc.name} ({acc.currency})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Drop Zone Style Upload */}
                            <div className="relative group">
                                <label
                                    htmlFor="csv-upload"
                                    className={cn(
                                        "flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[2.5rem] transition-all cursor-pointer",
                                        file
                                            ? "border-emerald-500 bg-emerald-500/5 group-hover:bg-emerald-500/10"
                                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 group-hover:border-blue-500/50 group-hover:bg-blue-500/[0.03]"
                                    )}
                                >
                                    <div className="space-y-4 text-center p-8">
                                        <div className={cn(
                                            "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm transition-all duration-500",
                                            file ? "bg-emerald-500 rotate-0 scale-110" : "bg-white dark:bg-slate-800 rotate-3 group-hover:rotate-0 scale-100"
                                        )}>
                                            {file ? (
                                                <CheckCircle2 className="h-10 w-10 text-white" />
                                            ) : (
                                                <FileSpreadsheet className="h-10 w-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-lg text-slate-900 dark:text-white uppercase tracking-tight">Arraste seu arquivo CSV</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
                                                {file ? `Arquivo "${file.name}" pronto` : "Ou clique para selecionar manualmente"}
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                </label>

                                {file && (
                                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in-50 duration-300">
                                        <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewCount(0); setPreviewTrades([]); }} className="h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 font-semibold text-xs hover:bg-red-50">
                                            REMOVER
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 dark:bg-slate-950 dark:border dark:border-slate-800/80 text-white h-[660px] flex flex-col overflow-hidden relative">

                            {/* Card Accent */}
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-lg blur-3xl -mr-20 -mt-20 pointer-events-none" />

                            <div className="p-10 flex-1 flex flex-col relative z-10 space-y-8 h-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-heading font-semibold uppercase tracking-tight">Prévia dos Dados</h2>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-lg",
                                            previewCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                                        )} />
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Live Validator</span>
                                    </div>
                                </div>

                                {previewCount > 0 ? (
                                    <div className="flex-1 flex flex-col min-h-0 space-y-8">

                                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-1">Total Detectado</p>
                                                <p className="text-4xl font-heading font-semibold tracking-tighter">{previewCount} trades</p>
                                            </div>
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <Sparkles className="h-6 w-6 text-emerald-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                            <div className="flex items-center justify-between px-2">
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Últimas Entradas</p>
                                                <p className="text-[10px] font-semibold text-slate-600">Mostrando top 5</p>
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {previewTrades.slice(0, 5).map((t, i) => (
                                                    <div key={i} className="bg-white/[0.03] border border-white/5 p-4 rounded-lg flex justify-between items-center transition-all hover:bg-white/[0.06]">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-[10px]",
                                                                t.direction === 'LONG' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                                                            )}>
                                                                {t.direction === 'LONG' ? 'BUY' : 'SELL'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm text-white tracking-tight">{t.symbol}</p>
                                                                <p className="text-[10px] text-slate-500 font-semibold uppercase">{new Date(t.entry_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white font-semibold text-sm tracking-tight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.pnl_net || 0)}</p>
                                                            <p className="text-[10px] text-slate-500 font-semibold font-mono">@{t.entry_price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {previewCount > 5 && (
                                                    <div className="py-4 text-center">
                                                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">+ {previewCount - 5} outros registros...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 flex items-start gap-3">
                                            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-blue-400/80 font-semibold leading-relaxed uppercase tracking-wider">
                                                Validação pronta. Ao processar, todos os trades serão vinculedos à conta <span className="text-blue-300 underline font-semibold">{accounts.find(a => a.id === selectedAccount)?.name || 'selecionada'}</span>.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-30">
                                        <div className="w-20 h-20 rounded-lg border-4 border-dashed border-slate-700 flex items-center justify-center">
                                            <FileType className="h-8 w-8 text-slate-700" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Aguardando arquivo...</p>
                                    </div>
                                )}

                                <Button
                                    className="w-full h-20 rounded-[2rem] bg-[#2b7de9] hover:bg-[#256bd1] text-white font-semibold text-lg shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                    disabled={!file || !selectedAccount || importing}
                                    onClick={handleImport}
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin mr-3" /> IMPORTANDO...
                                        </>
                                    ) : (
                                        "INICIAR IMPORTAÇÃO"
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
