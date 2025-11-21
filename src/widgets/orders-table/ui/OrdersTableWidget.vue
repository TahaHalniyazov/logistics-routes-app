<template>
  <section class="orders-table">
    <header class="orders-table__header">
      <div>
        <h2 class="orders-table__title">Заказы</h2>
        <p class="orders-table__subtitle">
          Фильтруйте, выбирайте и смотрите маршрут на карте
        </p>
      </div>
      <div class="orders-table__header-actions">
        <button class="orders-table__reset" type="button" @click="resetFilters">
          Сбросить фильтры
        </button>
        <button class="orders-table__refresh" type="button" @click="handleRefresh">
          Обновить
        </button>
      </div>
    </header>


    <div class="orders-table__filters">
      <div class="orders-table__filter">
        <label class="orders-table__filter-label">Статус</label>
        <select v-model="status" class="orders-table__select">
          <option value="">Все</option>
          <option value="Новый">Новый</option>
          <option value="В пути">В пути</option>
          <option value="Доставлен">Доставлен</option>
        </select>
      </div>

      <div class="orders-table__filter orders-table__filter--dates">
        <label class="orders-table__filter-label">Дата</label>
        <div class="orders-table__date-row">
          <input
            v-model="dateFrom"
            type="date"
            class="orders-table__input"
            placeholder="От"
          />
          <span class="orders-table__date-separator">–</span>
          <input
            v-model="dateTo"
            type="date"
            class="orders-table__input"
            placeholder="До"
          />
        </div>
      </div>

      <div class="orders-table__filter orders-table__filter--full">
        <label class="orders-table__filter-label">Город</label>
        <input
          v-model="cityQuery"
          type="text"
          class="orders-table__input"
          placeholder="Москва, Казань…"
        />
      </div>
    </div>

    <div class="orders-table__body">

      <div v-if="isLoading" class="orders-table__state">
        <div class="orders-table__spinner"></div>
        <div class="orders-table__state-title">Загружаем заказы…</div>
      </div>


      <div v-else-if="error" class="orders-table__state">
        <div class="orders-table__state-title">Ошибка загрузки</div>
        <div class="orders-table__state-text">
          {{ error }}. Попробуйте обновить список.
        </div>
      </div>

     
      <div
        v-else-if="filteredOrders.length === 0"
        class="orders-table__state"
      >
        <div class="orders-table__empty-icon">🔍</div>
        <div class="orders-table__state-title">Ничего не найдено</div>
        <div class="orders-table__state-text">
          Попробуйте изменить параметры фильтрации.
        </div>
      </div>


      <div v-else class="orders-table__list">
        <div class="orders-table__head">
          <div class="orders-table__cell orders-table__cell--checkbox"></div>
          <div class="orders-table__cell">ID</div>
          <div class="orders-table__cell">Маршрут</div>
          <div class="orders-table__cell">Статус</div>
          <div class="orders-table__cell">Дата</div>
          <div class="orders-table__cell orders-table__cell--weight">Вес</div>
        </div>

        <button
          v-for="order in filteredOrders"
          :key="order.id"
          class="orders-table__row"
          :class="{
            'orders-table__row--selected': order.id === selectedOrderId
          }"
          type="button"
          @click="handleRowClick(order.id)"
        >
          <div class="orders-table__cell orders-table__cell--checkbox">
            <input
              type="checkbox"
              class="orders-table__checkbox"
              :checked="checkedOrderIds.includes(order.id)"
              @click.stop="toggleChecked(order.id)"
            />
          </div>
          <div class="orders-table__cell">
            <span class="orders-table__id">#{{ order.id }}</span>
          </div>
          <div class="orders-table__cell">
            <div class="orders-table__route">
              <span class="orders-table__city">{{ order.sender_city }}</span>
              <span class="orders-table__route-arrow">→</span>
              <span class="orders-table__city orders-table__city--muted">
                {{ order.receiver_city }}
              </span>
            </div>
          </div>
          <div class="orders-table__cell">
            <span class="orders-table__status">
              {{ order.status }}
            </span>
          </div>
          <div class="orders-table__cell">
            <span class="orders-table__date">
              {{ order.date }}
            </span>
          </div>
          <div class="orders-table__cell orders-table__cell--weight">
            <span class="orders-table__weight">{{ order.weight }} кг</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@entities/order/model/useOrdersStore'
import type { Order } from '@entities/order/model/types'
import { useOrderFiltersStore } from '@features/order-filters/model/useOrderFiltersStore'
import { useOrderEditStore } from '@features/order-edit/model/useOrderEditStore'

const ordersStore = useOrdersStore()
const filtersStore = useOrderFiltersStore()
const editStore = useOrderEditStore()
const {
  orders,
  isLoading,
  error,
  selectedOrderId,
  checkedOrderIds
} = storeToRefs(ordersStore)

const { status, dateFrom, dateTo, cityQuery } = storeToRefs(filtersStore)

const { loadOrders, toggleChecked } = ordersStore
const { reset } = filtersStore

