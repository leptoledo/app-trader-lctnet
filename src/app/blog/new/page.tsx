"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBlogPostAction } from "@/app/actions/blogAction"
import { toast } from "sonner"
import { 
    ArrowLeft, 
    Send, 
    PenLine, 
    Lightbulb, 
    Clock, 
    Tag, 
    ImageIcon, 
    FileText, 
    CheckCircle2,
    AlertCircle
} from "lucide-react"

const CATEGORIES = [
    "Psicologia", "Análise Técnica", "Análise Quantitativa", 
    "Gestão de Risco", "Ferramentas", "Desenvolvimento", 
    "Mercado", "Estratégia", "Produto", "Geral"
]

export default function NewBlogPostPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [charCount, setCharCount] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState("")

    useEffect(() => {
        const checkAuth = async () => {
            const { supabase } = await import("@/lib/supabase")
            const { data } = await supabase.auth.getUser()
            if (!data?.user) {
                router.push("/login?redirect=/blog/new")
            } else {
                setIsLoggedIn(true)
            }
        }
        checkAuth()
    }, [router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)

            // Always mark as "send for review" (pending) for regular users
            formData.set("published", "true")

            const { supabase } = await import("@/lib/supabase")
            const sessionData = await supabase.auth.getSession()
            if (sessionData.data.session?.access_token) {
                formData.append("access_token", sessionData.data.session.access_token)
            }

            const result = await createBlogPostAction(formData)

            if (result.success) {
                setSubmitted(true)
            } else {
                toast.error(result.error || "Erro ao enviar o artigo.")
                setIsSubmitting(false)
            }
        } catch {
            toast.error("Erro inesperado. Tente novamente.")
            setIsSubmitting(false)
        }
    }

    // ---- SUCCESS STATE ----
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#0b1220] flex items-center justify-center px-4">
                <div className="max-w-lg w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto border-2 border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Artigo Enviado! 🎉</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                            O seu artigo foi submetido com sucesso para a <strong className="text-slate-700 dark:text-slate-200">fila de moderação</strong>. 
                            Nossa equipe vai revisar o conteúdo e publicá-lo em breve.
                        </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-left">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                                Você receberá uma notificação quando a equipe admin aprovar ou revisar seu artigo.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                        >
                            Ver Blog
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
                        >
                            Ir ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoggedIn === null) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#0b1220] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        )
    }

    // ---- EDITOR ----
    return (
        <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#0b1220] pb-20 transition-colors duration-500">
            
            {/* Header Bar */}
            <div className="bg-white dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between gap-4">
                <Link 
                    href="/blog"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Blog
                </Link>
                <div className="flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-emerald-500" />
                    <span className="text-base font-bold text-slate-900 dark:text-white hidden sm:block">Escrever Artigo</span>
                </div>
                <div className="w-24 hidden sm:block" /> {/* spacer */}
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                
                {/* Info Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex gap-4 items-start">
                    <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">Como funciona?</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-500 leading-relaxed">
                            Depois de enviar, seu artigo entra na <strong>fila de revisão</strong> dos administradores. 
                            Quando aprovado, ele vai ao ar no Blog da plataforma com seu nome como autor. 
                            Escreva com qualidade — conteúdo relevante para a comunidade de traders!
                        </p>
                    </div>
                </div>

                {/* The Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Main Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        
                        {/* Title Section */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Título do Artigo *
                            </label>
                            <input
                                name="title"
                                placeholder="Ex: Como Controlar o Risco Emocional no Day Trade"
                                required
                                maxLength={120}
                                className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none resize-none leading-snug"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                <FileText className="inline h-3 w-3 mr-1" />
                                Resumo / Introdução
                            </label>
                            <textarea
                                name="excerpt"
                                placeholder="Um parágrafo curto que apresenta o tema. Aparecerá nos cards de listagem do blog."
                                rows={3}
                                maxLength={300}
                                className="w-full bg-transparent text-base text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none resize-none leading-relaxed"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Conteúdo do Artigo *
                            </label>
                            <textarea
                                name="content"
                                placeholder={`Escreva o conteúdo completo do seu artigo aqui...

Você pode estruturar seu texto com:
- Seções e sub-tópicos
- Exemplos práticos de trades
- Análises e conclusões

Seja direto e objetivo. A comunidade de traders valoriza conteúdo prático e aplicável.`}
                                required
                                rows={16}
                                onChange={(e) => setCharCount(e.target.value.length)}
                                className="w-full bg-transparent text-base text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none resize-none leading-relaxed font-[var(--font-mono,monospace)] sm:font-sans"
                            />
                            <div className="mt-3 flex justify-end">
                                <span className={`text-xs font-medium tabular-nums ${charCount < 200 ? 'text-amber-400' : 'text-emerald-500'}`}>
                                    {charCount} caracteres {charCount < 200 && "(mínimo recomendado: 200)"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Detalhes do Artigo</h3>

                        {/* Category */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                <Tag className="h-3 w-3" /> Categoria
                            </label>
                            <input type="hidden" name="category" value={selectedCategory} />
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                            selectedCategory === cat
                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Read Time + Image URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                    <Clock className="h-3 w-3" /> Tempo de Leitura (Estimado)
                                </label>
                                <input
                                    name="readTime"
                                    placeholder="Ex: 5 min read"
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                    <ImageIcon className="h-3 w-3" /> URL da Imagem de Capa
                                </label>
                                <input
                                    name="image_url"
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                                <p className="text-xs text-slate-400 mt-1.5">Opcional. Deixe em branco para usar imagem padrão.</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Footer */}
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pronto para compartilhar?</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Ao enviar, seu artigo será revisado pela nossa equipe antes de ser publicado.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] w-full sm:w-auto justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando para Revisão...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar para Revisão
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
