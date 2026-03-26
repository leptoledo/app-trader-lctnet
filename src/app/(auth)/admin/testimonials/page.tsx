"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Search, MessageSquareHeart } from "lucide-react"
import { toast } from "sonner"
import { moderateTestimonialAction, fetchAdminTestimonialsAction } from "@/app/actions/testimonialAdminAction"

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
    const [isAdmin, setIsAdmin] = useState(false)

    const fetchTestimonials = async () => {
        setLoading(true)
        const sessionData = await supabase.auth.getSession()
        const token = sessionData.data.session?.access_token || null

        if (!token) {
            setLoading(false)
            return
        }

        const { data: user } = await supabase.auth.getUser()
        if (!user?.user) return

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).single()
        const userIsAdmin = profile?.role === "admin"
        setIsAdmin(userIsAdmin)

        if (userIsAdmin) {
            const result = await fetchAdminTestimonialsAction(token)
            if (result.success) {
                setTestimonials(result.data)
            } else {
                toast.error(result.error)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTestimonials()
    }, [])

    const handleModerate = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id)

        try {
            const sessionData = await supabase.auth.getSession()
            const token = sessionData.data.session?.access_token || null

            const result = await moderateTestimonialAction(id, action, token)

            if (result.success) {
                toast.success(result.message)
                if (action === 'reject') {
                    setTestimonials(prev => prev.filter(t => t.id !== id))
                } else {
                    setTestimonials(prev => prev.map(t =>
                        t.id === id ? { ...t, approved: true } : t
                    ))
                }
            } else {
                toast.error(result.error)
            }
        } catch {
            toast.error("Erro ao processar.")
        }
        setActionLoading(null)
    }

    const filteredTestimonials = testimonials.filter(t => {
        if (filter === 'all') return true
        if (filter === 'approved') return t.approved === true
        if (filter === 'pending') return t.approved === false || t.approved === null
        return true
    })

    if (!loading && !isAdmin) {
        return (
            <div className="flex items-center justify-center p-12 h-[calc(100vh-100px)]">
                <p className="text-slate-500 font-medium">Acesso negado. Apenas administradores.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                
                {/* Header like Community */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-[#0b1220] rounded-md flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800">
                            <MessageSquareHeart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Aprovação de Depoimentos</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os feedbacks da comunidade.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row like Community Tabs */}
                <div className="inline-block animate-in fade-in slide-in-from-top-6 duration-700 delay-100 w-full md:w-auto">
                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-md h-11 gap-1 flex w-full">
                        <button 
                            onClick={() => setFilter('pending')}
                            className={`flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors ${filter === 'pending' ? 'bg-white text-slate-900 dark:bg-[#0b1220] dark:text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            <Clock className="h-4 w-4" /> <span className="hidden sm:inline">Pendentes</span>
                        </button>
                        <button 
                            onClick={() => setFilter('approved')}
                            className={`flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors ${filter === 'approved' ? 'bg-white text-slate-900 dark:bg-[#0b1220] dark:text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            <CheckCircle className="h-4 w-4" /> <span className="hidden sm:inline">Públicos</span>
                        </button>
                        <button 
                            onClick={() => setFilter('all')}
                            className={`flex-1 md:flex-none h-full rounded-sm px-4 flex items-center gap-2 font-medium text-xs transition-colors ${filter === 'all' ? 'bg-white text-slate-900 dark:bg-[#0b1220] dark:text-white shadow-sm' : 'text-slate-500'}`}
                        >
                            <Search className="h-4 w-4" /> <span className="hidden sm:inline">Todos</span>
                        </button>
                    </div>
                </div>

                {/* Shared Trades Feed / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center p-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : filteredTestimonials.length === 0 ? (
                        <div className="col-span-full py-20 rounded-md bg-white dark:bg-[#0b1220] border border-dashed border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-700 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-md flex items-center justify-center mb-6">
                                <CheckCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight mb-2">Inbox Zero!</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">Nenhum depoimento encontrado neste filtro.</p>
                        </div>
                    ) : (
                        filteredTestimonials.map((t, idx) => {
                            const isPending = !t.approved;
                            return (
                                <div key={t.id} className="group transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 p-6 bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 rounded-md flex flex-col shadow-sm hover:border-slate-300 dark:hover:border-slate-700" style={{ animationDelay: `${(idx % 6) * 80}ms` }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#1f2937] text-emerald-500 font-bold text-sm">
                                                {t.nickname.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] font-medium text-slate-900 dark:text-white leading-tight">
                                                    {t.nickname.startsWith('@') ? t.nickname : `@${t.nickname.replace(/\\s+/g, '_')}`}
                                                </h3>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {isPending ? (
                                            <span className="text-[10px] bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 font-semibold px-2 py-1 flex items-center gap-1 uppercase tracking-widest border border-amber-200 dark:border-amber-900/30 rounded">
                                                <Clock className="w-3 h-3" /> Revisar
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-500 font-semibold px-2 py-1 flex items-center gap-1 uppercase tracking-widest border border-emerald-200 dark:border-emerald-900/30 rounded">
                                                <CheckCircle className="w-3 h-3" /> Público
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-[#111827]/50 p-4 mb-6 rounded">
                                        <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-normal h-full">
                                            "{t.message}"
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        {isPending ? (
                                            <>
                                                <Button 
                                                    className="h-9 flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm font-medium transition-colors text-xs rounded-md disabled:opacity-50" 
                                                    onClick={() => handleModerate(t.id, 'approve')}
                                                    disabled={actionLoading === t.id}
                                                >
                                                    {actionLoading === t.id ? "..." : <><CheckCircle className="h-4 w-4 mr-1.5" /> Aprovar</>}
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className="h-9 flex-1 text-rose-600 border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm font-medium transition-colors text-xs rounded-md disabled:opacity-50" 
                                                    onClick={() => handleModerate(t.id, 'reject')}
                                                    disabled={actionLoading === t.id}
                                                >
                                                    {actionLoading === t.id ? "..." : <><XCircle className="h-4 w-4 mr-1.5" /> Recusar</>}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                className="h-9 w-full text-rose-600 border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm font-medium transition-colors text-xs rounded-md disabled:opacity-50" 
                                                onClick={() => handleModerate(t.id, 'reject')}
                                                disabled={actionLoading === t.id}
                                            >
                                                <XCircle className="h-4 w-4 mr-1.5" /> Excluir do Site
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
