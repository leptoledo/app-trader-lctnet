import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createCheckoutSession } from '@/lib/stripe';
import { PLANS, SubscriptionPlan } from '@/config/plans';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        let supabase = await createSupabaseServerClient();
        
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            ) as any;
        }

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
