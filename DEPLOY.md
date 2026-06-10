# 前端代理部署指南

## 方案：Nginx 反向代理

### 一、准备工作

#### 1. 安装 Docker（如果未安装）

**Windows:**
下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. 构建前端项目

```bash
# 进入项目目录
cd e:\xyzw_web_helper-main

# 安装依赖
npm install

# 构建项目
npm run build
```

### 二、配置代理

#### 1. 修改 Nginx 配置

编辑 `docker/nginx.conf`，将 `game-api.example.com` 替换为实际的游戏服务器地址：

```nginx
# API 代理 - 游戏服务器
location /api/ {
    proxy_pass https://实际游戏服务器地址/;
    proxy_set_header Host 实际游戏服务器地址;
    # ... 其他配置
}
```

#### 2. 修改前端 API 配置

编辑 `src/config/index.js`，设置 API 基础路径：

```javascript
export const API_BASE_URL = '/api';
```

### 三、部署方式

#### 方式一：使用 Docker（推荐）

```bash
# 构建 Docker 镜像
docker build -t xyzw-web -f docker/dockerfile .

# 运行容器
docker run -d -p 80:80 --name xyzw-web xyzw-web

# 查看运行状态
docker ps

# 查看日志
docker logs xyzw-web
```

#### 方式二：直接使用 Nginx

```bash
# 安装 Nginx
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx

# 复制配置文件
sudo cp docker/nginx.conf /etc/nginx/conf.d/xyzw.conf

# 复制静态文件
sudo cp -r dist/* /var/www/html/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 方式三：使用 Node.js + Express

```bash
# 创建 server.js
cat > server.js << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API 代理
app.use('/api', createProxyMiddleware({
    target: 'https://实际游戏服务器地址',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url}`);
    }
}));

// 静态资源
app.use(express.static(path.join(__dirname, 'dist')));

// 所有路由指向 index.html（支持前端路由）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# 安装依赖
npm install express http-proxy-middleware

# 启动服务
node server.js
```

### 四、验证部署

1. **访问前端页面**：
   ```
   http://localhost
   或
   http://服务器IP
   ```

2. **测试 API 代理**：
   ```bash
   curl http://localhost/api/health
   ```

3. **查看 Nginx 日志**：
   ```bash
   # Docker 方式
   docker logs xyzw-web
   
   # 直接安装方式
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### 五、常见问题

#### 1. 跨域问题
确保 Nginx 配置中正确设置了代理头：
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
```

#### 2. 前端路由刷新 404
确保 Nginx 配置了 `try_files`：
```nginx
try_files $uri $uri/ /index.html;
```

#### 3. WebSocket 连接失败
检查 WebSocket 代理配置：
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### 六、生产环境优化

#### 1. 启用 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 2. 启用 Gzip 压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

#### 3. 配置缓存

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 七、更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
npm run build

# 3. 更新 Docker 容器
docker stop xyzw-web
docker rm xyzw-web
docker build -t xyzw-web -f docker/dockerfile .
docker run -d -p 80:80 --name xyzw-web xyzw-web

# 或直接更新 Nginx 静态文件
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

---

## 部署检查清单

- [ ] Docker 或 Nginx 已安装
- [ ] 前端项目已构建（dist 文件夹存在）
- [ ] Nginx 配置已修改（替换实际游戏服务器地址）
- [ ] 前端 API 配置已修改
- [ ] 容器或服务已启动
- [ ] 前端页面可正常访问
- [ ] API 代理可正常工作
