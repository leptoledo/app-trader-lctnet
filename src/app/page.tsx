"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ModeToggle } from "@/components/mode-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
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
  Facebook,
  Instagram,
  Twitter
} from "lucide-react"


export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLElement>(null)

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
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0b1220]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/60 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5 transition-transform hover:scale-105 duration-300 cursor-pointer">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-heading font-semibold tracking-tight text-slate-800 dark:text-white">
                Trader<span className="text-blue-500">LCTNET</span>
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
              <div className="hidden md:block">
                <PwaInstallButton />
              </div>
              <Button asChild className="rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] dark:from-[#3b82f6] dark:to-[#256bd1] text-white px-7 h-11 text-sm font-semibold shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:bg-[rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 active:scale-95 border border-transparent dark:border-blue-500/30">
                <Link href="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>



      <main>

        {/* HERO */}
        <section ref={heroRef} className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 bg-[#f7f9fc] dark:bg-[#0b1220]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.06),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.06),transparent_45%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-8">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 rounded-full border border-slate-200/70 dark:border-slate-800 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  Plataforma de journaling profissional
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold tracking-tighter text-slate-900 dark:text-white leading-[1.05]"
                >
                  Seu diário de trade com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">clareza</span>,
                  <br className="hidden lg:block" /> disciplina e resultados.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed"
                >
                  Registre suas operações, descubra padrões de comportamento e evolua com relatórios acionáveis. Uma plataforma premium feita para traders sérios.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center gap-4 pt-4"
                >
                  <Button asChild className="w-full sm:w-auto rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8 h-14 text-sm uppercase tracking-widest font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 active:scale-95 group">
                    <Link href="/login" className="flex items-center justify-center gap-2">
                      Criar Conta Gratuita
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto rounded-full border-slate-200 dark:border-slate-800 px-8 h-14 text-sm uppercase tracking-widest font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:-translate-y-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    Ver Live Demo
                  </Button>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-6 pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
                  {heroPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">{point.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{point.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <motion.div
                  style={{ y, opacity }}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative drop-shadow-2xl"
                >
                  <div className="absolute -inset-10 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20 rounded-[3rem] blur-3xl opacity-50 dark:opacity-80 mix-blend-screen" />
                  <div className="relative rounded-[2rem] border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden bg-slate-900/5 backdrop-blur-3xl transform perspective-[1000px] rotate-y-[-5deg] rotate-x-[5deg]">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/hero-dashboard.png"
                        alt="TraderLCTNET Professional Dashboard"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="py-14 border-y border-slate-100 dark:border-slate-800 bg-[#f7f9fc] dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Confiado por profissionais</p>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 dark:text-white mt-3">Infra que aguenta sua rotina de alta frequência.</h3>
                <div className="mt-6 flex gap-4">
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-500">
                    <span className="text-slate-900 dark:text-white">99.9%</span> uptime
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-500">
                    <span className="text-slate-900 dark:text-white">200ms</span> p95
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {brokers.map((broker) => (
                    <div key={broker} className="h-14 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 whitespace-nowrap">
                      {broker}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="recursos" className="py-28 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[#2b7de9] font-bold tracking-wider text-sm uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Recursos Premium</span>
              <h2 className="mt-6 text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Tudo o que você precisa para profissionalizar sua rotina</h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400 font-normal">Ferramentas pensadas para criar consistência e controle operacional.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((b, i) => (
                <div key={i} className="group p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-full blur-3xl -mr-16 -mt-16`} />
                  <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                    {b.icon}
                  </div>
                  <h4 className="text-xl font-semibold font-heading text-slate-900 dark:text-white mb-4">{b.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-normal leading-relaxed text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="analytics" className="py-28 bg-[#f7f9fc] dark:bg-[#0b1220]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fluxo profissional</p>
                <h2 className="text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Do trade ao insight em poucos minutos.</h2>
                <p className="text-slate-500 dark:text-slate-400 font-normal">Centralize suas entradas, organize evidências e gere relatórios que realmente mudam seu processo.</p>
                <div className="space-y-4">
                  {workflowSteps.map((step) => (
                    <div key={step.title} className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[#2b7de9] font-semibold">{step.num}</div>
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white">{step.title}</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
                {workflowCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-md">
                    <div className="relative aspect-[16/10]">
                      <Image src={card.image} alt={card.title} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-heading font-semibold text-slate-900 dark:text-white">{card.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="py-28 bg-white dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <Image src="/landing/reports.png" alt="Relatórios" width={720} height={520} className="rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800" />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Relatórios acionáveis</p>
                <h2 className="text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white">Entenda o que realmente move seu resultado.</h2>
                <p className="text-slate-500 dark:text-slate-400 font-normal">Dashboards e análises por sessão, símbolo e horário para transformar intuição em processo.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {insightPoints.map((point) => (
                    <div key={point.title} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{point.title}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{point.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG */}
        <section id="blog" className="py-28 bg-[#f7f9fc] dark:bg-[#020617]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Education Hub</h2>
                <p className="text-slate-500 dark:text-slate-400 font-normal mt-4 max-w-md">Artigos técnicos aprofundados para refinar seu edge no mercado.</p>
              </div>
              <Button variant="ghost" className="text-[#2b7de9] font-bold hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm px-8 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                Ver todos os artigos <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <div key={i} className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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
                    <h3 className="text-xl font-heading font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-[#2b7de9] transition-colors leading-tight">
                      {post.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0b1220] py-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(43,125,233,0.15))]" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <span className="text-blue-300/80 font-semibold tracking-widest text-xs uppercase mb-6 block">Comece agora mesmo</span>
            <h2 className="text-4xl md:text-6xl font-heading font-semibold text-white tracking-tight mb-8">
              Pronto para operar com <span className="text-blue-300">consistência real?</span>
            </h2>
            <p className="text-xl text-slate-300/90 mb-12 max-w-2xl mx-auto font-normal">
              Experimente gratuitamente e descubra sua vantagem operacional com clareza e disciplina.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="rounded-full bg-white hover:bg-slate-100 text-slate-900 px-10 h-14 text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] hover:-translate-y-1">
                <Link href="/login">Criar Conta Grátis <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

      </main>


      {/* --- FOOTER --- */}
      <footer className="bg-[#f7f9fc] dark:bg-[#0b1220] border-t border-slate-200/70 dark:border-slate-800 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-slate-900 dark:bg-slate-800 p-1.5 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-heading font-semibold tracking-tight text-slate-800 dark:text-white">
                  Trader<span className="text-blue-500">LCTNET</span>
                </span>
              </div>
              <p className="text-sm text-slate-500/90 dark:text-slate-400 font-normal leading-relaxed">
                Plataforma de journaling e analytics desenvolvida para traders que buscam alta performance e consistência matemática.
              </p>
            </div>

            <div className="flex gap-16 flex-wrap">
              {footerLinks.map((col, i) => (
                <div key={i}>
                  <h5 className="font-semibold text-slate-700 dark:text-white text-sm mb-6">{col.title}</h5>
                  <ul className="space-y-4">
                    {col.links.map((link, j) => (
                      <li key={j} className="text-sm font-normal text-slate-500/90 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors">
                        {link}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">© 2026 Leptoledo Capital. Todos os direitos reservados.</p>
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
const heroPoints = [
  {
    title: "Execução disciplinada",
    desc: "Checklists de regras para eliminar decisões impulsivas."
  },
  {
    title: "Clareza em minutos",
    desc: "Resumo diário com pontos de ajuste mais urgentes."
  },
  {
    title: "Edge comprovável",
    desc: "Relatórios consistentes para validar o playbook."
  },
  {
    title: "Evolução semanal",
    desc: "Comparativos por sessão, símbolo e horário."
  }
]

const brokers = ["TradingView", "MetaTrader 5", "NinjaTrader", "Interactive", "Binance", "Bybit"]

const workflowSteps = [
  { num: "01", title: "Registre", desc: "Cadastre seus trades ou importe em lote." },
  { num: "02", title: "Analise", desc: "Compare sessões, símbolos e horários." },
  { num: "03", title: "Ajuste", desc: "Transforme insights em regras operacionais." }
]

const workflowCards = [
  {
    title: "Dashboard unificado",
    desc: "Visão geral do desempenho com filtros inteligentes.",
    image: "/landing/dashboard.png"
  },
  {
    title: "Relatórios prontos",
    desc: "Entregáveis claros para mentores e sócios.",
    image: "/landing/reports.png"
  }
]

const insightPoints = [
  { title: "Padrões de erro", desc: "Encontre repetições que drenam o lucro." },
  { title: "Melhores horários", desc: "Identifique sessões mais rentáveis." },
  { title: "Setup vencedor", desc: "Mapeie o que funciona com consistência." },
  { title: "Disciplina diária", desc: "Acompanhe aderência às regras." }
]

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
