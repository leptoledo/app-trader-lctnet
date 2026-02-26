"use client"

import { useState } from "react"
import { UploadCloud, CheckCircle2, MessageSquare, Send, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const dummyFeedbacks = [
    {
        id: 1,
        title: "ativos nao automaticos",
        description: "Quando insiro um ativo, nao me retorna automaticamente o nome do ativo.",
        priority: "media",
        status: "resolvido",
        hasImage: true,
        date: "23 de nov. de 2025, 14:04"
    },
    {
        id: 2,
        title: "Investimentos",
        description: "Quando insiro um ativo, nao me retorna automaticamente o nome do ativo.",
        priority: "media",
        status: "resolvido",
        hasImage: true,
        date: "23 de nov. de 2025, 13:58"
    }
]

export default function FeedbackPage() {
    const [file, setFile] = useState<File | null>(null)

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Feedback & Suporte</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Encontrou um erro? Conte-nos para que possamos melhorar sua experiência.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">

                {/* Left Column - Report Issue Form */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm max-w-2xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                                <Send className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Reportar Problema</CardTitle>
                                <CardDescription className="mt-1">
                                    Descreva o erro e envie uma captura de tela se possível
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-semibold">Título do Problema</Label>
                            <Input id="title" placeholder="Ex: Erro ao salvar transação" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-semibold">Descrição Detalhada</Label>
                            <Textarea
                                id="description"
                                placeholder="Descreva o erro em detalhes: o que você estava fazendo, o que esperava que acontecesse e o que realmente aconteceu..."
                                className="min-h-[140px] resize-y border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Prioridade</Label>
                            <Select defaultValue="media">
                                <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <SelectValue placeholder="Selecione a prioridade..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baixa">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                            Baixa - Sem impacto funcional
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="media">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            Média - Afeta funcionalidade
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="alta">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            Alta - Sistema indisponível
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Imagem do Erro (Opcional)</Label>
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400 dark:text-slate-500" />
                                    <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        Clique para fazer upload ou arraste a imagem
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                        PNG, JPG ou GIF (máx. 2MB)
                                    </p>
                                </div>
                                <input id="file-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </label>
                            {file && (
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {file.name} selecionado ({Math.round(file.size / 1024)} KB)
                                </div>
                            )}
                        </div>

                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11">
                            Enviar Feedback
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Column - User Feedbacks list */}
                <div className="space-y-6 w-full max-w-md xl:max-w-none">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0b1220] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
                            <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Seus Feedbacks</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe o status dos seus reports</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {dummyFeedbacks.map((fb) => (
                            <Card key={fb.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                                            {fb.title}
                                            {fb.priority === "media" && <span className="block w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5 shrink-0 shadow-[0_0_4px_rgba(245,158,11,0.5)]"></span>}
                                        </h4>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex shrink-0 shadow-none px-2 rounded-md">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Resolvido
                                        </Badge>
                                    </div>

                                    <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                                        {fb.description}
                                    </p>

                                    {fb.hasImage && (
                                        <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:text-blue-500 transition-colors">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Ver imagem anexada
                                        </div>
                                    )}

                                    <div className="mt-4 text-xs text-slate-400 dark:text-slate-500/80 font-medium">
                                        {fb.date}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
