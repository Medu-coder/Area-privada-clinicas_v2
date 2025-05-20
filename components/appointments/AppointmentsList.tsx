'use client'

import { format } from 'date-fns'
import { ModificarCitaDialog } from './ModificarCitaDialog'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, MoreVertical } from 'lucide-react'
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFormStatus } from '@/hooks/use-form-status'

interface AppointmentsListProps {
  onUpdated?: () => void
}

interface Appointment {
  id: string
  date: string
  reason: string
  status: string
}

export function AppointmentsList({ onUpdated }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const { isLoading, error, start, setError, stop } = useFormStatus()

  const fetchAppointments = async () => {
    start()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error obteniendo usuario:', userError)
      setError('Error obteniendo usuario.')
      stop()
      return
    }
    const userId = user.id

    console.log('AppointmentsList: fetchAppointments start for user', userId)
    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pendiente', 'confirmada'])
      .order('date', { ascending: true })

    console.log('AppointmentsList: fetched appointments for user', userId, data, fetchError)

    if (fetchError) {
      console.error('Error al obtener citas:', fetchError)
      setError('Error al obtener citas.')
    }

    if (data) {
      setAppointments(data)
    }

    stop()
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleCancel = async (appt: Appointment) => {
    const confirm = window.confirm('¿Estás seguro de que quieres cancelar esta cita?')
    if (!confirm) return

    start()

    console.log('AppointmentsList: cancelling appointment', appt.id)

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelada' })
      .eq('id', appt.id)
      .select()

    if (updateError) {
      console.error('Error al cancelar la cita:', updateError)
      setError('No se pudo cancelar la cita.')
      stop()
      return
    }

    console.log('AppointmentsList: appointment status set to cancelled, freeing availability slot', appt.id)

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
      setError('Error al actualizar disponibilidad.')
    }

    console.log('AppointmentsList: availability slot freed', dateStr, hourStr)

    setAppointments((prev) => prev.filter((a) => a.id !== appt.id))
    onUpdated?.()
    stop()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {error && (
        <p className="text-sm text-red-600 text-center py-2">
          {error}
        </p>
      )}
      {appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">
          No tienes citas activas.
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-berdu-text">
                    {format(new Date(appt.date), "EEEE d 'de' MMMM, HH:mm 'h'", { locale: es })}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      asChild
                      className="pl-2 text-left w-full"
                    >
                      <ModificarCitaDialog
                        appointmentId={appt.id}
                        currentDate={appt.date}
                        currentReason={appt.reason}
                        onUpdated={() => {
                          setAppointments((prev) => prev.filter((a) => a.id !== appt.id))
                          onUpdated?.()
                        }}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="pl-2 text-left w-full text-destructive"
                      onSelect={() => handleCancel(appt)}
                    >
                      Cancelar cita
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-berdu-text mb-1">Motivo: {appt.reason}</p>
                <p className="text-sm text-berdu-secondary capitalize">Estado: {appt.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}