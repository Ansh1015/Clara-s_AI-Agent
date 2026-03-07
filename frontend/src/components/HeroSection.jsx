import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Loader2, Play } from 'lucide-react'

export default function HeroSection() {
    const prefersReducedMotion = useReducedMotion()

    const [currentStage, setCurrentStage] = useState(0)
    const [isResetting, setIsResetting] = useState(false)
    const timerRef = useRef(null)

    const startLoop = useCallback(() => {
        // Always clear existing timer first
        if (timerRef.current) {
            clearInterval(timerRef.current)
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        let stage = 0
        setIsResetting(true)
        setCurrentStage(0)

        setTimeout(() => {
            setIsResetting(false)
        }, 50)

        timerRef.current = setTimeout(() => {
            stage = 1
            setCurrentStage(1)

            timerRef.current = setInterval(() => {
                stage += 1

                if (stage <= 5) {
                    setCurrentStage(stage)
                }

                if (stage === 5) {
                    // Stage 5 is Agent Ready
                    // Clear interval immediately
                    clearInterval(timerRef.current)
                    timerRef.current = null

                    // After 2000ms restart loop
                    // using the same startLoop function
                    // No fade out — just content swap
                    timerRef.current = setTimeout(() => {
                        startLoop()
                    }, 2000)
                }
            }, 1200)
        }, 500)
    }, [])

    useEffect(() => {
        startLoop()

        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [startLoop])

    const getProgressWidth = () => {
        const progressMap = {
            0: '0%',
            1: '25%',
            2: '50%',
            3: '75%',
            4: '100%',
            5: '100%'
        }
        return progressMap[currentStage] || '0%'
    }

    return (
        <section
            className="relative pt-[80px] pb-[80px] px-6 flex items-center overflow-hidden"
            style={{
                background: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%), #0A0F1E"
            }}
        >
            {/* Background elements */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}
            />

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 items-center relative z-10">

                {/* Left Column */}
                <div className="max-w-2xl flex flex-col justify-center mt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-medium text-blue-500 w-fit mb-[16px]">
                        <span>✦</span> Powered by Mistral AI
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-[72px] font-bold leading-[1.1] tracking-tight mb-[32px]">
                        <span className="block text-white">Turn Any Call</span>
                        <span className="block text-white">Transcript Into a</span>
                        <span className="block bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-transparent bg-clip-text pb-2">Live AI Voice Agent</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-[480px] leading-relaxed mb-[24px]">
                        Paste a transcript. Get a production-ready agent in 60 seconds. Zero manual work. Zero cost.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-[16px]">
                        <motion.a
                            href="/login"
                            animate={prefersReducedMotion ? {} : {
                                boxShadow: ["0 0 20px rgba(59,130,246,0.4)", "0 0 40px rgba(59,130,246,0.8)", "0 0 20px rgba(59,130,246,0.4)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="px-7 py-3.5 bg-blue-500 text-white font-medium rounded-lg text-center hover:bg-blue-600 transition-colors"
                        >
                            Get Started Free →
                        </motion.a>

                        <a href="#" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors">
                            <Play className="w-4 h-4" /> Watch Demo
                        </a>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-slate-500 font-medium">Trusted by 50+ service businesses · Ben's Electric · Polar HVAC · Summit Fire</p>
                    </div>
                </div>

                {/* Right Column - Pipeline Card */}
                <div className="flex justify-center lg:justify-end perspective-1000 mt-6 self-start overflow-visible max-w-full -ml-32 relative z-20">
                    <motion.div
                        animate={
                            prefersReducedMotion
                                ? {}
                                : { y: [0, -12, 0] }
                        }
                        transition={
                            prefersReducedMotion
                                ? {}
                                : { y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
                        }
                        className="w-full max-w-[420px] h-[340px] bg-white/5 backdrop-blur-[20px] flex flex-col justify-between border rounded-2xl p-6 transition-all duration-500 overflow-hidden"
                        style={{
                            borderColor: currentStage >= 5 ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.3)',
                            boxShadow: currentStage >= 5 ? '0 0 40px rgba(34,197,94,0.15)' : '0 0 40px rgba(59,130,246,0.15)',
                        }}
                    >
                        <div className="flex-1 relative">
                            <AnimatePresence mode="popLayout">
                                {currentStage >= 5 ? (
                                    <motion.div
                                        key="ready"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <h2 className="text-3xl font-bold text-green-400">✅ Agent Ready!</h2>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="steps"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute inset-0 flex flex-col"
                                    >
                                        <div className="mt-4 mb-6">
                                            <h3 className="text-white text-sm font-bold">Building your AI receptionist...</h3>
                                        </div>

                                        <div className="space-y-4 font-mono text-sm">
                                            {/* Step 1 */}
                                            {currentStage >= 1 && (
                                                <div className={`flex items-center justify-between animate-fade-in ${currentStage === 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentStage === 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        Transcript received{currentStage === 1 ? '...' : ''}
                                                    </div>
                                                    {currentStage > 1 && <span className="text-slate-500 text-xs">(0.1s)</span>}
                                                </div>
                                            )}
                                            {/* Step 2 */}
                                            {currentStage >= 2 && (
                                                <div className={`flex items-center justify-between animate-fade-in ${currentStage === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentStage === 2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        Extracting business rules{currentStage === 2 ? '...' : ''}
                                                    </div>
                                                    {currentStage > 2 && <span className="text-slate-500 text-xs">(4.2s)</span>}
                                                </div>
                                            )}
                                            {/* Step 3 */}
                                            {currentStage >= 3 && (
                                                <div className={`flex items-center justify-between animate-fade-in ${currentStage === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentStage === 3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        Generating agent config{currentStage === 3 ? '...' : ''}
                                                    </div>
                                                    {currentStage > 3 && <span className="text-slate-500 text-xs">(8.1s)</span>}
                                                </div>
                                            )}
                                            {/* Step 4 */}
                                            {currentStage >= 4 && (
                                                <div className={`flex items-center justify-between animate-fade-in ${currentStage === 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentStage === 4 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        Saving to database...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Progress bar container (outside the swap) */}
                        <div className="mt-4 border-t border-white/10 pt-4 shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400">Progress</span>
                                <span className={`text-xs font-mono font-medium transition-colors ${currentStage >= 5 ? 'text-green-400' : 'text-blue-400'}`}>
                                    {getProgressWidth()}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: getProgressWidth() }}
                                    transition={{ duration: isResetting ? 0 : 1.1, ease: 'linear' }}
                                    className={`h-full rounded-full transition-colors duration-500 ${currentStage >= 5 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
