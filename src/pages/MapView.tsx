import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Position {
  latitude: number
  longitude: number
  timestamp: number
}

interface TrajetData {
  id: string
  startTime: string
  endTime: string
  duration: number
  distance: number
  manoeuvres: number
  cityPercentage: number
  isNight: boolean
  positions: Position[]
}

const MapView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trajet, setTrajet] = useState<TrajetData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load trajet data from localStorage (will be replaced with Supabase)
    const loadTrajet = () => {
      try {
        const trajets = JSON.parse(localStorage.getItem('trajets') || '[]')
        const foundTrajet = trajets.find((t: TrajetData) => t.id === id)
        
        if (foundTrajet) {
          setTrajet(foundTrajet)
        } else {
          // If not found in localStorage, try to load from mock data
          const mockTrajet: TrajetData = {
            id: id || '1',
            startTime: '2024-01-15T14:30:00Z',
            endTime: '2024-01-15T15:53:00Z',
            duration: 4980, // 1h 23m
            distance: 45.2,
            manoeuvres: 3,
            cityPercentage: 70,
            isNight: false,
            positions: [
              { latitude: 48.8566, longitude: 2.3522, timestamp: Date.now() - 4980000 },
              { latitude: 48.8606, longitude: 2.3376, timestamp: Date.now() - 4000000 },
              { latitude: 48.8738, longitude: 2.2950, timestamp: Date.now() - 3000000 },
              { latitude: 48.8566, longitude: 2.3522, timestamp: Date.now() - 2000000 },
              { latitude: 48.8606, longitude: 2.3376, timestamp: Date.now() - 1000000 },
              { latitude: 48.8738, longitude: 2.2950, timestamp: Date.now() }
            ]
          }
          setTrajet(mockTrajet)
        }
      } catch (error) {
        console.error('Error loading trajet:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrajet()
  }, [id])

  if (loading) {
    return (
      <div className="p-4">
        <div className="ios-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!trajet) {
    return (
      <div className="p-4">
        <div className="ios-card p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trajet not found</h2>
          <p className="text-gray-600 mb-4">The requested trajet could not be found.</p>
          <button
            onClick={() => navigate('/trajets')}
            className="ios-button"
          >
            Back to Trajets
          </button>
        </div>
      </div>
    )
  }

  // Calculate map bounds
  const positions = trajet.positions.map(p => [p.latitude, p.longitude] as [number, number])
  const bounds = positions.length > 0 ? L.latLngBounds(positions) : undefined

  // Calculate center point
  const center: [number, number] = positions.length > 0 
    ? [positions[0][0], positions[0][1]]
    : [48.8566, 2.3522] // Default to Paris

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trajets')}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Route Map</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={center}
          zoom={13}
          bounds={bounds}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route polyline */}
          {positions.length > 1 && (
            <Polyline
              positions={positions}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}
          
          {/* Start marker */}
          {positions.length > 0 && (
            <Marker position={positions[0]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-green-600">Start</div>
                  <div className="text-sm text-gray-600">
                    {new Date(trajet.startTime).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* End marker */}
          {positions.length > 1 && (
            <Marker position={positions[positions.length - 1]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-600">End</div>
                  <div className="text-sm text-gray-600">
                    {new Date(trajet.endTime).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom Info Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{trajet.distance.toFixed(1)} km</div>
            <div className="text-sm text-gray-600">Distance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(trajet.duration)}</div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{trajet.manoeuvres}</div>
            <div className="text-sm text-gray-600">Manoeuvres</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{trajet.cityPercentage}%</div>
            <div className="text-sm text-gray-600">City Driving</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>{trajet.isNight ? '🌙' : '☀️'}</span>
          <span>{trajet.isNight ? 'Night Drive' : 'Day Drive'}</span>
        </div>
      </div>
    </div>
  )
}

export default MapView
