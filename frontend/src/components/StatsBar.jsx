import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

function AnimatedNumber({ end, suffix = "", prefix = "", decimal = false }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })
    const prefersReducedMotion = useReducedMotion()
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (!isInView && !prefersReducedMotion) return

        if (prefersReducedMotion) {
            setValue(end)
            return
        }

        let startTimestamp = null
        const duration = 2000 // 2 seconds

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            setValue(progress * end)
            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }

        window.requestAnimationFrame(step)
    }, [isInView, end, prefersReducedMotion])

    const displayValue = decimal ? value.toFixed(2) : Math.floor(value)

    return (
        <span ref={ref} className="text-3xl sm:text-4xl text-white font-bold">
            {prefix}{displayValue}{suffix}
        </span>
    )
}

export default function StatsBar() {
    return (
        <section className="w-full bg-white/5 border-y border-white/10 pt-[40px] pb-[40px] px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">

                <div className="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center text-center pt-8 sm:pt-0 border-t-0">
                    <AnimatedNumber end={10} suffix="/10" />
                    <span className="text-slate-400 text-sm mt-2 font-medium">Success Rate</span>
                </div>

                <div className="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
                    <AnimatedNumber end={0} prefix="$" decimal={true} />
                    <span className="text-slate-400 text-sm mt-2 font-medium">LLM Cost</span>
                </div>

                <div className="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
                    <AnimatedNumber end={60} suffix=" sec" />
                    <span className="text-slate-400 text-sm mt-2 font-medium">Per Agent</span>
                </div>

                <div className="w-full sm:w-auto sm:flex-1 flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
                    <AnimatedNumber end={6} suffix=" min" />
                    <span className="text-slate-400 text-sm mt-2 font-medium">Full Batch</span>
                </div>

            </div>
        </section>
    )
}
