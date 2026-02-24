import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Handle subscription success
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripe = getStripeClient();
        const subId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = session.metadata?.userId;

        if (userId) {
            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subId,
                    plan: (session.amount_total ?? 0) > 2000 ? 'gold' : 'pro',
                    status: 'active',
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
                });

            if (error) console.error('DB Upsert Error:', error);
        }
    }

    // Handle updates/cancellations
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
            .from('subscriptions')
            .update({
                status: subscription.status,
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
    }
    return NextResponse.json({ received: true });
}
