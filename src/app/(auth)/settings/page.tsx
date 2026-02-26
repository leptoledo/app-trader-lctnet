"use client"

import { useEffect, useState } from "react"
import { useSubscription } from "@/hooks/useSubscription"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { saveApiKeysAction } from "@/app/actions/keysAction"
import { syncTradesAction } from "@/app/actions/syncAction"

const SETTINGS_TABS = [
    { id: "general", label: "Geral" },
    { id: "appearance", label: "Aparência" },
    { id: "preferences", label: "Preferências" },
    { id: "integrations", label: "Integrações" },
    { id: "billing", label: "Assinatura" },
]

export default function SettingsPage() {
    const { plan, loading, isFree } = useSubscription()
    const [publicName, setPublicName] = useState("")
    const [profileLoading, setProfileLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileSettings, setProfileSettings] = useState<Record<string, unknown>>({})
    const [outlierThreshold, setOutlierThreshold] = useState("25")
    const [savingPreferences, setSavingPreferences] = useState(false)
    const [activeTab, setActiveTab] = useState("general")

    // Integrations State
    const [binanceApiKey, setBinanceApiKey] = useState("")
    const [binanceApiSecret, setBinanceApiSecret] = useState("")
    const [savingKeys, setSavingKeys] = useState(false)
    const [syncingTrades, setSyncingTrades] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            setProfileLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, settings")
                    .eq("id", user.id)
                    .single()

                if (error) throw error
                const settings = (data?.settings as Record<string, unknown>) || {}
                if (isMounted) {
                    setProfileSettings(settings)
                    const nameFromSettings = (settings.public_name as string) || ""
                    setPublicName(nameFromSettings || data?.username || "")
                    const thresholdFromSettings = typeof settings.outlier_threshold_percent === "number"
                        ? settings.outlier_threshold_percent
                        : 25
                    setOutlierThreshold(String(thresholdFromSettings))
                }
            } catch {
                // Ignore profile load errors to avoid blocking settings
            } finally {
                if (isMounted) setProfileLoading(false)
            }
        }

        loadProfile()
        return () => {
            isMounted = false
        }
    }, [])

    const handleSaveProfile = async () => {
        const trimmed = publicName.trim().slice(0, 32)
        setSavingProfile(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Faça login para salvar o perfil.")
                return
            }

            const nextSettings = { ...profileSettings, public_name: trimmed }
            const { error } = await supabase
                .from("profiles")
                .update({ settings: nextSettings })
                .eq("id", user.id)

            if (error) throw error
            setProfileSettings(nextSettings)
            setPublicName(trimmed)
            toast.success("Perfil atualizado.")
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar perfil.")
        } finally {
            setSavingProfile(false)
        }
    }

    const handleSavePreferences = async () => {
        const parsed = Number(outlierThreshold)
        if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
            toast.error("Defina um percentual válido entre 0 e 100.")
            return
        }

        setSavingPreferences(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Faça login para salvar as preferências.")
                return
            }

            const nextSettings = { ...profileSettings, outlier_threshold_percent: parsed }
            const { error } = await supabase
                .from("profiles")
                .update({ settings: nextSettings })
                .eq("id", user.id)

            if (error) throw error
            setProfileSettings(nextSettings)
            setOutlierThreshold(String(parsed))
            toast.success("Preferências salvas.")
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar preferências.")
        } finally {
            setSavingPreferences(false)
        }
    }

    const handleSaveBinanceKeys = async () => {
        setSavingKeys(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Usuário não autenticado.")

            const res = await saveApiKeysAction(user.id, "BINANCE", binanceApiKey, binanceApiSecret)
            if (!res.success) throw new Error(res.error as string)

            toast.success(res.message)
            setBinanceApiKey("")
            setBinanceApiSecret("")
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar as chaves.")
        } finally {
            setSavingKeys(false)
        }
    }

    const handleSyncBinance = async () => {
        setSyncingTrades(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Usuário não autenticado.")

            const res = await syncTradesAction(user.id, "BINANCE")
            if (!res.success) throw new Error(res.error as string)

            toast.success(res.message)
        } catch (error: any) {
            toast.error(error.message || "Erro ao sincronizar trades.")
        } finally {
            setSyncingTrades(false)
        }
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1220]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#0b1220] p-6 lg:p-12 transition-colors duration-500">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">
                    Configurações
                </h1>

                {/* Horizontal Navigation */}
                <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
                    {SETTINGS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-emerald-500 text-slate-900 dark:text-slate-100"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content wrapper */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Perfil Público</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome Público</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Seu nome ou apelido exibido em trades que você optar por compartilhar na comunidade.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 flex flex-col space-y-2">
                                        <Input
                                            value={publicName}
                                            onChange={(e) => setPublicName(e.target.value)}
                                            placeholder="Ex: Trader Journal"
                                            className="h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220] transition-colors focus-visible:ring-emerald-500"
                                            disabled={profileLoading}
                                        />
                                        <span className="text-[11px] text-slate-400">Máximo de 32 caracteres permitidos.</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-100/50 dark:bg-[#0b1220]/50 flex justify-end">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile || profileLoading}
                                        className="h-9 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-none h-auto py-2"
                                    >
                                        {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aparência</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tema da Interface</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Ajuste o esquema de cores da aplicação. Escolha como prefere acompanhar seus resultados visuais.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 flex items-center justify-start">
                                        <div className="flex items-center gap-3 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220] px-3 font-medium text-sm transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                                            <ModeToggle />
                                            <span className="text-slate-700 dark:text-slate-300">Alterar Esquema</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === "preferences" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Preferências de Trades</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Alerta de Outlier (%)</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Defina o limiar para fechamento e notificação de trades atípicos na sua gestão de risco. Defina 0 para desativar.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={outlierThreshold}
                                            onChange={(e) => setOutlierThreshold(e.target.value)}
                                            placeholder="Ex: 25"
                                            className="h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220] transition-colors focus-visible:ring-emerald-500 w-full sm:w-32"
                                            disabled={profileLoading}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-100/50 dark:bg-[#0b1220]/50 flex justify-end">
                                    <Button
                                        onClick={handleSavePreferences}
                                        disabled={savingPreferences || profileLoading}
                                        className="h-9 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-none h-auto py-2"
                                    >
                                        {savingPreferences ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === "integrations" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Integrações Automáticas</h2>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Credenciais Binance</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Adicione sua API Key e Secret Key somente-leitura. Os dados são encriptados no seu painel. Após salvar as chaves com sucesso, use a sincronização.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 flex flex-col space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">API Key</label>
                                            <Input
                                                value={binanceApiKey}
                                                onChange={(e) => setBinanceApiKey(e.target.value)}
                                                placeholder="Sua Binance API Key"
                                                className="h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220]"
                                                disabled={savingKeys || profileLoading}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Secret Key</label>
                                            <Input
                                                type="password"
                                                value={binanceApiSecret}
                                                onChange={(e) => setBinanceApiSecret(e.target.value)}
                                                placeholder="Sua Binance Secret Key"
                                                className="h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220]"
                                                disabled={savingKeys || profileLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-100/50 dark:bg-[#0b1220]/50 flex justify-end gap-3">
                                    <Button
                                        onClick={handleSaveBinanceKeys}
                                        disabled={savingKeys || profileLoading || !binanceApiKey || !binanceApiSecret}
                                        className="h-9 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium shadow-none h-auto py-2"
                                    >
                                        {savingKeys ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Salvar Chaves
                                    </Button>
                                    <Button
                                        onClick={handleSyncBinance}
                                        disabled={syncingTrades || profileLoading}
                                        className="h-9 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-none h-auto py-2"
                                    >
                                        {syncingTrades ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                                        Sincronizar Trades
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing/Limits Tab */}
                    {activeTab === "billing" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Assinatura Atual</h2>
                                <Badge className={cn(
                                    "uppercase font-bold text-[10px] px-3 py-1 rounded-sm shadow-none",
                                    isFree
                                        ? "bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                )}>
                                    Plano {plan.name}
                                </Badge>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="flex items-center gap-5 w-full">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center shrink-0">
                                            <Crown className={cn("h-6 w-6", isFree ? "text-slate-400" : "text-emerald-500")} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">Status da Conta</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                                                {isFree ? "Você está usando a base tecnológica gratuita, possuindo limites estritos de registros no sistema." : "Seu portal está com acesso PRO liberado e todos os atributos destravados."}
                                            </p>
                                        </div>
                                    </div>
                                    {isFree && (
                                        <Button className="shrink-0 h-9 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-none w-full md:w-auto h-auto py-2" asChild>
                                            <Link href="/pricing" className="flex items-center justify-center gap-2">
                                                <Zap className="h-4 w-4" /> Assinar PRO
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="p-6 md:p-8 space-y-8">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Métricas de Utilização Mês</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Trades Limit */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Trades</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                                    12 <span className="text-slate-400 font-normal">/ {plan.limits.tradesPerMonth === 999999 ? '∞' : plan.limits.tradesPerMonth}</span>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-[#0b1220] rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[12%] rounded-full"></div>
                                            </div>
                                        </div>

                                        {/* Accounts Limit */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Contas Conectadas</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                                    1 <span className="text-slate-400 font-normal">/ {plan.limits.accounts}</span>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-[#0b1220] rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[100%] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
