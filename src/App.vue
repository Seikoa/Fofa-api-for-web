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
    <footer class="mt-8 pt-4 border-t text-center text-gray-500">
      <a 
        href="https://github.com/Seikoa/Fofa-api-for-web" 
        target="_blank"
        class="hover:text-blue-500 flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>项目源码</span>
      </a>
      <div class="mt-2 text-sm">
        基于 Vue 3 + Vite + Tailwind CSS 构建
      </div>
    </footer>
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