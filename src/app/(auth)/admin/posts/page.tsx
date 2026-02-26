"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
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

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)

    useEffect(() => {
        const fetchPosts = async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user?.user) return

            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("author_id", user.user.id)
                .order("created_at", { ascending: false })

            if (data) {
                setPosts(data)
            }
            setLoading(false)
        }
        fetchPosts()
    }, [])

    const handleDelete = async () => {
        if (!postToDelete) return

        setLoading(true)

        try {
            const { deleteBlogPostAction } = await import("@/app/actions/blogAction")
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

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Seus Artigos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Gerencie e crie conteúdo para o portal.</p>
                </div>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white transition-colors">
                    <Link href="/admin/posts/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum artigo publicado ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{post.title}</h3>
                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                    <span>Status: <strong className={post.published ? 'text-emerald-500' : 'text-amber-500'}>{post.published ? 'Publicado' : 'Rascunho'}</strong></span>
                                    <span>Data: {new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/posts/${post.id}/edit`}>
                                        <Pencil className="h-4 w-4 mr-2" /> Editar
                                    </Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => setPostToDelete(post.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
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
