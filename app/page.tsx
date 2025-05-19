import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PatientDashboard } from "@/components/patient-dashboard"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", session.user.id)
    .single()

  // Fetch appointments
  const { data: appointments = [] } = await supabase
    .from("appointments")
    .select("id, date, type, doctor")
    .eq("user_id", session.user.id)
    .order("date", { ascending: true })

  // Static mock data for other sections
  const documents = [
    { id: "1", name: "Consentimiento tratamiento", date: "2025-01-15" },
    { id: "2", name: "Radiografía panorámica", date: "2025-02-10" },
  ]

  const treatments = [
    {
      id: "1",
      name: "Ortodoncia",
      status: "En progreso",
      progress: 65,
      startDate: "2024-11-10",
    },
    {
      id: "2",
      name: "Blanqueamiento",
      status: "Completado",
      progress: 100,
      startDate: "2024-08-05",
      endDate: "2024-09-15",
    },
  ]

  const invoices = [
    { id: "1", name: "Factura Mayo 2025", amount: 120, date: "2025-05-05" },
    { id: "2", name: "Factura Abril 2025", amount: 85, date: "2025-04-05" },
  ]

  const reminders = [
    {
      id: "1",
      title: "Revisión semestral",
      description: "Programa tu revisión de rutina",
      date: "2025-11-14",
    },
    {
      id: "2",
      title: "Cambio de cepillo",
      description: "Es momento de cambiar tu cepillo dental",
      date: "2025-05-30",
    },
  ]

  const patientData = {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    appointments: appointments ?? [],
    documents,
    treatments,
    invoices,
    reminders,
  }

  console.log('DashboardPage: rendering with patient data', patientData)

  return (
    <DashboardShell>
      <DashboardHeader heading="Panel de Paciente" text="Gestiona tus citas, tratamientos y documentos" />
      <PatientDashboard patient={patientData} />
    </DashboardShell>
  )
}
