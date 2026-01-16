<template>
  <div class="card" id="card1">
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col">
          <h6 v-if="title">{{ title }}</h6>
        </div>
        <div class="col-auto">
          <div class="btn-group" role="group" aria-label="Basic example">
            <button
              v-for="(tab, index) in tabs"
              :key="index"
              type="button"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: activeTab === index }"
              @click="activeTab = index"
            >
              {{ tab.title }}
            </button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="tab-content">
            <StatsChart
              v-if="tabs[activeTab]"
              :data="tabs[activeTab].chartData"
              :title="tabs[activeTab].title"
              :yTitle="tabs[activeTab].yTitle || 'Valor'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatsChart from './StatsChart.vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const activeTab = ref(0)

const tabsRef = ref(null)

onMounted(() => {
})
</script>

<style scoped>
.dynamic-tabs {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.tabs-header h6 {
  margin: 0;
  padding: 8px 16px;
  border: none;
  background: none;
  border-bottom: 2px solid #0288D1;
  color: #0288D1;
  font-weight: normal;
  cursor: default;
}


.tab-content {
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>