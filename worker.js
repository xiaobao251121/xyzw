export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 微信登录接口代理
    if (path.startsWith('/api/weixin')) {
      const targetUrl = 'https://open.weixin.qq.com' + path.replace('/api/weixin', '');
      return await proxyRequest(request, targetUrl, {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://open.weixin.qq.com/',
      });
    }

    // 微信扫码状态轮询代理
    if (path.startsWith('/api/weixin-long')) {
      const targetUrl = 'https://long.open.weixin.qq.com' + path.replace('/api/weixin-long', '');
      return await proxyRequest(request, targetUrl, {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN',
        'Accept': '*/*',
        'Referer': 'https://open.weixin.qq.com/',
      });
    }

    // Hortor登录接口代理
    if (path.startsWith('/api/hortor')) {
      const targetUrl = 'https://comb-platform.hortorgames.com' + path.replace('/api/hortor', '');
      return await proxyRequest(request, targetUrl, {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; 23117RK66C Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36',
        'Accept': '*/*',
        'Host': 'comb-platform.hortorgames.com',
        'Connection': 'keep-alive',
        'Content-Type': 'text/plain; charset=utf-8',
        'Origin': 'https://open.weixin.qq.com',
        'Referer': 'https://open.weixin.qq.com/',
      });
    }

    // 默认返回静态文件
    return await env.ASSETS.fetch(request);
  }
};

async function proxyRequest(request, targetUrl, customHeaders) {
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers),
      ...customHeaders,
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
    redirect: 'follow',
  });

  const response = await fetch(newRequest);
  const responseHeaders = new Headers(response.headers);
  
  // 添加CORS头
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', '*');

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}