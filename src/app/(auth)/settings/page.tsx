"use client"

import { useEffect, useState } from "react"
import { useSubscription } from "@/hooks/useSubscription"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Sparkles, ChevronRight, Zap, Monitor, Settings as SettingsIcon, CreditCard, Shield, User, Crown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { ModeToggle } from "@/components/mode-toggle"

export default function SettingsPage() {
    const { plan, loading, isFree } = useSubscription()
    const [publicName, setPublicName] = useState("")
    const [profileLoading, setProfileLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileSettings, setProfileSettings] = useState<Record<string, unknown>>({})
    const [outlierThreshold, setOutlierThreshold] = useState("25")
    const [savingPreferences, setSavingPreferences] = useState(false)

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

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020617] p-8 transition-colors duration-500">
            <div className="max-w-6xl mx-auto w-full space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                            <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Preferências</p>
                            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                        </div>
                    </div>
                    <PwaInstallButton />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-75">
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl space-y-1">
                            <Button variant="ghost" className="w-full justify-between h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                <span className="flex items-center"><User className="h-4 w-4 mr-3" /> Perfil Geral</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                <Monitor className="h-4 w-4 mr-3 text-slate-400" /> Aparência
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                <CreditCard className="h-4 w-4 mr-3 text-slate-400" /> Faturamento
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                                <Shield className="h-4 w-4 mr-3 text-slate-400" /> Segurança
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">

                        {/* Public Profile Card */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                                <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                    Perfil Público
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    Nome exibido em trades compartilhados.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Nome Público</label>
                                    <Input
                                        value={publicName}
                                        onChange={(e) => setPublicName(e.target.value)}
                                        placeholder="Ex: TraderLCTNET"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-bold text-sm"
                                        disabled={profileLoading}
                                    />
                                    <p className="text-xs text-slate-400 font-medium">Máx. 32 caracteres.</p>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile || profileLoading}
                                        className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-blue-500/20"
                                    >
                                        {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Salvar Perfil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appearance / Theme */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                                <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                    Aparência
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    Ajuste o tema visual da plataforma.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Tema da Interface</label>
                                    <div className="flex items-center gap-4 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 px-4 font-bold text-sm w-fit transition-all hover:bg-slate-100 dark:hover:bg-slate-900">
                                        <ModeToggle />
                                        <span className="text-slate-700 dark:text-slate-300 mr-2">Alternar Tema</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">Você escolhe como prefere acompanhar seus resultados.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trade Preferences Card */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                                <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                    Preferências de Trades
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    Ajuste limites de alerta para fechamento.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Alerta de Outlier (%)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={outlierThreshold}
                                        onChange={(e) => setOutlierThreshold(e.target.value)}
                                        placeholder="Ex: 25"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-bold text-sm"
                                        disabled={profileLoading}
                                    />
                                    <p className="text-xs text-slate-400 font-medium">Defina 0% para desativar o alerta.</p>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSavePreferences}
                                        disabled={savingPreferences || profileLoading}
                                        className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-blue-500/20"
                                    >
                                        {savingPreferences ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Salvar Preferências
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Status Card */}
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">

                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/[0.03] rounded-lg blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000" />

                            <CardHeader className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                                            Status da Conta
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Controle de limites e plano contratado.</CardDescription>
                                    </div>
                                    <Badge className={cn(
                                        "uppercase font-black text-[10px] px-4 py-2 rounded-xl tracking-widest border shadow-sm",
                                        isFree
                                            ? "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
                                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                                    )}>
                                        Nível: {plan.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10 relative z-10">

                                <div className="bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group-hover:border-blue-500/20">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                            <Crown className="h-8 w-8 fill-white/10" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">Plano {plan.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                                                {isFree ? "Você está usando a versão base com limites reduzidos." : "Acesso total habilitado para este período."}
                                            </p>
                                        </div>
                                    </div>
                                    {isFree && (
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-lg h-14 px-8 font-black uppercase tracking-tighter text-xs shadow-xl shadow-blue-500/20 w-fit" asChild>
                                            <Link href="/pricing" className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" /> Evoluir Plano
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 ml-1">
                                        <Sparkles className="h-4 w-4 text-slate-400" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Métricas de Utilização</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-lg border border-slate-100 dark:border-slate-800/40">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trades / Mês</p>
                                                    <p className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                                                        12 <span className="text-sm text-slate-500 font-medium">de {plan.limits.tradesPerMonth === 999999 ? '∞' : plan.limits.tradesPerMonth}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                <div className="bg-blue-600 h-full w-[12%] rounded-lg shadow-sm"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-lg border border-slate-100 dark:border-slate-800/40">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contas Conectadas</p>
                                                    <p className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                                                        1 <span className="text-sm text-slate-500 font-medium">de {plan.limits.accounts}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[100%] rounded-lg shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </div>
    )
}
