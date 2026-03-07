import { useAuth } from '../lib/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import {
    Home,
    Zap,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Bot,
    Phone,
    CreditCard,
    ClipboardList,
    RefreshCw,
    User
} from 'lucide-react'

export default function Dashboard() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'There'
    const email = user?.email || 'user@example.com'

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white flex font-sans w-full overflow-hidden">
            {/* Sidebar Component */}
            <aside
                className="fixed left-0 top-[64px] bottom-0 w-[200px] flex flex-col justify-between z-20"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRight: '1px solid rgba(255,255,255,0.06)'
                }}
            >
                <div>
                    <nav className="flex flex-col px-4 pt-8 gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-[8px] transition-colors"
                            style={{
                                background: 'rgba(59,130,246,0.15)',
                                color: 'white',
                                borderLeft: '2px solid #3B82F6'
                            }}
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Overview</span>
                        </Link>

                        <Link
                            to="#"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-[8px] hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent"
                        >
                            <Zap className="w-5 h-5 shrink-0" />
                            <span className="font-medium">Run Pipeline</span>
                        </Link>

                        <Link
                            to="#"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-[8px] hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent"
                        >
                            <FileText className="w-5 h-5 shrink-0" />
                            <span className="font-medium">My Agents</span>
                        </Link>

                        <Link
                            to="#"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-[8px] hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent"
                        >
                            <BarChart3 className="w-5 h-5 shrink-0" />
                            <span className="font-medium">Results</span>
                        </Link>

                        <Link
                            to="#"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-[8px] hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent"
                        >
                            <Settings className="w-5 h-5 shrink-0" />
                            <span className="font-medium">Settings</span>
                        </Link>
                    </nav>
                </div>

                <div
                    className="p-6"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="truncate text-sm text-gray-400 cursor-default" title={email}>
                                {email}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-[calc(100vh-64px)] p-[24px] w-full flex justify-center">
                <div className="max-w-[1200px] w-full flex flex-col gap-[32px]">

                    {/* Header Section */}
                    <header>
                        <h1 className="text-[24px] font-bold text-white mb-1">Welcome, {firstName} 👋</h1>
                        <p className="text-gray-400">Here is what is happening with your AI agents today.</p>
                    </header>

                    {/* Status Cards Row */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card 1: Pipeline Runs */}
                        <div
                            className="p-6 rounded-[12px] group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-400 font-medium">Pipeline Runs</span>
                                <Zap className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">0</div>
                            <div className="text-sm text-gray-500">2 remaining this month</div>
                        </div>

                        {/* Card 2: Active Agents */}
                        <div
                            className="p-6 rounded-[12px] group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-400 font-medium">Active Agents</span>
                                <Bot className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">0</div>
                            <div className="text-sm text-gray-500">Deploy your first agent</div>
                        </div>

                        {/* Card 3: Calls Handled */}
                        <div
                            className="p-6 rounded-[12px] group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-400 font-medium">Calls Handled</span>
                                <Phone className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">0</div>
                            <div className="text-sm text-gray-500">Connect Retell to track</div>
                        </div>

                        {/* Card 4: Current Plan */}
                        <div
                            className="p-6 rounded-[12px] group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-400 font-medium">Current Plan</span>
                                <CreditCard className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">FREE</div>
                            <Link to="/pricing" className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
                                Upgrade to Pro →
                            </Link>
                        </div>
                    </section>

                    {/* Quick Actions Section */}
                    <section>
                        <h2 className="text-[18px] font-bold text-white mb-4">Quick Actions</h2>
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Quick Action 1: Pipeline A */}
                            <div
                                className="p-6 rounded-[12px] flex flex-col justify-between"
                                style={{
                                    background: 'rgba(59,130,246,0.08)',
                                    border: '1px solid rgba(59,130,246,0.2)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'}
                            >
                                <div>
                                    <Zap className="w-8 h-8 text-blue-500 mb-4" />
                                    <h3 className="text-[18px] font-bold text-white mb-2">Run Pipeline A</h3>
                                    <p className="text-gray-400 text-[15px] mb-8">Convert a demo call transcript into a v1 agent config</p>
                                </div>
                                <button
                                    className="w-fit px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Start Pipeline A →
                                </button>
                            </div>

                            {/* Quick Action 2: Pipeline B */}
                            <div
                                className="p-6 rounded-[12px] flex flex-col justify-between"
                                style={{
                                    background: 'rgba(139,92,246,0.08)',
                                    border: '1px solid rgba(139,92,246,0.2)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
                            >
                                <div>
                                    <RefreshCw className="w-8 h-8 text-purple-500 mb-4" />
                                    <h3 className="text-[18px] font-bold text-white mb-2">Run Pipeline B</h3>
                                    <p className="text-gray-400 text-[15px] mb-8">Upgrade v1 to v2 using your onboarding call transcript</p>
                                </div>
                                <button
                                    className="w-fit px-5 py-2.5 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    Start Pipeline B →
                                </button>
                            </div>

                        </div>
                    </section>

                    {/* Recent Activity Section */}
                    <section>
                        <h2 className="text-[18px] font-bold text-white mb-4">Recent Activity</h2>
                        <div
                            className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[12px]"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}
                        >
                            <ClipboardList className="w-12 h-12 text-gray-500 mb-4" />
                            <h3 className="text-[16px] text-gray-500 mb-1">No pipeline runs yet</h3>
                            <p className="text-[14px] text-gray-500 mb-6">Run your first pipeline to see results here</p>
                            <button className="px-5 py-2 border border-blue-500 text-blue-500 font-medium rounded-lg hover:bg-blue-500/10 transition-colors">
                                Run First Pipeline →
                            </button>
                        </div>
                    </section>

                    {/* Free Plan Banner */}
                    <section className="mt-auto pt-4">
                        <div
                            className="rounded-[12px] p-[20px] px-[24px] flex flex-col sm:flex-row justify-between items-center gap-4"
                            style={{
                                background: 'rgba(59,130,246,0.08)',
                                border: '1px solid rgba(59,130,246,0.2)'
                            }}
                        >
                            <div>
                                <h3 className="text-white font-bold text-[16px] mb-1">⚡ You are on the Free Plan</h3>
                                <p className="text-gray-400 text-sm">2 pipeline runs per month · Upgrade for unlimited runs</p>
                            </div>
                            <Link
                                to="/pricing"
                                className="w-full sm:w-auto text-center px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                            >
                                Upgrade to Pro →
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
