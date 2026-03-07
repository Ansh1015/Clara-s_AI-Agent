import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Pricing() {
    const prefersReducedMotion = useReducedMotion()
    const [hoveredCard, setHoveredCard] = useState(null)
    const [hoveredBtn, setHoveredBtn] = useState(null)

    const faqs = [
        {
            q: "Is the free tier really free forever?",
            a: "Yes. No credit card required. 2 pipeline runs per month always free."
        },
        {
            q: "What happens when I hit the free limit?",
            a: "You will see an upgrade prompt. Your existing configs are never deleted."
        },
        {
            q: "Can I cancel Pro anytime?",
            a: "Yes. Cancel anytime from your dashboard with no questions asked."
        },
        {
            q: "Do I need a Retell AI account?",
            a: "No. Clara AI handles the Retell integration for you on Pro tier."
        },
        {
            q: "What payment methods do you accept?",
            a: "All major credit cards via Stripe. Payments are secure and encrypted."
        }
    ]

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white pt-[40px] pb-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%)",
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg text-slate-400">Start free. No credit card required. Upgrade when you're ready.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
                    {/* Free Card */}
                    <div
                        onMouseEnter={() => setHoveredCard('free')}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="bg-white/5 backdrop-blur-[20px] rounded-2xl p-8 flex flex-col h-full border"
                        style={{
                            background: hoveredCard === 'free' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                            transform: hoveredCard === 'free' ? 'translateY(-8px)' : 'translateY(0px)',
                            border: hoveredCard === 'free' ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: hoveredCard === 'free' ? '0 20px 40px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-2">FREE</h2>
                            <div className="text-4xl font-bold mb-2">$0 <span className="text-lg text-slate-400 font-normal">/ month</span></div>
                            <p className="text-slate-400 text-sm">Perfect for testing</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {["2 pipeline runs per month", "Download agent config files", "Supabase storage included", "View changelog and diff", "Community support"].map((feat, i) => (
                                <li key={i} className="flex gap-3 text-slate-300">
                                    <Check className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onMouseEnter={() => setHoveredBtn('free')}
                            onMouseLeave={() => setHoveredBtn(null)}
                            className="w-full block text-center rounded-lg font-medium"
                            style={{
                                background: hoveredBtn === 'free' ? '#3B82F6' : 'transparent',
                                border: hoveredBtn === 'free' ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: hoveredBtn === 'free' ? '0 0 20px rgba(59,130,246,0.4)' : 'none',
                                color: 'white',
                                padding: '14px 24px',
                                transform: hoveredBtn === 'free' ? 'translateY(-1px)' : 'translateY(0px)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => window.location.href = '/login'}
                        >
                            Start Free
                        </button>
                    </div>

                    {/* Pro Card */}
                    <div
                        onMouseEnter={() => setHoveredCard('pro')}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="bg-white/5 backdrop-blur-[20px] rounded-2xl p-8 flex flex-col h-full relative border"
                        style={{
                            background: hoveredCard === 'pro' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                            transform: hoveredCard === 'pro' ? 'translateY(-8px)' : 'translateY(0px)',
                            border: hoveredCard === 'pro' ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: hoveredCard === 'pro' ? '0 20px 40px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg shadow-blue-500/30">Most Popular</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-2">PRO</h2>
                            <div className="text-4xl font-bold mb-2">$49 <span className="text-lg text-slate-400 font-normal">/ month</span></div>
                            <p className="text-slate-400 text-sm">For serious businesses</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {["Unlimited pipeline runs", "Live Retell AI deployment", "Phone number provisioning", "Agent answers real calls 24/7", "Priority Mistral processing", "Email support", "Full version history"].map((feat, i) => (
                                <li key={i} className="flex gap-3 text-white">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onMouseEnter={() => setHoveredBtn('pro')}
                            onMouseLeave={() => setHoveredBtn(null)}
                            className="w-full block text-center rounded-lg font-medium"
                            style={{
                                background: hoveredBtn === 'pro' ? '#3B82F6' : 'transparent',
                                border: hoveredBtn === 'pro' ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.2)',
                                boxShadow: hoveredBtn === 'pro' ? '0 0 20px rgba(59,130,246,0.4)' : 'none',
                                color: 'white',
                                padding: '14px 24px',
                                transform: hoveredBtn === 'pro' ? 'translateY(-1px)' : 'translateY(0px)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => window.location.href = '/login'}
                        >
                            Upgrade to Pro →
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{faq.q}</h3>
                                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
