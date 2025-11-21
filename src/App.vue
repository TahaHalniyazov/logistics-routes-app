<template>
  <div class="app-root">
    <header class="app-header">
      <div class="app-header__title">Маршруты</div>
      <div class="app-header__right">
        <div class="app-header__avatar"></div>
      </div>
    </header>

    <main class="app-main">
      <OrdersPage />
    </main>
    <AppToastContainer />
  </div>
</template>

<script setup lang="ts">
import AppToastContainer from '@shared/ui/AppToastContainer.vue'
import OrdersPage from '@pages/orders/ui/OrdersPage.vue'
</script>
