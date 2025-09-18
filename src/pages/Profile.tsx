import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTrajetStats } from '../lib/supabase'

const Profile: React.FC = () => {
  const { user, profile, updateProfile, isAnonymous } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    totalDistance: 0,
    totalManoeuvres: 0,
    averageCityPercentage: 0,
    totalTrajets: 0
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  })

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      
      try {
        const { data } = await getTrajetStats(user.id)
        if (data) {
          setStats(data)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    try {
      const { error } = await updateProfile(formData)
      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-3xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
            {user && (
              <button
                onClick={() => setEditing(!editing)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {editing ? 'Annuler' : 'Modifier'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez votre numéro de téléphone"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium"
                >
                  Sauvegarder
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile?.full_name || 'Utilisateur'}
                </h2>
                <p className="text-gray-600 mb-4">{user?.email || 'Utilisateur invité'}</p>
                {profile?.phone && (
                  <p className="text-gray-600">{profile.phone}</p>
                )}
                {isAnonymous && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      Vous utilisez le mode invité. Inscrivez-vous pour sauvegarder vos données de façon permanente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos statistiques</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
              <div className="text-sm text-gray-600">Temps total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalDistance.toFixed(1)}km</div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalManoeuvres}</div>
              <div className="text-sm text-gray-600">Manoeuvres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageCityPercentage}%</div>
              <div className="text-sm text-gray-600">Conduite urbaine</div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-600">Recevez des notifications sur vos habitudes de conduite</p>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mode sombre</p>
                <p className="text-sm text-gray-600">Passer au thème sombre</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de DriveFlow</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>Version 1.0.0</p>
            <p>Suivez vos habitudes de conduite et améliorez vos compétences</p>
            <p>Construit avec React, Vite et Supabase</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
