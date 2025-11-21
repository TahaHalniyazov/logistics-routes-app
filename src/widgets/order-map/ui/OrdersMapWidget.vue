<template>
  <section class="orders-map">
    <header class="orders-map__header">
      <h2 class="orders-map__title">Карта маршрутов</h2>
      <p class="orders-map__subtitle">
        Маркеры погрузки и выгрузки, а также маршрут по выбранным заказам
      </p>
    </header>

    <div class="orders-map__body">
      <div ref="mapContainer" class="orders-map__canvas"></div>


      <div v-if="isLoading" class="orders-map__overlay">
        <div class="orders-map__spinner"></div>
        <div class="orders-map__overlay-text">Загружаем заказы…</div>
      </div>

      <div v-else-if="error" class="orders-map__overlay orders-map__overlay--error">
        <div class="orders-map__overlay-text">
          Не удалось загрузить заказы. Карта покажет последние доступные данные.
        </div>
      </div>

      <div
        v-else-if="!orders.length"
        class="orders-map__overlay orders-map__overlay--empty"
      >
        <div class="orders-map__overlay-text">
          Нет заказов для отображения на карте
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import maplibregl, { type Map as MapLibreMap, type Marker } from 'maplibre-gl'
import { useOrdersStore } from '@entities/order/model/useOrdersStore'
import type { Order } from '@entities/order/model/types'

const ordersStore = useOrdersStore()
const { orders, isLoading, error, selectedOrderId, checkedOrderIds } =
  storeToRefs(ordersStore)

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<MapLibreMap | null>(null)

type OrderMarkers = {
  id: number
  pickup: Marker
  delivery: Marker
}

const markers = ref<OrderMarkers[]>([])

const ROUTE_SOURCE_ID = 'orders-route'
const ROUTE_LAYER_ID = 'orders-route-layer'

const initMap = () => {
  if (!mapContainer.value || map.value) return

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [37.6184, 55.7512], 
    zoom: 4
  })

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.value.on('load', () => {

    map.value!.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })


    map.value!.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#007AFF',
        'line-width': 4,
        'line-opacity': 0.9
      }
    })


    renderMarkers()
    updateRoute()
  })
}

const clearMarkers = () => {
  markers.value.forEach((entry) => {
    entry.pickup.remove()
    entry.delivery.remove()
  })
  markers.value = []
}

const createPopupHtml = (order: Order, type: 'pickup' | 'delivery') => {
  const city =
    type === 'pickup' ? order.sender_city : order.receiver_city
  const title = type === 'pickup' ? 'Погрузка' : 'Выгрузка'

  return `
    <div style="
      font-family: -apple-system, system-ui, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
      font-size: 12px;
    ">
      <div style="font-weight:600;margin-bottom:4px;">Заказ #${order.id}</div>
      <div style="margin-bottom:2px;"><strong>${title}:</strong> ${city}</div>
      <div style="margin-bottom:2px;"><strong>Статус:</strong> ${order.status}</div>
      <div><strong>Дата:</strong> ${order.date}</div>
    </div>
  `
}

const renderMarkers = () => {
  if (!map.value) return

  clearMarkers()

  orders.value.forEach((order) => {
    const pickupMarker = new maplibregl.Marker({
      color: '#34C759'
    })
      .setLngLat([order.pickup.lng, order.pickup.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 12 }).setHTML(
          createPopupHtml(order, 'pickup')
        )
      )
      .addTo(map.value as MapLibreMap)

    pickupMarker.getElement().addEventListener('click', () => {
      selectedOrderId.value = order.id
      flyToOrder(order)
    })

    const deliveryMarker = new maplibregl.Marker({
      color: '#FF3B30'
    })
      .setLngLat([order.delivery.lng, order.delivery.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 12 }).setHTML(
          createPopupHtml(order, 'delivery')
        )
      )
      .addTo(map.value as MapLibreMap)

    deliveryMarker.getElement().addEventListener('click', () => {
      selectedOrderId.value = order.id
      flyToOrder(order)
    })

    markers.value.push({
      id: order.id,
      pickup: pickupMarker,
      delivery: deliveryMarker
    })
  })
}

const flyToOrder = (order: Order) => {
  if (!map.value) return

  const bounds = new maplibregl.LngLatBounds()
    .extend([order.pickup.lng, order.pickup.lat])
    .extend([order.delivery.lng, order.delivery.lat])

  map.value.fitBounds(bounds, {
    padding: 60,
    duration: 600
  })
}

const updateRoute = () => {
  if (!map.value) return

  const lastCheckedId =
    checkedOrderIds.value[checkedOrderIds.value.length - 1]

  const order = orders.value.find((o) => o.id === lastCheckedId)

  const source = map.value.getSource(ROUTE_SOURCE_ID) as any
  if (!source) return

  if (!order) {
    const emptyData = {
      type: 'FeatureCollection',
      features: []
    }
    source.setData(emptyData)
    return
  }

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [order.pickup.lng, order.pickup.lat],
            [order.delivery.lng, order.delivery.lat]
          ]
        },
        properties: {}
      }
    ]
  }

  source.setData(geojson)
  flyToOrder(order)
}


onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
  clearMarkers()
})


watch(
  () => orders.value,
  () => {
    if (!map.value) return

    renderMarkers()
    updateRoute()
  }
)

watch(
  () => checkedOrderIds.value,
  () => {
    if (!map.value) return

    updateRoute()
  }
)
watch(
  () => selectedOrderId.value,
  (newId) => {
    if (!map.value || !newId) return
    const order = orders.value.find((o) => o.id === newId)
    if (order) {
      flyToOrder(order)
    }
  }
)
</script>

<style scoped>
.orders-map {
  height: 100%;
  border-radius: 24px;
  background: radial-gradient(
      circle at top left,
      rgba(0, 122, 255, 0.14),
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(90, 200, 250, 0.12),
      transparent 55%
    ),
    #f5f5f7;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
  padding: 16px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orders-map__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.orders-map__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.orders-map__subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.orders-map__body {
  position: relative;
  flex: 1;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, #c1cedf, #eef2f9);
}


.orders-map__canvas {
  width: 100%;
  height: 100%;
}


.orders-map__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(6px);
  background: linear-gradient(
    to bottom,
    rgba(245, 245, 247, 0.7),
    rgba(245, 245, 247, 0.4)
  );
}

.orders-map__overlay--error {
  background: linear-gradient(
    to bottom,
    rgba(255, 59, 48, 0.1),
    rgba(245, 245, 247, 0.7)
  );
}

.orders-map__overlay--empty {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.02),
    rgba(245, 245, 247, 0.7)
  );
}

.orders-map__spinner {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--app-accent);
  animation: orders-map-spin 0.9s linear infinite;
  margin-bottom: 8px;
}

.orders-map__overlay-text {
  font-size: 13px;
  text-align: center;
  max-width: 260px;
  color: var(--app-text-main);
}

@keyframes orders-map-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
