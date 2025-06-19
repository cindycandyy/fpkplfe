"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Calendar, Ticket, Download, Share, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function BookingConfirmationPage() {
  const { state } = useApp()
  const router = useRouter()
  const [confettiShown, setConfettiShown] = useState(false)

  // Get the most recent tickets (just purchased)
  const recentTickets = state.userTickets
    .filter((ticket) => ticket.status === "active")
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5)

  const totalAmount = recentTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0)
  const totalTickets = recentTickets.reduce((sum, ticket) => sum + ticket.quantity, 0)

  useEffect(() => {
    // Simple confetti effect simulation
    if (!confettiShown) {
      setConfettiShown(true)
      // You could add a real confetti library here
    }
  }, [confettiShown])

  const handleDownloadTickets = () => {
    // Simulate ticket download
    const ticketData = recentTickets.map((ticket) => ({
      id: ticket.id,
      event: ticket.eventTitle,
      type: ticket.ticketType,
      quantity: ticket.quantity,
      qrCode: ticket.qrCode,
      date: ticket.eventDate,
    }))

    console.log("Downloading tickets:", ticketData)
    // In a real app, this would generate and download a PDF
  }

  const handleShareTickets = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Event Tickets",
        text: `I just booked ${totalTickets} tickets for ${recentTickets.length} events!`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">🎉 Booking Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your {totalTickets} ticket{totalTickets > 1 ? "s" : ""} {totalTickets > 1 ? "have" : "has"} been
            successfully purchased
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Total: {formatCurrency(totalAmount)}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {recentTickets.length} Event{recentTickets.length > 1 ? "s" : ""}
            </Badge>
          </div>

          <p className="text-gray-600">Confirmation details have been sent to your email address</p>
        </CardContent>
      </Card>

      {/* Ticket Details */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Tickets</h2>

        {recentTickets.map((ticket) => (
          <Card key={ticket.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{ticket.eventTitle}</CardTitle>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(ticket.eventDate)}</span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-semibold">{ticket.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">
                    {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-semibold">{formatCurrency(ticket.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket ID</p>
                  <p className="font-semibold text-xs">{ticket.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button onClick={() => router.push("/tickets")} className="bg-purple-600 hover:bg-purple-700">
          <Ticket className="w-4 h-4 mr-2" />
          View All Tickets
        </Button>

        <Button onClick={handleDownloadTickets} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Tickets
        </Button>

        <Button onClick={handleShareTickets} variant="outline">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Button onClick={() => router.push("/events")} variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Browse More Events
        </Button>
      </div>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">✅ What's Next?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Check your email for detailed confirmation</li>
                <li>• Download the EventHub mobile app</li>
                <li>• Save your QR codes for easy access</li>
                <li>• Arrive 30 minutes before event start</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-blue-600">ℹ️ Need to Know</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Show QR code at event entrance</li>
                <li>• Bring valid ID matching ticket name</li>
                <li>• Cancellation available up to 24 hours before</li>
                <li>• Contact support for any issues</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Reminder:</strong> Screenshots of QR codes are not accepted. Please use the original QR code from
              your ticket or mobile app.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
