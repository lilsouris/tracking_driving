import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTrajetStats } from '../lib/supabase'

const Profile: React.FC = () => {
  const { user, profile, updateProfile, isAnonymous, signIn, signUp, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalHours: 0,
    totalDistance: 0,
    totalManoeuvres: 0,
    averageCityPercentage: 0,
    totalTrajets: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  })
  
  // Auth form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const navigate = useNavigate()
  // Geo permission state
  const [geoEnabled, setGeoEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('geo_preference_enabled')
    return saved ? saved === 'true' : false
  })
  const [geoStatus, setGeoStatus] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt')

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      setStatsLoading(true)
      try {
        const withTimeout = async (p: Promise<any>, ms = 5000) => {
          return Promise.race([
            p,
            new Promise((resolve) => setTimeout(() => resolve({ data: null }), ms))
          ])
        }

        const { data } = await withTimeout(getTrajetStats(user.id)) as any
        if (data) {
          setStats(data)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [user])

  // Geolocation permission probe
  useEffect(() => {
    const probe = async () => {
      if (!('permissions' in navigator)) {
        setGeoStatus('unsupported')
        return
      }
      try {
        // @ts-ignore - lib typing for PermissionName
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        setGeoStatus(result.state as any)
        result.onchange = () => setGeoStatus((result as any).state)
      } catch {
        setGeoStatus('prompt')
      }
    }
    probe()
  }, [])

  const handleToggleGeo = async () => {
    const next = !geoEnabled
    setGeoEnabled(next)
    localStorage.setItem('geo_preference_enabled', String(next))
    if (next) {
      // Trigger browser prompt if needed
      try {
        await new Promise<void>((resolve, reject) => {
          if (!('geolocation' in navigator)) return reject(new Error('unsupported'))
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { enableHighAccuracy: true, timeout: 8000 }
          )
        })
      } catch {
        /* noop */
      }
    }
  }

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setAuthError(error.message)
      } else {
        // Clear anonymous flag and go to dashboard
        localStorage.removeItem('anonymous_user')
        navigate('/')
      }
    } catch (err) {
      setAuthError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  // Debug logging
  console.log('Profile page - user:', user, 'isAnonymous:', isAnonymous, 'statsLoading:', statsLoading)

  // Show auth form if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
              <p className="text-gray-600">
                {isSignUp ? 'Inscrivez-vous pour sauvegarder vos données' : 'Connectez-vous à votre compte'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre mot de passe"
                  required
                  minLength={6}
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Chargement...' : (isSignUp ? 'S\'inscrire' : 'Se connecter')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Connectez-vous :</strong> Créez un compte ou connectez-vous pour accéder à votre profil et synchroniser vos données.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compute display name from profile or email local-part
  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Utilisateur')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Profil</h1>
          <p className="text-gray-500 mt-1">Vos informations et paramètres</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-semibold text-gray-900">{displayName}</div>
              <div className="text-gray-600">{user?.email}</div>
            </div>
            <button onClick={() => setEditing(!editing)} className="text-blue-600 font-medium">
              {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Conduite supervisée depuis le 1er Juin 2024</span>
          </div>

          {editing && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium">Sauvegarder</button>
            </div>
          )}
        </div>

        {/* Progression */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Progression</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-100 rounded-2xl p-5 text-center">
              <div className="w-6 h-6 text-blue-600 mx-auto mb-2">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="text-3xl font-semibold text-gray-900">{stats.totalHours}h</div>
              <div className="text-sm text-gray-600">Heures effectuées</div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-5 text-center">
              <div className="w-6 h-6 text-blue-600 mx-auto mb-2">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
              <div className="text-3xl font-semibold text-gray-900">60h</div>
              <div className="text-sm text-gray-600">Objectif</div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Progression globale</span>
              <span className="text-blue-600 font-semibold">79%</span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-3 bg-blue-600 rounded-full" style={{ width: '79%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Plus que 12.5h à effectuer</p>
          </div>
        </div>

        {/* Settings - previous style */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Paramètres</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                  <p className="font-medium text-gray-900">Accès localisation</p>
                  <p className="text-sm text-gray-600">Activer le suivi GPS en temps réel</p>
                  <p className="text-xs text-gray-500 mt-1">Statut: {geoStatus === 'unsupported' ? 'non supporté' : geoStatus}</p>
                </div>
                <button onClick={handleToggleGeo} className={`w-12 h-6 rounded-full relative transition-colors ${geoEnabled ? 'bg-green-500' : 'bg-gray-300'}`} aria-pressed={geoEnabled} aria-label="Basculer l'accès GPS">
                  <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${geoEnabled ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>
              <button onClick={signOut} className="w-full bg-red-50 text-red-600 rounded-xl p-3 font-semibold">Se déconnecter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
