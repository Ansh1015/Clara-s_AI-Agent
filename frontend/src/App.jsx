import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Results from './pages/Results'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Docs from './pages/Docs'
import Blog from './pages/Blog'
import NotFound from './pages/NotFound'

function AppContent() {
  const location = useLocation()

  // List of paths that use the internal app dashboard layout rather than the public website layout
  const isAppRoute = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/new-pipeline') ||
    location.pathname.startsWith('/results')

  return (
    <div className={`min-h-screen flex flex-col pt-16 ${isAppRoute ? 'pl-[200px]' : ''}`}>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-pipeline" element={<Pipeline />} />
            <Route path="/results/:accountId" element={<Results />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAppRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
