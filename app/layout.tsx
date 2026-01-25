import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const interFont = Inter({ subsets: ["latin"], variable: "--font-sans" })
const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "Nam3Land - Platform Layanan Pelanggan Properti",
  description: "Platform layanan pelanggan dan pemasaran properti",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${interFont.variable} ${poppinsFont.variable} bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
