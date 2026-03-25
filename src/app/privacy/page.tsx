import Link from "next/link"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden pt-24 pb-16">
            <ScrollToTop />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors mb-12">
                    <ArrowLeft className="h-4 w-4" /> Voltar ao Início
                </Link>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">1. Coleta de Dados</h2>
                    <p>O Trader Journal coleta informações pessoais básicas no cadastro (nome, e-mail) e armazena os registros de operações (trades) inseridos por você. Os dados transitam criptografados e são restritos à sua visualização pela camada de RLS do Supabase.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">2. Uso das Informações</h2>
                    <p>Nós utilizamos os dados das suas operações unicamente para gerar as métricas e estatísticas presentes no seu dashboard. Nenhuma informação confidencial de operações será vendida ou compartilhada com terceiros para fins publicitários sem consentimento explícito.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">3. Pagamentos via Stripe</h2>
                    <p>Ao realizar upgrade para um plano pago, todas as transações financeiras são diretamente processadas e armazenadas no portal de pagamentos Stripe. O Trader Journal não armazena dados inteiros de cartões de crédito, apenas tokens seguros de estado da assinatura (plano ativo ou desativado).</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">4. Seus Direitos</h2>
                    <p>Você pode excluir sua conta permanentemente, junto com a deleção de todos os dados de "trades", acessando as configurações ou solicitando suporte.</p>

                    <p className="mt-8 text-sm text-slate-500">
                        Esta é uma política de privacidade em construção provisória exigida pelos intermediários financeiros para lançamento inicial (Go-live).
                    </p>
                </div>
            </div>
        </div>
    )
}
