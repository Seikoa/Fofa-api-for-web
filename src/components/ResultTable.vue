<template>
  <div class="border rounded">
    <div class="p-4 border-b flex justify-between items-center">
      <h2 class="text-xl">查询结果</h2>
      <div class="space-x-2">
        <button
          @click="$emit('export-csv')"
          class="bg-green-500 text-white px-4 py-2 rounded"
        >
          导出 CSV
        </button>
        <button
          @click="$emit('export-json')"
          class="bg-purple-500 text-white px-4 py-2 rounded"
        >
          导出 JSON
        </button>
      </div>
    </div>

    <div class="p-4">
      <div v-if="data.length" class="mb-4 text-sm text-gray-600">
        共找到 {{ data.length }} 条结果
      </div>
      <table class="w-full">
        <thead>
          <tr>
            <th class="border p-2">序号</th>
            <th class="border p-2">主机</th>
            <th class="border p-2">IP</th>
            <th class="border p-2">端口</th>
            <th class="border p-2">标题</th>
            <th class="border p-2">协议</th>
            <th class="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center p-4">
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span class="ml-2">查询中...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="!data.length">
            <td colspan="6" class="text-center p-4">暂无数据</td>
          </tr>
          <tr v-else v-for="(item, index) in data" :key="index">
            <td class="border p-2">{{ index + 1 }}</td>
            <td class="border p-2">
              <a 
                :href="'http://' + item.host" 
                target="_blank"
                class="text-blue-500 hover:underline"
              >{{ item.host }}</a>
            </td>
            <td class="border p-2">{{ item.ip }}</td>
            <td class="border p-2">{{ item.port }}</td>
            <td class="border p-2 max-w-xs truncate" :title="item.title">{{ item.title }}</td>
            <td class="border p-2">{{ item.protocol }}</td>
            <td class="border p-2">
              <button
                @click="copyToClipboard(item.host)"
                class="text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                复制域名
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['export-csv', 'export-json'])

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    alert('复制失败')
  }
}
</script> 