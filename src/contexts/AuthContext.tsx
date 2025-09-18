import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser, getProfile } from '../lib/supabase'
import type { Profile } from '../types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAnonymous: boolean
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setIsAnonymous(false)
          // Load user profile
          const { data: profileData } = await getProfile(currentUser.id)
          if (profileData) {
            setProfile(profileData)
          }
        } else {
          // Check for anonymous user in localStorage
          const anonymousUser = localStorage.getItem('anonymous_user')
          if (anonymousUser) {
            setIsAnonymous(true)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setIsAnonymous(false)
          localStorage.removeItem('anonymous_user')
          // Load user profile
          const { data: profileData } = await getProfile(session.user.id)
          if (profileData) {
            setProfile(profileData)
          }
        } else {
          setUser(null)
          setProfile(null)
          // Set anonymous user if no auth
          if (!localStorage.getItem('anonymous_user')) {
            localStorage.setItem('anonymous_user', 'true')
            setIsAnonymous(true)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('anonymous_user')
    setIsAnonymous(false)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (data) {
      setProfile(data)
    }
    
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAnonymous,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
