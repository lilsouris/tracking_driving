import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createTrajet, updateTrajet } from '../lib/supabase'
import type { GPSPosition } from '../types/database'

const AddTrajet: React.FC = () => {
  const { user } = useAuth()
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [positions, setPositions] = useState<GPSPosition[]>([])
  const [distanceKm, setDistanceKm] = useState(0)
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const [gpsActive, setGpsActive] = useState(false)
  const [currentTrajetId, setCurrentTrajetId] = useState<string | null>(null)
  const navigate = useNavigate()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [geoPermissionState, setGeoPermissionState] = useState<PermissionState | 'unsupported'>('prompt')
  const lastPosRef = useRef<GPSPosition | null>(null)
  const lastSyncAtRef = useRef<number>(0)
  const unsyncedKmRef = useRef<number>(0)
  
  const translateError = (msg: string): string => {
    if (!msg) return ''
    const m = msg.toLowerCase()
    if (m.includes('location permission denied')) {
      return 'Autorisation de localisation refusée. Activez-la dans les réglages du navigateur.'
    }
    if (m.includes('we need your location')) {
      return "Nous avons besoin de votre localisation pour démarrer. Veuillez l'autoriser lorsqu'on vous le demande."
    }
    if (m.includes('geolocation is not supported')) {
      return "La géolocalisation n'est pas prise en charge par ce navigateur."
    }
    if (m.startsWith('gps tracking error')) {
      return 'Erreur de suivi GPS. Vérifiez vos réglages de localisation et réessayez.'
    }
    if (m.startsWith('failed to create trajet')) {
      return 'Impossible de créer le trajet. Veuillez réessayer.'
    }
    if (m.startsWith('failed to save trajet')) {
      return 'Impossible d’enregistrer le trajet. Veuillez réessayer.'
    }
    if (m.startsWith('failed to start tracking')) {
      return 'Impossible de démarrer le suivi. Veuillez réessayer.'
    }
    return msg
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Calculate total distance (fallback/recompute)
  const totalDistance = positions.reduce((total, pos, index) => {
    if (index === 0) return 0
    const prevPos = positions[index - 1]
    return total + calculateDistance(
      prevPos.latitude, prevPos.longitude,
      pos.latitude, pos.longitude
    )
  }, 0)

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Check geolocation permission using Permissions API
  const ensureGeoPermission = async (): Promise<PermissionState | 'unsupported'> => {
    if (!('permissions' in navigator)) {
      setGeoPermissionState('unsupported')
      return 'unsupported'
    }
    try {
      const status = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName })
      setGeoPermissionState(status.state)
      // Keep state updated if it changes
      if (typeof status.onchange === 'object' || typeof status.onchange === 'function') {
        status.onchange = () => setGeoPermissionState(status.state)
      }
      return status.state
    } catch {
      setGeoPermissionState('unsupported')
      return 'unsupported'
    }
  }

  useEffect(() => {
    // Preload permission state
    ensureGeoPermission()
  }, [])

  // Debug timer state changes
  useEffect(() => {
    console.log('Timer state changed - isTracking:', isTracking, 'elapsedTime:', elapsedTime, 'intervalRef:', intervalRef.current)
  }, [isTracking, elapsedTime])

  // Start tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    try {
      const permission = await ensureGeoPermission()
      if (permission === 'denied') {
        setError('Location permission denied. Please enable it in your browser settings.')
        return
      }
      // If not yet granted, explicitly prompt on each start click
      if (permission !== 'granted') {
        const got = await new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { enableHighAccuracy: true, timeout: 8000 }
          )
        })
        if (!got) {
          setError('We need your location to start tracking. Please allow access when prompted.')
          return
        }
      }

      // Reset timer and any stale interval before starting
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setElapsedTime(0)
      const now = new Date()
      setStartTime(now)
      setIsTracking(true)
      setError('')
      setDistanceKm(0)
      lastPosRef.current = null
      lastSyncAtRef.current = Date.now()
      unsyncedKmRef.current = 0

      // Start timer
      console.log('Starting timer interval') // Debug log
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1
          console.log('Timer update:', newTime) // Debug log
          return newTime
        })
      }, 1000)
      console.log('Timer interval set:', intervalRef.current) // Debug log

      // Start GPS tracking (this will trigger the native prompt if state is 'prompt' or 'unsupported')
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setGpsActive(true)
          const newPosition: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy ?? undefined,
            altitude: position.coords.altitude ?? undefined,
            speed: position.coords.speed ?? undefined
          }
          console.log('GPS position received:', newPosition) // Debug log
          
          // Compute incremental distance with simple sanity filters
          const prev = lastPosRef.current
          if (prev) {
            const increment = calculateDistance(
              prev.latitude, prev.longitude,
              newPosition.latitude, newPosition.longitude
            )
            const accuracy = position.coords.accuracy ?? 0
            console.log('Distance increment:', increment, 'Accuracy:', accuracy) // Debug log
            // Ignore jumps if accuracy is very poor or increment is unrealistic (> 2km per sample)
            if (accuracy < 100 && increment < 2) {
              setDistanceKm((d) => {
                const newDistance = d + increment
                console.log('Distance updated:', newDistance) // Debug log
                return newDistance
              })
              unsyncedKmRef.current += increment
            }
          }
          lastPosRef.current = newPosition
          setPositions(prev => {
            const newPositions = [...prev, newPosition]
            console.log('GPS points count:', newPositions.length) // Debug log
            return newPositions
          })
          
          // Update trajet in database with new GPS data
          if (user && currentTrajetId) {
            const nowTs = Date.now()
            const seconds = startTime ? Math.floor((nowTs - startTime.getTime()) / 1000) : 0
            const shouldSync = (nowTs - lastSyncAtRef.current > 4000) || unsyncedKmRef.current >= 0.05
            if (shouldSync) {
              lastSyncAtRef.current = nowTs
              unsyncedKmRef.current = 0
              // Use current state values instead of stale closure values
              const currentDistance = distanceKm + (increment < 2 ? increment : 0)
              const currentPositions = [...positions, newPosition]
              
              console.log('Syncing to Supabase:', {
                trajetId: currentTrajetId,
                distance: currentDistance,
                duration: seconds,
                gpsPoints: currentPositions.length
              }) // Debug log
              
              updateTrajet(currentTrajetId, {
                gps_trace: currentPositions,
                distance_km: currentDistance,
                duration_seconds: seconds
              }).then(result => {
                console.log('Supabase update successful:', result) // Debug log
              }).catch(error => {
                console.error('Failed to update trajet:', error)
              })
            }
          }
        },
        (error) => {
          console.error('GPS error:', error)
          setError('GPS tracking error: ' + error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
      setWatchId(id)

      // Create trajet in database (non-blocking). If it fails, tracking continues and we retry save at the end.
      ;(async () => {
        if (!user) return
        const { data: trajetData, error: trajetError } = await createTrajet({
          user_id: user.id,
          start_time: now.toISOString(),
          distance_km: 0,
          manoeuvres: 0,
          city_percentage: 0,
          route_type: 'mixed',
          is_night: now.getHours() < 6 || now.getHours() > 18,
          gps_trace: []
        })
        if (trajetError) {
          console.error('Failed to create trajet:', trajetError)
          return
        }
        if (trajetData) {
          setCurrentTrajetId(trajetData.id)
          // Push current buffered state immediately
          await updateTrajet(trajetData.id, {
            gps_trace: positions,
            distance_km: distanceKm,
            duration_seconds: 0
          }).catch(error => {
            console.error('Failed to update initial trajet:', error)
          })
        }
      })()

    } catch (err) {
      setError('Failed to start tracking: ' + (err as Error).message)
    }
  }

  // Stop tracking
  const stopTracking = () => {
    console.log('Stopping tracking') // Debug log
    setIsTracking(false)
    if (intervalRef.current) {
      console.log('Clearing timer interval:', intervalRef.current) // Debug log
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setGpsActive(false)
  }

  // Save trajet
  const saveTrajet = async () => {
    if (!startTime || positions.length === 0) return

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    
    // Calculate city percentage (mock calculation)
    const cityPercentage = Math.min(100, Math.max(0, 50 + Math.random() * 40))
    
    // Calculate manoeuvres (mock calculation based on distance and time)
    const manoeuvres = Math.floor(distanceKm / 10) + Math.floor(duration / 1800)

    try {
      if (user && currentTrajetId) {
        // Update existing trajet in Supabase
        const { error } = await updateTrajet(currentTrajetId, {
          end_time: endTime.toISOString(),
          duration_seconds: duration,
          distance_km: distanceKm,
          manoeuvres,
          city_percentage: Math.round(cityPercentage),
          gps_trace: positions
        })

        if (error) {
          setError('Failed to save trajet: ' + error.message)
          return
        }
      } else {
        // Save to localStorage for anonymous users
        const trajetData = {
          id: Date.now().toString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          distance: distanceKm,
          manoeuvres,
          cityPercentage: Math.round(cityPercentage),
          isNight: startTime.getHours() < 6 || startTime.getHours() > 18,
          positions
        }

        const existingTrajets = JSON.parse(localStorage.getItem('trajets') || '[]')
        existingTrajets.unshift(trajetData)
        localStorage.setItem('trajets', JSON.stringify(existingTrajets))
      }
      
      navigate('/trajets')
    } catch (err) {
      setError('Failed to save trajet: ' + (err as Error).message)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Trajet</h1>
        <p className="text-gray-600">Start tracking your driving session</p>
      </div>

      {/* Pre-permission note */}
      {!isTracking && (
        <div className="ios-card p-4 bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-900">
            We use your location to record your trajet in real-time. Your position is only
            used while tracking is active and you can stop at any time.
          </p>
          {geoPermissionState === 'denied' && (
            <p className="text-sm text-red-600 mt-2">
              Location is blocked. Enable it in your browser settings to proceed.
            </p>
          )}
        </div>
      )}

      {/* Timer Display */}
      <div className="ios-card p-8 text-center">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-lg text-gray-600">
          {isTracking ? 'Tracking...' : 'Ready to start'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ios-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {distanceKm.toFixed(1)} km
          </div>
          <div className="text-sm text-gray-600">Distance</div>
        </div>
        <div className="ios-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {positions.length}
          </div>
          <div className="text-sm text-gray-600">GPS Points</div>
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setError('')}></div>
          <div role="alertdialog" aria-modal="true" className="relative z-10 w-11/12 max-w-md bg-white rounded-2xl shadow-xl border border-red-200">
            <div className="p-5">
              <p className="text-red-600 text-base">{translateError(error)}</p>
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button 
                onClick={async () => {
                  setError('')
                  // Trigger system permission prompt
                  if ('geolocation' in navigator) {
                    try {
                      await new Promise<void>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                          () => resolve(),
                          () => resolve(),
                          { enableHighAccuracy: true, timeout: 8000 }
                        )
                      })
                    } catch {}
                  }
                }}
                className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 font-medium"
              >
                Autoriser la localisation
              </button>
              <button onClick={() => setError('')} className="w-full bg-gray-500 text-white rounded-xl px-4 py-3 font-medium">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="ios-button w-full text-lg py-4"
          >
            Start Tracking
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={stopTracking}
              className="w-full bg-red-500 text-white rounded-xl px-6 py-4 font-medium active:bg-red-600 transition-colors"
            >
              Stop Tracking
            </button>
            <button
              onClick={saveTrajet}
              className="ios-button w-full text-lg py-4"
            >
              Save Trajet
            </button>
          </div>
        )}
      </div>

      {/* GPS Status */}
      <div className="ios-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">GPS Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${gpsActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {gpsActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {positions.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Last update: {new Date(positions[positions.length - 1].timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isTracking && (
        <div className="ios-card p-4 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure location services are enabled</li>
            <li>• Keep the app open while driving</li>
            <li>• Tap "Start Tracking" when you begin your journey</li>
            <li>• Tap "Stop Tracking" when you arrive</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default AddTrajet
