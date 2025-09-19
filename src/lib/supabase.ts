import { createClient } from '@supabase/supabase-js'
import type { Profile, NewTrajet, UpdateTrajet } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Missing', 
  key: supabaseAnonKey ? 'Set' : 'Missing' 
}) // Debug log

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey })
  throw new Error('Missing Supabase environment variables')
}

// Use untyped client to avoid strict generic mismatches during early development
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Supabase client created successfully') // Debug log

// Debug function to test Supabase connection
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...')
  try {
    // Test basic connection
    const { data, error } = await supabase.from('trajets').select('count').limit(1)
    console.log('Supabase connection test result:', { data, error })
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Supabase auth test result:', { user: user?.id, error: authError })
    
    return { connection: !error, auth: !!user, error: error || authError }
  } catch (err) {
    console.error('Supabase connection test failed:', err)
    return { connection: false, auth: false, error: err }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection
}

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
  console.log('getCurrentUser called') // Debug log
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('getCurrentUser result:', { user: user?.id, error }) // Debug log
    if (error) {
      console.error('getCurrentUser error:', error) // Debug log
    }
    return user
  } catch (err) {
    console.error('getCurrentUser exception:', err) // Debug log
    return null
  }
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
  console.log('getTrajets called with userId:', userId, 'limit:', limit) // Debug log
  
  try {
    const { data, error } = await supabase
      .from('trajets')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit)
    
    console.log('getTrajets result:', { data, error }) // Debug log
    
    if (error) {
      console.error('getTrajets error details:', error) // Debug log
    }
    
    return { data, error }
  } catch (err) {
    console.error('getTrajets exception:', err) // Debug log
    return { data: null, error: err }
  }
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
  console.log('getTrajetStats called with userId:', userId) // Debug log
  
  try {
    const { data, error } = await supabase
      .from('trajets')
      .select('distance_km, duration_seconds, manoeuvres, city_percentage, is_night')
      .eq('user_id', userId)
      .not('end_time', 'is', null)
    
    console.log('getTrajetStats result:', { data, error }) // Debug log
    
    if (error) {
      console.error('getTrajetStats error details:', error) // Debug log
      return { data: null, error }
    }
    
    const stats = (data as any[]).reduce((acc, trajet: any) => {
      acc.totalDistance += trajet?.distance_km || 0
      acc.totalDuration += trajet?.duration_seconds || 0
      acc.totalManoeuvres += trajet?.manoeuvres || 0
      acc.cityDriving += trajet?.city_percentage || 0
      acc.nightDrives += trajet?.is_night ? 1 : 0
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
    
    console.log('getTrajetStats calculated stats:', stats) // Debug log
    
    return {
      data: {
        ...stats,
        averageCityPercentage: stats.totalTrajets > 0 ? Math.round(stats.cityDriving / stats.totalTrajets) : 0,
        totalHours: Math.round(stats.totalDuration / 3600 * 10) / 10
      },
      error: null
    }
  } catch (err) {
    console.error('getTrajetStats exception:', err) // Debug log
    return { data: null, error: err }
  }
}
