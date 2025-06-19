"use client"

import { useState } from "react"
import { Ticket, Calendar, QrCode, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApp } from "@/contexts/app-context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function TicketsPage() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  const activeTickets = state.userTickets.filter((ticket) => ticket.status === "active")
  const ticketHistory = state.userTickets.filter((ticket) => ticket.status !== "active")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "used":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelTicket = (ticketId: string) => {
    dispatch({ type: "CANCEL_TICKET", payload: ticketId })
    toast({
      title: "Ticket cancelled",
      description: "Your ticket has been cancelled successfully",
    })
  }

  const QRCodeModal = ({ ticket }: { ticket: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          Show QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">QR Code: {ticket.qrCode}</p>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold">{ticket.eventTitle}</h3>
            <p className="text-sm text-gray-600">
              {ticket.ticketType} × {ticket.quantity}
            </p>
            <p className="text-sm text-gray-500">{formatDate(ticket.eventDate)}</p>
          </div>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
        <p className="text-gray-600">Manage your event tickets and booking history</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Tickets ({activeTickets.length})</TabsTrigger>
          <TabsTrigger value="history">History ({ticketHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tickets</h3>
                <p className="text-gray-600 text-center mb-4">
                  You don't have any active tickets yet. Browse events to book your first ticket!
                </p>
                <Button onClick={() => (window.location.href = "/events")}>Browse Events</Button>
              </CardContent>
            </Card>
          ) : (
            activeTickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{ticket.eventTitle}</CardTitle>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(ticket.eventDate)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Ticket Type</p>
                          <p className="font-semibold">{ticket.ticketType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold">{ticket.quantity} ticket(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="font-semibold">{formatCurrency(ticket.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Purchase Date</p>
                          <p className="font-semibold">{formatDate(ticket.purchaseDate)}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <QRCodeModal ticket={ticket} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelTicket(ticket.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Ticket
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {ticketHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ticket History</h3>
                <p className="text-gray-600 text-center">
                  Your ticket history will appear here once you have past events.
                </p>
              </CardContent>
            </Card>
          ) : (
            ticketHistory.map((ticket) => (
              <Card key={ticket.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{ticket.eventTitle}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(ticket.eventDate)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium">{ticket.ticketType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium">{ticket.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium">{formatCurrency(ticket.totalPrice)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
