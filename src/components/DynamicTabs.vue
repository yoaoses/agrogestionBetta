<template>
  <div class="dynamic-tabs" ref="tabsRef">
    <div class="tab-buttons">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="tab-content">
      <StatsChart
        v-if="tabs[activeTab]"
        :data="tabs[activeTab].chartData"
        :title="tabs[activeTab].title"
        :yTitle="tabs[activeTab].yTitle || 'Valor'"
      />
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
  }
})

const activeTab = ref(0)

const tabsRef = ref(null)

onMounted(() => {
  console.log('tabs:', tabsRef.value?.offsetHeight)
})
</script>

<style scoped>
.dynamic-tabs {
  width: 100%;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-buttons button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-buttons button.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-content {
  padding: 16px 0;
}
</style>