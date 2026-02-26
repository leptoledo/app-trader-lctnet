"use client"

import { TrendingUp, Facebook, Instagram, Twitter, Github, Youtube, ArrowRight, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { ScrollToTop } from "@/components/scroll-to-top"
import Image from "next/image"

const footerLinks = [
    { title: "Produto", links: ["Base de Dados", "Autenticação", "Edge Functions", "Storage", "Analytics", "Preços", "Changelog"] },
    { title: "Soluções", links: ["Day Trade", "Swing Trade", "Iniciantes", "Avançado", "Startups", "Agências"] },
    { title: "Recursos", links: ["Blog", "Suporte", "Status do Sistema", "Integrações", "Segurança"] },
    { title: "Desenvolvedores", links: ["Documentação", "API Reference", "Modelos", "Open Source", "Contribuir"] },
    { title: "Empresa", links: ["Sobre Nós", "Termos de Serviço", "Política de Privacidade", "Regras de Uso", "Contato"] }
]

const recentPosts = [
    {
        id: "1",
        title: "A Psicologia do Loss: Como evitar a armadilha do Overtrading",
        excerpt: "Descubra como os vieses cognitivos afetam suas decisões e aprenda a usar o Trader Journal para impor limites rígidos de perda máxima diária.",
        category: "Psicologia",
        date: "24 Fev 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Automatizando Importações do MetaTrader 5 via API",
        excerpt: "Tutorial completo de como conectar seus robôs de investimento diretamente ao banco de dados do seu journal sem usar planilhas.",
        category: "Desenvolvimento",
        date: "20 Fev 2026",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Por que Expectância Matemática supera o Win Rate",
        excerpt: "Análise quantitativa de por que acertar 70% das vezes não significa lucrar, e como calcular o Payoff ideal da sua estratégia.",
        category: "Análise Quantitativa",
        date: "15 Fev 2026",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1515&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Novos Templates: Configurando Diário de Swing Trade",
        excerpt: "Conheça o novo modelo oficial para traders de longo prazo focado em análise macroeconômica e múltiplos dias de exposição.",
        category: "Produto",
        date: "10 Fev 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1470&auto=format&fit=crop"
    }
]

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>(recentPosts)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from("blog_posts")
                    .select("*")
                    .eq("published", true)
                    .order("created_at", { ascending: false })

                if (data && data.length > 0) {
                    const realPosts = data.map(p => ({
                        id: p.slug || p.id,
                        title: p.title,
                        excerpt: p.excerpt || "O mercado premia quem tem a informação certa. Leia nosso artigo completo.",
                        category: p.category || "Geral",
                        date: new Date(p.created_at).toLocaleDateString('pt-BR'),
                        readTime: p.read_time || "5 min read",
                        image: p.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop'
                    }))
                    setPosts([...realPosts, ...recentPosts])
                }
            } catch (err) {
                console.error("Erro ao buscar artigos reais", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    const firstPost = posts[0]
    const otherPosts = posts.slice(1)

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
                            {["Recursos", "Analytics", "Comunidade", "Preços", "Blog"].map((item) => (
                                <Link
                                    key={item}
                                    href={
                                        item === "Preços" ? "/pricing" :
                                            item === "Blog" ? "/blog" :
                                                `/#${item.toLowerCase()}`
                                    }
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-emerald-500 dark:hover:text-emerald-400",
                                        item === "Blog" ? "text-emerald-500 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"
                                    )}
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <ModeToggle />
                            <Button asChild variant="ghost" className="px-2 sm:px-4 text-sm font-medium hover:text-emerald-500">
                                <Link href="/login">Login</Link>
                            </Button>
                            <div className="block">
                                <PwaInstallButton />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative pt-32 pb-24 border-b border-slate-100 dark:border-slate-800/50">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">

                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-3xl space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50 mb-2"
                            >
                                <FileText className="h-3 w-3" /> Blog & Insights
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                            >
                                Construa sua <br />
                                <span className="text-emerald-500">Vantagem Competitiva</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl font-medium mt-6 leading-relaxed"
                            >
                                Análises quantitativas, psicologia do trading e novidades da plataforma direto da equipe de engenharia do Trader Journal.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full md:w-auto flex flex-col sm:flex-row gap-3"
                        >
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar artigos..."
                                    className="h-12 w-full sm:w-[280px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all dark:placeholder:text-slate-600"
                                />
                            </div>
                            <Button className="h-12 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-none transition-colors hidden sm:flex">
                                Assinar Newsletter
                            </Button>
                        </motion.div>
                    </div>

                    {!firstPost ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Featured Post (First one) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-16 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500"
                            >
                                <div className="w-full md:w-[55%] h-[300px] md:h-[450px] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    {/* In production this would be next/image, using standard img tag with class for simplicity here */}
                                    <img
                                        src={firstPost.image}
                                        alt={firstPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col justify-center relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                                            {firstPost.category}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400">{firstPost.readTime}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-[1.2] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                        <Link href={`/blog/${firstPost.id}`}>
                                            {firstPost.title}
                                        </Link>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-8">
                                        {firstPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-sm font-semibold text-slate-400">
                                            {firstPost.date}
                                        </div>
                                        <Button variant="ghost" className="text-slate-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 p-0 hover:bg-transparent group/btn">
                                            Ler Artigo <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Post Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                {otherPosts.map((post, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        key={post.id}
                                        className="relative rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 flex flex-col flex-1">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4">
                                                <span>{post.date}</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                                <Link href={`/blog/${post.id}`} className="before:absolute before:inset-0">
                                                    {post.title}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3 mb-6">
                                                {post.excerpt}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                                                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-16 text-center">
                        <Button variant="outline" className="h-12 rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 transition-colors px-8">
                            Carregar mais artigos
                        </Button>
                    </div>

                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-white dark:bg-[#0b1220] pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="bg-emerald-500 p-1.5 rounded-md">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Trader Journal
                            </span>
                        </div>
                        <div className="flex gap-6 text-slate-400 dark:text-slate-500">
                            <Twitter className="h-6 w-6 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
                            <Github className="h-6 w-6 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
                            <Youtube className="h-6 w-6 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
                        {footerLinks.map((col, i) => (
                            <div key={i}>
                                <h5 className="font-semibold text-slate-900 dark:text-white text-[15px] mb-6">{col.title}</h5>
                                <ul className="space-y-4">
                                    {col.links.map((link, j) => (
                                        <li key={j} className="text-[14px] text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition-colors font-medium">
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">© 2026 Leptoledo Capital. All rights reserved.</p>
                        <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
