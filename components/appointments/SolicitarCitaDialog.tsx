'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

export function SolicitarCitaDialog({ onCreated }: { onCreated?: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedHour, setSelectedHour] = useState<string | undefined>()
  const [reason, setReason] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Nueva lógica: solo fechas con al menos una franja disponible
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

      const hours = data.map((d) => d.hour.slice(0, 5)) // transforma "14:00:00" → "14:00"
      const uniqueHours = Array.from(new Set(hours)).sort()
      setAvailableHours(uniqueHours)
    }

    fetchHours()
  }, [selectedDate])

  const handleSubmit = async () => {
    // Paso 1: Log al entrar en handleSubmit
    console.log('🔍 handleSubmit llamado')
    console.log('Fecha seleccionada:', selectedDate)
    console.log('Hora seleccionada:', selectedHour)
    console.log('Motivo:', reason)
    if (!selectedDate || !selectedHour || !reason) return

    setIsSubmitting(true)

    const user = { id: 'd101c6ca-faeb-47dc-bc73-1daf9f5678a5' }
    // Paso 2: Log después de obtener el usuario
    console.log('Usuario:', user)
    if (!user) {
      toast({ title: 'Error', description: 'Usuario no autenticado', variant: 'destructive' })
      setIsSubmitting(false)
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
    const hourStr = selectedHour // ya está en formato "HH:mm"

    // Paso 3: Log antes de insertar la cita
    console.log('Insertando cita con:', {
      user_id: user.id,
      date: fullDate.toISOString(),
      reason,
      status: 'pendiente',
    })

    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: user.id,
      date: fullDate.toISOString(),
      reason,
      status: 'pendiente',
    })

    // Paso 4: Log después de la inserción
    if (insertError) {
      console.error('❌ Error al insertar cita:', insertError)
      toast({ title: 'Error', description: 'No se pudo registrar la cita', variant: 'destructive' })
    } else {
      await supabase
        .from('availability')
        .update({ available: false })
        .eq('date', dateStr)
        .eq('hour', hourStr)

      // Paso 5: Log después de actualizar la disponibilidad
      console.log('📌 Disponibilidad actualizada:', { date: dateStr, hour: hourStr })

      toast({ title: 'Cita registrada', description: 'La cita se registró correctamente' })
      setOpen(false)
      setSelectedDate(undefined)
      setSelectedHour(undefined)
      setReason(undefined)
      onCreated?.()
    }

    setIsSubmitting(false)
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
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const formatted = format(date, 'yyyy-MM-dd')
              return !availableDates.includes(formatted)
            }}
          />

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

          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedHour || !reason}>
            Confirmar cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}