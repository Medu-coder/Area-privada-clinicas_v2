'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useToast } from '@/hooks/use-toast'
import { useFormStatus } from '@/hooks/use-form-status'

export function SolicitarCitaDialog({ onCreated }: { onCreated?: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedHour, setSelectedHour] = useState<string | undefined>()
  const [reason, setReason] = useState<string | undefined>()
  const { toast } = useToast()
  const { isLoading, error, start, setError, stop } = useFormStatus()
  const [open, setOpen] = useState(false)
  const supabase = supabaseBrowser
  
  useEffect(() => {
    const fetchAvailableDates = async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('date, hour')
        .eq('available', true)

      if (error) {
        console.error('Error al cargar fechas disponibles:', error)
        return
      }

      const uniqueDates = Array.from(new Set(data.map((d) => d.date)))

      setAvailableDates(uniqueDates)
    }

    fetchAvailableDates()
  }, [])

  useEffect(() => {
    if (!selectedDate) return

    const fetchHours = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('availability')
        .select('hour')
        .eq('available', true)
        .eq('date', dateStr)

      if (error) return console.error('Error al cargar horas', error)

      const hours = data.map((d) => d.hour.slice(0, 5))
      const uniqueHours = Array.from(new Set(hours)).sort()
      setAvailableHours(uniqueHours)
    }

    fetchHours()
  }, [selectedDate])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHour || !reason) return
    start()
    console.log('SolicitarCitaDialog: submit new appointment', { selectedDate, selectedHour, reason })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Usuario no autenticado')
      toast({ title: 'Error', description: 'Usuario no autenticado', variant: 'destructive' })
      stop()
      return
    }

    const [h, m] = selectedHour.split(':')
    const fullDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(h),
      parseInt(m),
      0
    )

    const dateStr = fullDate.toISOString().split('T')[0]
    const hourStr = selectedHour

    const appointmentDate = format(fullDate, "yyyy-MM-dd'T'HH:mm:ss")

    console.log('SolicitarCitaDialog: inserting appointment with data', {
      user_id: user.id,
      date: appointmentDate,
      reason,
      status: 'pendiente',
    })

    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: user.id,
      date: appointmentDate,
      reason,
      status: 'pendiente',
    })

    if (insertError) {
      setError('No se pudo registrar la cita')
      console.error('Error al insertar cita:', insertError)
      toast({ title: 'Error', description: 'No se pudo registrar la cita', variant: 'destructive' })
      stop()
      return
    } else {
      await supabase
        .from('availability')
        .update({ available: false })
        .eq('date', dateStr)
        .eq('hour', hourStr)

      console.log('SolicitarCitaDialog: availability updated', { dateStr, hourStr })
      // handle errors from this update if desired

      toast({ title: 'Cita registrada', description: 'La cita se registró correctamente' })
      stop()
      setOpen(false)
      setSelectedDate(undefined)
      setSelectedHour(undefined)
      setReason(undefined)
      onCreated?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">Solicitar nueva cita</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}
          <div className="w-full max-w-xs mx-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const formatted = format(date, 'yyyy-MM-dd')
                return !availableDates.includes(formatted)
              }}
            />
          </div>

          {selectedDate && (
            <Select onValueChange={setSelectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una hora disponible" />
              </SelectTrigger>
              <SelectContent>
                {[...new Set(availableHours)].map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Motivo de la cita" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Revisión">Revisión</SelectItem>
              <SelectItem value="Limpieza">Limpieza</SelectItem>
              <SelectItem value="Odontología">Odontología</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={isLoading || !selectedHour || !reason}>
            Confirmar cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}