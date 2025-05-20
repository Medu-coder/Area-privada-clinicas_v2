'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

export function ModificarCitaDialog({
  appointmentId,
  currentDate,
  currentReason,
  onUpdated,
}: ModificarCitaDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedHour, setSelectedHour] = useState<string>()
  const [reason, setReason] = useState<string>(currentReason)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

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
    setAvailableDates(uniqueDates)
  }

  const loadAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('availability')
      .select('hour')
      .eq('available', true)
      .eq('date', dateStr)
    if (error) {
      console.error('Error al cargar horas disponibles:', error)
      return
    }
    const hours = data.map((d) => d.hour.slice(0, 5))
    setAvailableHours(Array.from(new Set(hours)).sort())
  }

  useEffect(() => {
    if (!open) return
    const current = new Date(currentDate)
    setSelectedDate(current)
    setSelectedHour(current.toTimeString().slice(0, 5))
    setReason(currentReason)
    fetchAvailableDates()
    loadAvailability(current)
  }, [open])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHour || !reason) return
    setErrorMessage(null)
    setIsSubmitting(true)

    console.log('ModificarCitaDialog: submitting modification', {
      appointmentId,
      currentDate,
      selectedDate,
      selectedHour,
      reason,
    })

    const oldDateObj = new Date(currentDate)
    const oldDateStr = format(oldDateObj, 'yyyy-MM-dd')
    const oldHourStr = format(oldDateObj, 'HH:mm')
    console.log('ModificarCitaDialog: freeing old slot', { oldDateStr, oldHourStr })
    const { error: freeError } = await supabase
      .from('availability')
      .update({ available: true })
      .eq('date', oldDateStr)
      .eq('hour', oldHourStr)
    if (freeError) {
      console.error('Error liberando hueco antiguo:', freeError)
      setErrorMessage('Error liberando el hueco antiguo.')
    }

    const newDateStr = format(selectedDate, 'yyyy-MM-dd')
    console.log('ModificarCitaDialog: reserving new slot', { newDateStr, selectedHour })
    const { error: occupyError } = await supabase
      .from('availability')
      .update({ available: false })
      .eq('date', newDateStr)
      .eq('hour', selectedHour)
    if (occupyError) {
      console.error('Error reservando nuevo hueco:', occupyError)
      setErrorMessage('Error reservando el nuevo hueco.')
    }

    // If there was an error in either freeing or reserving, don't proceed
    if (freeError || occupyError) {
      setIsSubmitting(false)
      return
    }

    const [h, m] = selectedHour.split(':')
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(h, 10), parseInt(m, 10))
    console.log('ModificarCitaDialog: updating appointment in DB', { appointmentId, date: format(newDate, "yyyy-MM-dd'T'HH:mm:ss"), reason })
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ date: format(newDate, "yyyy-MM-dd'T'HH:mm:ss"), reason })
      .eq('id', appointmentId)
    if (updateError) {
      setErrorMessage('No se pudo modificar la cita.')
      toast({ title: 'Error', description: 'No se pudo modificar la cita', variant: 'destructive' })
    } else {
      toast({ title: 'Cita modificada', description: 'La cita se ha modificado correctamente' })
      console.log('ModificarCitaDialog: appointment updated successfully', appointmentId)
      setOpen(false)
      onUpdated()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Modificar cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modificar cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 text-center">
              {errorMessage}
            </p>
          )}
          <div className="w-full max-w-xs mx-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                if (date) loadAvailability(date)
              }}
              disabled={(date) => !availableDates.includes(format(date, 'yyyy-MM-dd'))}
            />
          </div>
          {selectedDate && (
            <Select onValueChange={setSelectedHour} value={selectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona hora" />
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
          <Select onValueChange={setReason} value={reason}>
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
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedHour || !reason}
          >
            Confirmar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}