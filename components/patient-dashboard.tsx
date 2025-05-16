"use client";
import React, { useState, useEffect } from 'react'
import { Calendar, Download, FileText, Bell, Clock, Upload } from "lucide-react"
import { LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreatmentCard } from "@/components/treatment-card"
import { ReminderCard } from "@/components/reminder-card"
import { DocumentCard } from "@/components/document-card"
import { InvoiceCard } from "@/components/invoice-card"
import { SolicitarCitaDialog } from '@/components/appointments/SolicitarCitaDialog'
import { AppointmentsList } from '@/components/appointments/AppointmentsList'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Patient {
  name: string
  email: string
  appointments: Array<{
    id: string
    date: string
    type: string
    doctor: string
  }>
  documents: Array<{
    id: string
    name: string
    date: string
  }>
  treatments: Array<{
    id: string
    name: string
    status: string
    progress: number
    startDate: string
    endDate?: string
  }>
  invoices: Array<{
    id: string
    name: string
    amount: number
    date: string
  }>
  reminders: Array<{
    id: string
    title: string
    description: string
    date: string
  }>
}

interface PatientDashboardProps {
  patient: Patient
}

export function PatientDashboard({ patient }: PatientDashboardProps) {
  console.log('PatientDashboard: render start', patient)
  const router = useRouter()
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null)

  useEffect(() => {
    console.log('PatientDashboard: checking session')
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.log('PatientDashboard: no active session, redirecting to login')
        router.replace('/login')
      } else {
        console.log('PatientDashboard: session valid, rendering dashboard')
        setLoadingAuth(false)
        supabase
          .from('users')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('PatientDashboard: error fetching profile', error)
            } else {
              setProfile(data)
            }
          })
      }
    })
  }, [router])

  if (loadingAuth) {
    return null
  }

  const handleLogout = async () => {
    console.log('PatientDashboard: logging out')
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const handleAppointmentCreated = () => {
    console.log('PatientDashboard: appointment created, triggering refresh')
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="grid gap-6">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl text-berdu-text">Bienvenido/a, {profile?.full_name ?? patient.name}</CardTitle>
            <CardDescription className="text-berdu-text opacity-75">{profile?.email ?? patient.email}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sección de Citas */}
        <Card className="border-none shadow-sm bg-white md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Tus citas</CardTitle>
            <Calendar className="h-5 w-5 text-berdu-text" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4">
              <AppointmentsList key={refreshKey} onUpdated={handleAppointmentCreated} />
            </div>
          </CardContent>
          <CardFooter>
            <SolicitarCitaDialog onCreated={handleAppointmentCreated} />
          </CardFooter>
        </Card>

        {/* Sección de Recordatorios */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Recordatorios</CardTitle>
            <Bell className="h-5 w-5 text-berdu-text" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4">
              {patient.reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Planes de Tratamiento */}
        <Card className="border-none shadow-sm bg-white md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Planes de tratamiento</CardTitle>
            <Clock className="h-5 w-5 text-berdu-text" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4">
              {patient.treatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Descargas */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Descargas</CardTitle>
            <Download className="h-5 w-5 text-berdu-text" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4">
              {patient.invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Ver historial médico
            </Button>
          </CardFooter>
        </Card>

        {/* Sección de Documentos */}
        <Card className="border-none shadow-sm bg-white md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Documentos</CardTitle>
            <FileText className="h-5 w-5 text-berdu-text" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patient.documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
              <Card className="flex h-[140px] flex-col items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Subir nuevo documento</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
