import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/10 bg-navy-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                        <img src="/logo.png" alt="Clara AI" style={{ height: "28px", width: "auto" }} />
                        <p className="text-gray-400 text-sm">Automate your AI voice agent setup</p>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-sm text-gray-400">
                        <Link to="#" className="hover:text-white transition-colors">GitHub</Link>
                        <Link to="#" className="hover:text-white transition-colors">Customer Support</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-white transition-colors">LinkedIn</Link>
                    </div>

                    <div className="text-sm text-gray-500 text-center md:text-right">
                        <p>Built with Mistral AI · Powered by Retell AI</p>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-600 mt-8">
                    &copy; {new Date().getFullYear()} Clara AI. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
