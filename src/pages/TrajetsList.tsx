import React from 'react'
import { Link } from 'react-router-dom'

const TrajetsList: React.FC = () => {
  // Mock data - will be replaced with real data from Supabase
  const trajets = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      duration: '1h 23m',
      distance: '45.2 km',
      manoeuvres: 3,
      cityPercentage: 70,
      isNight: false,
      routeType: 'Mixed'
    },
    {
      id: '2',
      date: '2024-01-14',
      time: '20:15',
      duration: '2h 15m',
      distance: '78.5 km',
      manoeuvres: 5,
      cityPercentage: 45,
      isNight: true,
      routeType: 'Highway'
    },
    {
      id: '3',
      date: '2024-01-13',
      time: '09:45',
      duration: '45m',
      distance: '23.1 km',
      manoeuvres: 2,
      cityPercentage: 85,
      isNight: false,
      routeType: 'City'
    },
    {
      id: '4',
      date: '2024-01-12',
      time: '16:20',
      duration: '1h 50m',
      distance: '67.3 km',
      manoeuvres: 4,
      cityPercentage: 30,
      isNight: false,
      routeType: 'Mixed'
    }
  ]

  const getRouteTypeIcon = (routeType: string) => {
    switch (routeType) {
      case 'City':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      case 'Highway':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Trajets</h1>
        <Link
          to="/add-trajet"
          className="ios-button px-4 py-2 text-sm"
        >
          Add New
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="ios-card p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{trajets.length}</p>
            <p className="text-sm text-gray-600">Total Trajets</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {trajets.reduce((sum, t) => sum + parseFloat(t.distance), 0).toFixed(1)} km
            </p>
            <p className="text-sm text-gray-600">Total Distance</p>
          </div>
        </div>
      </div>

      {/* Trajets List */}
      <div className="space-y-3">
        {trajets.map((trajet) => (
          <div key={trajet.id} className="ios-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{trajet.date}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{trajet.time}</span>
                  {trajet.isNight && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Night
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{trajet.duration}</span>
                  <span>•</span>
                  <span>{trajet.distance}</span>
                  <span>•</span>
                  <span>{trajet.manoeuvres} manoeuvres</span>
                </div>
              </div>
              <Link
                to={`/map/${trajet.id}`}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  {getRouteTypeIcon(trajet.routeType)}
                  <span className="text-gray-600">{trajet.routeType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-600">{trajet.cityPercentage}% city</span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                {trajet.isNight ? '🌙' : '☀️'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {trajets.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trajets yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your driving habits</p>
          <Link to="/add-trajet" className="ios-button">
            Add Your First Trajet
          </Link>
        </div>
      )}
    </div>
  )
}

export default TrajetsList
