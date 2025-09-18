import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTrajets, getTrajetStats } from '../lib/supabase'
import type { Trajet } from '../types/database'

const Dashboard: React.FC = () => {
  const { user, isAnonymous } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    totalDistance: 0,
    totalManoeuvres: 0,
    averageCityPercentage: 0,
    totalTrajets: 0
  })
  const [recentTrajets, setRecentTrajets] = useState<Trajet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user && !isAnonymous) return
      
      try {
        if (user) {
          // Load real data from Supabase
          const [statsResult, trajetsResult] = await Promise.all([
            getTrajetStats(user.id),
            getTrajets(user.id, 5)
          ])
          
          if (statsResult.data) {
            setStats(statsResult.data)
          }
          
          if (trajetsResult.data) {
            setRecentTrajets(trajetsResult.data)
          }
        } else {
          // Load from localStorage for anonymous users
          const localTrajets = JSON.parse(localStorage.getItem('trajets') || '[]')
          setRecentTrajets(localTrajets.slice(0, 5))
          
          // Calculate stats from localStorage
          const localStats = localTrajets.reduce((acc: any, trajet: any) => {
            acc.totalDistance += trajet.distance || 0
            acc.totalDuration += trajet.duration || 0
            acc.totalManoeuvres += trajet.manoeuvres || 0
            acc.cityDriving += trajet.cityPercentage || 0
            acc.totalTrajets += 1
            return acc
          }, {
            totalDistance: 0,
            totalDuration: 0,
            totalManoeuvres: 0,
            cityDriving: 0,
            totalTrajets: 0
          })
          
          setStats({
            totalHours: Math.round(localStats.totalDuration / 3600 * 10) / 10,
            totalDistance: localStats.totalDistance,
            totalManoeuvres: localStats.totalManoeuvres,
            averageCityPercentage: localStats.totalTrajets > 0 ? Math.round(localStats.cityDriving / localStats.totalTrajets) : 0,
            totalTrajets: localStats.totalTrajets
          })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, isAnonymous])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
              <p className="text-gray-600 text-sm">Bienvenue sur DriveFlow</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Vos statistiques de conduite</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{stats.totalHours}h</div>
              <div className="text-sm text-gray-600 font-medium">Temps total</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">{stats.totalDistance.toFixed(1)}km</div>
              <div className="text-sm text-gray-600 font-medium">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-1">{stats.totalManoeuvres}</div>
              <div className="text-sm text-gray-600 font-medium">Manoeuvres</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-1">{stats.averageCityPercentage}%</div>
              <div className="text-sm text-gray-600 font-medium">Conduite urbaine</div>
            </div>
          </div>
        </div>

        {/* Recent Trajets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trajets récents</h3>
            <Link to="/trajets" className="text-blue-600 text-sm font-medium">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {recentTrajets.length > 0 ? (
              recentTrajets.map((trajet) => (
                <div key={trajet.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{formatDate(trajet.start_time)}</div>
                        <div className="text-sm text-gray-600">
                          {trajet.is_night ? '🌙 Conduite nocturne' : '☀️ Conduite diurne'}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/map/${trajet.id}`}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium">Durée</p>
                      <p className="font-semibold text-gray-900 text-lg">{formatTime(trajet.duration_seconds || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium">Distance</p>
                      <p className="font-semibold text-gray-900 text-lg">{trajet.distance_km.toFixed(1)}km</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide font-medium">Urbain %</p>
                      <p className="font-semibold text-gray-900 text-lg">{trajet.city_percentage}%</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun trajet pour le moment</h3>
                <p className="text-gray-600 mb-6">Commencez à suivre vos habitudes de conduite</p>
                <Link to="/add-trajet" className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Commencer votre premier trajet
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            to="/add-trajet"
            className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-5 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Nouveau trajet
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/trajets"
              className="bg-white/90 backdrop-blur-sm text-gray-700 text-center py-4 rounded-2xl font-semibold shadow-lg border border-white/20 hover:shadow-xl transition-all"
            >
              Historique
            </Link>
            <Link
              to="/profile"
              className="bg-white/90 backdrop-blur-sm text-gray-700 text-center py-4 rounded-2xl font-semibold shadow-lg border border-white/20 hover:shadow-xl transition-all"
            >
              Profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
