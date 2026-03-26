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
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquareHeart className="h-8 w-8 text-emerald-500" /> Aprovação de Depoimentos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Gerencie os feedbacks da comunidade antes que eles apareçam na Landpage.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${filter === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm font-semibold text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>
                        Pendentes
                    </button>
                    <button onClick={() => setFilter('approved')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${filter === 'approved' ? 'bg-white dark:bg-slate-700 shadow-sm font-semibold text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>
                        Públicos
                    </button>
                    <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'}`}>
                        Todos
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : filteredTestimonials.length === 0 ? (
                <div className="text-center p-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-[#111827]/50 backdrop-blur-sm">
                    <CheckCircle className="h-12 w-12 text-emerald-500/50 mx-auto mb-4" />
                    <p className="text-slate-900 dark:text-white font-medium text-lg">Inbox Zero!</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Nenhum depoimento encontrado neste filtro.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTestimonials.map(t => {
                        const isPending = !t.approved;
                        return (
                            <div key={t.id} className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0">
                                            {t.nickname.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                                                {t.nickname.startsWith('@') ? t.nickname : `@${t.nickname.replace(/\\s+/g, '_')}`}
                                            </h3>
                                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {isPending ? (
                                        <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Revisar
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Público
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-[#060b13] p-4 rounded-xl mb-6 relative overflow-hidden">
                                    <p className="text-slate-600 dark:text-slate-300 text-sm italic font-medium relative z-10 leading-relaxed">
                                        "{t.message}"
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    {isPending ? (
                                        <>
                                            <Button 
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-none font-semibold transition-colors disabled:opacity-50" 
                                                onClick={() => handleModerate(t.id, 'approve')}
                                                disabled={actionLoading === t.id}
                                            >
                                                {actionLoading === t.id ? "..." : <><CheckCircle className="h-4 w-4 mr-2" /> Aprovar</>}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none font-semibold transition-colors disabled:opacity-50" 
                                                onClick={() => handleModerate(t.id, 'reject')}
                                                disabled={actionLoading === t.id}
                                            >
                                                {actionLoading === t.id ? "..." : <><XCircle className="h-4 w-4 mr-2" /> Recusar (Excluir)</>}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            className="w-full text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none font-semibold transition-colors disabled:opacity-50" 
                                            onClick={() => handleModerate(t.id, 'reject')}
                                            disabled={actionLoading === t.id}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" /> Excluir do Site
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
