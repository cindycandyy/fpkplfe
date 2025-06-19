import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    // Fallback formatting
    return `Rp ${amount.toLocaleString("id-ID")}`
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    // Fallback formatting
    const date = new Date(dateString)
    const options = {
      weekday: "long" as const,
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    }

    // Simple fallback
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    return `${dayName}, ${day} ${monthName} ${year}`
  }
}

export function getEventTypeColor(type: string): string {
  switch (type) {
    case "concert":
      return "bg-purple-100 text-purple-800"
    case "exhibition":
      return "bg-blue-100 text-blue-800"
    case "seminar":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getTicketTypeColor(type: string): string {
  switch (type) {
    case "regular":
      return "border-gray-300 bg-gray-50"
    case "vip":
      return "border-yellow-300 bg-yellow-50"
    case "vvip":
      return "border-purple-300 bg-purple-50"
    default:
      return "border-gray-300 bg-gray-50"
  }
}
