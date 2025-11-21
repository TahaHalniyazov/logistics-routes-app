<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen && currentOrder"
        class="modal-backdrop"
        @click.self="handleClose"
      >
        <div class="modal">
          <header class="modal__header">
            <h2 class="modal__title">Редактирование заказа #{{ currentOrder.id }}</h2>
            <button class="modal__close" type="button" @click="handleClose">
              ✕
            </button>
          </header>

          <form class="modal__form" @submit.prevent="handleSubmit">
            <div class="modal__field">
              <label class="modal__label">Статус</label>
              <select v-model="form.status" class="modal__input">
                <option value="Новый">Новый</option>
                <option value="В пути">В пути</option>
                <option value="Доставлен">Доставлен</option>
              </select>
            </div>

            <div class="modal__field">
              <label class="modal__label">Дата</label>
              <input
                v-model="form.date"
                type="date"
                class="modal__input"
                required
              />
            </div>

            <div class="modal__field">
              <label class="modal__label">Вес (кг)</label>
              <input
                v-model.number="form.weight"
                type="number"
                min="0"
                step="0.1"
                class="modal__input"
                required
              />
            </div>

            <p class="modal__hint">
              Маршрут: {{ currentOrder.sender_city }} → {{ currentOrder.receiver_city }}
            </p>

            <footer class="modal__footer">
              <button
                type="button"
                class="modal__button modal__button--secondary"
                @click="handleClose"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="modal__button modal__button--primary"
                :disabled="isSaving"
              >
                <span v-if="!isSaving">Сохранить</span>
                <span v-else>Сохраняем…</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
  
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@entities/order/model/useOrdersStore'
import type { OrderStatus } from '@entities/order/model/types'
import { useOrderEditStore } from '@features/order-edit/model/useOrderEditStore'
import { useToastStore } from '@shared/model/useToastStore'

const ordersStore = useOrdersStore()
const editStore = useOrderEditStore()
const toastStore = useToastStore()

const { isOpen, editingOrderId } = storeToRefs(editStore)
const { orders } = storeToRefs(ordersStore)

const isSaving = ref(false)

const currentOrder = computed(() =>
  orders.value.find((o) => o.id === editingOrderId.value!) ?? null
)

const form = reactive<{
  status: OrderStatus
  date: string
  weight: number | null
}>({
  status: 'Новый',
  date: '',
  weight: null
})

watch(
  currentOrder,
  (order) => {
    if (!order) return
    form.status = order.status
    form.date = order.date
    form.weight = order.weight
  },
  { immediate: true }
)

const handleClose = () => {
  if (isSaving.value) return
  editStore.close()
}

const handleSubmit = async () => {
  if (!currentOrder.value || form.weight == null) return

  isSaving.value = true
  try {
    ordersStore.updateOrder({
      ...currentOrder.value,
      status: form.status,
      date: form.date,
      weight: form.weight
    })

    toastStore.showToast('Заказ успешно обновлён', 'success', 3000)
    editStore.close()
  } catch (e) {
    console.error(e)
    toastStore.showToast('Ошибка при обновлении заказа', 'error', 3000)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  width: 100%;
  max-width: 420px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  padding: 16px 18px 18px;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.modal__close {
  border: none;
  border-radius: 999px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal__label {
  font-size: 12px;
  color: var(--app-text-muted);
}

.modal__input {
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 7px 12px;
  font-size: 13px;
  outline: none;
  background: rgba(245, 245, 247, 0.95);
}

.modal__input:focus {
  border-color: rgba(0, 122, 255, 0.6);
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.25);
}

.modal__hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--app-text-muted);
}

.modal__footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal__button {
  border-radius: 999px;
  border: none;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
}

.modal__button--secondary {
  background: rgba(0, 0, 0, 0.05);
  color: var(--app-text-muted);
}

.modal__button--primary {
  background: var(--app-accent);
  color: #fff;
  box-shadow: 0 10px 24px rgba(0, 122, 255, 0.35);
}

.modal__button--primary:disabled {
  opacity: 0.7;
  cursor: default;
  box-shadow: none;
}


.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
