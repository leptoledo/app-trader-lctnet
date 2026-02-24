import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCheckoutSession } from '@/lib/stripe';
import { PLANS, SubscriptionPlan } from '@/config/plans';

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { planId } = await req.json();
        const plan = PLANS[planId as SubscriptionPlan];

        if (!plan || !plan.stripePriceId) {
            return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
        }

        const session = await createCheckoutSession(user.id, user.email!, plan.stripePriceId);

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error('Checkout error:', err);
        const message = err instanceof Error ? err.message : 'Erro interno do servidor';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
