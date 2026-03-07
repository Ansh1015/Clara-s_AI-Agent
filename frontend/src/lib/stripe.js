import { loadStripe } from '@stripe/stripe-js'
import { api } from './api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

export const redirectToCheckout = async (userId) => {
    const response = await api.post('/api/create-checkout-session', {
        user_id: userId,
        price_id: 'price_xxxxx' // Placeholder for Pro plan price ID from Stripe
    })
    window.location.href = response.data.url
}
