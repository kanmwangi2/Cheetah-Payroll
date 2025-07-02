'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { db } from '@/lib/supabase-enhanced'
import { AuthUser, UserCompanyRole, Profile } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  setSelectedCompany: (companyId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await db.raw.auth.getSession()
      if (session?.user) {
        await loadUserData(session.user)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = db.raw.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (authUser: User) => {
    try {
      // Get user profile
      const { data: profile } = await db.select('profiles', {
        filters: { id: authUser.id },
        single: true
      })

      // Get user roles and company assignments
      const { data: roles } = await db.select('userCompanyRoles', {
        select: `
          *,
          companies (
            id,
            name
          )
        `,
        filters: { userId: authUser.id }
      })

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        profile: profile || undefined,
        roles: roles || [],
        selectedCompanyId: localStorage.getItem('selectedCompanyId') || undefined
      }

      setUser(userData)
    } catch (error) {
      console.error('Error loading user data:', error)
      setUser(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await db.raw.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('selectedCompanyId')
    await db.raw.auth.signOut()
    setUser(null)
  }

  const setSelectedCompany = (companyId: string) => {
    localStorage.setItem('selectedCompanyId', companyId)
    setUser(prev => prev ? { ...prev, selectedCompanyId: companyId } : null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      setSelectedCompany
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
