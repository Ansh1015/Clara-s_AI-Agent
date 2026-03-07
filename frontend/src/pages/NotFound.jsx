import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-[120px] font-bold leading-none bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4">
                404
            </h1>
            <h2 className="text-3xl font-bold text-white mb-4">Page not found</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-10">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 hover:border-white/20 transition-all group"
            >
                Back to Home
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    )
}
