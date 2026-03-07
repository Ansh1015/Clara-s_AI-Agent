import { motion, useReducedMotion } from 'framer-motion'

export default function FeaturesSection() {
    const prefersReducedMotion = useReducedMotion()

    return (
        <section id="features" className="pt-[80px] pb-[80px] px-6 bg-navy-900 overflow-hidden relative">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-500 uppercase tracking-widest text-xs font-bold">Everything You Need</span>
                    <h2 className="text-4xl text-white font-bold tracking-tight">Full Stack Voice AI Architecture</h2>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="group glass-card p-8 border hover:border-blue-500/50 transition-colors bg-white/[0.02]"
                        style={{ borderColor: 'rgba(59,130,246,0.2)' }}
                    >
                        <div className="inline-block px-3 py-1 bg-blue-500 rounded text-xs font-bold text-white mb-6">
                            PIPELINE A
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Demo Call → v1 Agent</h3>
                        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                            First-time setup. Clara reads your demo transcript and builds a complete agent configuration with business hours, emergency routing, and contact hierarchies.
                        </p>
                        <div className="bg-[#0A0F1E] rounded-lg p-4 font-mono text-xs border border-white/10 overflow-hidden">
                            <span className="text-slate-500">{'{'}</span><br />
                            &nbsp;&nbsp;<span className="text-blue-400">"agent"</span><span className="text-slate-400">: </span><span className="text-green-400">"Clara"</span>,<br />
                            &nbsp;&nbsp;<span className="text-blue-400">"hours"</span><span className="text-slate-400">: </span><span className="text-green-400">"8AM-5PM"</span><br />
                            <span className="text-slate-500">{'}'}</span>
                        </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group glass-card p-8 border hover:border-purple-500/50 transition-colors bg-white/[0.02]"
                        style={{ borderColor: 'rgba(139,92,246,0.2)' }}
                    >
                        <div className="inline-block px-3 py-1 bg-purple-500 rounded text-xs font-bold text-white mb-6">
                            PIPELINE B
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Onboarding → v2 Upgrade</h3>
                        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                            Upgrade flow. Clara compares onboarding transcript against v1, extracts changes, and produces updated agent with full changelog.
                        </p>
                        <div className="bg-[#0A0F1E] rounded-lg p-4 font-mono text-xs border border-white/10 overflow-hidden space-y-1">
                            <div className="text-red-400 line-through opacity-70">- timezone: null</div>
                            <div className="text-green-400 font-bold">+ timezone: "EST"</div>
                        </div>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="group glass-card p-8 border hover:border-green-500/50 transition-colors bg-white/[0.02]"
                        style={{ borderColor: 'rgba(34,197,94,0.2)' }}
                    >
                        <div className="inline-block px-3 py-1 bg-green-500 rounded text-xs font-bold text-white mb-6">
                            DEPLOY
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">One Click Live Deployment</h3>
                        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                            Push agent configuration directly to Retell AI. Your agent starts answering real calls immediately with zero manual setup.
                        </p>
                        <div className="bg-[#0A0F1E] rounded-lg p-4 border border-white/10 flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-green-400 font-mono text-xs">Agent Live</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
