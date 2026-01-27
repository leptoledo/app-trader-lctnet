import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as any;
    const supabase = createSupabaseAdminClient();

    // Handle subscription success
    if (event.type === 'checkout.session.completed') {
        const subId = session.subscription as string;
        const subscription = (await stripe.subscriptions.retrieve(subId)) as any;
        const userId = session.metadata.userId;

        const { error } = await (supabase as any)
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subId,
                plan: session.amount_total > 2000 ? 'gold' : 'pro',
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            });

        if (error) console.error('DB Upsert Error:', error);
    }

    // Handle updates/cancellations
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;

        await (supabase as any)
            .from('subscriptions')
            .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
    }
    return NextResponse.json({ received: true });
}
