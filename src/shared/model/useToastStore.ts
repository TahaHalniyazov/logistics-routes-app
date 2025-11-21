
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let counter = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  const showToast = (message: string, type: ToastType = 'info', timeout = 3000) => {
    const id = counter++
    toasts.value.push({ id, message, type })

    if (timeout > 0) {
      setTimeout(() => {
        removeToast(id)
      }, timeout)
    }
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast
  }
})
