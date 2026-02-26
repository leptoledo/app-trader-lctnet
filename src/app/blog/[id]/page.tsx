"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Clock, Calendar, Share2, TrendingUp, Facebook, Instagram, Twitter, Github, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ModeToggle } from "@/components/mode-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { motion } from "framer-motion"

// Mock data as fallback
const recentPosts = [
    {
        id: "1",
        title: "A Psicologia do Loss: Como evitar a armadilha do Overtrading",
        excerpt: "Descubra como os vieses cognitivos afetam suas decisões e aprenda a usar o Trader Journal para impor limites rígidos de perda máxima diária.",
        content: "## O Custo Invisível das Emoções\n\nNo mercado financeiro, a matemática raramente falha, mas a psicologia humana sim. O 'overtrading' é de longe o destruidor de contas número um. Neste artigo vamos dissecar...\n\n(Artigo de Demonstração)",
        category: "Psicologia",
        date: "24 Fev 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Automatizando Importações do MetaTrader 5 via API",
        excerpt: "Tutorial completo de como conectar seus robôs de investimento diretamente ao banco de dados do seu journal sem usar planilhas.",
        content: "## Adeus Planilhas!\n\nNenhuma rotina de alta performance sobrevive a tarefas manuais repetitivas. Explicaremos como plugar a API do MetaTrader 5 na nossa engine.\n\n(Artigo de Demonstração)",
        category: "Desenvolvimento",
        date: "20 Fev 2026",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Por que Expectância Matemática supera o Win Rate",
        excerpt: "Análise quantitativa de por que acertar 70% das vezes não significa lucrar, e como calcular o Payoff ideal da sua estratégia.",
        content: "## Acertar não é Ganhar\n\nA taxa de acerto é a métrica mais superestimada por traders novatos. Vamos entender a Expectância Matemática.\n\n(Artigo de Demonstração)",
        category: "Análise Quantitativa",
        date: "15 Fev 2026",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1515&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Novos Templates: Configurando Diário de Swing Trade",
        excerpt: "Conheça o novo modelo oficial para traders de longo prazo focado em análise macroeconômica e múltiplos dias de exposição.",
        content: "## Desenhado para o Longo Prazo\n\nOperar com alvos de semanas ou meses requer um diário muito diferente do Day Trade. Conheça as tags fundamentais...\n\n(Artigo de Demonstração)",
        category: "Produto",
        date: "10 Fev 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1470&auto=format&fit=crop"
    }
]

export default function BlogPostReader() {
    const params = useParams()
    const router = useRouter()
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPost = async () => {
            if (!params.id) return

            const idStr = String(params.id)

            // Try to find in mock data first (if it's 1, 2, 3, or 4)
            const mockPost = recentPosts.find(p => p.id === idStr)
            if (mockPost) {
                setPost({
                    ...mockPost,
                    created_at: mockPost.date,
                    image_url: mockPost.image
                })
                setLoading(false)
                return
            }

            // Otherwise, fetch from Supabase
            try {
                // Determine if it's an ID (UUID) or a slug
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

                let query = supabase.from("blog_posts").select("*")

                if (isUUID) {
                    query = query.eq("id", idStr)
                } else {
                    query = query.eq("slug", idStr)
                }

                const { data, error } = await query.single()

                if (data) {
                    setPost(data)
                } else {
                    router.push("/blog") // redirect if not found
                }
            } catch (error) {
                console.error("Error fetching post:", error)
                router.push("/blog")
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [params, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0b1220] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!post) return null

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden transition-colors duration-500">
            <ScrollToTop />

            {/* --- HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-emerald-500 p-1.5 rounded-md">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                                Trader Journal
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/blog" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Voltar para o Blog</Link>
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <ModeToggle />
                            <div className="block">
                                <PwaInstallButton />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative pt-32 pb-24">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

                <div className="max-w-3xl mx-auto px-4 relative z-10">
                    <Button variant="ghost" asChild className="mb-8 text-slate-500 hover:text-emerald-500 -ml-4">
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Artigos
                        </Link>
                    </Button>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">
                                {post.category || "Geral"}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800/80 py-4"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {typeof post.created_at === 'string' && post.created_at.includes('Fev')
                                    ? post.created_at
                                    : new Date(post.created_at).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {post.read_time || post.readTime || "5 min read"}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full h-[300px] md:h-[450px] relative rounded-2xl md:rounded-[2rem] overflow-hidden my-12"
                        >
                            <img
                                src={post.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop'}
                                alt="Capa"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        <motion.article
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="prose prose-slate dark:prose-invert prose-emerald prose-lg max-w-none mt-12 bg-white dark:bg-[#111827] p-8 md:p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                            {/* Simple markdown to HTML fallback for now since it's a raw string */}
                            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n\n/g, '<br/><br/>').replace(/## (.*)/g, '<h2>$1</h2>') }} />
                        </motion.article>

                    </div>
                </div>
            </main>
        </div>
    )
}
