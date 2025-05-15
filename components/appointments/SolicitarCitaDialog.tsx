'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

export function SolicitarCitaDialog() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedHour, setSelectedHour] = useState<string | undefined>()
  const [reason, setReason] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Cargar horas disponibles al seleccionar fecha
  useEffect(() => {
    if (!selectedDate) return

    const fetchAvailability = async () => {
      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('availability')
        .select('hour')
        .eq('available', true)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())

      if (error) {
        toast({ title: 'Error', description: 'No se pudo cargar la disponibilidad', variant: 'destructive' })
        return
      }

      setAvailableHours(data.map((item: any) => item.hour))
    }

    fetchAvailability()
  }, [selectedDate])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHour || !reason) return

    setIsSubmitting(true)

    const fullDate = new Date(selectedDate)
    const [hour, minutes] = selectedHour.split(':')
    fullDate.setHours(parseInt(hour), parseInt(minutes), 0)

    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
      toast({ title: 'Error', description: 'Usuario no autenticado', variant: 'destructive' })
      setIsSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('appointments').insert({
      user_id: user.id,
      date: fullDate.toISOString(),
      status: 'pendiente',
      reason
    })

    if (insertError) {
      toast({ title: 'Error', description: 'No se pudo crear la cita', variant: 'destructive' })
    } else {
      toast({ title: 'Cita solicitada', description: 'Tu cita ha sido registrada correctamente' })
    }

    // Marcar la disponibilidad como ocupada
    await supabase
      .from('availability')
      .update({ available: false })
      .match({ date: fullDate.toISOString(), hour: selectedHour })

    setIsSubmitting(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Solicitar nueva cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />

          {selectedDate && (
            <Select onValueChange={setSelectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una hora disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableHours.map((hour) => (
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