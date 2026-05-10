<template>
  <div class="debt-list">
    <div class="list-header">
      <h2>⚠️ 技术债</h2>
      <span class="count">共 {{ debts.length }} 条记录</span>
    </div>
    <el-table :data="debts" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="description" label="描述" min-width="250" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="effortEstimate" label="工作量" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="discoveredAt" label="发现时间" width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TechDebt {
  id: string
  description: string
  module: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  effortEstimate: 'small' | 'medium' | 'large'
  status: 'open' | 'in-progress' | 'resolved'
  discoveredAt: string
}

const debts = ref<TechDebt[]>([
  {
    id: 'kc-debt-00001',
    description: '遗留认证模块需要重构以支持新标准',
    module: 'auth',
    priority: 'high',
    effortEstimate: 'large',
    status: 'open',
    discoveredAt: '2024-01-08 14:00:00',
  },
])

function getPriorityType(priority: string) {
  const map: Record<string, string> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }
  return map[priority] || 'info'
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    open: 'danger',
    'in-progress': 'warning',
    resolved: 'success',
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.debt-list {
  padding: 0;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.list-header h2 {
  font-size: 20px;
  color: #4a9eff;
}

.count {
  color: #8b98a5;
  font-size: 14px;
}
</style>