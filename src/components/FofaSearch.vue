<template>
  <div class="mb-4 p-4 border rounded">
    <div class="mb-4">
      <label class="block mb-2">API 配置</label>
      <div class="flex items-center gap-2 mb-2">
        <input
          v-model="apiUrl"
          :placeholder="defaultApiUrl"
          class="border p-2 flex-1"
          :disabled="!useCustomApi"
        />
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="useCustomApi"
            class="mr-2"
          >
          自定义域名
        </label>
      </div>
      <div class="text-sm text-gray-500 mb-2">
        {{ useCustomApi ? '请输入域名，例如: fofa.info 或 fofa.red' : '使用官方域名 fofa.info' }}
      </div>
      <input
        v-model="email"
        placeholder="输入你的 FOFA 注册邮箱"
        class="border p-2 w-full mb-2"
        type="email"
      />
      <input
        v-model="apiKey"
        placeholder="输入你的 FOFA API Key"
        class="border p-2 w-full"
        type="password"
      />
    </div>
    
    <div class="mb-4">
      <label class="block mb-2">查询语句</label>
      <input
        v-model="query"
        placeholder='例如: title="公司" || domain="gov.cn"'
        class="border p-2 w-full mb-2"
      />
      
      <div class="mb-2">
        <label class="block mb-1">返回结果数量</label>
        <select 
          v-model="size" 
          class="border p-2 rounded w-full"
        >
          <option value="10">10 条</option>
          <option value="100">100 条</option>
          <option value="1000">1000 条</option>
          <option value="10000">10000 条</option>
        </select>
        <div class="text-sm text-gray-500 mt-1">
          注意：返回结果数量越大，消耗的 F 点数越多
        </div>
      </div>

      <div class="text-sm text-gray-500 mt-2">
        <div class="flex justify-between items-center mb-2">
          <span>查询示例：</span>
          <div class="space-x-2">
            <a 
              :href="`https://fofa.info/result?qbase64=${getBase64Query}`" 
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              在 FOFA 中查看
            </a>
            <span>|</span>
            <a 
              href="https://fofa.info" 
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              FOFA 官网
            </a>
          </div>
        </div>
        <ul class="list-disc pl-5 space-y-1">
          <li>标题包含关键词：title="公司"</li>
          <li>域名包含关键词：domain="gov.cn"</li>
          <li>多条件组合：title="公司" && country="CN"</li>
          <li>或条件：title="公司" || title="企业"</li>
        </ul>
        <div class="mt-2 flex justify-between items-center">
          <a 
            href="https://fofa.info/api" 
            target="_blank" 
            class="text-blue-500 hover:underline"
          >
            查询语法参考
          </a>
          <a 
            href="https://fofa.red/api" 
            target="_blank" 
            class="text-blue-500 hover:underline"
          >
            API 文档
          </a>
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="search"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!isValid || loading"
      >
        <span v-if="loading">查询中...</span>
        <span v-else>查询</span>
      </button>
      <button
        @click="clearForm"
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        清空
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const defaultApiUrl = '/api/v1/search/all'
const useCustomApi = ref(false)
const apiUrl = ref(defaultApiUrl)
const email = ref('')
const apiKey = ref('')
const query = ref('')
const size = ref('100')

// 计算 Base64 编码的查询语句，用于 FOFA 官网链接
const getBase64Query = computed(() => {
  if (!query.value) return ''
  try {
    return btoa(encodeURIComponent(query.value.trim()))
  } catch (e) {
    return ''
  }
})

// 监听自定义 API 开关
watch(useCustomApi, (newVal) => {
  if (!newVal) {
    apiUrl.value = defaultApiUrl
  }
})

const emit = defineEmits(['search'])

const isValid = computed(() => {
  return apiUrl.value && 
         email.value && 
         apiKey.value && 
         query.value &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const clearForm = () => {
  if (!useCustomApi.value) {
    apiUrl.value = defaultApiUrl
  } else {
    apiUrl.value = ''
  }
  email.value = ''
  apiKey.value = ''
  query.value = ''
  size.value = '100'
}

const search = () => {
  if (!apiUrl.value || !email.value || !apiKey.value || !query.value) {
    alert('请填写完整的必要信息')
    return
  }
  
  // 处理自定义 API URL
  let finalApiUrl = defaultApiUrl
  if (useCustomApi.value) {
    // 如果是完整 URL，直接使用
    if (apiUrl.value.startsWith('http')) {
      finalApiUrl = `/api/v1/search/all?apiUrl=${encodeURIComponent(apiUrl.value)}`
    } else {
      // 如果只是域名，添加到查询参数
      const domain = apiUrl.value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      finalApiUrl = `/api/v1/search/all?apiUrl=${encodeURIComponent(domain)}`
    }
  }
  
  emit('search', {
    apiUrl: finalApiUrl,
    email: email.value,
    apiKey: apiKey.value,
    query: query.value,
    size: parseInt(size.value)
  })
}

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
</script> 