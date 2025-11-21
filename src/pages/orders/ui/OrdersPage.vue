<template>
  <div class="orders-page">

    <section class="orders-layout">
      <div class="orders-layout__left">
        <OrdersTableWidget />
      </div>
      <div class="orders-layout__right">
        <OrdersMapWidget />
      </div>
    </section>


    <section class="orders-mobile">
      <div class="orders-mobile__map">
        <OrdersMapWidget />
      </div>
      <div class="orders-mobile__sheet">
        <div class="orders-mobile__grabber"></div>
        <OrdersTableWidget />
      </div>
    </section>
    <OrderEditModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OrdersTableWidget from '../../../widgets/orders-table/ui/OrdersTableWidget.vue'
import OrdersMapWidget from '../../../widgets/order-map/ui/OrdersMapWidget.vue'
import OrderEditModal from '@features/order-edit/ui/OrderEditModal.vue'
import { useOrdersStore } from '@entities/order/model/useOrdersStore'

const ordersStore = useOrdersStore()

onMounted(() => {
  if (!ordersStore.hasLoadedOnce) {
    ordersStore.loadOrders()
  }
})
</script>

<style scoped>
.orders-page {
  width: 100%;
  height: 100%;
}


.orders-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}


.orders-layout__left {
  min-height: calc(100vh - 120px);
}


.orders-layout__right {
  min-height: calc(100vh - 120px);
}


.orders-mobile {
  display: none;
}


@media (max-width: 767px) {
  .orders-layout {
    display: none;
  }

  .orders-mobile {
    display: block;
    position: relative;
    height: calc(100vh - 64px); 
    overflow: hidden;
  }

  .orders-mobile__map {
    height: 40vh;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
    background: #d0d7e2;
  }

  .orders-mobile__sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 54vh;
    background: rgba(255, 255, 255, 0.98);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.12);
    padding: 8px 12px 16px;
    backdrop-filter: blur(16px);
    overflow-y: auto;
  }

  .orders-mobile__grabber {
    width: 48px;
    height: 5px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.15);
    margin: 6px auto 10px;
  }
}
</style>
