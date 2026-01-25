"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('customerNotifications')
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications)
      setNotifications(parsed)
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('customerNotifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id)
      const removed = prev.find(notification => notification.id === id)
      if (removed && !removed.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return updated
    })
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem('customerNotifications')
  }, [])

  // Simulate receiving new notifications (for demo purposes)
  const simulateNewNotification = useCallback(() => {
    const types: Notification['type'][] = ['info', 'success', 'warning', 'error']
    const messages = [
      { title: 'Properti Baru Tersedia', message: 'Properti yang sesuai dengan kriteria Anda telah ditambahkan', type: 'info' as const },
      { title: 'Reservasi Disetujui', message: 'Reservasi Anda untuk properti telah disetujui', type: 'success' as const },
      { title: 'Pesan Baru dari Agen', message: 'Agen telah mengirimkan pesan baru kepada Anda', type: 'info' as const },
      { title: 'Pembaruan Harga', message: 'Harga properti yang Anda simpan telah berubah', type: 'warning' as const },
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    addNotification({
      title: randomMessage.title,
      message: randomMessage.message,
      type: randomMessage.type,
      actionUrl: '/dashboard/customer/properties'
    })
  }, [addNotification])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    simulateNewNotification
  }
}
