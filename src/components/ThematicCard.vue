<template>
  <div class="thematic-card" :id="`card-${index}`" ref="cardRef">
    <div class="card-header">
      <h3>Card #{{ index }}: {{ themeData.theme }}</h3>
    </div>
    <div class="tabs-section">
      <DynamicTabs :tabs="themeData.tabs" />
    </div>
    <div class="participation-section">
      <h4>Participación Farms/KPIs</h4>
      <div class="participation">
        <div v-for="item in themeData.participation" :key="item.farm || item.kpi" class="participation-item">
          <span class="item-name">{{ item.farm || item.kpi }}</span>
          <span class="item-value">{{ item.percent ? item.percent.toFixed(1) + '%' : item.value }}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Último registro válido: {{ getLastRecord() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DynamicTabs from './DynamicTabs.vue'

const props = defineProps({
  themeData: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const cardRef = ref(null)

onMounted(() => {
  console.log('card:', cardRef.value?.offsetHeight)
})

const getLastRecord = () => {
  if (props.themeData.tabs && props.themeData.tabs.length > 0) {
    const lastTab = props.themeData.tabs[props.themeData.tabs.length - 1]
    return lastTab.lastRecord ? `${lastTab.lastRecord.date} - ${lastTab.lastRecord.description}` : 'N/A'
  }
  return 'N/A'
}
</script>

<style scoped>
.thematic-card {
  border: 2px solid #00C853;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 200, 83, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.thematic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 200, 83, 0.2);
}

.card-header h3 {
  margin: 0 0 20px 0;
  color: #0288D1;
  font-weight: bold;
}

.tabs-section {
  margin-bottom: 20px;
}

.participation-section h4 {
  margin: 0 0 12px 0;
  color: #00C853;
}

.participation {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.participation-item {
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 4px solid #0288D1;
}

.item-name {
  font-weight: bold;
  font-size: 0.9em;
  color: #333;
}

.item-value {
  font-size: 1.1em;
  color: #00C853;
  font-weight: 600;
}

.footer {
  border-top: 2px solid #00C853;
  padding-top: 12px;
  font-size: 0.9em;
  color: #666;
  margin-top: 20px;
}
</style>