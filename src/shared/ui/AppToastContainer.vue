<template>
  <div class="toast-container">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
      >
        <span class="toast__text">{{ toast.message }}</span>
        <button class="toast__close" type="button" @click="removeToast(toast.id)">
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@shared/model/useToastStore'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore
</script>

<style scoped>
.toast-container {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  min-width: 220px;
  max-width: 320px;
  border-radius: 999px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.toast__text {
  flex: 1;
}

.toast__close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
}

.toast__close:hover {
  opacity: 1;
}

.toast--success {
  background: linear-gradient(135deg, #34c759, #4cd964);
  color: #fff;
}

.toast--error {
  background: linear-gradient(135deg, #ff3b30, #ff5e57);
  color: #fff;
}

.toast--info {
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  color: #fff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s ease-out;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
