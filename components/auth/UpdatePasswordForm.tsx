'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function UpdatePasswordForm() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Tomamos el recovery code del query param
  const recoveryCode = searchParams.get('code') ?? ''
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    if (!recoveryCode) {
      router.replace('/login')
    } else {
      setIsVerifying(false)
    }
  }, [recoveryCode, router])

  if (isVerifying) {
    return <div className="flex min-h-screen items-center justify-center">Verificando enlace...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)
    // Actualiza la contraseña usando el token que Supabase puso en la cookie
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setErrorMessage(error.message)
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Contraseña actualizada', description: 'Ya puedes iniciar sesión con tu nueva contraseña' })
      router.push('/login')
    }
    setIsLoading(false)
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Cambia tu contraseña</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {errorMessage && (
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}