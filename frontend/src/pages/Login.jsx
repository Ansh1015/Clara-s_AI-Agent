import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Chrome } from 'lucide-react'
import { supabase, signInWithGoogle } from '../lib/supabase'

export default function Login() {
    const prefersReducedMotion = useReducedMotion()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    // Optional: Auto redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                navigate('/dashboard')
            }
        }
        checkSession()
    }, [navigate])

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            await signInWithGoogle()
            // Redirect happens via Supabase OAuth redirect URL
        } catch (error) {
            console.error('Error logging in:', error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 60%)",
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}
            />

            <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-[440px] relative z-10 text-center rounded-[16px] p-[40px]"
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 0 40px rgba(59,130,246,0.08)"
                }}
            >
                <div className="mb-8">
                    <img
                        src="/logo.png"
                        alt="Clara AI"
                        style={{ height: "36px", width: "auto" }}
                        className="mx-auto mb-6"
                    />
                    <h1 className="text-white text-[22px] font-[700] mb-2">Welcome to Clara AI</h1>
                    <p className="text-[#94A3B8] text-[14px]">Sign in to start building your AI voice agents</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-[12px] py-[12px] px-[24px] bg-[#FFFFFF] text-[#1F1F1F] text-[15px] font-[500] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F8F9FA] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88 c0-.57-.05-.66-.15-1.18z" />
                                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z" />
                                    <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.99-.25-1.53s.09-1.05.25-1.53V5.4H1.83a8 8 0 0 0 0 7.2l2.68-2.07z" />
                                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.47c.64-1.87 2.4-3.29 4.48-3.29z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white/5 border border-white/10 text-slate-400 font-medium rounded-lg cursor-not-allowed"
                    >
                        Continue with Email (Coming Soon)
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-[12px] text-[#64748B]">
                        By continuing, you agree to Clara AI's <a href="#" className="text-[#3B82F6] hover:underline">Terms of Service</a> and <a href="#" className="text-[#3B82F6] hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
