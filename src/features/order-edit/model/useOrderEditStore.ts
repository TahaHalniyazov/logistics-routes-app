
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderEditStore = defineStore('orderEdit', () => {
  const isOpen = ref(false)
  const editingOrderId = ref<number | null>(null)

  const open = (orderId: number) => {
    editingOrderId.value = orderId
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    editingOrderId.value = null
  }

  return {
    isOpen,
    editingOrderId,
    open,
    close
  }
})
