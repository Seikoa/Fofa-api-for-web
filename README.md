# FOFA API 查询工具

一个基于 Vue 3 + Vite + Tailwind CSS 构建的 FOFA API 查询工具，支持多种查询方式和数据导出。

## 功能特点

- 支持 FOFA.INFO 和 FOFA.RED 双平台查询
- 支持自定义返回结果数量
- 支持 CSV 和 JSON 格式导出
- 响应式设计，移动端友好
- 支持自定义 API 域名

## 使用说明

### 基本配置

1. **URL 选择**
   - 默认使用 FOFA 官方 (fofa.info)
   - 可选择 FOFA RED (fofa.red)
   - 或输入自定义域名
   - 注意：不同域名的账号系统是独立的，需要使用对应的 API Key

2. **查询设置**
   - 输入查询语句（支持 FOFA 所有查询语法）
   - 选择返回结果数量（10-10000 条）
   - 注意：返回结果数量越大，消耗的 F 点数越多

### 查询示例

- 标题包含关键词：`title="公司"`
- 域名包含关键词：`domain="gov.cn"`
- 多条件组合：`title="公司" && country="CN"`
- 或条件：`title="公司" || title="企业"`

### 数据导出

- CSV 格式：适合在 Excel 中打开
- JSON 格式：适合程序处理

## 注意事项

1. 确保你的 FOFA 账号有足够的 F 点数
2. API Key 请妥善保管，不要泄露
3. 使用自定义域名时：
   - 不同域名的账号系统是独立的
   - 需要使用对应平台的 API Key
   - 确保输入的域名格式正确（例如：fofa.info、fofa.red）

## 常见问题

1. **查询失败：账号无效**
   - 检查邮箱和 API Key 是否正确
   - 确认使用的是正确域名对应的 API Key
   - 确保域名输入格式正确（不需要包含 http:// 或 路径）

2. **查询失败：余额不足**
   - 检查 F 点数是否充足
   - 考虑减少返回结果数量

3. **无法导出数据**
   - 确保已经有查询结果
   - 检查浏览器下载设置

## 相关链接

- [FOFA 官网](https://fofa.info)
- [API 文档](https://fofa.info/api)
- [查询语法参考](https://fofa.info/api)
- [项目源码](https://github.com/Seikoa/Fofa-api-for-web)

## 开发相关

如果你想在本地运行此项目：

## 部署说明

### Cloudflare Pages 部署

1. **准备工作**
   - 注册 [Cloudflare](https://dash.cloudflare.com) 账号
   - 将项目推送到 GitHub 仓库

2. **创建 Worker**
   - 进入 Cloudflare 控制台，选择 "Workers & Pages"
   - 点击 "Create Worker"
   - 将以下代码粘贴到 Worker 编辑器中：


```javascript
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
```

3. **部署 Worker**
   - 点击 "Save and Deploy"
   - 记下 Worker 的域名（例如：your-worker.your-subdomain.workers.dev）

4. **部署前端应用**
   - 在 Cloudflare Pages 中点击 "Create a project"
   - 选择你的 GitHub 仓库
   - 配置构建设置：
     - Framework preset: Vue
     - Build command: `npm run build`
     - Build output directory: `dist`
     - 环境变量：
       ```
       NODE_VERSION: 16
       ```

5. **配置路由规则**
   - 在 Worker 的设置中添加路由规则：
     - 进入 "Triggers" 标签页
     - 添加自定义域名路由规则：`你的域名/api/*`
     - 例如：`your-site.pages.dev/api/*`

6. **验证部署**
   - 访问你的 Pages URL
   - 测试 API 查询功能
   - 确保数据能正常导出

### 常见部署问题

1. **API 请求失败**
   - 检查 Worker 路由规则是否正确
   - 确认 Worker 代码已正确部署

2. **构建失败**
   - 检查 Node.js 版本设置
   - 查看构建日志中的错误信息

3. **CORS 错误**
   - 确保 Worker 中的 CORS 头设置正确
   - 检查请求头配置

### 赞助商
   - 本项目由YxVM赞助
