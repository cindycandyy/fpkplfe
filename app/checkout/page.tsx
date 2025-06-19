"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Lock, Building, Smartphone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/contexts/app-context"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Ticket } from "@/types/event"

export default function CheckoutPage() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    bankAccount: "",
    eWalletProvider: "gopay",
  })

  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceFee = totalPrice * 0.05
  const finalTotal = totalPrice + serviceFee

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (paymentMethod === "credit-card") {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
        toast({
          title: "Incomplete form",
          description: "Please fill in all credit card details",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate different payment processing times
      const processingTime = paymentMethod === "credit-card" ? 2000 : paymentMethod === "bank-transfer" ? 1000 : 1500

      await new Promise((resolve) => setTimeout(resolve, processingTime))

      // Create tickets from cart
      const newTickets: Ticket[] = state.cart.map((item, index) => {
        const event = state.events.find((e) => e.id === item.eventId)
        const ticketType = event?.ticketTypes.find((t) => t.id === item.ticketTypeId)

        return {
          id: `T${Date.now()}-${index}`,
          eventId: item.eventId,
          eventTitle: event?.title || "",
          ticketType: ticketType?.name || "",
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          purchaseDate: new Date().toISOString().split("T")[0],
          eventDate: event?.date || "",
          status: "active" as const,
          qrCode: `QR${Date.now()}-${index}`,
        }
      })

      // Update available tickets (simulate inventory reduction)
      state.cart.forEach((item) => {
        const event = state.events.find((e) => e.id === item.eventId)
        if (event) {
          const ticketType = event.ticketTypes.find((t) => t.id === item.ticketTypeId)
          if (ticketType) {
            ticketType.available = Math.max(0, ticketType.available - item.quantity)
          }
        }
      })

      dispatch({ type: "PURCHASE_TICKETS", payload: newTickets })

      toast({
        title: "Payment successful! 🎉",
        description: `Your tickets have been booked successfully via ${paymentMethod.replace("-", " ")}`,
      })

      router.push("/booking-confirmation")
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.cart.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
        <p className="text-gray-600">Complete your ticket purchase safely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-green-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Building className="w-5 h-5 text-green-600" />
                  <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer">
                    Bank Transfer
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="e-wallet" id="e-wallet" />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <Label htmlFor="e-wallet" className="flex-1 cursor-pointer">
                    E-Wallet (GoPay, OVO, DANA)
                  </Label>
                </div>
              </RadioGroup>

              {/* Credit Card Form */}
              {paymentMethod === "credit-card" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === "bank-transfer" && (
                <div className="p-4 bg-green-50 rounded-lg space-y-3">
                  <h4 className="font-medium text-green-800">Bank Transfer Instructions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span className="font-medium">Bank Central Asia (BCA)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <span className="font-medium">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Name:</span>
                      <span className="font-medium">EventHub Indonesia</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium text-green-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Please transfer the exact amount and keep your receipt for verification.
                  </p>
                </div>
              )}

              {/* E-Wallet */}
              {paymentMethod === "e-wallet" && (
                <div className="p-4 bg-purple-50 rounded-lg space-y-4">
                  <div>
                    <Label htmlFor="ewallet-provider">Choose E-Wallet</Label>
                    <Select
                      value={formData.eWalletProvider}
                      onValueChange={(value) => handleInputChange("eWalletProvider", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select e-wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gopay">GoPay</SelectItem>
                        <SelectItem value="ovo">OVO</SelectItem>
                        <SelectItem value="dana">DANA</SelectItem>
                        <SelectItem value="linkaja">LinkAja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-purple-700">
                    <p>
                      You will be redirected to {formData.eWalletProvider.toUpperCase()} to complete your payment
                      securely.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.cart.map((item) => {
                const event = state.events.find((e) => e.id === item.eventId)
                const ticketType = event?.ticketTypes.find((t) => t.id === item.ticketTypeId)

                return (
                  <div key={`${item.eventId}-${item.ticketTypeId}`} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event?.title}</h4>
                        <p className="text-xs text-gray-600">
                          {ticketType?.name} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                )
              })}

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee (5%)</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay {formatCurrency(finalTotal)}
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center space-y-1">
                <div className="flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Secure 256-bit SSL encryption
                </div>
                <p>Your payment information is safe and secure</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
