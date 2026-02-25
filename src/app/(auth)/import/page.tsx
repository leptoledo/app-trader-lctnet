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
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-white" />
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
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
                <div className="max-w-3xl mx-auto w-full pt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white dark:bg-[#0b1220] p-12 md:p-16 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">

                        <div className="relative z-10 space-y-8">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-400 mx-auto">
                                <Zap className="h-8 w-8 text-slate-400" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Importação em Massa</h1>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                                A sincronização automática via CSV é o segredo dos traders de alta performance.
                                <span className="block mt-1 text-slate-700 dark:text-slate-300">Funcionalidade exclusiva do plano PRO.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md h-10 px-8 font-medium text-sm shadow-sm w-full sm:w-auto transition-colors" asChild>
                                    <Link href="/pricing" className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> Fazer Upgrade Hoje
                                    </Link>
                                </Button>
                                <Button variant="outline" className="rounded-md h-10 px-8 font-medium text-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto" asChild>
                                    <Link href="/trades">Voltar para Trades</Link>
                                </Button>
                            </div>

                            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                {[
                                    { icon: Zap, title: "Zero Esforço", desc: "Arraste e solte seu extrato" },
                                    { icon: ShieldCheck, title: "100% Seguro", desc: "Seus dados protegidos" },
                                    { icon: Sparkles, title: "Insights", desc: "Análise avançada" }
                                ].map((feature, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-md border border-slate-200 dark:border-slate-800 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                                        <feature.icon className="h-5 w-5 text-slate-400 mb-3" />
                                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{feature.title}</p>
                                        <p className="text-xs text-slate-500">{feature.desc}</p>
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
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="mx-auto grid w-full max-w-6xl gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-md h-10 w-10 bg-white dark:bg-[#0b1220] shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <Link href="/trades"><ArrowLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Sync Histórico</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Input Controls */}
                    <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-75">

                        <div className="bg-white dark:bg-[#0b1220] p-8 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">1. Fonte de Dados</label>
                                    <Select value={selectedAdapter} onValueChange={onAdapterChange}>
                                        <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm transition-colors focus:ring-slate-900 dark:focus:ring-white">
                                            <SelectValue placeholder="Selecione o formato" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm">
                                            {BROKER_ADAPTERS.map(adapter => (
                                                <SelectItem key={adapter.id} value={adapter.id} className="font-medium py-2 text-sm">{adapter.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">2. Conta de Destino</label>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                        <SelectTrigger className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm transition-colors focus:ring-slate-900 dark:focus:ring-white">
                                            <SelectValue placeholder="Escolha a conta" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm">
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id} className="font-medium py-2 text-sm">{acc.name} ({acc.currency})</SelectItem>
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
                                        "flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-md transition-colors cursor-pointer",
                                        file
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                                    )}
                                >
                                    <div className="space-y-3 text-center p-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-md flex items-center justify-center mx-auto transition-colors",
                                            file ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 text-slate-400 shadow-sm"
                                        )}>
                                            {file ? (
                                                <CheckCircle2 className="h-6 w-6" />
                                            ) : (
                                                <FileSpreadsheet className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">Arraste seu arquivo CSV</p>
                                            <p className="text-xs text-slate-500">
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
                                    <div className="absolute top-2 right-2 animate-in fade-in duration-300">
                                        <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewCount(0); setPreviewTrades([]); }} className="h-8 rounded-md text-red-500 font-medium text-xs hover:bg-red-50 dark:hover:bg-red-500/10">
                                            Remover
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                        <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-[#0b1220] h-[550px] flex flex-col overflow-hidden relative">

                            <div className="p-6 flex-1 flex flex-col relative z-10 space-y-6 h-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">Prévia dos Dados</h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            previewCount > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                        )} />
                                        <span className="text-xs font-medium text-slate-500">Live Validator</span>
                                    </div>
                                </div>

                                {previewCount > 0 ? (
                                    <div className="flex-1 flex flex-col min-h-0 space-y-6">

                                        <div className="bg-white dark:bg-[#0b1220] p-4 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-0.5">Total Detectado</p>
                                                <p className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">{previewCount} trades</p>
                                            </div>
                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-md flex items-center justify-center">
                                                <Sparkles className="h-5 w-5 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1 flex flex-col min-h-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Últimas Entradas</p>
                                                <p className="text-xs font-medium text-slate-400">Top 5</p>
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                                {previewTrades.slice(0, 5).map((t, i) => (
                                                    <div key={i} className="bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 p-3 rounded-md flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-md flex items-center justify-center font-medium text-[10px]",
                                                                t.direction === 'LONG' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                            )}>
                                                                {t.direction === 'LONG' ? 'BUY' : 'SELL'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-slate-900 dark:text-white tracking-tight">{t.symbol}</p>
                                                                <p className="text-xs text-slate-500">{new Date(t.entry_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-slate-900 dark:text-white font-medium text-sm tracking-tight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.pnl_net || 0)}</p>
                                                            <p className="text-[10px] text-slate-500 font-mono font-medium">@{t.entry_price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {previewCount > 5 && (
                                                    <div className="py-2 text-center">
                                                        <p className="text-xs text-slate-500 font-medium">+ {previewCount - 5} outros registros...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-md p-3 border border-blue-100 dark:border-blue-800/30 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed">
                                                Validação pronta. Ao processar, todos os trades serão vinculados à conta <span className="font-medium underline">{accounts.find(a => a.id === selectedAccount)?.name || 'selecionada'}</span>.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-50">
                                        <div className="w-16 h-16 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-[#0b1220]">
                                            <FileType className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">Aguardando arquivo...</p>
                                    </div>
                                )}

                                <Button
                                    className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
                                    disabled={!file || !selectedAccount || importing}
                                    onClick={handleImport}
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Importando...
                                        </>
                                    ) : (
                                        "Iniciar Importação"
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
