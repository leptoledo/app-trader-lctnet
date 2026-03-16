import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

function getPlanFromAmount(amount: number): 'pro' | 'gold' {
    // Gold plan is typically the higher priced one (e.g. > R$30 or > 3000 cents)
    return amount > 3000 ? 'gold' : 'pro'
}

export async function POST(req: Request) {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
        const stripe = getStripeClient()
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[WEBHOOK SIGNATURE ERROR]', message)
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    const stripe = getStripeClient()

    console.log(`[STRIPE WEBHOOK] Received: ${event.type}`)

    // ── checkout.session.completed ────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const subId = session.subscription as string
        const userId = session.metadata?.userId

        if (!userId || !subId) {
            console.error('[WEBHOOK] Missing userId or subId in checkout session', { userId, subId })
            return NextResponse.json({ received: true })
        }

        const subscription = await stripe.subscriptions.retrieve(subId)
        const priceAmount = subscription.items.data[0]?.price?.unit_amount ?? 0
        const plan = getPlanFromAmount(priceAmount)

        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subId,
                plan,
                status: 'active',
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
            }, { onConflict: 'user_id' })

        if (error) console.error('[WEBHOOK DB ERROR - checkout]', error)
        else console.log(`[WEBHOOK] ✅ User ${userId} activated plan: ${plan}`)
    }

    // ── customer.subscription.updated ─────────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription
        const priceAmount = subscription.items.data[0]?.price?.unit_amount ?? 0
        const plan = getPlanFromAmount(priceAmount)

        const { error } = await supabase
            .from('subscriptions')
            .update({
                plan,
                status: subscription.status,
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

        if (error) console.error('[WEBHOOK DB ERROR - updated]', error)
        else console.log(`[WEBHOOK] ✅ Subscription ${subscription.id} updated: status=${subscription.status}, plan=${plan}`)
    }

    // ── customer.subscription.deleted ─────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

        if (error) console.error('[WEBHOOK DB ERROR - deleted]', error)
        else console.log(`[WEBHOOK] ✅ Subscription ${subscription.id} canceled`)
    }

    // ── invoice.payment_failed ─────────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as any).subscription as string

        if (subId) {
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: 'past_due' })
                .eq('stripe_subscription_id', subId)

            if (error) console.error('[WEBHOOK DB ERROR - payment_failed]', error)
            else console.log(`[WEBHOOK] ⚠️ Payment failed for subscription ${subId}`)
        }
    }

    return NextResponse.json({ received: true })
}
