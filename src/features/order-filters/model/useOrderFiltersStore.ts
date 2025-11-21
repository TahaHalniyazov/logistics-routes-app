import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderStatus } from '@entities/order/model/types'

export type StatusFilter = '' | 'Все' | OrderStatus

export const useOrderFiltersStore = defineStore('orderFilters', () => {
  const status = ref<StatusFilter>('')
  const dateFrom = ref<string>('')       
  const dateTo = ref<string>('')
  const cityQuery = ref<string>('')        

  const reset = () => {
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    cityQuery.value = ''
  }

  return {
    status,
    dateFrom,
    dateTo,
    cityQuery,
    reset
  }
})
