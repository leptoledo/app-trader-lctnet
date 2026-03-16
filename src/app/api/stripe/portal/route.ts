import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Fetch the stripe customer ID from our subscriptions table
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single()

        if (subError || !sub?.stripe_customer_id) {
            return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada para este usuário.' }, { status: 404 })
        }

        const stripe = getStripeClient()

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (err) {
        console.error('[STRIPE PORTAL ERROR]', err)
        const message = err instanceof Error ? err.message : 'Erro interno do servidor'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
