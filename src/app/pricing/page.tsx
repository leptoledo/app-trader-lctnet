"use client"

import { PLANS } from "@/config/plans"
import { Check, ArrowUpRight, Star, Zap, ShieldCheck, Globe, Flame, TrendingUp, Facebook, Instagram, Twitter, Github, Youtube, Database, LineChart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { toast } from "sonner"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { ScrollToTop } from "@/components/scroll-to-top"

const footerLinks = [
    { title: "Produto", links: ["Base de Dados", "Autenticação", "Edge Functions", "Storage", "Analytics", "Preços", "Changelog"] },
    { title: "Soluções", links: ["Day Trade", "Swing Trade", "Iniciantes", "Avançado", "Startups", "Agências"] },
    { title: "Recursos", links: ["Blog", "Suporte", "Status do Sistema", "Integrações", "Segurança"] },
    { title: "Desenvolvedores", links: ["Documentação", "API Reference", "Modelos", "Open Source", "Contribuir"] },
    { title: "Empresa", links: ["Sobre Nós", "Termos de Serviço", "Política de Privacidade", "Regras de Uso", "Contato"] }
]

export default function PricingPage() {
    const handleSubscribe = async (planId: string) => {
        if (planId === 'free') {
            window.location.href = '/dashboard'
            return
        }

        toast.loading("Iniciando checkout seguro...")

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error("Erro ao criar sessão de pagamento")
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            toast.error(message)
        } finally {
            toast.dismiss()
        }
    }

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
                                        item === "Preços" ? "text-emerald-500 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"
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
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50 mb-4"
                        >
                            <Globe className="h-3 w-3" /> Preços Transparentes
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                        >
                            Invista na sua <br className="hidden md:block" />
                            <span className="text-emerald-500">Consistência</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium mt-6 leading-relaxed"
                        >
                            Escolha o plano ideal para o seu momento no mercado. De iniciantes a traders institucionais operando em alta frequência.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-8 relative">
                        {/* Plan: FREE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="group relative bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Starter</h3>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">R$ 0</span>
                                    <span className="text-slate-500 text-sm font-medium">/mês</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                                    O kit básico para quem está começando a registrar operações manuais.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {PLANS.free.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 transition-colors"
                                onClick={() => handleSubscribe('free')}
                            >
                                Começar Gratuitamente
                            </Button>
                        </motion.div>

                        {/* Plan: PRO (Featured) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="group relative bg-slate-900 dark:bg-[#0f172a] rounded-3xl p-8 md:p-10 border border-slate-800 shadow-xl lg:scale-105 z-10 flex flex-col overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />

                            <div className="absolute top-6 right-6">
                                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                    <Flame className="h-3 w-3" /> Popular
                                </div>
                            </div>

                            <div className="mb-8 relative z-10">
                                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">Pro Trader</h3>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-bold text-white tracking-tight">R$ 97</span>
                                    <span className="text-slate-400 text-sm font-medium">/mês</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    Automação completa e análises preditivas para quem opera todos os dias.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1 relative z-10">
                                {PLANS.pro.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-white stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full h-12 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-none transition-colors relative z-10 group"
                                onClick={() => handleSubscribe('pro')}
                            >
                                Assinar Pro <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Button>
                        </motion.div>

                        {/* Plan: GOLD (VIP) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="group relative bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
                                    Mesa Institucional
                                </h3>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">R$ 197</span>
                                    <span className="text-slate-500 text-sm font-medium">/mês</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                                    Para gestores de capital, mesas proprietárias e operações em time.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {PLANS.gold.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Star className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-amber-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {feat}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-sm font-semibold border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-700 dark:text-amber-500 transition-colors"
                                onClick={() => handleSubscribe('gold')}
                            >
                                Contatar Vendas
                            </Button>
                        </motion.div>
                    </div>

                    {/* FAQ & Trust Section */}
                    <div className="mt-32 max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Perguntas Frequentes</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-emerald-500" /> Posso cancelar quando quiser?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Sim, não temos fidelidade ou multas de cancelamento. Você pode cancelar sua assinatura Pro ou Ouro a qualquer momento diretamente pelo seu painel de cobrança.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Meus dados operacionais estão seguros?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Totalmente. Utilizamos criptografia AES-256 e o Supabase Auth para garantir que apenas você acesse suas operações, além de isolar os dados financeiros sensíveis.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Database className="h-4 w-4 text-emerald-500" /> A importação automática funciona como?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Se você usa MetaTrader 5, ProfitChart ou NinjaTrader, você pode configurar nosso conector e sincronizar suas negociações diretamente, sem precisar de exportação manual CSS.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <LineChart className="h-4 w-4 text-emerald-500" /> Tem limite de backtesting?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    No plano Pro você tem acesso ilimitado ao motor de backtest para calcular curva de capital, sharpe ratio e desenhar cenários futuros sem limite de simulações.
                                </p>
                            </div>
                        </div>

                        {/* Secure Trust Badges */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 pt-16 mt-8 sm:mt-12 opacity-50 dark:opacity-60 grayscale">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400"><ShieldCheck className="h-5 w-5" /> Pagamento Seguro via Stripe</div>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400"><Globe className="h-5 w-5" /> Criptografia Ponta-a-Ponta</div>
                        </div>
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
