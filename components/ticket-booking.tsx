"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ShoppingCart, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/types/event"
import { formatCurrency, getTicketTypeColor } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"

interface TicketBookingProps {
  event: Event
}

export function TicketBooking({ event }: TicketBookingProps) {
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({})
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const router = useRouter()

  const handleTicketSelect = (ticketId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }))
  }

  const checkAuthAndProceed = (callback: () => void) => {
    if (!state.isAuthenticated) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to book tickets",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    callback()
  }

  const handleAddToCart = () => {
    checkAuthAndProceed(() => {
      Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
        if (quantity > 0) {
          const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId)
          if (ticketType) {
            dispatch({
              type: "ADD_TO_CART",
              payload: {
                eventId: event.id,
                ticketTypeId,
                quantity,
                price: ticketType.price,
              },
            })
          }
        }
      })

      toast({
        title: "Added to cart!",
        description: "Tickets have been added to your cart",
      })

      router.push("/cart")
    })
  }

  const handleBookNow = () => {
    checkAuthAndProceed(() => {
      // Clear existing cart first
      dispatch({ type: "CLEAR_CART" })

      // Add selected tickets to cart
      Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
        if (quantity > 0) {
          const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId)
          if (ticketType) {
            dispatch({
              type: "ADD_TO_CART",
              payload: {
                eventId: event.id,
                ticketTypeId,
                quantity,
                price: ticketType.price,
              },
            })
          }
        }
      })

      toast({
        title: "Proceeding to checkout",
        description: "Taking you to secure checkout",
      })

      // Go directly to checkout
      router.push("/checkout")
    })
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)
  const totalPrice = event.ticketTypes.reduce((sum, ticket) => {
    const quantity = selectedTickets[ticket.id] || 0
    return sum + ticket.price * quantity
  }, 0)

  return (
    <div className="sticky top-8">
      <Card>
        <CardHeader>
          <CardTitle>Book Tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.ticketTypes.map((ticket) => (
            <div key={ticket.id} className={`border rounded-lg p-4 ${getTicketTypeColor(ticket.color)}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{ticket.name}</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(ticket.price)}</p>
                </div>
                <Badge variant={ticket.available > 0 ? "default" : "destructive"}>
                  {ticket.available > 0 ? `${ticket.available} left` : "Sold Out"}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {ticket.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {ticket.available > 0 ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTicketSelect(ticket.id, Math.max(0, (selectedTickets[ticket.id] || 0) - 1))}
                    disabled={!selectedTickets[ticket.id]}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{selectedTickets[ticket.id] || 0}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTicketSelect(ticket.id, Math.min(ticket.available, (selectedTickets[ticket.id] || 0) + 1))
                    }
                    disabled={selectedTickets[ticket.id] >= ticket.available}
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full bg-red-500 hover:bg-red-500">
                  <X className="w-4 h-4 mr-2" />
                  Not Available
                </Button>
              )}
            </div>
          ))}

          {totalTickets > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total ({totalTickets} tickets)</span>
                <span className="text-xl font-bold">{formatCurrency(totalPrice)}</span>
              </div>

              <div className="space-y-2">
                <Button onClick={handleBookNow} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book Now
                </Button>

                <Button onClick={handleAddToCart} variant="outline" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-4">
            Pembatalan dapat dilakukan hingga 24 jam sebelum event
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
