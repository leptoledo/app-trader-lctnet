"use client"

import { Notebook as NotebookIcon, Sparkles, Zap, ShieldCheck, ArrowLeft, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotebookPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-md h-10 w-10 bg-white dark:bg-[#0b1220] shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <Link href="/"><ArrowLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Notebook de Estratégias</h1>
                        </div>
                    </div>
                </div>

                {/* Content Section - Coming Soon Style */}
                <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="bg-white dark:bg-[#0b1220] p-12 md:p-16 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group text-center space-y-8">

                        <div className="inline-block relative">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-400 mx-auto">
                                <NotebookIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md p-1 shadow-sm">
                                <Construction className="h-3 w-3" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">
                                Em Desenvolvimento
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                                O seu novo hub de estratégias está sendo codificado.
                                <span className="block mt-1 text-slate-700 dark:text-slate-300">Previsão: Fase 2 Deployment.</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                            {[
                                { icon: Zap, title: "Playbook", desc: "Documente seus setups passo a passo" },
                                { icon: ShieldCheck, title: "Checklists", desc: "Validação antes de cada clique" },
                                { icon: Sparkles, title: "Revisão por IA", desc: "Sua estratégia auditada" }
                            ].map((feature, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-md border border-slate-200 dark:border-slate-800 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                                    <feature.icon className="h-5 w-5 text-slate-400 mb-3" />
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{feature.title}</p>
                                    <p className="text-xs text-slate-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Button className="h-10 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm px-8 shadow-sm transition-colors" asChild>
                                <Link href="/">Voltar ao Dashboard</Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
