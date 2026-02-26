"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBlogPostAction } from "@/app/actions/blogAction"
import { toast } from "sonner"
import { ArrowLeft, Send, Save, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

export default function NewPostPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)

            // Inyect accessToken into formData for server action
            const { supabase } = await import("@/lib/supabase")
            const sessionData = await supabase.auth.getSession()
            if (sessionData.data.session?.access_token) {
                formData.append('access_token', sessionData.data.session.access_token)
            }

            const result = await createBlogPostAction(formData)

            if (result.success) {
                toast.success(result.message)
                router.push("/admin/posts")
            } else {
                toast.error(result.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            toast.error("Erro inesperado ao criar o post.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="text-slate-500 hover:text-emerald-500" asChild>
                    <Link href="/admin/posts">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Novo Artigo</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#111827] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título</label>
                        <input
                            name="title"
                            placeholder="Ex: Como gerenciar o Risco Diário"
                            required
                            className="w-full mt-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                            <input
                                name="category"
                                placeholder="Psicologia"
                                className="w-full mt-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tempo de Leitura</label>
                            <input
                                name="readTime"
                                placeholder="Ex: 5 min read"
                                className="w-full mt-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resumo (Excerpt)</label>
                        <textarea
                            name="excerpt"
                            placeholder="Um breve resumo do artigo que aparecerá nos cards da página principal do blog..."
                            rows={2}
                            className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] p-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Conteúdo Markdown / Texto</label>
                        <textarea
                            name="content"
                            placeholder="Escreva seu artigo brilhante aqui..."
                            required
                            rows={12}
                            className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] p-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" /> Imagem de Capa (URL)
                        </label>
                        <input
                            name="image_url"
                            placeholder="https://images.unsplash.com/..."
                            className="w-full mt-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <input
                            type="checkbox"
                            name="published"
                            value="true"
                            className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Publicar Imediatamente</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">Deixe desmarcado para salvar como rascunho</p>
                        </div>
                    </div>

                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()} className="h-12 px-6 rounded-xl font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-none group">
                        {isSubmitting ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</span>
                        ) : (
                            <span className="flex items-center gap-2">Criar e Salvar <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
