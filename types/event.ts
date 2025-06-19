export interface Event {
  id: string
  title: string
  type: "concert" | "exhibition" | "seminar"
  date: string
  time: string
  location: string
  capacity: number
  participants: number
  description: string
  image: string
  ticketTypes: TicketType[]
}

export interface TicketType {
  id: string
  name: string
  price: number
  quota: number
  available: number
  features: string[]
  color: "regular" | "vip" | "vvip"
}

export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  ticketType: string
  quantity: number
  totalPrice: number
  purchaseDate: string
  eventDate: string
  status: "active" | "cancelled" | "used"
  qrCode: string
}

export interface User {
  id: string
  email: string
  name: string
  tickets: Ticket[]
}
