"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Clock, Calendar, TrendingUp, Twitter, Linkedin } from "lucide-react"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ModeToggle } from "@/components/mode-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Mock data as fallback
const recentPosts = [
    {
        id: "1",
        title: "A Psicologia do Loss: Como evitar a armadilha do Overtrading",
        excerpt: "Descubra como os vieses cognitivos afetam suas decisões e aprenda a usar o Trader Journal para impor limites rígidos de perda máxima diária.",
        content: `## O Custo Invisível das Emoções\n\nNo mercado financeiro, a matemática raramente falha, mas a psicologia humana sim.\n\nO **overtrading** é de longe o destruidor de contas número um entre traders de varejo.\n\n## Os Vieses Cognitivos do Trade\n\nConheça os principais armadilhas mentais:\n\n- **Aversão à Perda**: a dor de perder R$100 é mais intensa do que o prazer de ganhar R$100\n- **Efeito de Ancoragem**: quando você prende o preço médio de compra como referência\n- **Excesso de Confiança**: sequências de acertos geram ilusão de controle\n\n## Como o Trader Journal Ajuda\n\nRegistrar cada operação te força a encarar padrões de comportamento que você normalmente ignora. É o espelho que nenhum trader quer olhar — mas que todos precisam.`,
        category: "Psicologia",
        date: "24 Fev 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Automatizando Importações do MetaTrader 5 via API",
        excerpt: "Tutorial completo de como conectar seus robôs de investimento diretamente ao banco de dados do seu journal sem usar planilhas.",
        content: "## Adeus Planilhas!\n\nNenhuma rotina de alta performance sobrevive a tarefas manuais repetitivas.\n\n## Como Funciona\n\nVamos usar a API REST do MetaTrader 5 para exportar operações diretamente para o Supabase.",
        category: "Desenvolvimento",
        date: "20 Fev 2026",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Por que Expectância Matemática supera o Win Rate",
        excerpt: "Análise quantitativa de por que acertar 70% das vezes não significa lucrar, e como calcular o Payoff ideal da sua estratégia.",
        content: "## Acertar não é Ganhar\n\nA taxa de acerto é a métrica mais superestimada por traders novatos.\n\n## A Fórmula da Expectância\n\n`E = (Win Rate × Média de Ganho) - (Loss Rate × Média de Perda)`",
        category: "Análise Quantitativa",
        date: "15 Fev 2026",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1515&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Novos Templates: Configurando Diário de Swing Trade",
        excerpt: "Conheça o novo modelo oficial para traders de longo prazo focado em análise macroeconômica e múltiplos dias de exposição.",
        content: "## Desenhado para o Longo Prazo\n\nOperar com alvos de semanas ou meses requer um diário muito diferente do Day Trade.\n\n## As Tags Fundamentais\n\n- Setup de entrada\n- Catalisador macro\n- Dias de exposição\n- Gestão de parciais",
        category: "Produto",
        date: "10 Fev 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1470&auto=format&fit=crop"
    }
]

