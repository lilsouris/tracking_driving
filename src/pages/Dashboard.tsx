import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard: React.FC = () => {
  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalHours: 24.5,
    totalKm: 156.8,
    manoeuvres: 12,
    cityPercentage: 65
  }

  const recentTrajets = [
    {
      id: '1',
      date: '2024-01-15',
      duration: '1h 23m',
      distance: '45.2 km',
      manoeuvres: 3,
      cityPercentage: 70,
      isNight: false
    },
    {
      id: '2',
      date: '2024-01-14',
      duration: '2h 15m',
      distance: '78.5 km',
      manoeuvres: 5,
      cityPercentage: 45,
      isNight: true
    }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Track your driving habits</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ios-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ios-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total KM</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalKm}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ios-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manoeuvres</p>
              <p className="text-2xl font-bold text-gray-900">{stats.manoeuvres}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ios-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">% City</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cityPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trajets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trajets</h3>
          <Link to="/trajets" className="text-blue-600 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentTrajets.map((trajet) => (
            <div key={trajet.id} className="ios-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{trajet.date}</span>
                  {trajet.isNight && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Night
                    </span>
                  )}
                </div>
                <Link
                  to={`/map/${trajet.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{trajet.duration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-medium">{trajet.distance}</p>
                </div>
                <div>
                  <p className="text-gray-600">City %</p>
                  <p className="font-medium">{trajet.cityPercentage}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <Link
          to="/add-trajet"
          className="ios-button w-full text-center block"
        >
          Start New Trajet
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
