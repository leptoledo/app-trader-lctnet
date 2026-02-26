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
  FileText,
  Calendar,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LineChart,
  Facebook,
  Instagram,
  Twitter,
  Github,
  Youtube,
  ChevronRight,
  Database,
  Lock,
  Globe,
  Cpu,
  BrainCircuit,
  PieChart,
  BarChart,
  Triangle,
  Activity,
  Code,
  MessageSquare
} from "lucide-react"

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLElement>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden transition-colors duration-500">

      <ScrollToTop />

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Trader Journal
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {["Recursos", "Analytics", "Comunidade", "Preços", "Blog"].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
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

      <main>
        {/* --- HERO --- */}
        <section ref={heroRef} className="pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.1]"
          >
            Opere com disciplina<br />
            <span className="text-emerald-500">Lucros reais a longo prazo</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed"
          >
            A plataforma de desenvolvimento para traders profissionais. Registre entradas, crie regras de compliance e alcance a consistência com análises avançadas do seu histórico operacional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-3 mt-10"
          >
            <Button asChild className="w-full sm:w-auto rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-10 text-sm font-medium shadow-none transition-colors">
              <Link href="/login">Criar conta gratuita</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 px-6 h-10 text-sm font-medium shadow-none transition-colors">
              <Link href="/dashboard">Ver Demonstração</Link>
            </Button>
          </motion.div>

          {/* Logos Group */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 pt-10"
          >
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-8">Compatível com as principais plataformas mundiais</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {brokers.map((broker) => (
                <div key={broker} className="text-lg font-bold tracking-wider text-slate-800 dark:text-slate-200">
                  {broker}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* --- CUSTOMER STORIES / BENTO GRID FEATURES --- */}
        <section id="recursos" className="py-24 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0b1220] border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Traders de Alta Frequência</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Utilizado pelas mentes mais inovadoras do mercado.</h2>
              </div>
              <Button variant="outline" className="rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 px-4 h-9 text-sm font-medium shadow-none transition-colors">
                Ver histórias completas
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">

              {/* Feature 1: Large Box - Data Sync */}
              <div className="col-span-1 md:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 md:p-10 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-8 items-start justify-between relative z-10 h-full">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                      <Database className="h-5 w-5" />
                      <h3>Importação Automática</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                      Conecte sua conta e deixe que nossa infraestrutura importe seu histórico automaticamente. <strong>Todo projeto ganha um banco de dados completo</strong> e criptografado para o seu registro de operações.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> MetaTrader 5 Integrado</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Histórico 100% cloud-based</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Zero limite de armazenamento</li>
                    </ul>
                  </div>

                  {/* Decorative graphic: Database */}
                  <div className="w-full md:w-1/2 h-full min-h-[200px] bg-slate-50 dark:bg-[#0b1220] rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center relative shadow-inner">
                    <div className="absolute inset-0 grid grid-cols-6 gap-2 p-4 opacity-10 dark:opacity-20 pointer-events-none">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="bg-slate-400 dark:bg-slate-500 rounded-sm" />
                      ))}
                    </div>
                    <Database className="h-20 w-20 text-slate-300 dark:text-slate-700 relative z-10 group-hover:scale-105 transition-transform duration-700" strokeWidth={1} />
                  </div>
                </div>
              </div>

              {/* Feature 2: Small Box - Security */}
              <div className="col-span-1 md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 relative overflow-hidden group flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                  <ShieldCheck className="h-5 w-5" />
                  <h3>Risco & Compliance</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Defina limites de rebaixamento e bloqueie overtrading. Securing your equity with rules.
                </p>
                <div className="mt-auto bg-slate-50 dark:bg-[#0b1220] rounded-xl border border-slate-200 dark:border-slate-800 p-4 font-mono text-xs text-slate-600 dark:text-slate-400 space-y-2 h-32 flex flex-col justify-center shadow-inner group-hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-center"><span className="text-emerald-500">Max Daily Loss</span> <span>-$500</span></div>
                  <div className="flex justify-between items-center"><span className="text-emerald-500">Max Positions</span> <span>3 ativos</span></div>
                  <div className="flex justify-between items-center text-red-400 opacity-50"><span className="">Lock Account</span> <span>If triggered</span></div>
                </div>
              </div>

              {/* Feature 3: Small Box - Psychology */}
              <div className="col-span-1 md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                  <BrainCircuit className="h-5 w-5" />
                  <h3>Análise Psicológica</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Cruze seus dados financeiros com seu estado emocional. Descubra quais emoções custam mais caro.
                </p>
                <div className="mt-auto bg-slate-50 dark:bg-[#0b1220] rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-32 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_50%)]" />
                  <PieChart className="h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                </div>
              </div>

              {/* Feature 4: Small Box - Playbook */}
              <div className="col-span-1 md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                  <FileText className="h-5 w-5" />
                  <h3>Playbook Digital</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Capture evidências de tela dos seus setups. Multi-upload images to store and review scenarios.
                </p>
                <div className="mt-auto h-32 relative border border-slate-200 dark:border-slate-800 rounded-xl bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden flex items-center justify-center shadow-inner">
                  <div className="p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Live Sync</span>
                  </div>
                </div>
              </div>

              {/* Feature 5: Small Box - Backtest */}
              <div className="col-span-1 md:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 relative overflow-hidden flex flex-col group">
                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-medium">
                  <LineChart className="h-5 w-5" />
                  <h3>Data & Backtesting</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Expectativa matemática real. Instant ready-to-use insights sobre performance.
                </p>
                <div className="mt-auto bg-slate-50 dark:bg-[#0b1220] rounded-xl border border-slate-200 dark:border-slate-800 p-4 font-mono text-xs text-slate-600 dark:text-slate-400 space-y-2 h-32 flex flex-col justify-center shadow-inner">
                  <div className="flex items-center justify-between group-hover:text-emerald-500 transition-colors"><span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Win Rate</span> <span>68.5%</span></div>
                  <div className="flex items-center justify-between"><span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Payoff</span> <span>1.85</span></div>
                  <div className="flex items-center justify-between"><span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Profit Factor</span> <span>2.10</span></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- COMMUNITY TESTIMONIALS --- */}
        <section className="py-24 relative overflow-hidden bg-white dark:bg-[#050914] border-b border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4">
              Junte-se à comunidade
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium max-w-2xl mx-auto">
              Descubra o que a nossa comunidade de traders tem a dizer sobre a experiência no Trader Journal.
            </p>
            <Button variant="outline" className="rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 h-9 px-4 text-xs font-medium shadow-sm transition-colors mx-auto">
              <MessageSquare className="h-4 w-4 mr-2" /> Junte-se no Discord
            </Button>
          </div>

          <div className="relative max-w-[100vw] mx-auto py-10 overflow-hidden">
            {/* Animated Marquee Rows */}
            <div className="flex flex-col gap-6 pointer-events-auto">

              {/* Row 1 */}
              <div className="flex gap-6 w-max animate-marquee-horizontal hover:[animation-play-state:paused]">
                {/* Clone the array multiple times to ensure continuous horizontal loop */}
                {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                  <div key={`r1-${i}`} className="w-[320px] sm:w-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] p-6 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm cursor-default shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#1f2937] text-emerald-500 font-bold text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-900 dark:text-white">{t.handle}</div>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-normal h-full">
                      {t.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Row 2 - Reverse */}
              <div className="flex gap-6 w-max animate-marquee-horizontal-reverse hover:[animation-play-state:paused] ml-[-200px]">
                {[...testimonials.slice().reverse(), ...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, i) => (
                  <div key={`r2-${i}`} className="w-[320px] sm:w-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] p-6 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm cursor-default shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#1f2937] text-emerald-500 font-bold text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-900 dark:text-white">{t.handle}</div>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-normal h-full">
                      {t.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Row 3 - Slow Forward */}
              <div className="flex gap-6 w-max animate-marquee-horizontal-slow hover:[animation-play-state:paused] ml-[-400px]">
                {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                  <div key={`r3-${i}`} className="w-[320px] sm:w-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1220] p-6 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm cursor-default shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#1f2937] text-emerald-500 font-bold text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-900 dark:text-white">{t.handle}</div>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-normal h-full">
                      {t.content}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Edge fade gradients - Horizontal */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-40 bg-gradient-to-r from-white dark:from-[#050914] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-40 bg-gradient-to-l from-white dark:from-[#050914] to-transparent z-20 pointer-events-none" />
          </div>
        </section>


        {/* --- TEMPLATES / MODELS --- */}
        <section className="py-24 bg-slate-50 dark:bg-[#0b1220] border-b border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4">
                Comece em segundos
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Acelere sua configuração com modelos operacionais construídos por nós e nossa comunidade.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" className="rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 h-9 px-4 text-xs font-medium shadow-none">
                  Ver todos os modelos
                </Button>
                <Button variant="outline" className="rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-slate-700 dark:text-slate-300 h-9 px-4 text-xs font-medium shadow-none">
                  <Database className="h-4 w-4 mr-2" /> Biblioteca Oficial
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 lg:gap-6">

              {/* Template 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="h-48 bg-slate-50 dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
                  <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><BarChart className="h-7 w-7 text-slate-500" /></div>
                  <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><TrendingUp className="h-7 w-7 text-slate-500" /></div>
                </div>
                <div className="p-8">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Day Trade Starter</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-6 leading-relaxed">
                    O kit completo para day trade, com dashboards e tags essenciais rastreando scalpings, custos de corretagem e drawdowns diários.
                  </p>
                  <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 group-hover:text-emerald-500">
                    Ver Modelo <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Template 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="h-48 bg-slate-50 dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
                  <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><Calendar className="h-7 w-7 text-slate-500" /></div>
                  <Triangle className="h-14 w-14 text-slate-800 dark:text-slate-700 fill-current opacity-50" />
                </div>
                <div className="p-8">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Swing Trade Mastery</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-6 leading-relaxed">
                    Configuração otimizada para posições longas, acompanhamento de risco/retorno multi-semana e tags automáticas de análise fundamentalista.
                  </p>
                  <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 group-hover:text-emerald-500">
                    Ver Modelo <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Template 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="h-48 bg-slate-50 dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
                  <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><PieChart className="h-7 w-7 text-slate-500" /></div>
                  <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><LineChart className="h-7 w-7 text-slate-500" /></div>
                </div>
                <div className="p-8">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Métricas Quantitativas</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-6 leading-relaxed">
                    Template para relatórios profissionais avançados, focando em estatísticas complexas como Expectância Matemática, Sortino e Value at Risk (VaR).
                  </p>
                  <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 group-hover:text-emerald-500">
                    Ver Modelo <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Template 4 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="h-48 bg-slate-50 dark:bg-[#0b1220] border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
                  <div className="flex gap-2"><div className="h-6 w-6 rounded-md bg-slate-300 dark:bg-slate-700" /><div className="h-6 w-6 rounded-md bg-slate-300 dark:bg-slate-700" /></div>
                  <div className="h-14 w-14 rounded-full border-4 border-slate-300 dark:border-slate-700" />
                </div>
                <div className="p-8">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Setup Comportamental</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-6 leading-relaxed">
                    Focado no estudo Psicológico do trader. Avalie níveis de ansiedade pré-trade e descubra correlações ocultas de estresse com grandes prejuízos.
                  </p>
                  <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 group-hover:text-emerald-500">
                    Ver Modelo <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- FRAMEWORKS / INTEGRATIONS --- */}
        <section className="py-24 bg-white dark:bg-[#0b1220] text-center border-b border-slate-100 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">
              Integre com sua<br /> <span className="font-bold">plataforma favorita</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">100% cloud. Importe via CSV ou Connectors nativos.</p>
            <div className="flex justify-center flex-wrap gap-8 md:gap-12 mt-12 opacity-30 dark:opacity-40">
              <TrendingUp className="h-8 w-8" />
              <Database className="h-8 w-8" />
              <LineChart className="h-8 w-8" />
              <Zap className="h-8 w-8" />
              <Calendar className="h-8 w-8" />
              <Globe className="h-8 w-8" />
            </div>
          </div>
        </section>

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
                    <li key={j} className="text-[14px] text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition-colors">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 Leptoledo Capital. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div >
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const brokers = ["TradingView", "MetaTrader 5", "NinjaTrader", "Interactive Brokers", "Binance", "Bybit"]

const testimonials = [
  { handle: "@marcos_trade", content: "Uso o sistema de gestão há meses. Simplesmente o melhor tracker de emoções. Entender a correlação entre meu sono e Loss diário mudou meu game.", avatar: "MT" },
  { handle: "@julia_invest", content: "A API do sistema é fantástica. Consegui conectar meus robôs do MetaTrader 5 direto pro banco de dados em menos de 1 hora. Recomendo muito!", avatar: "JI" },
  { handle: "@dev_trader", content: "Primeira vez rodando localmente a plataforma e funcionou de primeira. A experiência de desenvolvedor (DX) é incrível.", avatar: "DT" },
  { handle: "@anna_fx", content: "Super rápido, parece muito leve. Foi muito fácil criar minhas regras de compliance para a minha mesa proprietária.", avatar: "AF" },
  { handle: "@felipe_pro", content: "As automações com Edge Functions para alertar limites de drawdown me salvaram mais de uma vez.", avatar: "FP" },
  { handle: "@lucas_quant", content: "Muito impressionado com a evolução. O que era apenas um diário virou uma infraestrutura completa para fundos quantitativos.", avatar: "LQ" },
  { handle: "@carol_swing", content: "Simplesmente incrível. A parte de acompanhar comportamentos pre-trade ajudou a corrigir meus piores gatilhos de overtrading.", avatar: "CS" },
  { handle: "@vitor_scalp", content: "É muito maneiro como conseguem manter tudo limpo mesmo com tantos dados. A importação em massa nunca travou uma vez.", avatar: "VS" },
  { handle: "@thiago_prop", content: "Iniciei minha mesa proprietária gerindo risco aqui. Nunca perdi 1 frame de atualização do Painel de Bordo.", avatar: "TP" },
  { handle: "@rafael_options", content: "Cálculos de payoff exatos. Nenhuma outra plataforma brasileira chega nesse nível de detalhe analítico e clean code.", avatar: "RO" }
]

const footerLinks = [
  { title: "Produto", links: ["Base de Dados", "Autenticação", "Edge Functions", "Storage", "Analytics", "Preços", "Changelog"] },
  { title: "Soluções", links: ["Day Trade", "Swing Trade", "Iniciantes", "Avançado", "Startups", "Agências"] },
  { title: "Recursos", links: ["Blog", "Suporte", "Status do Sistema", "Integrações", "Segurança"] },
  { title: "Desenvolvedores", links: ["Documentação", "API Reference", "Modelos", "Open Source", "Contribuir"] },
  { title: "Empresa", links: ["Sobre Nós", "Termos de Serviço", "Política de Privacidade", "Regras de Uso", "Contato"] }
]
