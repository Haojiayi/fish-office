# 联网部署说明

这个版本已经有 Node 内置 HTTP 服务，不需要安装第三方依赖。

## 本地运行

```bash
npm start
```

默认地址：

```text
http://127.0.0.1:4175/
```

## 公网部署

部署到 Render、Railway、Fly.io、VPS 等 Node 环境时，启动命令保持：

```bash
npm start
```

环境变量建议：

```text
HOST=0.0.0.0
PORT=平台分配的端口
```

同事打开同一个公网 URL，并使用同一个房间暗号，例如 `FISH-404`，就会进入同一个摸鱼办公室。

### Render 一键思路

项目里已经包含 `render.yaml`。把这个目录推到 GitHub 后，在 Render 里创建 Blueprint，选择这个仓库即可。

Render 会使用：

```text
startCommand: npm start
healthCheckPath: /healthz
HOST=0.0.0.0
```

### Docker 部署

项目里也包含 `Dockerfile`，可以在支持 Docker 的平台运行：

```bash
docker build -t fish-office .
docker run -p 4175:4175 -e HOST=0.0.0.0 fish-office
```

## 当前同步范围

- 暗号消息
- 工位宠物状态
- 一键摸鱼动作
- 老板巡视倒计时和应急伪装
- 房间指标和活动日志
