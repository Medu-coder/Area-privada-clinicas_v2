'use client'

import React from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  initialSession: Session | null
  children: React.ReactNode
}

export function AuthProvider({
  initialSession,
  children,
}: AuthProviderProps) {
  // Aquí creamos el cliente en el entorno browser
  const supabase = createClientComponentClient()

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  )
}