"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail } from "lucide-react"

export default function AgentProfile() {
	const [profile, setProfile] = useState({
		name: "",
		email: "",
	})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : ""
			const storedName = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "{}")?.name || "" : ""
			const agentId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : ""
			
			setProfile({ email: storedEmail, name: storedName })

			if (!storedEmail) {
				setLoading(false)
				return
			}

			try {
				// Fetch agent profile
				const profileRes = await fetch(`/api/agent/profile?email=${encodeURIComponent(storedEmail)}`)
				if (profileRes.status === 200) {
					const profileData = await profileRes.json()
					if (profileData) {
						setProfile({
							name: profileData.name || storedName || "",
							email: storedEmail,
						})
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-blue-500 rounded-lg">
						<User className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-blue-800">Profil Saya</h1>
						<p className="text-blue-600 mt-1">Informasi profil dan data agen Anda</p>
					</div>
				</div>
			</div>

			{/* Profile Card */}
			<Card className="shadow-lg border-0">
				<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500 rounded-lg">
							<User className="w-5 h-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-xl text-gray-800">Informasi Profil</CardTitle>
							<CardDescription className="text-gray-600">Data pribadi Anda</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-8">
					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
							<p className="text-gray-500">Memuat data profil...</p>
						</div>
					) : (
						<>
							{/* Avatar Section */}
							<div className="flex justify-center mb-8">
								<div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
									<span className="text-white font-bold text-4xl">
										{profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
									</span>
								</div>
							</div>

							{/* Profile Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-2">
										<User className="w-5 h-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Nama Lengkap</span>
									</div>
									<p className="text-lg font-semibold text-gray-800">{profile.name || "Tidak tersedia"}</p>
								</div>

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-2">
										<Mail className="w-5 h-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Email</span>
									</div>
									<p className="text-lg font-semibold text-gray-800">{profile.email || "Tidak tersedia"}</p>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

		</div>
	)
}
