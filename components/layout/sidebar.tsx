"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
	LayoutDashboard,
	Building2,
	Users,
	Calendar,
	Settings,
	MessageSquare,
	LogOut,
	Menu,
	X,
	Home,
	FileText,
} from "lucide-react"

interface SidebarProps {
	role: "admin" | "agent" | "customer"
}

export default function Sidebar({ role }: SidebarProps) {
	const router = useRouter()
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)

	const handleLogout = () => {
		localStorage.removeItem("userRole")
		localStorage.removeItem("userData")
		localStorage.removeItem("userEmail")
		localStorage.removeItem("userId")
		router.push("/")
	}

	const getNavItems = () => {
		const baseItems = [
			{
				label: "Dasbor",
				href: `/dashboard/${role}`,
				icon: LayoutDashboard,
			},
		]

		if (role === "admin") {
			return [
				...baseItems,
				{ label: "Properti", href: `/dashboard/${role}/properties`, icon: Building2 },
				{ label: "Agen", href: `/dashboard/${role}/agents`, icon: Users },
				{ label: "Reservasi", href: `/dashboard/${role}/reservations`, icon: Calendar },
				{ label: "Laporan", href: `/dashboard/${role}/report`, icon: FileText },
				{ label: "Pengaturan", href: `/dashboard/${role}/settings`, icon: Settings },
			]
		}

		if (role === "agent") {
			return [
				...baseItems,
				{ label: "Chat", href: `/dashboard/${role}/chat`, icon: MessageSquare },
				{ label: "Pelanggan", href: `/dashboard/${role}/customers`, icon: Users },
				{ label: "Reservasi", href: `/dashboard/${role}/reservations`, icon: Calendar },
				{ label: "Profil", href: `/dashboard/${role}/profile`, icon: Settings },
			]
		}

		if (role === "customer") {
			return [
				...baseItems,
				{ label: "Properti", href: `/dashboard/${role}/properties`, icon: Home },
				{ label: "Chat", href: `/dashboard/${role}/chat`, icon: MessageSquare },
				{ label: "Reservasi", href: `/dashboard/${role}/reservations`, icon: Calendar },
				{ label: "Profil", href: `/dashboard/${role}/profile`, icon: Settings },
			]
		}

		return baseItems
	}

	const navItems = getNavItems()

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-card rounded-lg"
			>
				{isOpen ? <X size={24} /> : <Menu size={24} />}
			</button>

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 ${
					isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				}`}
			>
				<div className="p-6 border-b border-border">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<span className="text-white font-bold">N</span>
						</div>
						<span className="font-heading font-bold text-lg text-primary">Nam3Land</span>
					</div>
					<p className="text-xs text-muted-foreground mt-2 capitalize">{role} Portal</p>
				</div>

				<nav className="p-4 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon
						const isActive = pathname === item.href
						
						return (
							<Link key={item.href} href={item.href}>
								<button
									onClick={() => setIsOpen(false)}
									className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
										isActive ? "bg-primary text-white" : "text-foreground hover:bg-muted"
									}`}
								>
									<Icon size={20} />
									<span className="font-medium">{item.label}</span>
								</button>
							</Link>
						)
					})}
				</nav>

				<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
					<Button onClick={handleLogout} variant="outline" className="w-full flex items-center gap-2 bg-transparent">
						<LogOut size={18} />
						Keluar
					</Button>
				</div>
			</aside>

			{/* Mobile Overlay */}
			{isOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
			)}
		</>
	)
}
