import axios from 'axios'
import type { Order } from '../model/types'

export async function fetchOrders(): Promise<Order[]> {
  const response = await axios.get<Order[]>('/mock/orders.json')
  return response.data
}
