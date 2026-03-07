import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Pricing() {
    const prefersReducedMotion = useReducedMotion()

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
                    <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 flex flex-col h-full">
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

                        <a href="/login" className="w-full block text-center py-3.5 px-6 border border-white text-white font-medium rounded-lg hover:bg-white/5 transition-colors">
                            Get Started Free
                        </a>
                    </div>

                    {/* Pro Card */}
                    <div className="bg-white/5 backdrop-blur-[20px] border border-blue-500/50 rounded-2xl p-8 flex flex-col h-full relative" style={{ boxShadow: '0 0 40px rgba(59,130,246,0.15)' }}>
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

                        <a href="/login" className="w-full block text-center py-3.5 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                            Upgrade to Pro →
                        </a>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-2 text-white">{faq.q}</h3>
                                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
