export type OrderStatus = 'Новый' | 'В пути' | 'Доставлен'

export interface OrderPoint {
  lat: number
  lng: number
}

export interface Order {
  id: number
  sender_city: string
  receiver_city: string
  pickup: OrderPoint
  delivery: OrderPoint
  status: OrderStatus
  date: string 
  weight: number
}
