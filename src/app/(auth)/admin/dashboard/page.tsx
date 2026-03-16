"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Users, TrendingUp, BookOpen, Clock, ArrowUpRight, Crown, Zap, CircleCheck } from "lucide-react"
import { fetchAdminDashboardStatsAction } from "@/app/actions/adminAction"
import { toast } from "sonner"
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        counts: { users: 0, trades: 0, posts: 0, pending: 0 },
        plans: { free: 0, pro: 0, gold: 0, activeTotal: 0 },
        growth: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            const sessionData = await supabase.auth.getSession()
            const accessToken = sessionData.data.session?.access_token || null

            const result = await fetchAdminDashboardStatsAction(accessToken)
            if (result.success && result.data) {
                setStats(result.data)
            } else {
                toast.error(result.error || "Erro ao carregar os dados do dashboard")
            }
            setLoading(false)
        }

        fetchStats()
    }, [])

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6']; // emerald, blue, purple
    const planData = [
        { name: 'Ouro', value: stats.plans.gold },
        { name: 'PRO', value: stats.plans.pro },
        { name: 'Gratuito', value: stats.plans.free },
    ].filter(p => p.value > 0);

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panorâmico (Mista)</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Visão geral da plataforma, com métricas de usuários e volume de operações.</p>
            </div>

            {loading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Usuários Card */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Users className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Usuários</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.counts.users}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trades Card */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-24 h-24 text-blue-500" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Operações Logadas</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.counts.trades}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blog Posts Card */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-24 h-24 text-purple-500" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
                                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Artigos Publicados</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.counts.posts}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Moderation Card */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Clock className="w-24 h-24 text-amber-500" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Moderação Pendente</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{stats.counts.pending}</h2>
                                        {stats.counts.pending > 0 && (
                                            <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full animate-pulse ml-2">
                                                Atenção Requisitada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Users Growth Chart */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Crescimento de Usuários (Últ. 6 meses)</h3>
                            <div className="flex-1 w-full min-h-[300px]">
                                {stats.growth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} name="Novos Cadastros" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">Sem dados suficientes</div>
                                )}
                            </div>
                        </div>
                        
                        {/* Plan Distribution */}
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Proporção de Planos (Stripe)</h3>
                            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                                {planData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={planData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {planData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">Sem dados de assinaturas</div>
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <div className="text-center">
                                    <p className="text-xs text-emerald-500 mb-1 flex items-center justify-center gap-1"><Crown className="w-3 h-3"/> Ouro</p>
                                    <p className="font-bold text-xl dark:text-white">{stats.plans.gold}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-blue-500 mb-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> PRO</p>
                                    <p className="font-bold text-xl dark:text-white">{stats.plans.pro}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-purple-500 mb-1 flex items-center justify-center gap-1"><CircleCheck className="w-3 h-3"/> Gratuito</p>
                                    <p className="font-bold text-xl dark:text-white">{stats.plans.free}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
