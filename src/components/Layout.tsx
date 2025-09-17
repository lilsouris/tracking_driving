import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, isAnonymous } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">DriveTracker</h1>
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : isAnonymous ? (
                <span className="text-sm text-gray-500">Guest Mode</span>
              ) : (
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                isActive('/') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link
              to="/trajets"
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                isActive('/trajets') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs mt-1">Trajets</span>
            </Link>
            <Link
              to="/add-trajet"
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                isActive('/add-trajet') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs mt-1">Add</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                isActive('/profile') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
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
