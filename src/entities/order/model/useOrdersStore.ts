import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Order } from './types'
import { fetchOrders } from '../api/ordersApi'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedOrderId = ref<number | null>(null)
  const checkedOrderIds = ref<number[]>([])

  const hasLoadedOnce = ref(false)

  const loadOrders = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const data = await fetchOrders()
      orders.value = data
      hasLoadedOnce.value = true
    } catch (e) {
      console.error(e)
      error.value = 'Не удалось загрузить заказы'
    } finally {
      isLoading.value = false
    }
  }

  const updateOrder = (updated: Order) => {
    const index = orders.value.findIndex((o) => o.id === updated.id)
    if (index !== -1) {
      orders.value[index] = { ...updated }
    }
  }

  const toggleChecked = (id: number) => {
    if (checkedOrderIds.value.includes(id)) {
      checkedOrderIds.value = checkedOrderIds.value.filter((x) => x !== id)
    } else {
      checkedOrderIds.value = [...checkedOrderIds.value, id]
    }
  }

  const selectedOrder = computed(() =>
    orders.value.find((o) => o.id === selectedOrderId.value) ?? null
  )

  return {
    orders,
    isLoading,
    error,
    selectedOrderId,
    selectedOrder,
    checkedOrderIds,
    hasLoadedOnce,
    loadOrders,
    updateOrder,
    toggleChecked
  }
})
