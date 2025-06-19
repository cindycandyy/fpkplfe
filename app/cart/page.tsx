"use client"

import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/contexts/app-context"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    if (quantity === 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: { eventId, ticketTypeId } })
    } else {
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { eventId, ticketTypeId, quantity } })
    }
  }

  const removeItem = (eventId: string, ticketTypeId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { eventId, ticketTypeId } })
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    })
  }

  const proceedToCheckout = () => {
    router.push("/checkout")
  }

  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0)

  if (state.cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 text-center mb-4">Add some tickets to get started!</p>
            <Button onClick={() => router.push("/events")}>Browse Events</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">{totalItems} items in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {state.cart.map((item) => {
            const event = state.events.find((e) => e.id === item.eventId)
            const ticketType = event?.ticketTypes.find((t) => t.id === item.ticketTypeId)

            if (!event || !ticketType) return null

            return (
              <Card key={`${item.eventId}-${item.ticketTypeId}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-purple-600 font-medium mb-2">{ticketType.name} Ticket</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(ticketType.price)}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.eventId, item.ticketTypeId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatCurrency(totalPrice * 0.05)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice * 1.05)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={proceedToCheckout} className="w-full bg-green-600 hover:bg-green-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>

              <div className="text-xs text-gray-500 text-center">Secure checkout powered by EventHub</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
