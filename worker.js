addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  const url = new URL(request.url)
  
  // 如果是 API 请求
  if (url.pathname.startsWith('/api/')) {
    // 从查询参数中获取目标域名
    let targetDomain = url.searchParams.get('apiUrl') || 'fofa.info'
    
    // 清理域名（移除协议、路径等）
    targetDomain = targetDomain
      .replace(/^https?:\/\//, '')  // 移除协议
      .replace(/\/.*$/, '')         // 移除路径
      .trim()                       // 移除空格
    
    // 获取认证信息
    const email = url.searchParams.get('email')
    const key = url.searchParams.get('key')
    
    if (!email || !key) {
      return new Response(JSON.stringify({
        error: true,
        errmsg: '缺少必要的认证信息'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // 移除 apiUrl 参数，避免传递给目标服务器
    const params = new URLSearchParams(url.searchParams)
    params.delete('apiUrl')
    
    // 构建目标 URL
    const apiUrl = `https://${targetDomain}/api/v1/search/all?${params}`
    
    console.log('Requesting:', apiUrl)  // 调试用
    
    const modifiedRequest = new Request(apiUrl, {
      method: request.method,
      headers: {
        'Accept': 'application/json',
        'Origin': `https://${targetDomain}`,
        'Referer': `https://${targetDomain}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    try {
      const response = await fetch(modifiedRequest)
      const data = await response.json()
      
      // 检查响应是否包含错误
      if (data.error) {
        return new Response(JSON.stringify({
          error: true,
          errmsg: data.errmsg || '查询失败',
          debug: { targetDomain, apiUrl }  // 添加调试信息
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
      
      // 如果成功，返回数据
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: true,
        errmsg: '请求失败：' + error.message,
        debug: { targetDomain, apiUrl }  // 添加调试信息
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }

  // 其他请求返回 404
  return new Response('Not Found', { status: 404 })
} 