const normalizeString = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const applyFilters = (list: Order[]): Order[] => {
  return list.filter((order) => {
    if (status.value && status.value !== order.status) {
      return false
    }

    if (dateFrom.value && order.date < dateFrom.value) {
      return false
    }
    if (dateTo.value && order.date > dateTo.value) {
      return false
    }

    if (cityQuery.value.trim()) {
      const query = normalizeString(cityQuery.value.trim())
      const sender = normalizeString(order.sender_city)
      const receiver = normalizeString(order.receiver_city)

      if (!sender.includes(query) && !receiver.includes(query)) {
        return false
      }
    }

    return true
  })
}

const filteredOrders = computed(() => applyFilters(orders.value))

const handleRefresh = () => {
  loadOrders()
}

const resetFilters = () => {
  reset()
}

const handleRowClick = (id: number) => {
  selectedOrderId.value = id
  editStore.open(id)
}
</script>

<style scoped>
.orders-table {
  height: 100%;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  padding: 16px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orders-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.orders-table__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.orders-table__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.orders-table__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.orders-table__refresh,
.orders-table__reset {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out,
    background 0.12s ease-out;
}

.orders-table__refresh {
  background: rgba(0, 122, 255, 0.1);
  color: var(--app-accent);
  box-shadow: 0 8px 18px rgba(0, 122, 255, 0.25);
}

.orders-table__refresh:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 122, 255, 0.35);
}

.orders-table__reset {
  background: rgba(0, 0, 0, 0.04);
  color: var(--app-text-muted);
}

.orders-table__reset:hover {
  background: rgba(0, 0, 0, 0.06);
}


.orders-table__filters {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 1.2fr);
  gap: 8px;
}

.orders-table__filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.orders-table__filter--dates {
  min-width: 0;
}

.orders-table__filter--full {
  grid-column: span 1;
}

.orders-table__filter-label {
  font-size: 11px;
  color: var(--app-text-muted);
}

.orders-table__select,
.orders-table__input {
  width: 100%;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  background: rgba(245, 245, 247, 0.9);
}

.orders-table__select:focus,
.orders-table__input:focus {
  border-color: rgba(0, 122, 255, 0.6);
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.25);
}

.orders-table__date-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 4px;
  align-items: center;
}

.orders-table__date-separator {
  font-size: 11px;
  color: var(--app-text-muted);
  text-align: center;
}

.orders-table__body {
  flex: 1;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(245, 245, 247, 0.9),
    rgba(255, 255, 255, 0.95)
  );
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.orders-table__state {
  flex: 1;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
}

.orders-table__spinner {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--app-accent);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.orders-table__state-title {
  font-size: 14px;
  font-weight: 600;
}

.orders-table__state-text {
  font-size: 12px;
  color: var(--app-text-muted);
  max-width: 260px;
}

.orders-table__empty-icon {
  font-size: 26px;
  margin-bottom: 4px;
}


.orders-table__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: auto;
}

.orders-table__head {
  display: grid;
  grid-template-columns: 32px 70px 1.4fr 0.9fr 0.8fr 0.7fr;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--app-text-muted);
}

.orders-table__row {
  display: grid;
  grid-template-columns: 32px 70px 1.4fr 0.9fr 0.8fr 0.7fr;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  text-align: left;
  align-items: center;
  transition: background 0.12s ease-out, box-shadow 0.12s ease-out,
    transform 0.08s ease-out;
}

.orders-table__row:hover {
  background: rgba(250, 250, 255, 0.98);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.orders-table__row--selected {
  outline: 1px solid rgba(0, 122, 255, 0.5);
  box-shadow: 0 14px 30px rgba(0, 122, 255, 0.2);
}

.orders-table__cell {
  font-size: 12px;
}

.orders-table__cell--checkbox {
  display: flex;
  justify-content: center;
}

.orders-table__cell--weight {
  text-align: right;
}

.orders-table__checkbox {
  width: 15px;
  height: 15px;
  accent-color: var(--app-accent);
}

.orders-table__id {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.orders-table__route {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.orders-table__city {
  font-size: 12px;
}

.orders-table__city--muted {
  color: var(--app-text-muted);
}

.orders-table__route-arrow {
  font-size: 11px;
  color: var(--app-text-muted);
}

.orders-table__status,
.orders-table__date,
.orders-table__weight {
  font-size: 12px;
}

@media (max-width: 767px) {
  .orders-table {
    padding: 10px 10px 14px;
  }

  .orders-table__filters {
    grid-template-columns: 1fr;
  }

  .orders-table__filter--full {
    grid-column: span 1;
  }

  .orders-table__header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .orders-table__head {
    display: none; 
  }

  .orders-table__row {
    grid-template-columns: 28px 1fr;
    grid-auto-rows: auto;
    align-items: flex-start;
    padding: 8px 8px;
  }

  .orders-table__cell--checkbox {
    margin-top: 2px;
  }

  .orders-table__cell:nth-child(2),
  .orders-table__cell:nth-child(3),
  .orders-table__cell:nth-child(4),
  .orders-table__cell:nth-child(5),
  .orders-table__cell:nth-child(6) {
    grid-column: 2 / 3;
  }

  .orders-table__route {
    margin-bottom: 2px;
  }

  .orders-table__status,
  .orders-table__date,
  .orders-table__weight {
    display: inline-block;
    margin-right: 6px;
    font-size: 11px;
    color: var(--app-text-muted);
  }
}
</style>
