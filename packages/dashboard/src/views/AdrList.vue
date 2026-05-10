<template>
  <div class="adr-list">
    <div class="list-header">
      <h2>📋 架构决策记录</h2>
      <span class="count">共 {{ adrs.length }} 条记录</span>
    </div>
    <el-table :data="adrs" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="modulesAffected" label="影响的模块" width="150">
        <template #default="{ row }">
          {{ row.modulesAffected.join(', ') }}
        </template>
      </el-table-column>
      <el-table-column prop="seqNumber" label="序号" width="80" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ADR {
  id: string
  seqNumber: number
  title: string
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded'
  modulesAffected: string[]
  createdAt: string
}

const adrs = ref<ADR[]>([
  {
    id: 'kc-adr-001',
    seqNumber: 1,
    title: '采用微服务架构重构系统',
    status: 'accepted',
    modulesAffected: ['auth', 'api', 'db'],
    createdAt: '2024-01-10 09:00:00',
  },
])

function getStatusType(status: string) {
  const map: Record<string, string> = {
    proposed: 'info',
    accepted: 'success',
    deprecated: 'warning',
    superseded: 'danger',
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.adr-list {
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