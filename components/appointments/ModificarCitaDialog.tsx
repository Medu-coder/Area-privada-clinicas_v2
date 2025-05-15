'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface ModificarCitaDialogProps {
  appointmentId: string
  currentDate: string
  currentReason: string
  onUpdated: () => void
}

export function ModificarCitaDialog({ appointmentId, currentDate, currentReason, onUpdated }: ModificarCitaDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(currentDate))
  const [selectedHour, setSelectedHour] = useState<string | undefined>()
  const [reason, setReason] = useState(currentReason)
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [availableDatesStr, setAvailableDatesStr] = useState<string[]>([])
  const { toast } = useToast()

  const loadAvailability = async (date: Date) => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('availability')
      .select('hour')
      .eq('available', true)
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())

    if (!error && data) {
      setAvailableHours(data.map((d) => d.hour))
    } else {
      toast({ title: 'Error al cargar disponibilidad', variant: 'destructive' })
    }
  }

  const fetchAvailableDates = async () => {
    const { data, error } = await supabase
      .from('availability')
      .select('date')
      .eq('available', true)

    if (error) {
      console.error('Error al cargar fechas disponibles:', error)
      return
    }

    const uniqueDates = Array.from(new Set(data.map((d) => d.date.split('T')[0])))
    setAvailableDatesStr(uniqueDates)
  }

  const handleOpen = () => {
    setOpen(true)
    fetchAvailableDates()
    if (selectedDate) loadAvailability(selectedDate)
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHour || !reason) return

    const newDate = new Date(selectedDate)
    const [hour, minute] = selectedHour.split(':')
    newDate.setHours(parseInt(hour), parseInt(minute))

    const dateStr = newDate.toISOString().split('T')[0]
    const hourStr = newDate.toTimeString().slice(0, 8)

    const { error: updateError } = await supabase
      .from('appointments')
      .update({ date: newDate.toISOString(), reason })
      .eq('id', appointmentId)

    if (updateError) {
      toast({ title: 'No se pudo modificar la cita', variant: 'destructive' })
      return
    }

    await supabase
      .from('availability')
      .update({ available: false })
      .eq('date', dateStr)
      .eq('hour', hourStr)

    toast({ title: 'Cita modificada correctamente' })
    setOpen(false)
    onUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" onClick={handleOpen}>Modificar cita</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modificar cita</DialogTitle>
        </DialogHeader>

        <Calendar
          selected={selectedDate}
          onSelect={(date: Date | undefined) => {
            setSelectedDate(date)
            if (date) loadAvailability(date)
          }}
          disabled={(date) => {
            const dateStr = date.toISOString().split('T')[0]
            return !availableDatesStr.includes(dateStr)
          }}
        />

        <Select onValueChange={setSelectedHour} defaultValue={selectedHour}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una hora" />
          </SelectTrigger>
          <SelectContent>
            {availableHours.map((hour) => (
              <SelectItem key={hour} value={hour}>{hour}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setReason} defaultValue={reason}>
          <SelectTrigger>
            <SelectValue placeholder="Motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Revisión">Revisión</SelectItem>
            <SelectItem value="Limpieza">Limpieza</SelectItem>
            <SelectItem value="Odontología">Odontología</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Confirmar cambios
        </Button>
      </DialogContent>
    </Dialog>
  )
}
