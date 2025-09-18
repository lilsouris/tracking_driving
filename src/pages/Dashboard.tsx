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
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Stats Overview */}
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-3">Tableau de bord</h2>
          <p className="text-gray-500 mb-5">Suivez votre progression en conduite supervisée</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Card */}
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 text-blue-500 mb-3">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{Number(stats.totalHours || 0).toFixed(1)}h</div>
                <div className="text-sm text-gray-500">Heures totales</div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 text-blue-500 mb-3">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/></svg>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{(stats.totalDistance ?? 0).toFixed(1)}</div>
                <div className="text-sm text-gray-500">Km parcourus</div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 text-blue-500 mb-3">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalManoeuvres ?? 0}</div>
                <div className="text-sm text-gray-500">Manœuvres</div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 text-blue-500 mb-3">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.averageCityPercentage ?? 0}%</div>
                <div className="text-sm text-gray-500">Conduite ville</div>
              </div>
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

          <div className="space-y-4">
            {recentTrajets.length > 0 ? (
              recentTrajets.map((trajet) => (
                <div key={trajet.id} className="rounded-2xl bg-white shadow-sm border border-gray-200 p-5">
                  {/* Date & time row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[17px] font-semibold text-gray-900">{formatDate(trajet.start_time)}</div>
                      <div className="text-gray-500 text-sm">{trajet.start_time ? new Date(trajet.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}
                        {trajet.end_time ? ` – ${new Date(trajet.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}
                      </div>
                    </div>
                    <Link to={`/map/${trajet.id}`} className="text-blue-600 hover:text-blue-800 p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </Link>
                  </div>

                  {/* Metrics row */}
                  <div className="mt-3 flex items-center gap-5 text-gray-700">
                    <div className="flex items-center gap-2"><span>🚗</span><span>{(trajet.distance_km ?? 0).toFixed(1)} km</span></div>
                    <div className="flex items-center gap-2"><span>🕒</span><span>{formatTime(trajet.duration_seconds ?? 0)}</span></div>
                  </div>

                  {/* Extra row */}
                  <div className="mt-2 flex items-center gap-5 text-gray-600 text-sm">
                    <div className="flex items-center gap-2"><span>⚙️</span><span>{trajet.manoeuvres ?? 0} manœuvres</span></div>
                    <div className="flex items-center gap-2"><span>{trajet.is_night ? '🌙' : '☀️'}</span><span>{trajet.is_night ? 'Nuit' : 'Jour'}</span></div>
                  </div>

                  {/* Road type row - placeholders */}
                  <div className="mt-3 flex items-center gap-6 text-gray-600 text-sm">
                    <div className="flex items-center gap-2"><span>🛣️</span><span>Autoroute 60%</span></div>
                    <div className="flex items-center gap-2"><span>🏙️</span><span>Ville {trajet.city_percentage ?? 0}%</span></div>
                    <div className="flex items-center gap-2"><span>🌾</span><span>Campagne 10%</span></div>
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

        {/* Quick Actions removed per request */}
      </div>
    </div>
  )
}

export default Dashboard
