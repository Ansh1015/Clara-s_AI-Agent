import { Link } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
    const { session, signOut } = useAuth()

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-navy-900/80 backdrop-blur-md z-50 border-b border-white/10 flex items-center justify-between px-6 transition-colors duration-300">
            <Link to="/" className="flex items-center cursor-pointer">
                <img src="/logo.png" alt="Clara AI" style={{ height: "32px", width: "auto" }} />
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <a href="/#features" className="text-gray-400 hover:text-white transition-colors">Product</a>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</Link>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
            </div>

            <div className="flex items-center gap-4">
                {session ? (
                    <>
                        <Link to="/dashboard" className="hidden sm:inline-block px-4 py-2 border border-blue-500/30 text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                            Dashboard
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hidden sm:inline-block px-4 py-2 border border-white text-white rounded-lg hover:bg-white/5 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all">
                            Start Free
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}
