import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        throw new Error('Missing STRIPE_SECRET_KEY');
    }
    if (!stripeClient) {
        stripeClient = new Stripe(apiKey, {
            apiVersion: '2023-10-16' as any,
            appInfo: {
                name: 'Trader Journal SaaS',
                version: '1.0.0'
            }
        });
    }
    return stripeClient;
};

export async function createCheckoutSession(userId: string, userEmail: string, priceId: string) {
    try {
    const stripe = getStripeClient();
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
