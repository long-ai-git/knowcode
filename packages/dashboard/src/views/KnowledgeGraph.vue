<template>
  <div class="knowledge-graph">
    <div class="graph-header">
      <h2>🔗 知识图谱</h2>
      <el-button type="primary" @click="refreshGraph">刷新</el-button>
    </div>
    <div ref="chartRef" class="graph-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const nodes = ref([
  { id: 'bug-1', name: 'Bug: NullPointerException', type: 'bug', x: 100, y: 100 },
  { id: 'bug-2', name: 'Bug: ArrayIndexOutOfBounds', type: 'bug', x: 300, y: 150 },
  { id: 'adr-1', name: 'ADR: 采用微服务架构', type: 'adr', x: 200, y: 50 },
  { id: 'debt-1', name: '技术债: 遗留认证模块', type: 'debt', x: 400, y: 200 },
])

const links = ref([
  { source: 'bug-1', target: 'adr-1', label: 'resolved_by' },
  { source: 'bug-2', target: 'debt-1', label: 'caused_by' },
])

function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chart) return

  const option: echarts.EChartsOption = {
    backgroundColor: '#1a1f25',
    title: {
      text: 'KnowCode 知识关系图谱',
      textStyle: { color: '#4a9eff', fontSize: 18 },
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return params.data.name || params.data.id
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
          color: '#e7e9ea',
          fontSize: 12,
        },
        lineStyle: {
          color: '#4a9eff',
          width: 2,
          curveness: 0.3,
        },
        data: nodes.value.map(n => ({
          id: n.id,
          name: n.name,
          symbol: n.type === 'bug' ? 'circle' : n.type === 'adr' ? 'rect' : 'diamond',
          itemStyle: {
            color: n.type === 'bug' ? '#ff6b6b' : n.type === 'adr' ? '#4ecdc4' : '#ffe66d',
          },
        })),
        links: links.value.map(l => ({
          source: l.source,
          target: l.target,
          label: { show: true, formatter: l.label, color: '#8b98a5' },
        })),
        force: {
          repulsion: 300,
          edgeLength: 150,
        },
      },
    ],
  }

  chart.setOption(option)
}

function refreshGraph() {
  updateChart()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.knowledge-graph {
  height: calc(100vh - 100px);
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.graph-header h2 {
  font-size: 20px;
  color: #4a9eff;
}

.graph-container {
  width: 100%;
  height: calc(100% - 60px);
  background: #1a1f25;
  border-radius: 8px;
  border: 1px solid #2f3336;
}
</style>