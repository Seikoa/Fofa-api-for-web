export class FofaApi {
  constructor(apiUrl, email, apiKey) {
    this.email = email
    this.apiKey = apiKey
    this.baseUrl = import.meta.env.PROD ? 
      'https://fofa.red/api/v1/search/all' : 
      '/api/v1/search/all'
  }

  // 添加一个辅助方法来处理 UTF-8 字符串的 Base64 编码
  utf8_to_b64(str) {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1)
        }))
    } catch (e) {
      throw new Error('查询语句包含无效字符')
    }
  }

  async search(query, size = 100, fields = ['host', 'ip', 'port', 'title', 'protocol']) {
    if (!query.trim()) {
      throw new Error('查询语句不能为空')
    }

    const base64Query = this.utf8_to_b64(query.trim())
    
    const params = new URLSearchParams({
      email: this.email,
      key: this.apiKey,
      qbase64: base64Query,
      size: size.toString(),
      fields: fields.join(',')
    })

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://fofa.red',
          'Referer': 'https://fofa.red'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.errmsg || '查询失败')
      }
      
      if (!Array.isArray(data.results)) {
        throw new Error('返回数据格式错误')
      }

      if (data.size === 0) {
        return []
      }
      
      // 将结果转换为对象数组
      return data.results.map(item => {
        const [host, ip, port, title, protocol] = item
        return {
          host,
          ip,
          port,
          title: title || '',
          protocol: protocol || ''
        }
      })
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('API 访问失败，请检查网络连接和参数是否正确')
      }
      throw error
    }
  }
} 