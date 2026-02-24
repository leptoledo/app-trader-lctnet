"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Plus, Search, Calendar, Tag, Smile, Frown, Meh, ArrowLeft, MessageSquare, Sparkles, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface JournalEntry {
    id: string
    title: string
    content: string
    tags: string[]
    mood?: string
    created_at: string
    updated_at: string
}

export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Form state
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState("")
    const [mood, setMood] = useState("")

    useEffect(() => {
        fetchEntries()
    }, [])

    async function fetchEntries() {
        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setEntries((data || []) as JournalEntry[])
        } catch (error: any) {
            toast.error('Erro ao carregar entradas: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!title.trim() || !content.trim()) {
            toast.error('Título e conteúdo são obrigatórios')
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Não autenticado')

            const { error } = await supabase
                .from('journal_entries')
                .insert({
                    user_id: user.id,
                    title: title.trim(),
                    content: content.trim(),
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    mood: mood.trim() || null
                })

            if (error) throw error

            toast.success('Entrada criada com sucesso!')
            setTitle("")
            setContent("")
            setTags("")
            setMood("")
            setIsCreating(false)
            fetchEntries()
        } catch (error: any) {
            toast.error('Erro ao criar entrada: ' + error.message)
        }
    }

    const filteredEntries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020617] p-8 transition-colors duration-500">
            <div className="max-w-5xl mx-auto w-full space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">Mentalidade</p>
                            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Diário de Trading</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsCreating(!isCreating)}
                            className={cn(
                                "h-12 px-6 rounded-xl font-bold transition-all shadow-lg",
                                isCreating
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-none"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                            )}
                        >
                            {isCreating ? 'Cancelar' : (
                                <><Plus className="h-5 w-5 mr-2" /> Nova Entrada</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Sub-Header Actions: Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-6 duration-500 delay-75">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Buscar pensamentos, setups ou lições..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 rounded-[1.25rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm focus:ring-blue-500 font-medium text-sm shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-[1.25rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                        <Filter className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>

                {/* Create Form - Glassmorphism Card */}
                {isCreating && (
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                        <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-xl font-heading font-bold text-slate-900 dark:text-white">Documentar Sessão</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Título da Reflexão</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Pós-Sessão NY: Controle Emocional"
                                            className="h-14 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-bold focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Conteúdo & Análise Psicológica</label>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Descreve o racional, como se sentiu durante o drawdown, e o que aprendeu hoje..."
                                            className="min-h-[200px] rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-medium p-6 resize-none focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Categorias (Tags)</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={tags}
                                                    onChange={(e) => setTags(e.target.value)}
                                                    placeholder="Separado por vírgula..."
                                                    className="h-14 pl-12 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-bold focus:ring-blue-500 placeholder:font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Humor / Estado de Espírito</label>
                                            <div className="relative group">
                                                <Smile className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={mood}
                                                    onChange={(e) => setMood(e.target.value)}
                                                    placeholder="Ex: Confiante, Neutro, Eufórico"
                                                    className="h-14 pl-12 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 font-bold focus:ring-blue-500 placeholder:font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                        SALVAR REGISTRO NO DIÁRIO
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Entries List */}
                <div className="space-y-6">
                    {filteredEntries.length === 0 ? (
                        <Card className="rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
                            <CardContent className="p-20 text-center animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                                    Diário Vazio
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm mx-auto">
                                    Comece a documentar sua jornada. O sucesso no trading é 90% mental.
                                </p>
                                <Button onClick={() => setIsCreating(true)} className="h-14 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Escrever minha primeira lição
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredEntries.map((entry, idx) => (
                                <Card
                                    key={entry.id}
                                    className="rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-900/60 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-slate-900/40 backdrop-blur-sm group animate-in fade-in slide-in-from-bottom-8 duration-700"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">
                                                        #{entry.id.slice(0, 4)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {entry.title}
                                                </CardTitle>
                                            </div>

                                            {entry.mood && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700/50">
                                                    {entry.mood.toLowerCase().includes('con') || entry.mood.toLowerCase().includes('pos') ? <Smile className="h-3.5 w-3.5 text-emerald-500" /> : entry.mood.toLowerCase().includes('fru') || entry.mood.toLowerCase().includes('neg') ? <Frown className="h-3.5 w-3.5 text-red-500" /> : <Meh className="h-3.5 w-3.5 text-blue-500" />}
                                                    {entry.mood}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                                            {entry.content}
                                        </p>

                                        {entry.tags.length > 0 && (
                                            <div className="flex items-center gap-3 flex-wrap pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                                <Tag className="h-3.5 w-3.5 text-slate-400" />
                                                {entry.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/30 hover:text-blue-500 transition-colors cursor-default"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
