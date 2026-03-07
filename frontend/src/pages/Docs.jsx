export default function Docs() {
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white pt-8 pb-24 px-6 relative">
            <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10">
                {/* Sidebar */}
                <aside className="md:w-64 shrink-0">
                    <div className="sticky top-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">Documentation</h3>
                        <nav className="space-y-1">
                            <a href="#" className="block px-3 py-2 text-blue-400 bg-blue-500/10 rounded-lg font-medium">Getting Started</a>
                            <a href="#" className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Pipeline A</a>
                            <a href="#" className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Pipeline B</a>
                            <a href="#" className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">API Reference</a>
                            <a href="#" className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">FAQ</a>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
                    <h1 className="text-4xl font-bold mb-6">Getting Started</h1>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            Welcome to the Clara AI documentation. This guide will help you understand how to use our platform to transform raw call transcripts into production-ready AI voice agents.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-white/10 pb-2">Quick Start Guide</h2>
                        <p className="text-slate-400 mb-6">Follow these simple steps to start building your first agent.</p>

                        <h3 className="text-xl font-bold mt-8 mb-3 text-white">Prerequisites</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400 mb-8">
                            <li>A valid Clara AI account</li>
                            <li>A sample call transcript in text format</li>
                            <li>(Optional) A Retell AI account for live deployment</li>
                        </ul>

                        <h3 className="text-xl font-bold mt-8 mb-3 text-white">Installation Steps</h3>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-blue-300 mb-8 border border-white/5">
                            # No installation required!<br />
                            # Clara AI runs completely in the browser and cloud.
                        </div>

                        <h3 className="text-xl font-bold mt-8 mb-3 text-white">First Pipeline Run</h3>
                        <ol className="list-decimal pl-5 space-y-3 text-slate-400">
                            <li>Navigate to your Dashboard.</li>
                            <li>Click "New Pipeline" to start a new run.</li>
                            <li>Paste your call transcript into the input area.</li>
                            <li>Click "Run Pipeline" and wait approximately 60 seconds.</li>
                            <li>Review the extracted business rules, agent configuration, and test the agent directly in the interface.</li>
                        </ol>
                    </div>
                </main>
            </div>
        </div>
    )
}
