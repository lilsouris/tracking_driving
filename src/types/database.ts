export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trajets: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          distance_km: number
          manoeuvres: number
          city_percentage: number
          route_type: 'city' | 'highway' | 'mixed'
          is_night: boolean
          gps_trace: any[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          duration_seconds?: number | null
          distance_km?: number
          manoeuvres?: number
          city_percentage?: number
          route_type?: 'city' | 'highway' | 'mixed'
          is_night?: boolean
          gps_trace?: any[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          distance_km?: number
          manoeuvres?: number
          city_percentage?: number
          route_type?: 'city' | 'highway' | 'mixed'
          is_night?: boolean
          gps_trace?: any[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Trajet = Database['public']['Tables']['trajets']['Row']
export type NewTrajet = Database['public']['Tables']['trajets']['Insert']
export type UpdateTrajet = Database['public']['Tables']['trajets']['Update']
export type NewProfile = Database['public']['Tables']['profiles']['Insert']
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']

export interface GPSPosition {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
  altitude?: number
  speed?: number
}
