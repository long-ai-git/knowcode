<template>
  <div class="bug-list">
    <div class="list-header">
      <h2>🐛 BUG 记录</h2>
      <span class="count">共 {{ bugs.length }} 条记录</span>
    </div>
    <el-table :data="bugs" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="symptom" label="症状" min-width="200" />
      <el-table-column prop="rootCause" label="根因" min-width="150" />
      <el-table-column prop="severity" label="严重程度" width="100">
        <template #default="{ row }">
          <el-tag :type="getSeverityType(row.severity)">{{ row.severity }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hitCount" label="命中次数" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Bug {
  id: string
  symptom: string
  rootCause: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  hitCount: number
  createdAt: string
}

const bugs = ref<Bug[]>([
  {
    id: 'kc-bug-00001',
    symptom: '用户登录失败，提示空指针异常',
    rootCause: 'Session对象未正确初始化',
    severity: 'high',
    status: 'resolved',
    hitCount: 5,
    createdAt: '2024-01-15 10:30:00',
  },
])

function getSeverityType(severity: string) {
  const map: Record<string, string> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }
  return map[severity] || 'info'
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
.bug-list {
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