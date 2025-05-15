import Image from "next/image"
import Link from "next/link"

interface DashboardHeaderProps {
  heading: string
  text?: string
}

export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-berdu-text">{heading}</h1>
        {text && <p className="text-neutral-500">{text}</p>}
      </div>
      <Link href="/" className="flex items-center gap-2">
        <Image src="/images/berdu-logo.png" alt="Berdú Logo" width={120} height={40} className="h-auto" />
      </Link>
    </div>
  )
}
