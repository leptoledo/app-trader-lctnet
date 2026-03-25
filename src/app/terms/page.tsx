import Link from "next/link"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden pt-24 pb-16">
            <ScrollToTop />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors mb-12">
                    <ArrowLeft className="h-4 w-4" /> Voltar ao Início
                </Link>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold tracking-tight">Termos de Uso ("ToS")</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceitação</h2>
                    <p>Ao utilizar os sistemas, websites e serviços do Trader Journal, você concorda com nossos Termos de Uso. É requisito ter ao menos a maioridade legal de sua região e prover dados corretos durante o registro.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">2. Limitações de Responsabilidade</h2>
                    <p>O Trader Journal é uma infraestrutura educacional e de organização (Log), NÃO oferecemos recomendações de compra ou venda de ativos financeiros. Nossos indicadores tratam apenas métricas matemáticas e probabilidade de eventos passados anotados. **Aconselhamento Financeiro:** as simulações executadas aqui são puramente didáticas e não devem basear ordens irracionais no mercado real. Nós nos isentamos de quaisquer perdas originadas diretamente nos mercados.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">3. Pagamento e Estornos (Refunds)</h2>
                    <p>Nossos planos são cobrados antecipadamente de acordo com o intervalo escolhido (mensal/anual). Você poderá revogar ou rebaixar a assinatura a qualquer instante e manterá acesso ao modelo pelo período restante do contrato daquele mês. O cancelamento pode ser concluído pelo seu Gestor de Assinaturas (Powered by Stripe). Reembolsos após renovações efetuadas seguem os ditames do código do consumidor local, com devolução garantida para descadastros exigidos em até 7 dias úteis do primeiro pagamento faturado.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">4. Suspensão de Serviço</h2>
                    <p>O abuso do espaço de armazenamento com o uso do Supabase ou ações que configurem ataques e quebras nos serviços (scraps exaustivos, uso de bot no terminal de interface livre, falsificação de identidade para subornos) levará ao estorno da mensalidade com banimento permanente sumário na camada Cloud.</p>
                </div>
            </div>
        </div>
    )
}
