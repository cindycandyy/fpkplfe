"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Event, Ticket, User } from "@/types/event"
import { mockEvents, mockTickets } from "@/lib/data"

interface CartItem {
  eventId: string
  ticketTypeId: string
  quantity: number
  price: number
}

interface AppState {
  user: User | null
  events: Event[]
  cart: CartItem[]
  userTickets: Ticket[]
  isAuthenticated: boolean
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: { eventId: string; ticketTypeId: string } }
  | { type: "CLEAR_CART" }
  | { type: "UPDATE_CART_QUANTITY"; payload: { eventId: string; ticketTypeId: string; quantity: number } }
  | { type: "PURCHASE_TICKETS"; payload: Ticket[] }
  | { type: "CANCEL_TICKET"; payload: string }

const initialState: AppState = {
  user: null,
  events: mockEvents,
  cart: [],
  userTickets: mockTickets,
  isAuthenticated: false,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [],
      }
    case "ADD_TO_CART":
      const existingItem = state.cart.find(
        (item) => item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId,
      )
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId
              ? { ...item, quantity: action.payload.quantity }
              : item,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, action.payload],
      }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (item) => !(item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId),
        ),
      }
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      }
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      }
    case "PURCHASE_TICKETS":
      return {
        ...state,
        userTickets: [...state.userTickets, ...action.payload],
        cart: [],
      }
    case "CANCEL_TICKET":
      return {
        ...state,
        userTickets: state.userTickets.map((ticket) =>
          ticket.id === action.payload ? { ...ticket, status: "cancelled" } : ticket,
        ),
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
