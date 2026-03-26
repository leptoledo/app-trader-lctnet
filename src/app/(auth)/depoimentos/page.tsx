"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, MessageSquareHeart, CheckCircle2 } from "lucide-react"

export default function DepoimentosPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [session, setSession] = useState<any>(null)

    const [nickname, setNickname] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (!data.session) {
                router.push('/login?callbackUrl=/depoimentos')
                return
            }
            setSession(data.session)
            
            // Try to pre-fill nickname
            const userMeta = data.session.user.user_metadata
            if (userMeta?.username) {
                setNickname(userMeta.username)
            } else if (userMeta?.name) {
                setNickname(userMeta.name)
            } else if (data.session.user.email) {
                setNickname(data.session.user.email.split('@')[0])
            }
            
            // Check if user already submitted a testimonial today
            const { data: existingTestimonial } = await supabase
                .from('testimonials')
                .select('*')
                .eq('user_id', data.session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (existingTestimonial && existingTestimonial.length > 0) {
                // we can let them know or just allow them to submit another
            }

            setFetching(false)
        }
        checkSession()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nickname.trim() || !message.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase.from('testimonials').insert({
                user_id: session.user.id,
                nickname: nickname,
                message: message,
                rating: 5, // Default to 5 stars for now
            })

            if (error) throw error

            setSubmitted(true)
            toast.success("Depoimento enviado com sucesso! Ele será analisado.")
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar depoimento. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500 min-h-[calc(100vh-64px)]">
            <div className="max-w-3xl mx-auto w-full mt-8 md:mt-12">
                
                {submitted ? (
                    <Card className="py-20 rounded-xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800/60 text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                        <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">
                            Comunidade Agradece!
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
                            Sua experiência foi registrada e agora fará parte da página oficial do Trader Journal.
                        </p>
                        <Button 
                            onClick={() => router.push('/dashboard')}
                            className="h-10 px-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-none"
                        >
                            Voltar ao Dashboard
                        </Button>
                    </Card>
                ) : (
                    <Card className="rounded-xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                        
                        <div className="p-8 sm:p-10">
                            <div className="flex items-start gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
                                    <MessageSquareHeart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="pt-1">
                                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Deixe sua Avaliação</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Compartilhe sua experiência usando o Trader Journal com a comunidade.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="nickname" className="text-sm font-medium text-slate-900 dark:text-slate-300">
                                        Como quer ser chamado? (Nickname)
                                    </Label>
                                    <Input
                                        id="nickname"
                                        placeholder="Ex: @trader_pro"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        required
                                        maxLength={30}
                                        className="h-11 rounded-lg bg-slate-50 dark:bg-[#060b13] border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 text-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="message" className="text-sm font-medium text-slate-900 dark:text-slate-300">
                                        Sua Avaliação
                                    </Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Conte como a plataforma tem ajudado nas suas operações diárias..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        maxLength={500}
                                        className="resize-none rounded-lg bg-slate-50 dark:bg-[#060b13] border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 p-4 text-sm"
                                    />
                                    <div className="flex justify-end text-xs text-slate-400 font-medium">
                                        {message.length} / 500
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={loading || !nickname || !message}
                                    className="w-full h-11 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-none transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando
                                        </>
                                    ) : (
                                        "Enviar Depoimento"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
