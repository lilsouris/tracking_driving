import { createClient } from '@supabase/supabase-js'
import { Database, Profile, Trajet, NewTrajet, UpdateTrajet, GPSPosition } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Trajet functions
export const getTrajets = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('trajets')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit)
  return { data, error }
}

export const getTrajet = async (trajetId: string) => {
  const { data, error } = await supabase
    .from('trajets')
    .select('*')
    .eq('id', trajetId)
    .single()
  return { data, error }
}

export const createTrajet = async (trajet: NewTrajet) => {
  const { data, error } = await supabase
    .from('trajets')
    .insert(trajet)
    .select()
    .single()
  return { data, error }
}

export const updateTrajet = async (trajetId: string, updates: UpdateTrajet) => {
  const { data, error } = await supabase
    .from('trajets')
    .update(updates)
    .eq('id', trajetId)
    .select()
    .single()
  return { data, error }
}

export const deleteTrajet = async (trajetId: string) => {
  const { error } = await supabase
    .from('trajets')
    .delete()
    .eq('id', trajetId)
  return { error }
}

// Statistics functions
export const getTrajetStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('trajets')
    .select('distance_km, duration_seconds, manoeuvres, city_percentage, is_night')
    .eq('user_id', userId)
    .not('end_time', 'is', null)
  
  if (error) return { data: null, error }
  
  const stats = data.reduce((acc, trajet) => {
    acc.totalDistance += trajet.distance_km || 0
    acc.totalDuration += trajet.duration_seconds || 0
    acc.totalManoeuvres += trajet.manoeuvres || 0
    acc.cityDriving += trajet.city_percentage || 0
    acc.nightDrives += trajet.is_night ? 1 : 0
    acc.totalTrajets += 1
    return acc
  }, {
    totalDistance: 0,
    totalDuration: 0,
    totalManoeuvres: 0,
    cityDriving: 0,
    nightDrives: 0,
    totalTrajets: 0
  })
  
  return {
    data: {
      ...stats,
      averageCityPercentage: stats.totalTrajets > 0 ? Math.round(stats.cityDriving / stats.totalTrajets) : 0,
      totalHours: Math.round(stats.totalDuration / 3600 * 10) / 10
    },
    error: null
  }
}
