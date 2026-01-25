"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Calendar, MapPin, X, Mail, Home } from "lucide-react";

interface ConversationRow {
  id: string;
  customerId: string;
  customerName: string;
  propertyName: string;
  status: "active" | "pending" | "completed";
}
interface ChatMessageRow {
  id: string;
  senderRole: "agent" | "customer";
  message: string;
  timestamp: string;
}
interface ReservationInfo {
  propertyName: string;
  status: string;
  reservationTime: string;
  notes: string;
}
interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface ChatWindowProps {
  conversation: ConversationRow;
  messages: ChatMessageRow[];
  isTyping: boolean;
  onSendMessage: () => void;
  newMessage: string;
  onNewMessageChange: (message: string) => void;
  onEndConversation: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  isTyping,
  onSendMessage,
  newMessage,
  onNewMessageChange,
  onEndConversation,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [reservation, setReservation] = useState<ReservationInfo | null>(null);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/conversations/reservation?conversationId=${conversation.id}`
        );
        if (res.ok) setReservation(await res.json());
      } catch {}
    })();
  }, [conversation.id]);

  const fetchCustomerProfile = async () => {
    try {
      const res = await fetch(
        `/api/customer/profile?customerId=${conversation.customerId}`
      );
      if (res.ok) {
        const profile = await res.json();
        setCustomerProfile(profile);
        setShowCustomerModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch customer profile:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {conversation.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-800 text-lg">
              {conversation.customerName}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {conversation.propertyName}
              </p>
              {reservation && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {reservation.status} •{" "}
                  {new Date(reservation.reservationTime).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={fetchCustomerProfile}
              title="Lihat Profile Customer"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={onEndConversation}
              disabled={conversation.status === "completed"}
              title="Akhiri percakapan ini"
            >
              Tutup Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Belum ada pesan</p>
            <p className="text-sm text-gray-400 mt-1">
              Mulai percakapan dengan mengirim pesan
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderRole === "agent" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                {message.senderRole === "customer" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {conversation.customerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.senderRole === "agent"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.senderRole === "agent"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                {message.senderRole === "agent" && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    A
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {conversation.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {conversation.status === "completed" && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            Percakapan ini sudah diakhiri. Anda tidak dapat mengirim pesan baru.
          </div>
        )}
        <div className="flex gap-3">
          <Input
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4"
            disabled={conversation.status === "completed"}
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || conversation.status === "completed"}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {showCustomerModal && customerProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Customer
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {customerProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">
                    {customerProfile.name}
                  </h4>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-800">
                      {customerProfile.email}
                    </p>
                  </div>
                </div>

                {customerProfile.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Telepon</p>
                      <p className="text-sm font-medium text-gray-800">
                        {customerProfile.phone}
                      </p>
                    </div>
                  </div>
                )}

                {customerProfile.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Home className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Alamat</p>
                      <p className="text-sm font-medium text-gray-800">
                        {customerProfile.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Bergabung</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(customerProfile.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowCustomerModal(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
