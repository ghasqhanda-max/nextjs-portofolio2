"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"


export default function CustomerProfile() {
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		joinDate: "",
	})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : ""
			const storedName = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "{}")?.name || "" : ""
			const customerId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : ""
			
			setProfile({ 
				email: storedEmail, 
				name: storedName,
				phone: "",
				address: "",
				joinDate: ""
			})

			if (!customerId) {
				setLoading(false)
				return
			}

			try {
				// Fetch customer profile
				const profileRes = await fetch(`/api/customer/profile?customerId=${encodeURIComponent(customerId)}`)
				if (profileRes.status === 200) {
					const profileData = await profileRes.json()
					if (profileData) {
						setProfile({
							name: profileData.name || storedName || "",
							email: profileData.email || storedEmail || "",
							phone: profileData.phone || "Tidak tersedia",
							address: profileData.address || "Tidak tersedia",
							joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID') : "Tidak tersedia",
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
			<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-green-500 rounded-lg">
						<User className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-green-800">Profil Saya</h1>
						<p className="text-green-600 mt-1">Informasi profil dan data customer Anda</p>
					</div>
				</div>
			</div>

			{/* Profile Card */}
			<Card className="shadow-lg border-0">
				<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-500 rounded-lg">
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
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
							<p className="text-gray-500">Memuat data profil...</p>
						</div>
					) : (
						<>
							{/* Avatar Section */}
							<div className="flex justify-center mb-8">
								<div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
									<span className="text-white font-bold text-4xl">
										{profile.name ? profile.name.charAt(0).toUpperCase() : "C"}
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

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-2">
										<Phone className="w-5 h-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Telepon</span>
									</div>
									<p className="text-lg font-semibold text-gray-800">{profile.phone}</p>
								</div>

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-2">
										<MapPin className="w-5 h-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Alamat</span>
									</div>
									<p className="text-lg font-semibold text-gray-800">{profile.address}</p>
								</div>

								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-2">
										<Calendar className="w-5 h-5 text-gray-500" />
										<span className="text-sm font-medium text-gray-600">Bergabung</span>
									</div>
									<p className="text-lg font-semibold text-gray-800">{profile.joinDate}</p>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

		</div>
	)
}
