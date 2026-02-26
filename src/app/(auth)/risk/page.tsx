"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useAccounts } from "@/hooks/useAccounts"
import { Trade } from "@/types"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { formatLocalDateKey } from "@/lib/calendar"
import { cn } from "@/lib/utils"

const RISK_TABS = [
    { id: "calculator", label: "Calculadora" },
    { id: "simulator", label: "Simulador" },
    { id: "exposure", label: "Exposição" },
    { id: "ruin", label: "Ruína" },
]

export default function RiskManagementPage() {
    const { accounts, loading: accLoading } = useAccounts()
    const [selectedAccountId, setSelectedAccountId] = useState<string>("")
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("calculator")

    // Calculadora States
    const [calcRiskPercent, setCalcRiskPercent] = useState<number>(1.0)
    const [calcStopPips, setCalcStopPips] = useState<number>(20)
    const [calcAsset, setCalcAsset] = useState<string>("EURUSD")

    // Simulador States
    const [simWinRate, setSimWinRate] = useState<number>(40)
    const [simRMultiple, setSimRMultiple] = useState<number>(2.0)

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id)
        }
    }, [accounts])

    useEffect(() => {
        async function fetchTrades() {
            setLoading(true)
            try {
                const { data } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('account_id', selectedAccountId)
                if (data) setTrades(data as Trade[])
            } finally {
                setLoading(false)
            }
        }
        if (selectedAccountId) {
            fetchTrades()
        }
    }, [selectedAccountId])

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)

    // Daily Exposure
    const todayStats = useMemo(() => {
        const today = formatLocalDateKey(new Date())
        let closedPnL = 0
        let runningRisk = 0

        trades.forEach(t => {
            const entryStr = t.entry_date ? formatLocalDateKey(new Date(t.entry_date)) : ""
            const exitStr = t.exit_date ? formatLocalDateKey(new Date(t.exit_date)) : ""

            if (t.status === 'CLOSED' && exitStr === today) {
                closedPnL += (t.pnl_net || 0)
            }
            if (t.status === 'OPEN' && t.stop_loss && t.entry_price > 0) {
                const riskPerUnit = Math.abs(t.entry_price - t.stop_loss)
                runningRisk += (riskPerUnit * t.quantity)
            }
        })
        return { closedPnL, runningRisk, totalExposure: closedPnL - runningRisk }
    }, [trades])

    const dailyLimit = selectedAccount ? selectedAccount.initial_balance * 0.03 : 0 // Exemplo: Limite diário 3%
    const exposurePercent = selectedAccount ? Math.abs(todayStats.totalExposure) / selectedAccount.initial_balance * 100 : 0
    const isOverExposed = todayStats.totalExposure <= -dailyLimit

    // Calculated fields
    const calcLotSize = useMemo(() => {
        if (!selectedAccount || calcStopPips <= 0) return 0
        const riskMoney = selectedAccount.initial_balance * (calcRiskPercent / 100)

        // Pseudo logic for lot calculation
        let pipValue1Lot = 10
        if (calcAsset.includes('JPY')) pipValue1Lot = 8
        if (calcAsset === 'XAUUSD' || calcAsset === 'GOLD') pipValue1Lot = 1

        const valPerPip = riskMoney / calcStopPips
        return valPerPip / pipValue1Lot
    }, [selectedAccount, calcRiskPercent, calcStopPips, calcAsset])

    // Simulator
    const simResult = useMemo(() => {
        const risk = 100 // Arrisca $100
        const reward = risk * simRMultiple
        const winPct = simWinRate / 100
        const lossPct = 1 - winPct

        // Expected Value
        const ev = (winPct * reward) - (lossPct * risk)
        return ev
    }, [simWinRate, simRMultiple])

    // Risk of ruin
    const riskOfRuin = useMemo(() => {
        const winProb = simWinRate / 100
        const lossProb = 1 - winProb
        if (winProb === 0) return 100
        if (winProb >= 0.5 && simRMultiple >= 1) return "< 1"
        if (simResult > 0) {
            return ((lossProb / winProb) ** 10 * 100).toFixed(1)
        }
        return "> 99"
    }, [simWinRate, simRMultiple, simResult])

    if (accLoading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b1220]"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>
    if (accounts.length === 0) return <div className="p-8">Por favor conecte uma conta primeiro.</div>

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#0b1220] p-6 lg:p-12 transition-colors duration-500">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">
                        Gestão de Risco
                    </h1>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111827] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-[200px] border-none bg-transparent shadow-none focus:ring-0 text-sm font-medium">
                                <SelectValue placeholder="Selecione a conta" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name} (${acc.initial_balance.toLocaleString()})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Horizontal Navigation */}
                <div className="flex space-x-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
                    {RISK_TABS.map((tab) => (
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

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* LOGIC FOR TAB: CALCULATOR */}
                    {activeTab === "calculator" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Calculadora de Lotes Dinâmica</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0 transition-opacity">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Saldo & Risco</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Calcule o volume exato da sua posição em função do seu risco percentual e do ativo operado.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Saldo da Conta</label>
                                            <div className="h-10 rounded-md bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-700 flex items-center px-4 font-mono font-medium text-slate-500 content-center text-sm w-full">
                                                ${selectedAccount?.initial_balance.toLocaleString() || "0"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Ativo Base</label>
                                            <Select value={calcAsset} onValueChange={setCalcAsset}>
                                                <SelectTrigger className="h-10 rounded-md font-mono text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EURUSD">EUR/USD (Padrão)</SelectItem>
                                                    <SelectItem value="USDJPY">USD/JPY (Jpy)</SelectItem>
                                                    <SelectItem value="XAUUSD">XAU/USD (Ouro)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1 mt-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tamanho e Stop</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Quantos Pips há da sua entrada até a proteção? Qual o seu risco por trade?
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center bg-white dark:bg-[#0b1220] p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Risco (%)</label>
                                            <Input
                                                type="number"
                                                value={calcRiskPercent}
                                                onChange={(e) => setCalcRiskPercent(Number(e.target.value))}
                                                className="h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1220] transition-colors focus-visible:ring-emerald-500 font-mono text-sm"
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="flex justify-between items-center mb-6">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Stop</label>
                                                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-500 text-sm">{calcStopPips} Pips</span>
                                            </div>
                                            <Slider
                                                value={[calcStopPips]}
                                                onValueChange={(val) => setCalcStopPips(val[0])}
                                                max={200}
                                                step={1}
                                                className="py-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-100/50 dark:bg-[#0b1220]/50 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500">O volume aqui gerado usa bases hipotéticas sobre as moedas. <br className="hidden md:block" />Pode haver variação na corretora real.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 leading-none">Volume de Execução</p>
                                        <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                                            {calcLotSize.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOGIC FOR TAB: SIMULATOR */}
                    {activeTab === "simulator" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Simulador de Renda Assimétrica</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0 transition-opacity">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Configuração de Vantagem</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Encontre seu ponto de equilíbrio matemático e descubra qual seu ganho teórico para cada $100 em risco na mesa.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Taxa de Acerto Automática</label>
                                                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-500 text-sm">{simWinRate}%</span>
                                            </div>
                                            <Slider
                                                value={[simWinRate]}
                                                onValueChange={(val) => setSimWinRate(val[0])}
                                                max={100}
                                                step={1}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    Alvo (Risco : Retorno)
                                                </label>
                                                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-500 text-sm">1:{simRMultiple.toFixed(1)}</span>
                                            </div>
                                            <Slider
                                                value={[simRMultiple]}
                                                onValueChange={(val) => setSimRMultiple(val[0])}
                                                max={10}
                                                step={0.1}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-100/50 dark:bg-[#0b1220]/50 flex justify-between items-center">
                                    <p className="text-xs text-slate-500">
                                        A curva de longo prazo depende inteiramente do EV estar sempre acima de 0.
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <div className={cn(
                                            "text-4xl font-semibold tracking-tight font-mono leading-none",
                                            simResult > 0 ? "text-emerald-500" : simResult < 0 ? "text-red-500" : "text-slate-500"
                                        )}>
                                            {simResult > 0 ? '+' : ''}${simResult.toFixed(2)}
                                        </div>
                                        {simResult < 0 ? (
                                            <p className="text-[10px] text-red-500 font-bold uppercase mt-2">Cenário Teórico Prejudicial</p>
                                        ) : (
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2">Cenário Positivo (E.V)</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* LOGIC FOR TAB: EXPOSURE */}
                    {activeTab === "exposure" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Exposição Diária</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0 transition-opacity">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between border-b border-slate-200 dark:border-slate-800 gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Limites</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Base real puxada diretamente de suas operações do dia ({formatLocalDateKey(new Date())}).
                                        </p>
                                    </div>
                                    <div className="md:w-2/3 space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Perda Potencial / Realizada hoje</p>
                                                <div className={cn(
                                                    "text-3xl font-semibold tracking-tight font-mono",
                                                    isOverExposed ? "text-red-500" : "text-slate-900 dark:text-slate-100"
                                                )}>
                                                    ${Math.abs(todayStats.totalExposure).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Limite Máximo (-3%)</p>
                                                <div className="text-xl font-medium text-slate-500 font-mono tracking-tight">
                                                    ${dailyLimit.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative h-2 bg-white dark:bg-[#0b1220] rounded-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <div
                                                className={cn(
                                                    "h-full rounded-sm transition-all duration-1000",
                                                    exposurePercent > 90 ? "bg-red-500" : exposurePercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                                                )}
                                                style={{ width: `${Math.min(exposurePercent, 100)}%` }}
                                            ></div>
                                        </div>

                                        {isOverExposed && (
                                            <div className="bg-red-50 dark:bg-[#2a131b] border border-red-200 dark:border-red-900/50 rounded-md p-4 flex gap-3">
                                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Aviso de Limite Diário</h4>
                                                    <p className="text-xs text-red-600 dark:text-red-400/80 mt-1 leading-relaxed">Você já alcançou ou rompeu a barreira matemática configurada para o seu limite de perda viável em um único dia. Feche a plataforma.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* LOGIC FOR TAB: RUIN */}
                    {activeTab === "ruin" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Análise de Ruína</h2>

                            <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0 transition-opacity">
                                <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="md:w-1/3 space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Chance de Zerar a Conta</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            A matemática nos mostra friamente qual a probabilidade do seu atual sistema zerar os seus fundos em um futuro próximo. Use o simulador para ajustar o EV primeiro.
                                        </p>
                                    </div>
                                    <div className="md:w-2/3">

                                        <div className="mt-2 text-6xl font-semibold tracking-tight mb-4 text-slate-900 dark:text-slate-100 font-mono">
                                            {riskOfRuin}%
                                        </div>

                                        {Number(riskOfRuin) > 50 || riskOfRuin.toString().includes(">") ? (
                                            <div className="mt-4 text-xs font-medium px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-sm border border-red-100 dark:border-red-500/20 inline-block">
                                                Probabilidade letal (Extrema)
                                            </div>
                                        ) : (
                                            <div className="mt-4 text-xs font-medium px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm border border-emerald-100 dark:border-emerald-500/20 inline-block">
                                                Nível Controlável e Sustentável
                                            </div>
                                        )}
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
