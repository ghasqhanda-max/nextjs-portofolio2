export interface Property {
  id: string
  name: string
  location: string
  price: number
  beds: number
  baths: number
  sqft: number
  image: string
  description: string
  status: "available" | "reserved"
  agent?: string
  agentId?: string
  createdAt: string
  // optional multi-unit support
  unitsTotal?: number
  unitsAvailable?: number
}

export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  properties: number
  status: "active" | "inactive"
  joinDate: string
}

export interface Reservation {
  id: string
  customerId: string
  customerName: string
  propertyId: string
  propertyName: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string
  agentId?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "agent" | "customer"
  message: string
  timestamp: string
  isRead: boolean
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  agentId: string
  agentName: string
  propertyId: string
  propertyName: string
  status: "active" | "pending" | "completed"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Sunset Villa",
    location: "Malibu, CA",
    price: 450000,
    beds: 4,
    baths: 3,
    sqft: 3500,
    image: "/luxury-villa-with-sunset-view.jpg",
    description: "Beautiful beachfront villa with stunning ocean views",
    status: "available",
    agent: "John Smith",
    agentId: "agent-1",
    createdAt: "2024-01-15",
  },
  {
    id: "prop-2",
    name: "Ocean View",
    location: "Santa Monica, CA",
    price: 650000,
    beds: 5,
    baths: 4,
    sqft: 4200,
    image: "/modern-ocean-view-apartment.jpg",
    description: "Modern apartment with panoramic ocean views",
    status: "available",
    agent: "Sarah Johnson",
    agentId: "agent-2",
    createdAt: "2024-01-10",
  },
  {
    id: "prop-3",
    name: "Mountain Retreat",
    location: "Aspen, CO",
    price: 350000,
    beds: 3,
    baths: 2,
    sqft: 2800,
    image: "/mountain-cabin-retreat.png",
    description: "Cozy mountain cabin with fireplace and deck",
    status: "reserved",
    agent: "Mike Chen",
    agentId: "agent-3",
    createdAt: "2024-01-05",
  },
  {
    id: "prop-4",
    name: "City Penthouse",
    location: "New York, NY",
    price: 1200000,
    beds: 3,
    baths: 3,
    sqft: 3000,
    image: "/luxury-city-penthouse.png",
    description: "Luxury penthouse in the heart of Manhattan",
    status: "available",
    agent: "Emma Davis",
    agentId: "agent-4",
    createdAt: "2024-01-01",
  },
]

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "John Smith",
    email: "john@propertyhub.com",
    phone: "+1-555-0101",
    properties: 8,
    status: "active",
    joinDate: "2023-06-15",
  },
  {
    id: "agent-2",
    name: "Sarah Johnson",
    email: "sarah@propertyhub.com",
    phone: "+1-555-0102",
    properties: 12,
    status: "active",
    joinDate: "2023-05-20",
  },
  {
    id: "agent-3",
    name: "Mike Chen",
    email: "mike@propertyhub.com",
    phone: "+1-555-0103",
    properties: 6,
    status: "active",
    joinDate: "2023-07-10",
  },
  {
    id: "agent-4",
    name: "Emma Davis",
    email: "emma@propertyhub.com",
    phone: "+1-555-0104",
    properties: 15,
    status: "active",
    joinDate: "2023-04-05",
  },
]

export const mockReservations: Reservation[] = [
  {
    id: "res-1",
    customerId: "cust-1",
    customerName: "Alice Brown",
    propertyId: "prop-1",
    propertyName: "Sunset Villa",
    date: "2024-02-15",
    time: "10:00 AM",
    status: "confirmed",
    notes: "Customer interested in beachfront properties",
    agentId: "agent-1",
  },
  {
    id: "res-2",
    customerId: "cust-2",
    customerName: "Bob Wilson",
    propertyId: "prop-2",
    propertyName: "Ocean View",
    date: "2024-02-16",
    time: "2:00 PM",
    status: "pending",
    notes: "First time buyer",
    agentId: "agent-2",
  },
  {
    id: "res-3",
    customerId: "cust-3",
    customerName: "Carol Martinez",
    propertyId: "prop-3",
    propertyName: "Mountain Retreat",
    date: "2024-02-17",
    time: "11:00 AM",
    status: "completed",
    notes: "Viewed property, considering offer",
    agentId: "agent-3",
  },
]

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    customerId: "cust-1",
    customerName: "Sarah Johnson",
    agentId: "agent-1",
    agentName: "John Smith",
    propertyId: "prop-1",
    propertyName: "Sunset Villa",
    status: "active",
    lastMessage: "When can I schedule a viewing?",
    lastMessageTime: "2024-02-15 10:30 AM",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    customerId: "cust-2",
    customerName: "Mike Chen",
    agentId: "agent-2",
    agentName: "Sarah Johnson",
    propertyId: "prop-2",
    propertyName: "Ocean View",
    status: "active",
    lastMessage: "The property looks amazing!",
    lastMessageTime: "2024-02-15 9:15 AM",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    customerId: "cust-3",
    customerName: "Emma Davis",
    agentId: "agent-3",
    agentName: "Mike Chen",
    propertyId: "prop-3",
    propertyName: "Mountain Retreat",
    status: "completed",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2024-02-14 3:45 PM",
    unreadCount: 0,
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "cust-1",
    senderName: "Sarah Johnson",
    senderRole: "customer",
    message: "Hi, I'm interested in the Sunset Villa. Can you tell me more about it?",
    timestamp: "2024-02-15 10:00 AM",
    isRead: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "agent-1",
    senderName: "John Smith",
    senderRole: "agent",
    message: "Of course! The Sunset Villa is a beautiful 4-bedroom beachfront property with stunning ocean views.",
    timestamp: "2024-02-15 10:05 AM",
    isRead: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "cust-1",
    senderName: "Sarah Johnson",
    senderRole: "customer",
    message: "When can I schedule a viewing?",
    timestamp: "2024-02-15 10:30 AM",
    isRead: false,
  },
]
