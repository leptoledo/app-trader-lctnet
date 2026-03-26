"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                    Obrigado pelo seu depoimento!
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                    Sua mensagem foi recebida com sucesso. Ela passará por uma rápida revisão antes de ser exibida publicamente na nossa página principal.
                                </p>
                                <Button 
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                                >
                                    Voltar ao Dashboard
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                                        <MessageSquareHeart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Deixe sua Avaliação</h1>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Compartilhe sua experiência usando o Trader Journal com a comunidade.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nickname" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Como quer ser chamado? (Nickname)
                                        </Label>
                                        <Input
                                            id="nickname"
                                            placeholder="Ex: @trader_pro"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            required
                                            maxLength={30}
                                            className="h-12 bg-slate-50 dark:bg-[#060b13] border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Sua Avaliação
                                        </Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Conte como a plataforma tem ajudado nas suas operações diárias..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            rows={5}
                                            maxLength={500}
                                            className="resize-none bg-slate-50 dark:bg-[#060b13] border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 p-4"
                                        />
                                        <div className="flex justify-end text-xs text-slate-400 font-medium">
                                            {message.length} / 500
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={loading || !nickname || !message}
                                        className="w-full h-12 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                                            </>
                                        ) : (
                                            "Enviar Depoimento"
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
