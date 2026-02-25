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
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b1220] p-8 transition-colors duration-500">
            <div className="max-w-4xl mx-auto w-full space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-[#0b1220] rounded-md flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800">
                            <BookOpen className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Diário de Trading</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsCreating(!isCreating)}
                            className={cn(
                                "h-10 px-4 rounded-md font-medium transition-colors shadow-sm",
                                isCreating
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-none border border-transparent"
                                    : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white"
                            )}
                        >
                            {isCreating ? 'Cancelar' : (
                                <><Plus className="h-4 w-4 mr-2" /> Nova Entrada</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Sub-Header Actions: Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-6 duration-500 delay-75">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
                        <Input
                            placeholder="Buscar pensamentos, setups ou lições..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] focus:ring-slate-900 dark:focus:ring-white font-medium text-sm shadow-sm"
                        />
                    </div>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500">
                        <Card className="rounded-md border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b1220] overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-slate-400" />
                                    <CardTitle className="text-lg font-medium text-slate-900 dark:text-white">Documentar Sessão</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Título da Reflexão</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Pós-Sessão NY: Controle Emocional"
                                            className="h-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium focus:ring-slate-900 dark:focus:ring-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Conteúdo & Análise Psicológica</label>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Descreve o racional, como se sentiu durante a operação, e o que aprendeu hoje..."
                                            className="min-h-[160px] rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium p-4 resize-y focus:ring-slate-900 dark:focus:ring-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Categorias (Tags)</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={tags}
                                                    onChange={(e) => setTags(e.target.value)}
                                                    placeholder="Separado por vírgula..."
                                                    className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium focus:ring-slate-900 dark:focus:ring-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Humor / Estado de Espírito</label>
                                            <div className="relative group">
                                                <Smile className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={mood}
                                                    onChange={(e) => setMood(e.target.value)}
                                                    placeholder="Ex: Confiante, Neutro, Eufórico"
                                                    className="h-10 pl-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium focus:ring-slate-900 dark:focus:ring-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm shadow-sm transition-colors">
                                        Salvar Registro
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Entries List */}
                <div className="space-y-6">
                    {filteredEntries.length === 0 ? (
                        <Card className="rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220]">
                            <CardContent className="p-16 text-center animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">
                                    Diário Vazio
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                                    Comece a documentar sua jornada. O registro consistente é chave para o aprendizado.
                                </p>
                                <Button onClick={() => setIsCreating(true)} className="h-10 px-6 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium text-sm shadow-sm transition-colors">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Registrar Sessão
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredEntries.map((entry, idx) => (
                                <Card
                                    key={entry.id}
                                    className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 group animate-in fade-in slide-in-from-bottom-4 duration-700"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <CardHeader className="p-6 pb-4">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                                        #{entry.id.slice(0, 4)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-widest font-medium">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl font-medium text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                                    {entry.title}
                                                </CardTitle>
                                            </div>

                                            {entry.mood && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium uppercase tracking-widest border border-slate-200 dark:border-slate-800">
                                                    {entry.mood.toLowerCase().includes('con') || entry.mood.toLowerCase().includes('pos') ? <Smile className="h-3 w-3 text-emerald-500" /> : entry.mood.toLowerCase().includes('fru') || entry.mood.toLowerCase().includes('neg') ? <Frown className="h-3 w-3 text-red-500" /> : <Meh className="h-3 w-3 text-slate-500" />}
                                                    {entry.mood}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                                            {entry.content}
                                        </p>

                                        {entry.tags.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                                <Tag className="h-3 w-3 text-slate-400" />
                                                {entry.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-medium uppercase tracking-widest"
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