// Extract headings from markdown content for the TOC
function extractHeadings(content: string) {
    const lines = content.split("\n")
    return lines
        .filter(line => line.startsWith("## ") || line.startsWith("### "))
        .map(line => {
            const level = line.startsWith("### ") ? 3 : 2
            const text = line.replace(/^#{2,3}\s+/, "")
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            return { level, text, id }
        })
}

// Animated heading renderer with scroll-target IDs
function HeadingWithId({ level, children }: { level: number; children: React.ReactNode }) {
    const text = typeof children === "string" ? children : ""
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const Tag = `h${level}` as any
    return <Tag id={id}>{children}</Tag>
}

export default function BlogPostReader() {
    const params = useParams()
    const router = useRouter()
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeId, setActiveId] = useState<string>("")
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchPost = async () => {
            if (!params.id) return
            const idStr = String(params.id)

            const mockPost = recentPosts.find(p => p.id === idStr)
            if (mockPost) {
                setPost({ ...mockPost, created_at: mockPost.date, image_url: mockPost.image })
                setLoading(false)
                return
            }

            try {
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)
                let query = supabase.from("blog_posts").select("*, profiles(full_name, avatar_url)")
                query = isUUID ? query.eq("id", idStr) : query.eq("slug", idStr)
                const { data } = await query.single()
                if (data) setPost(data)
                else router.push("/blog")
            } catch {
                router.push("/blog")
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [params, router])

    // Highlight active heading in TOC on scroll
    useEffect(() => {
        if (!post) return
        const headings = extractHeadings(post.content || "")
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveId(entry.target.id)
                })
            },
            { rootMargin: "0px 0px -60% 0px" }
        )
        headings.forEach(h => {
            const el = document.getElementById(h.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [post])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0b1220] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        )
    }
    if (!post) return null

    const headings = extractHeadings(post.content || "")
    const authorName = post.profiles?.full_name || post.author_name || "Colaborador"
    const authorRole = post.author_role || "Trader & Colaborador"
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden transition-colors duration-500">
            <ScrollToTop />

            {/* HEADER */}
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
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/blog" className="text-sm font-medium text-emerald-500 dark:text-emerald-400">
                                Blog
                            </Link>
                        </nav>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <ModeToggle />
                            <div className="block"><PwaInstallButton /></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Link href="/blog" className="text-sm font-semibold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 transition-colors">
                            Blog
                        </Link>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mb-4"
                    >
                        {post.title}
                    </motion.h1>

                    {/* Meta */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {typeof post.created_at === "string" && post.created_at.includes("Fev")
                                ? post.created_at
                                : new Date(post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {post.read_time || post.readTime || "5 min read"}
                        </div>
                    </motion.div>

                    {/* Author */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                            {post.profiles?.avatar_url ? (
                                <img src={post.profiles.avatar_url} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                    {authorName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{authorName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{authorRole}</p>
                        </div>
                    </motion.div>

                    {/* LAYOUT: Content + Sidebar */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        
                        {/* Main Content Column */}
                        <div className="flex-1 min-w-0">
                            {/* Cover Image */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-slate-100 dark:bg-slate-800"
                            >
                                <img
                                    src={post.image_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop"}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Excerpt / Intro */}
                            {post.excerpt && (
                                <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                                    className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-8 pb-8 border-b border-slate-100 dark:border-slate-800"
                                >
                                    {post.excerpt}
                                </motion.p>
                            )}

                            {/* Article Body - Markdown */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                ref={contentRef}
                                className="prose prose-slate dark:prose-invert max-w-none 
                                    prose-headings:scroll-mt-24 
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800
                                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                                    prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:text-[17px]
                                    prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:text-[17px]
                                    prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                                    prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:font-medium hover:prose-a:underline
                                    prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:bg-emerald-50 dark:prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                                    prose-pre:bg-[#0d1117] dark:prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl
                                    prose-blockquote:border-l-4 prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-50/30 dark:prose-blockquote:bg-emerald-500/5 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl prose-blockquote:italic
                                    prose-img:rounded-2xl prose-img:shadow-xl
                                    prose-hr:border-slate-200 dark:prose-hr:border-slate-800
                                "
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h2: ({ children }) => <HeadingWithId level={2}>{children}</HeadingWithId>,
                                        h3: ({ children }) => <HeadingWithId level={3}>{children}</HeadingWithId>,
                                    }}
                                >
                                    {post.content}
                                </ReactMarkdown>
                            </motion.div>

                            {/* Category pill at bottom */}
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                {(post.category || "Geral").split(",").map((cat: string) => (
                                    <span key={cat} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold uppercase tracking-widest">
                                        {cat.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* SIDEBAR */}
                        {headings.length > 0 && (
                            <div className="hidden lg:block w-72 shrink-0">
                                <div className="sticky top-24 space-y-8">
                                    
                                    {/* On this page */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                            Neste artigo
                                        </p>
                                        <nav className="space-y-1">
                                            {headings.map(heading => (
                                                <a
                                                    key={heading.id}
                                                    href={`#${heading.id}`}
                                                    onClick={e => {
                                                        e.preventDefault()
                                                        document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                                                    }}
                                                    className={`block py-1 text-sm transition-colors duration-200 ${
                                                        heading.level === 3 ? "pl-4" : "pl-0"
                                                    } ${
                                                        activeId === heading.id
                                                            ? "text-emerald-500 dark:text-emerald-400 font-semibold"
                                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    {heading.text}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Share */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                            Compartilhar
                                        </p>
                                        <div className="flex gap-3">
                                            <a
                                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                                            >
                                                <Twitter className="h-4 w-4" />
                                            </a>
                                            <a
                                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                                            >
                                                <Linkedin className="h-4 w-4" />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(shareUrl)
                                                }}
                                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-all text-xs font-bold"
                                                title="Copiar link"
                                            >
                                                URL
                                            </button>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                    >
                                        ← Voltar ao Blog
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
