"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Save, Layout, Edit, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveLandingSectionAction, fetchAllLandingSectionsAction } from "@/app/actions/landingAdminAction"

export default function LandingAdminPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)

    // Form states
    const [heroData, setHeroData] = useState({
        title: "Opere com disciplina\nLucros reais a longo prazo",
        subtitle: "A plataforma de desenvolvimento para traders profissionais. Registre entradas, crie regras de compliance e alcance a consistência com análises avançadas do seu histórico operacional.",
        primaryBtnText: "Criar conta gratuita",
        primaryBtnLink: "/login",
        secondaryBtnText: "Ver Demonstração",
        secondaryBtnLink: "/dashboard?demo=true",
        brokersText: "Compatível com as principais plataformas mundiais"
    })

    const [featuresData, setFeaturesData] = useState({
        sectionLabel: "Traders de Alta Frequência",
        sectionTitle: "Utilizado pelas mentes mais inovadoras do mercado.",
        buttonText: "Ver histórias completas",
        item1Title: "Importação Automática",
        item1Desc: "Conecte sua conta e deixe que nossa infraestrutura importe seu histórico automaticamente. Todo projeto ganha um banco de dados completo e criptografado para o seu registro de operações.",
        item2Title: "Risco & Compliance",
        item2Desc: "Defina limites de rebaixamento e bloqueie overtrading. Securing your equity with rules.",
        item3Title: "Análise Psicológica",
        item3Desc: "Cruze seus dados financeiros com seu estado emocional. Descubra quais emoções custam mais caro.",
        item4Title: "Playbook Digital",
        item4Desc: "Capture evidências de tela dos seus setups. Multi-upload images to store and review scenarios.",
        item5Title: "Data & Backtesting",
        item5Desc: "Expectativa matemática real. Instant ready-to-use insights sobre performance."
    })

    const [footerData, setFooterData] = useState({
        col1Title: "Produto",
        col1Links: "Base de Dados\nAutenticação\nEdge Functions\nStorage\nAnalytics\nPreços\nChangelog",
        col2Title: "Soluções",
        col2Links: "Day Trade\nSwing Trade\nIniciantes\nAvançado\nStartups\nAgências",
        col3Title: "Recursos",
        col3Links: "Blog\nSuporte\nStatus do Sistema\nIntegrações\nSegurança",
        col4Title: "Desenvolvedores",
        col4Links: "Documentação\nAPI Reference\nModelos\nOpen Source\nContribuir",
        col5Title: "Empresa",
        col5Links: "Sobre Nós\nTermos de Serviço\nPolítica de Privacidade\nRegras de Uso\nContato"
    })

    useEffect(() => {
        async function loadContent() {
            setLoading(true)
            const result = await fetchAllLandingSectionsAction()
            if (result.success && result.data.length > 0) {
                // Find hero
                const heroSection = result.data.find((s: any) => s.section_id === 'hero')
                if (heroSection && heroSection.draft_content && Object.keys(heroSection.draft_content).length > 0) {
                    setHeroData(heroSection.draft_content)
                }
                // Find features
                const featuresSection = result.data.find((s: any) => s.section_id === 'features')
                if (featuresSection && featuresSection.draft_content && Object.keys(featuresSection.draft_content).length > 0) {
                    setFeaturesData(featuresSection.draft_content)
                }
                // Find footer
                const footerSection = result.data.find((s: any) => s.section_id === 'footer')
                if (footerSection && footerSection.draft_content && Object.keys(footerSection.draft_content).length > 0) {
                    setFooterData(footerSection.draft_content)
                }
            }
            setLoading(false)
        }
        loadContent()
    }, [])

    const handleSave = async (status: 'draft' | 'published', section: string) => {
        if (status === 'draft') setSaving(true)
        else setPublishing(true)

        const sessionData = await supabase.auth.getSession()
        const accessToken = sessionData.data.session?.access_token || null

        if (!accessToken) {
            toast.error("Não autorizado")
            if (status === 'draft') setSaving(false)
            else setPublishing(false)
            return
        }

        const dataToSave = section === 'hero' ? heroData : section === 'features' ? featuresData : footerData;
        const result = await saveLandingSectionAction(section, dataToSave, status, accessToken)
        
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }

        if (status === 'draft') setSaving(false)
        else setPublishing(false)
    }

    const handleHeroChange = (field: string, value: string) => {
        setHeroData(prev => ({ ...prev, [field]: value }))
    }

    const handleFeaturesChange = (field: string, value: string) => {
        setFeaturesData(prev => ({ ...prev, [field]: value }))
    }

    const handleFooterChange = (field: string, value: string) => {
        setFooterData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <Layout className="h-8 w-8 text-emerald-500" />
                    Conteúdo da Landing Page
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Edite os textos, imagens e seções da página principal do sistema.
                </p>
            </div>

            {loading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <Tabs defaultValue="hero" className="w-full">
                    <TabsList className="mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <TabsTrigger value="hero" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Hero Section</TabsTrigger>
                        <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Recursos</TabsTrigger>
                        <TabsTrigger value="footer" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Rodapé</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="space-y-6">
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit className="h-5 w-5 text-emerald-500" />
                                Textos Principais
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Título Principal (Hero)</Label>
                                    <Textarea 
                                        className="mt-1.5 resize-none h-20"
                                        placeholder="Opere com disciplina..."
                                        value={heroData.title}
                                        onChange={(e) => handleHeroChange("title", e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Dica: use Enter para quebra de linha.</p>
                                </div>
                                
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Subtítulo</Label>
                                    <Textarea 
                                        className="mt-1.5 h-24"
                                        placeholder="A plataforma de desenvolvimento para traders..."
                                        value={heroData.subtitle}
                                        onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Botão Primário (Texto)</Label>
                                        <Input 
                                            className="mt-1.5"
                                            value={heroData.primaryBtnText}
                                            onChange={(e) => handleHeroChange("primaryBtnText", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Botão Primário (Link)</Label>
                                        <Input 
                                            className="mt-1.5"
                                            value={heroData.primaryBtnLink}
                                            onChange={(e) => handleHeroChange("primaryBtnLink", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Botão Secundário (Texto)</Label>
                                        <Input 
                                            className="mt-1.5"
                                            value={heroData.secondaryBtnText}
                                            onChange={(e) => handleHeroChange("secondaryBtnText", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Botão Secundário (Link)</Label>
                                        <Input 
                                            className="mt-1.5"
                                            value={heroData.secondaryBtnLink}
                                            onChange={(e) => handleHeroChange("secondaryBtnLink", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Label className="text-slate-700 dark:text-slate-300">Texto das Corretoras</Label>
                                <Input 
                                    className="mt-1.5"
                                    value={heroData.brokersText}
                                    onChange={(e) => handleHeroChange("brokersText", e.target.value)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    onClick={() => handleSave("draft", "hero")} 
                                    disabled={saving || publishing}
                                    variant="outline"
                                    className="w-full sm:w-auto md:w-[200px]"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                                    Salvar Rascunho
                                </Button>
                                <Button 
                                    onClick={() => handleSave("published", "hero")} 
                                    disabled={saving || publishing}
                                    className="w-full sm:w-auto md:w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : "Publicar Alterações"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-6">
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit className="h-5 w-5 text-emerald-500" />
                                Cabeçalho da Seção de Recursos
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Rótulo Superior (Label)</Label>
                                    <Input 
                                        className="mt-1.5"
                                        value={featuresData.sectionLabel}
                                        onChange={(e) => handleFeaturesChange("sectionLabel", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Botão (Texto)</Label>
                                    <Input 
                                        className="mt-1.5"
                                        value={featuresData.buttonText}
                                        onChange={(e) => handleFeaturesChange("buttonText", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-slate-700 dark:text-slate-300">Título da Seção</Label>
                                    <Input 
                                        className="mt-1.5 font-medium text-lg"
                                        value={featuresData.sectionTitle}
                                        onChange={(e) => handleFeaturesChange("sectionTitle", e.target.value)}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Caixas de Funcionalidades (Bento Grid)</h2>

                            <div className="space-y-6">
                                {/* Feature 1 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">1. Box Principal</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label>Título</Label>
                                            <Input className="mt-1.5" value={featuresData.item1Title} onChange={(e) => handleFeaturesChange("item1Title", e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Descrição</Label>
                                            <Textarea className="mt-1.5 h-16" value={featuresData.item1Desc} onChange={(e) => handleFeaturesChange("item1Desc", e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Features 2 & 3 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">2. Risco & Compliance</h3>
                                        <Label>Título</Label><Input value={featuresData.item2Title} onChange={(e) => handleFeaturesChange("item2Title", e.target.value)} />
                                        <Label>Descrição</Label><Textarea className="h-16" value={featuresData.item2Desc} onChange={(e) => handleFeaturesChange("item2Desc", e.target.value)} />
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">3. Psicológico</h3>
                                        <Label>Título</Label><Input value={featuresData.item3Title} onChange={(e) => handleFeaturesChange("item3Title", e.target.value)} />
                                        <Label>Descrição</Label><Textarea className="h-16" value={featuresData.item3Desc} onChange={(e) => handleFeaturesChange("item3Desc", e.target.value)} />
                                    </div>
                                </div>

                                {/* Features 4 & 5 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">4. Playbook</h3>
                                        <Label>Título</Label><Input value={featuresData.item4Title} onChange={(e) => handleFeaturesChange("item4Title", e.target.value)} />
                                        <Label>Descrição</Label><Textarea className="h-16" value={featuresData.item4Desc} onChange={(e) => handleFeaturesChange("item4Desc", e.target.value)} />
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">5. Backtest</h3>
                                        <Label>Título</Label><Input value={featuresData.item5Title} onChange={(e) => handleFeaturesChange("item5Title", e.target.value)} />
                                        <Label>Descrição</Label><Textarea className="h-16" value={featuresData.item5Desc} onChange={(e) => handleFeaturesChange("item5Desc", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    onClick={() => handleSave("draft", "features")} 
                                    disabled={saving || publishing}
                                    variant="outline"
                                    className="w-full sm:w-auto md:w-[200px]"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                                    Salvar Rascunho
                                </Button>
                                <Button 
                                    onClick={() => handleSave("published", "features")} 
                                    disabled={saving || publishing}
                                    className="w-full sm:w-auto md:w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : "Publicar Alterações"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="footer" className="space-y-6">
                        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit className="h-5 w-5 text-emerald-500" />
                                Colunas do Rodapé
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Preencha o título de cada coluna e abaixo defina os links separados por uma quebra de linha (tecle Enter em cada link). Os destinos dos links do sistema (Preços, Blog, etc) são resolvidos automaticamente.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Col 1 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label>Coluna 1 - Título</Label>
                                    <Input value={footerData.col1Title} onChange={(e) => handleFooterChange("col1Title", e.target.value)} />
                                    <Label>Links (um por linha)</Label>
                                    <Textarea className="h-32" value={footerData.col1Links} onChange={(e) => handleFooterChange("col1Links", e.target.value)} />
                                </div>
                                {/* Col 2 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label>Coluna 2 - Título</Label>
                                    <Input value={footerData.col2Title} onChange={(e) => handleFooterChange("col2Title", e.target.value)} />
                                    <Label>Links (um por linha)</Label>
                                    <Textarea className="h-32" value={footerData.col2Links} onChange={(e) => handleFooterChange("col2Links", e.target.value)} />
                                </div>
                                {/* Col 3 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label>Coluna 3 - Título</Label>
                                    <Input value={footerData.col3Title} onChange={(e) => handleFooterChange("col3Title", e.target.value)} />
                                    <Label>Links (um por linha)</Label>
                                    <Textarea className="h-32" value={footerData.col3Links} onChange={(e) => handleFooterChange("col3Links", e.target.value)} />
                                </div>
                                {/* Col 4 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label>Coluna 4 - Título</Label>
                                    <Input value={footerData.col4Title} onChange={(e) => handleFooterChange("col4Title", e.target.value)} />
                                    <Label>Links (um por linha)</Label>
                                    <Textarea className="h-32" value={footerData.col4Links} onChange={(e) => handleFooterChange("col4Links", e.target.value)} />
                                </div>
                                {/* Col 5 */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                    <Label>Coluna 5 - Título</Label>
                                    <Input value={footerData.col5Title} onChange={(e) => handleFooterChange("col5Title", e.target.value)} />
                                    <Label>Links (um por linha)</Label>
                                    <Textarea className="h-32" value={footerData.col5Links} onChange={(e) => handleFooterChange("col5Links", e.target.value)} />
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    onClick={() => handleSave("draft", "footer")} 
                                    disabled={saving || publishing}
                                    variant="outline"
                                    className="w-full sm:w-auto md:w-[200px]"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                                    Salvar Rascunho
                                </Button>
                                <Button 
                                    onClick={() => handleSave("published", "footer")} 
                                    disabled={saving || publishing}
                                    className="w-full sm:w-auto md:w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : "Publicar Alterações"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
