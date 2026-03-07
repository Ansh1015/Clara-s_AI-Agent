import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
