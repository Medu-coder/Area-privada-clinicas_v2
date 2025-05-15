'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Appointment {
  id: string
  date: string
  reason: string
  status: string
}

export function AppointmentsList() {
  const DUMMY_USER_ID = 'd101c6ca-faeb-47dc-bc73-1daf9f5678a5'
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', DUMMY_USER_ID)
        .in('status', ['pendiente', 'confirmada'])
        .order('date', { ascending: true })

      if (error) {
        console.error('Error al obtener citas:', error)
      }

      if (data) {
        setAppointments(data)
      }

      setLoading(false)
    }

    fetchAppointments()
  }, [])

  const handleCancel = async (appt: Appointment) => {
    const confirm = window.confirm('¿Estás seguro de que quieres cancelar esta cita?')
    if (!confirm) return

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelada' })
      .eq('id', appt.id)
      .select()

    if (updateError) {
      console.error('Error al cancelar la cita:', updateError)
      alert('No se pudo cancelar la cita.')
      return
    }

    const dateObj = new Date(appt.date)
    const dateStr = dateObj.toISOString().split('T')[0]
    const hourStr = dateObj.toTimeString().slice(0, 8)

    const { error: availError } = await supabase
      .from('availability')
      .update({ available: true })
      .eq('date', dateStr)
      .eq('hour', hourStr)

    if (availError) {
      console.error('Error al actualizar disponibilidad:', availError)
    }

    setAppointments((prev) => prev.filter((a) => a.id !== appt.id))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        No tienes citas activas.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <Card key={appt.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>
                {format(new Date(appt.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => console.log('Modificar cita:', appt.id)}>
                  Modificar cita
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => handleCancel(appt)}
                >
                  Cancelar cita
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">Motivo: {appt.reason}</p>
            <p className="text-xs text-muted-foreground capitalize">Estado: {appt.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}