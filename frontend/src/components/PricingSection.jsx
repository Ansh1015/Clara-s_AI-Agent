import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function PricingSection() {
    const prefersReducedMotion = useReducedMotion()
    const [hoveredCard, setHoveredCard] = useState(null)
    const [hoveredBtn, setHoveredBtn] = useState(null)

    return (
        <section className="pt-[80px] pb-[80px] px-6 relative overflow-hidden bg-navy-900 border-t border-white/5">
            <div className="max-w-5xl mx-auto relative z-10">

                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl text-white font-bold tracking-tight">Simple, Transparent Pricing</h2>
                    <p className="text-slate-400 text-lg">Start free. Upgrade when you're ready.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Free Card */}
                    <div
                        onMouseEnter={() => setHoveredCard('free')}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="glass-card p-8 border rounded-2xl relative"
                        style={{
                            background: hoveredCard === 'free' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                            transform: hoveredCard === 'free' ? 'translateY(-8px)' : 'translateY(0px)',
                            border: hoveredCard === 'free' ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: hoveredCard === 'free' ? '0 20px 40px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ flex: 1 }}>
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
                        </div>
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
                        className="glass-card p-8 border rounded-2xl relative transform md:-translate-y-4"
                        style={{
                            background: hoveredCard === 'pro' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)',
                            transform: hoveredCard === 'pro' ? 'translateY(-8px)' : 'translateY(0px)',
                            border: hoveredCard === 'pro' ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: hoveredCard === 'pro' ? '0 20px 40px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ flex: 1 }}>
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
                        </div>
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
                            onClick={() => window.location.href = '/pricing'}
                        >
                            Upgrade to Pro →
                        </button>
                    </div>

                </div>
            </div>
        </section>
    )
}
