import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
    appInfo: {
        name: 'Trader Journal SaaS',
        version: '1.0.0'
    }
});

export async function createCheckoutSession(userId: string, userEmail: string, priceId: string) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancel`,
            metadata: {
                userId: userId,
            },
        });

        return session;
    } catch (error) {
        console.error('Stripe Session Error:', error);
        throw error;
    }
}
