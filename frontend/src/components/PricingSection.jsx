import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function PricingSection() {
    const prefersReducedMotion = useReducedMotion()

    return (
        <section className="pt-[80px] pb-[80px] px-6 relative overflow-hidden bg-navy-900 border-t border-white/5">
            <div className="max-w-5xl mx-auto relative z-10">

                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl text-white font-bold tracking-tight">Simple, Transparent Pricing</h2>
                    <p className="text-slate-400 text-lg">Start free. Upgrade when you're ready.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Free Card */}
                    <div className="glass-card p-8 border-white/10 relative">
                        <h3 className="text-2xl font-bold text-white mb-2">FREE</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$0</span>
                            <span className="text-slate-400"> / month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-500 shrink-0" /> 2 pipeline runs per month</li>
                            <li className="flex gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Download config files</li>
                            <li className="flex gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Supabase storage</li>
                            <li className="flex gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Community support</li>
                        </ul>
                        <Link to="/login" className="block w-full text-center py-[12px] px-[24px] bg-transparent border border-white/20 text-white rounded-[8px] hover:bg-white/5 transition-colors font-medium">
                            Start Free
                        </Link>
                    </div>

                    {/* Pro Card */}
                    <div className="glass-card p-8 border-blue-500/50 bg-blue-500/5 relative transform md:-translate-y-4">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                            MOST POPULAR
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$49</span>
                            <span className="text-slate-400"> / month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Unlimited pipeline runs</li>
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Live Retell AI deployment</li>
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Phone number provisioning</li>
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Agent answers real calls</li>
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Priority Mistral processing</li>
                            <li className="flex gap-3 text-white"><Check className="w-5 h-5 text-blue-500 shrink-0" /> Email support</li>
                        </ul>
                        <motion.div
                            animate={prefersReducedMotion ? {} : {
                                boxShadow: ["0 0 20px rgba(59,130,246,0.4)", "0 0 40px rgba(59,130,246,0.8)", "0 0 20px rgba(59,130,246,0.4)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="rounded-lg"
                        >
                            <Link to="/pricing" className="block w-full text-center py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                                Upgrade to Pro →
                            </Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}
