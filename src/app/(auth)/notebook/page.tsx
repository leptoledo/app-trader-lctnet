"use client"

import { Notebook as NotebookIcon, Sparkles, Zap, ShieldCheck, ArrowLeft, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotebookPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-5xl mx-auto w-full space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" asChild className="rounded-lg h-12 w-12 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                            <Link href="/"><ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Base de Conhecimento</p>
                            <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-white tracking-tight">Notebook de Estratégias</h1>
                        </div>
                    </div>
                </div>

                {/* Content Section - Coming Soon Style */}
                <div className="max-w-4xl mx-auto pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-16 rounded-[4rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl relative overflow-hidden group">

                        {/* Interactive Background Glows */}
                        <div className="absolute top-0 right-0 p-40 bg-blue-500/10 rounded-lg blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-1000 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/10 rounded-lg blur-3xl -ml-16 -mb-16 pointer-events-none" />

                        <div className="relative z-10 text-center space-y-10">

                            <div className="inline-block relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/30 transform rotate-3 group-hover:rotate-0 transition-all duration-700">
                                    <NotebookIcon className="h-10 w-10 fill-white/10" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-lg p-1.5 shadow-lg animate-bounce">
                                    <Construction className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-heading font-semibold text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                                    Em <span className="text-blue-500 dark:text-blue-400">Desenvolvimento</span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg max-w-lg mx-auto leading-relaxed">
                                    O seu novo hub de estratégias está sendo codificado.
                                    <span className="block mt-2 font-semibold text-slate-800 dark:text-slate-200">Previsão: Fase 2 Deployment.</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
                                {[
                                    { icon: Zap, title: "Playbook", desc: "Documente seus setups passo a passo" },
                                    { icon: ShieldCheck, title: "Checklists", desc: "Validação antes de cada clique" },
                                    { icon: Sparkles, title: "Revisão por IA", desc: "Sua estratégia auditada por IA" }
                                ].map((feature, i) => (
                                    <div key={i} className="bg-white/90 dark:bg-slate-950/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 transition-all hover:border-blue-500/30 group/item">
                                        <feature.icon className="h-6 w-6 text-blue-500 mb-4 transition-transform group-hover/item:scale-110" />
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase mb-1 tracking-widest">{feature.title}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <Button className="h-16 rounded-[2rem] bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold uppercase text-xs tracking-[0.2em] px-12 transition-all hover:-translate-y-1 active:scale-95 shadow-xl" asChild>
                                <Link href="/">Voltar ao Dashboard</Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
