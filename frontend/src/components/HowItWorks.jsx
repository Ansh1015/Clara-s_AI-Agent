import { motion, useReducedMotion } from 'framer-motion'
import { FileText, Zap, PhoneCall } from 'lucide-react'

const steps = [
    {
        num: "1",
        title: "Paste Transcript",
        desc: "Upload or paste your demo or onboarding call transcript. Supports up to 200,000 characters.",
        icon: <FileText className="w-8 h-8 text-blue-500" />,
        color: "rgba(59,130,246,0.4)"
    },
    {
        num: "2",
        title: "Pipeline Runs",
        desc: "Mistral AI extracts every business rule, routing logic, and configuration automatically.",
        icon: <Zap className="w-8 h-8 text-purple-500" />,
        color: "rgba(139,92,246,0.4)"
    },
    {
        num: "3",
        title: "Agent Goes Live",
        desc: "Production-ready config deployed to Retell AI. Your agent starts answering calls immediately.",
        icon: <PhoneCall className="w-8 h-8 text-green-500" />,
        color: "rgba(34,197,94,0.4)"
    }
]

export default function HowItWorks() {
    const prefersReducedMotion = useReducedMotion()

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <section className="pt-[80px] pb-[80px] px-6 relative z-10 bg-navy-900 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-500 uppercase tracking-widest text-xs font-bold">HOW IT WORKS</span>
                    <h2 className="text-4xl text-white font-bold tracking-tight">From Transcript to Live Agent</h2>
                    <p className="text-slate-400 text-lg">Three steps. Sixty seconds. Zero manual work.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center gap-6 w-full max-w-sm">
                            <motion.div
                                initial={prefersReducedMotion ? "visible" : "hidden"}
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : idx * 0.2 }}
                                variants={cardVariants}
                                className="relative w-full bg-white/5 border border-white/10 rounded-xl p-8 transition-colors duration-300 group"
                                style={{ '--hover-glow': step.color }}
                            >
                                <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                    {step.num}
                                </div>

                                <div className="mb-6 p-4 bg-white/5 rounded-full inline-block group-hover:bg-white/10 transition-colors">
                                    {step.icon}
                                </div>

                                <h3 className="text-white text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {step.desc}
                                </p>

                                {/* Hover Glow Inject via CSS var */}
                                <style>{`
                  .group:hover {
                    border-color: var(--hover-glow);
                    box-shadow: 0 0 20px var(--hover-glow);
                  }
                `}</style>
                            </motion.div>

                            {idx < steps.length - 1 && (
                                <div className="hidden md:block text-slate-600 font-bold text-2xl">
                                    →
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
