<template>
  <div class="stats">
    <h2>📊 统计面板</h2>
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-icon bug">🐛</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.bugCount }}</div>
          <div class="stat-label">BUG 记录</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon adr">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.adrCount }}</div>
          <div class="stat-label">架构决策</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon debt">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.debtCount }}</div>
          <div class="stat-label">技术债</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon hit">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalHits }}</div>
          <div class="stat-label">总命中次数</div>
        </div>
      </el-card>
    </div>
    <div class="chart-row">
      <el-card class="chart-card">
        <div ref="trendChartRef" style="width: 100%; height: 300px"></div>
      </el-card>
      <el-card class="chart-card">
        <div ref="severityChartRef" style="width: 100%; height: 300px"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const trendChartRef = ref<HTMLElement | null>(null)
const severityChartRef = ref<HTMLElement | null>(null)

const stats = ref({
  bugCount: 42,
  adrCount: 12,
  debtCount: 8,
  totalHits: 156,
})

function initCharts() {
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      title: { text: '月度趋势', textStyle: { color: '#4a9eff' } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'BUG',
          type: 'line',
          data: [10, 8, 12, 6, 4, 2],
          itemStyle: { color: '#ff6b6b' },
        },
      ],
    })
  }

  if (severityChartRef.value) {
    const severityChart = echarts.init(severityChartRef.value)
    severityChart.setOption({
      title: { text: 'BUG 严重程度分布', textStyle: { color: '#4a9eff' } },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: [
            { value: 5, name: 'Critical' },
            { value: 12, name: 'High' },
            { value: 18, name: 'Medium' },
            { value: 7, name: 'Low' },
          ],
          itemStyle: {
            color: (params: any) => {
              const colors = ['#ff6b6b', '#ffe66d', '#4ecdc4', '#95e1d3']
              return colors[params.dataIndex]
            },
          },
        },
      ],
    })
  }
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.stats h2 {
  font-size: 20px;
  color: #4a9eff;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #1a1f25;
  border: 1px solid #2f3336;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #e7e9ea;
}

.stat-label {
  font-size: 14px;
  color: #8b98a5;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: #1a1f25;
  border: 1px solid #2f3336;
}
</style>