import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCheckoutSession } from '@/lib/stripe';
import { PLANS, SubscriptionPlan } from '@/config/plans';

export async function POST(req: Request) {
    try {
        const { data: { user } } = await (supabase as any).auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { planId } = await req.json();
        const plan = PLANS[planId as SubscriptionPlan];

        if (!plan || !plan.stripePriceId) {
            return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
        }

        const session = await createCheckoutSession(user.id, user.email!, plan.stripePriceId);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
