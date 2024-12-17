<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">FOFA API 查询工具</h1>
    <FofaSearch 
      @search="handleSearch" 
      :loading="loading"
    />
    <ResultTable 
      :data="results" 
      :loading="loading"
      @export-csv="exportCsv"
      @export-json="exportJson"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FofaSearch from './components/FofaSearch.vue'
import ResultTable from './components/ResultTable.vue'
import { FofaApi } from './utils/fofaApi'

const results = ref([])
const loading = ref(false)

const handleSearch = async (params) => {
  loading.value = true
  try {
    const api = new FofaApi(params.apiUrl, params.email, params.apiKey)
    const data = await api.search(
      params.query,
      params.size,
      ['host', 'ip', 'port', 'title', 'protocol']
    )
    results.value = data
  } catch (error) {
    alert('查询失败：' + error.message)
    results.value = []
  } finally {
    loading.value = false
  }
}

const exportCsv = () => {
  if (!results.value.length) {
    alert('没有数据可导出')
    return
  }
  const headers = ['主机', 'IP', '端口', '标题', '协议']
  const csvContent = [
    headers.join(','),
    ...results.value.map(item => 
      [item.host, item.ip, item.port, item.title, item.protocol].join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'fofa_results.csv'
  link.click()
}

const exportJson = () => {
  if (!results.value.length) {
    alert('没有数据可导出')
    return
  }
  const jsonStr = JSON.stringify(results.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'fofa_results.json'
  link.click()
}
</script> 