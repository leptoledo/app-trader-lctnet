"use client"

import { PLANS } from "@/config/plans"
import { Check, ArrowUpRight, Star, Zap, ShieldCheck, Globe, Flame, TrendingUp, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { toast } from "sonner"
import { PwaInstallButton } from "@/components/pwa-install-button"

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
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden font-sans">

            {/* Header Mirroring landing page */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 duration-300">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-heading font-semibold tracking-tight text-slate-800 dark:text-white">
                                Trader<span className="text-blue-500">LCTNET</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-10">
                            {["Recursos", "Analytics", "Blog"].map((item) => (
                                <Link key={item} href={`/#${item.toLowerCase()}`} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                                </Link>
                            ))}
                            <Link href="/pricing" className="text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors relative group">
                                Preços
                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600" />
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <ModeToggle />
                            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
                            <div className="hidden md:block">
                                <PwaInstallButton />
                            </div>
                            <Button asChild className="rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white px-7 h-11 text-sm font-semibold shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 active:scale-95 border border-transparent dark:border-blue-500/30">
                                <Link href="/login">Começar Grátis</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-semibold uppercase tracking-widest border border-blue-100 dark:border-blue-900/50"
                        >
                            <Globe className="h-3 w-3" /> Planos Flexíveis
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold tracking-tighter text-slate-900 dark:text-white leading-[1.05]"
                        >
                            Invista na sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Consistência</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium"
                        >
                            Escolha o plano ideal para o seu momento no mercado. <br className="hidden md:block" /> De iniciantes a traders institucionais.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8 relative">
                        {/* Interactive glow behind the cards */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 blur-3xl -z-10 rounded-full" />

                        {/* Plan: FREE */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Gratuito</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter">R$ 0</span>
                                    <span className="text-slate-500 text-sm font-semibold">/mês</span>
                                </div>
                                <p className="text-xs text-slate-400 font-normal mt-4">Ideal para quem está começando o diário.</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {PLANS.free.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button variant="outline" className="w-full h-14 rounded-full font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1" onClick={() => handleSubscribe('free')}>
                                Começar Gratuitamente
                            </Button>
                        </motion.div>

                        {/* Plan: PRO (Featured) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="group relative bg-slate-900 dark:bg-[#0A101F] backdrop-blur-3xl rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl scale-105 z-10 flex flex-col overflow-hidden"
                        >
                            {/* Premium Glow & Ring */}
                            <div className="absolute inset-0 rounded-[2.5rem] ring-2 ring-blue-500/50 dark:ring-blue-400/30 ring-inset glow-effect pointer-events-none" />
                            <div className="absolute top-0 right-0 p-32 bg-blue-600/15 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="absolute top-6 right-8">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                    <Flame className="h-3 w-3" /> Mais Popular
                                </div>
                            </div>

                            <div className="mb-8 relative z-10">
                                <h3 className="text-xl font-semibold text-white mb-2 uppercase tracking-tight">Pro</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-semibold text-white tracking-tighter">R$ 97</span>
                                    <span className="text-slate-400 text-sm font-semibold">/mês</span>
                                </div>
                                <p className="text-xs text-slate-400 font-normal mt-4">Para traders que operam todos os dias.</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1 relative z-10">
                                {PLANS.pro.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="text-sm font-normal text-slate-100">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full h-14 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1 relative z-10 text-sm uppercase tracking-widest group" onClick={() => handleSubscribe('pro')}>
                                Assinar Pro <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Button>
                        </motion.div>

                        {/* Plan: GOLD (VIP) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-tight flex items-center gap-2">
                                    Ouro
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter">R$ 197</span>
                                    <span className="text-slate-500 text-sm font-semibold">/mês</span>
                                </div>
                                <p className="text-xs text-slate-400 font-normal mt-4">Gestão profissional e acesso a sinais.</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {PLANS.gold.features.map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                            <Star className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-amber-400" />
                                        </div>
                                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400 italic">
                                            {feat}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button variant="ghost" className="w-full h-14 rounded-full font-bold border-2 border-amber-500/30 hover:border-amber-500 dark:text-amber-500 text-amber-600 hover:text-white hover:bg-amber-600 transition-all hover:-translate-y-1 uppercase tracking-widest text-sm" onClick={() => handleSubscribe('gold')}>
                                Upgrade para Ouro
                            </Button>
                        </motion.div>
                    </div>

                    {/* FAQ Mini Section */}
                    <div className="mt-32 max-w-4xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight uppercase">Perguntas Frequentes</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-3 p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <Zap className="h-5 w-5 text-blue-500" /> Posso cancelar quando quiser?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Sim, não temos fidelidade. Você pode cancelar sua assinatura Pro ou Ouro a qualquer momento pelo dashboard.</p>
                            </div>
                            <div className="space-y-3 p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Meus dados estão seguros?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Utilizamos criptografia de ponta a ponta e o Supabase Auth para garantir que apenas você acesse suas operações.</p>
                            </div>
                        </div>

                        {/* Secure Trust Badges */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12 border-t border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] opacity-60">
                            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Pagamento Seguro Stripe</div>
                            <div className="flex items-center gap-2"><Globe className="h-5 w-5" /> Criptografia 256-bit</div>
                            <div className="flex items-center gap-2"><Star className="h-5 w-5" /> 7 Dias de Garantia</div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-800 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-slate-900 dark:bg-slate-800 p-1.5 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                                    Trader<span className="text-blue-600">LCTNET</span>
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Plataforma de journaling e analytics desenvolvida para traders que buscam alta performance e consistência matemática.
                            </p>
                        </div>

                        <div className="flex gap-16 flex-wrap">
                            <div className="space-y-6">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Produto</h5>
                                <ul className="space-y-4">
                                    {["Features", "Preços", "Integrações", "Changelog"].map(link => (
                                        <li key={link} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Recursos</h5>
                                <ul className="space-y-4">
                                    {["Documentação", "API", "Comunidade", "Blog"].map(link => (
                                        <li key={link} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Empresa</h5>
                                <ul className="space-y-4">
                                    {["Sobre", "Carreiras", "Legal", "Contato"].map(link => (
                                        <li key={link} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">© 2026 Leptoledo Capital. Todos os direitos reservados.</p>
                        <div className="flex gap-6">
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 transition-all cursor-pointer">
                                <Facebook className="h-4 w-4" />
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 transition-all cursor-pointer">
                                <Instagram className="h-4 w-4" />
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 transition-all cursor-pointer">
                                <Twitter className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
