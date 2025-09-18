import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Accueil Tab */}
            <Link
              to="/"
              className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1 font-semibold">Accueil</span>
            </Link>

            {/* Floating Plus Button */}
            <button
              onClick={async () => {
                try {
                  const pref = localStorage.getItem('geo_preference_enabled')
                  const wantsGeo = pref ? pref === 'true' : true
                  if (wantsGeo && 'geolocation' in navigator) {
                    // Trigger permission prompt if still "prompt"
                    if ('permissions' in navigator) {
                      // @ts-ignore
                      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
                      if (status.state === 'prompt') {
                        await new Promise<void>((resolve) => {
                          navigator.geolocation.getCurrentPosition(
                            () => resolve(),
                            () => resolve(),
                            { enableHighAccuracy: true, timeout: 8000 }
                          )
                        })
                      }
                    } else {
                      // Fallback prompt
                      await new Promise<void>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                          () => resolve(),
                          () => resolve(),
                          { enableHighAccuracy: true, timeout: 8000 }
                        )
                      })
                    }
                  }
                } catch {}
                navigate('/add-trajet')
              }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl transform -translate-y-3 hover:scale-110 transition-all"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            {/* Profil Tab */}
            <Link
              to="/profile"
              className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all ${
                isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1 font-semibold">Profil</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed nav */}
      <div className="h-20"></div>
    </div>
  )
}

export default Layout
