"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { deleteBlogPostAction, moderateBlogPostAction } from "@/app/actions/blogAction"

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('all')

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setLoading(true)
        const { data: user } = await supabase.auth.getUser()
        if (!user?.user) return

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).single()
        const userIsAdmin = profile?.role === "admin"
        setIsAdmin(userIsAdmin)

        let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
        
        if (!userIsAdmin) {
            query = query.eq("author_id", user.user.id)
        }

        const { data, error } = await query

        if (data) {
            setPosts(data)
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!postToDelete) return

        setLoading(true)

        try {
            const sessionData = await supabase.auth.getSession()
            const token = sessionData.data.session?.access_token || null

            const result = await deleteBlogPostAction(postToDelete, token)

            if (result.success) {
                toast.success(result.message)
                setPosts(posts.filter(p => p.id !== postToDelete))
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("Erro inesperado ao tentar excluir o artigo.")
        }

        setPostToDelete(null)
        setLoading(false)
    }

    const handleModerate = async (id: string, action: 'approve' | 'reject') => {
        setLoading(true)
        try {
            const sessionData = await supabase.auth.getSession()
            const token = sessionData.data.session?.access_token || null

            const result = await moderateBlogPostAction(id, action, token)

            if (result.success) {
                toast.success(result.message)
                fetchPosts() // recarregar para pegar novos status
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("Erro ao moderar post.")
        }
        setLoading(false)
    }

    const filteredPosts = posts.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isAdmin ? "Moderação & Artigos" : "Seus Artigos"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isAdmin ? "Gerencie todo o conteúdo do blog." : "Gerencie seus artigos enviados."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium' : 'text-slate-500'}`}>Todos</button>
                            <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-amber-600' : 'text-slate-500'}`}>Pendentes</button>
                        </div>
                    )}
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white transition-colors">
                        <Link href="/admin/posts/new">
                            <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                        </Link>
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum artigo encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPosts.map(post => {
                        const isPending = post.status === 'pending';
                        const isDraft = post.status === 'draft' || (!post.status && !post.published);
                        const isPublished = post.status === 'published' || (!post.status && post.published);
                        const isRejected = post.status === 'rejected';

                        return (
                            <div key={post.id} className={`p-6 bg-white dark:bg-[#111827] border ${isPending ? 'border-amber-200 dark:border-amber-900/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all hover:shadow-md`}>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{post.title}</h3>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                                        {isPublished && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Publicado</span>}
                                        {isPending && <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full"><Clock className="h-3 w-3" /> Aguardando Revisão</span>}
                                        {isDraft && <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"><Pencil className="h-3 w-3" /> Rascunho</span>}
                                        {isRejected && <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Rejeitado</span>}
                                        
                                        <span className="text-slate-400">|</span>
                                        <span className="text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {isAdmin && isPending && (
                                        <>
                                            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => handleModerate(post.id, 'approve')}>
                                                <CheckCircle className="h-4 w-4 mr-1.5" /> Aprovar
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => handleModerate(post.id, 'reject')}>
                                                <XCircle className="h-4 w-4 mr-1.5" /> Rejeitar
                                            </Button>
                                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/posts/${post.id}/edit`}>
                                            <Pencil className="h-4 w-4 mr-1.5" /> {isAdmin ? "Editar" : "Revisar"}
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setPostToDelete(post.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Dialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
                            <AlertTriangle className="h-5 w-5" /> Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-600 dark:text-slate-400">
                            Esta ação é irreversível. O artigo selecionado será permanentemente excluído do banco de dados e não estará mais disponível para o público.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setPostToDelete(null)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
                            {loading ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Excluindo...</span>
                            ) : (
                                "Sim, excluir artigo"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
