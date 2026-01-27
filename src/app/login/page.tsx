"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, TrendingUp, ArrowRight, Github, Mail } from "lucide-react"

export default function AuthPage() {
    const router = useRouter()
    const [view, setView] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast.success("Bem-vindo de volta! Carregando dashboard...")
                router.push('/dashboard')
                router.refresh()
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username },
                    },
                })
                if (error) throw error
                toast.success("Conta criada com sucesso! Verifique seu e-mail.")
                setView('login') // Switch to login after signup
            }
        } catch (error: any) {
            toast.error(error.message || "Ocorreu um erro. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen bg-[#f7f9fc] dark:bg-[#0b1220]">

            {/* --- LEFT SIDE (Form) --- */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f9fc] dark:bg-[#0b1220] transition-colors duration-500">
                <div className="mx-auto w-full max-w-sm space-y-8">

                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-center items-center">
                        <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-500/20">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                                Trader<span className="text-blue-600">LCTNET</span>
                            </span>
                        </Link>

                        <h1 className="text-3xl font-heading font-semibold tracking-tight text-slate-900 dark:text-white">
                            {view === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                            {view === 'login'
                                ? 'Insira seus dados para acessar sua estação de trading.'
                                : 'Comece a jornada para a consistência hoje.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-6">

                        {view === 'signup' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="username" className="text-slate-600 dark:text-slate-300 font-semibold">Nome de Usuário</Label>
                                <Input
                                    id="username"
                                    placeholder="TraderPro"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="h-11 bg-white/90 dark:bg-slate-900/50 border-slate-200"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 font-semibold">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-white/90 dark:bg-slate-900/50 border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 font-semibold">Senha</Label>
                                {view === 'login' && (
                                    <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                                        Esqueceu a senha?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-white/90 dark:bg-slate-900/50 border-slate-200"
                            />
                        </div>

                        <Button className="w-full h-11 text-base font-semibold bg-[#2b7de9] hover:bg-[#256bd1] shadow-lg shadow-blue-500/20" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {view === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'}
                        </Button>

                        {/* Social Dummy Buttons */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#f7f9fc] dark:bg-[#0b1220] px-2 text-slate-400">Ou continue com</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" type="button" disabled={loading} className="h-11 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 font-semibold">
                                <Github className="mr-2 h-4 w-4" /> Github
                            </Button>
                            <Button variant="outline" type="button" disabled={loading} className="h-11 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 font-semibold">
                                <Mail className="mr-2 h-4 w-4" /> Google
                            </Button>
                        </div>
                    </form>

                    {/* Toggle View */}
                    <div className="text-center text-sm">
                        {view === 'login' ? (
                            <p className="text-slate-500 dark:text-slate-400">
                                Não tem uma conta?{" "}
                                <button onClick={() => setView('signup')} className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all">
                                    Cadastre-se agora
                                </button>
                            </p>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">
                                Já tem uma conta?{" "}
                                <button onClick={() => setView('login')} className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all">
                                    Faça login
                                </button>
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* --- RIGHT SIDE (Image) --- */}
            <div className="hidden lg:block relative bg-[#0b1220] overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply z-10" />
                <Image
                    src="/images/auth-side-panel.png"
                    alt="Trading Flow State"
                    fill
                    className="object-cover opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-1000 md:scale-105"
                    priority
                    quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-20" />

                <div className="absolute bottom-0 left-0 p-12 z-30 max-w-xl">
                    <div className="h-1 w-12 bg-blue-500 mb-6 rounded-full" />
                    <blockquote className="space-y-2">
                        <p className="text-3xl font-heading font-medium text-white leading-relaxed">
                            "A disciplina é a ponte entre as metas e a realização. O TraderLCTNET me ajudou a cruzar essa ponte."
                        </p>
                        <footer className="pt-4">
                            <div className="text-base font-bold text-white">Ricardo S.</div>
                            <div className="text-sm text-blue-400 font-medium">Trader Profissional - Full Time</div>
                        </footer>
                    </blockquote>
                </div>
            </div>

        </div>
    )
}
