"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ModeToggle } from "@/components/mode-toggle"
import {
  TrendingUp,
  ChevronRight,
  FileText,
  Calendar,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LineChart,
  Activity,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react"

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)

  // Parallax for dashboard
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden transition-colors duration-500">

      <ScrollToTop />

      {/* --- HEADER --- */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5 transition-transform hover:scale-105 duration-300 cursor-pointer">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                Trader<span className="text-blue-600">LCTNET</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-10">
              {["Recursos", "Analytics", "Blog"].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                </Link>
              ))}
              <Link href="/pricing" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
                Preços
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <ModeToggle />
              <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
              <Button asChild className="rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 px-6 h-11 text-sm font-bold text-white shadow-lg focus:ring-4 focus:ring-slate-200 dark:focus:ring-blue-900 transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
                <Link href="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main>

        {/* --- HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-24 pb-32 md:pt-40 md:pb-48 overflow-hidden bg-white dark:bg-[#020617] transition-colors duration-500">
          {/* Background Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800 text-[11px] font-bold uppercase tracking-widest mb-10 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Journaling Automático IA v2.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-8 max-w-5xl mx-auto"
            >
              A inteligência que faltava no seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Trade System</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed font-sans"
            >
              Chega de planilhas manuais. O TraderLCTNET sincroniza com sua corretora, analisa seus erros emocionais e te mostra o caminho da consistência matemática.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24"
            >
              <Button asChild className="w-full sm:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-10 h-16 text-lg font-bold shadow-2xl shadow-blue-600/25 transition-all hover:-translate-y-1 active:scale-95 ring-offset-2 focus:ring-2 ring-blue-500 group">
                <Link href="/login" className="flex items-center justify-center gap-3">
                  Criar Conta Gratuita
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto rounded-2xl border-slate-200 dark:border-slate-700 px-10 h-16 text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all backdrop-blur-sm bg-white/50 dark:bg-white/5">
                Ver Live Demo
              </Button>
            </motion.div>

            {/* DASHBOARD PREVIEW IMAGE 3D CONTAINER */}
            <motion.div
              style={{ y, opacity }}
              className="max-w-6xl mx-auto relative group perspective-1000"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />

              <div className="relative bg-[#0f172a] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden transform group-hover:rotate-x-2 transition-transform duration-1000 ease-out">
                {/* Browser UI Header */}
                <div className="h-10 w-full bg-[#1e293b] flex items-center justify-start gap-2 px-6 border-b border-slate-700/50">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                    <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                    <div className="h-3 w-3 rounded-full bg-[#10b981]" />
                  </div>
                  <div className="ml-4 h-5 w-64 bg-[#334155] rounded-md opacity-50" />
                </div>

                <div className="aspect-[16/9] relative group">
                  <Image
                    src="/images/dashboard-preview.png"
                    alt="TraderLCTNET Professional Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay Gradient for smooth blending */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Float Stats Cards - Animated */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -right-8 top-1/3 p-4 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Taxa de Acerto</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">68.4%</p>
                  </div>
                </div>
                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[68%]" />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -left-8 bottom-1/4 p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Fator de Lucro</p>
                    <p className="text-xl font-bold text-white">2.45</p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* --- SOCIAL PROOF --- */}
        <section className="py-20 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-xs font-bold font-heading uppercase tracking-[0.2em] text-slate-400 mb-12">Confiado por mais de 10.000 Traders Profissionais</h3>
            <div className="flex justify-center flex-wrap gap-x-16 gap-y-12 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
              {["TradingView", "MetaTrader 5", "NinjaTrader", "Interactive", "Binance", "Bybit"].map((broker) => (
                <span key={broker} className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-100 cursor-default">{broker}</span>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="recursos" className="py-32 bg-white dark:bg-[#020617] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-sm uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Recursos Premium</span>
              <h2 className="mt-6 text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                Tudo o que você precisa para <br className="hidden md:block" />profissionalizar sua rotina
              </h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
            >
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-full blur-3xl -mr-16 -mt-16`} />

                  <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                    {b.icon}
                  </div>
                  <h4 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-4">{b.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- DARK ANALYTICS SECTION --- */}
        <section id="analytics" className="py-32 bg-[#020617] text-white overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/4 w-[1000px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1 relative"
              >
                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 rounded-[3rem] blur-2xl -z-10" />
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
                  {/* Stylized Chart Representation using CSS */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Resultado Mensal</p>
                        <p className="text-3xl font-heading font-bold mt-1 text-white">R$ 14.520,00</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        +12.5%
                      </div>
                    </div>
                    <div className="h-48 flex items-end gap-2 px-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: "0%" }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm hover:from-emerald-500 hover:to-emerald-400 transition-all cursor-pointer group relative"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Trade #{i + 1}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="order-1 lg:order-2 space-y-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1]"
                >
                  Transforme <span className="text-blue-500">erros invisíveis</span> em lucro real.
                </motion.h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  90% dos traders perdem dinheiro não por falta de técnica, mas por falta de gestão. Nosso algoritmo identifica seus padrões de perda e te alerta antes que você devolva o lucro da semana.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  {[
                    { title: "Gestão de Risco", desc: "Travas automáticas de loss diário" },
                    { title: "Diário de Emoções", desc: "Correlacione humor com performance" },
                    { title: "Playbook Visual", desc: "Salve seus melhores setups" },
                    { title: "Relatórios PDF", desc: "Para investidores e mentores" }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      <div>
                        <h5 className="font-bold text-white text-sm">{feat.title}</h5>
                        <p className="text-slate-500 text-xs mt-1">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- BLOG PREVIEW --- */}
        <section id="blog" className="py-32 bg-slate-50 dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Education Hub</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-md">Artigos técnicos aprofundados para refinar seu edge no mercado.</p>
              </div>
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm px-8 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                Ver todos os artigos <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <div key={i} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden mb-6">
                    <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-900 border border-white/50">
                      {post.tag}
                    </div>
                  </div>
                  <div className="flex-1 px-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-3">
                      <Calendar className="h-3 w-3" /> {post.date}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {post.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA FOOTER --- */}
        <section className="bg-[#0f172a] py-32 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(37,99,235,0.1))]" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-6 block">Comece agora mesmo</span>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tight mb-8">
              Pronto para operar <span className="text-blue-500">como um institucional?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
              Junte-se à elite. Teste nossa plataforma gratuitamente por 14 dias. Sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-12 h-16 text-lg font-bold transition-all shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)]">
                <Link href="/login">Criar Conta Grátis</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
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
              {footerLinks.map((col, i) => (
                <div key={i}>
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-6">{col.title}</h5>
                  <ul className="space-y-4">
                    {col.links.map((link, j) => (
                      <li key={j} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                        {link}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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

// DATA & CONTENT
const benefits = [
  {
    title: "Importação Automática",
    desc: "Conecte sua conta do MetaTrader ou ProfitChart e deixe que nós importamos seu histórico em segundos.",
    icon: <FileText className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Risco & Compliance",
    desc: "Defina limiares de rebaixamento e receba alertas em tempo real se violar suas próprias regras.",
    icon: <ShieldCheck className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Análise Psicológica",
    desc: "Registre como você se sentiu durante o trade e descubra quais emoções custam mais caro.",
    icon: <Eye className="h-6 w-6" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Playbook Digital",
    desc: "Capture prints dos seus setups e crie uma biblioteca de estratégias vencedoras.",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Backtesting Real",
    desc: "Simule resultados baseados na sua expectativa matemática histórica, não em achismos.",
    icon: <LineChart className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "Relatórios IA",
    desc: "Todo domingo, receba um email detalhado com seus pontos fortes e fracos da semana.",
    icon: <Zap className="h-6 w-6" />,
    color: "from-yellow-500 to-orange-500"
  }
]

const blogPosts = [
  {
    tag: "Psicologia",
    title: "Por que você devolve tudo na sexta-feira?",
    img: "https://images.unsplash.com/photo-1611974717537-4340c1157f49?q=80&w=800&auto=format&fit=crop",
    date: "24 Jan 2026"
  },
  {
    tag: "Técnica",
    title: "Domine o Order Block em 5 passos",
    img: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop",
    date: "20 Jan 2026"
  },
  {
    tag: "Gestão",
    title: "Como calcular o tamanho do lote ideal",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    date: "15 Jan 2026"
  }
]

const footerLinks = [
  { title: "Produto", links: ["Features", "Preços", "Integrações", "Changelog"] },
  { title: "Recursos", links: ["Documentação", "API", "Comunidade", "Blog"] },
  { title: "Empresa", links: ["Sobre", "Carreiras", "Legal", "Contato"] }
]
