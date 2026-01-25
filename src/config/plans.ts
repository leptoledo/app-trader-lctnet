export type SubscriptionPlan = 'free' | 'pro' | 'gold';

export interface PlanConfig {
    id: SubscriptionPlan;
    name: string;
    price: number;
    stripePriceId?: string;
    features: string[];
    limits: {
        tradesPerMonth: number;
        accounts: number;
        historyMonths: number;
    };
}

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        features: [
            'Até 50 trades por mês',
            'Apenas 1 conta de trading',
            'Histórico de 3 meses',
            'Dashboard básico',
            'Comunidade (apenas leitura)'
        ],
        limits: {
            tradesPerMonth: 50,
            accounts: 1,
            historyMonths: 3
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 19,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        features: [
            'Trades ilimitados',
            'Até 3 contas de trading',
            'Histórico de 2 anos',
            'Compartilhamento social',
            'Import automático (CSV)',
            'Analytics avançado'
        ],
        limits: {
            tradesPerMonth: 999999,
            accounts: 3,
            historyMonths: 24
        }
    },
    gold: {
        id: 'gold',
        name: 'Ouro',
        price: 49,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID,
        features: [
            'Tudo do Pro',
            'Contas ilimitadas',
            'Histórico vitalício',
            'Acesso antecipado a API',
            'Sinais exclusivos',
            'Suporte prioritário (VIP)'
        ],
        limits: {
            tradesPerMonth: 999999,
            accounts: 99,
            historyMonths: 999
        }
    }
};
