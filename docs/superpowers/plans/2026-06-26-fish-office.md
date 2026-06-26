# 互联网摸鱼办公室 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个“伪办公 SaaS 皮肤”的静态网页原型，让朋友们能在看似正经的工作台里养工位宠物、摸鱼互动。

**Architecture:** 使用无构建步骤的静态前端：HTML 提供结构，CSS 负责企业后台风格和响应式布局，JavaScript 管理工位宠物、暗号消息、摸鱼动作、老板键和本地状态。宠物状态逻辑放在独立模块并用 Node 测试覆盖；数据保存在内存和 `localStorage`，首版不接真实后端。

**Tech Stack:** HTML、CSS、原生 JavaScript ES Modules、浏览器本地存储、Node 测试、Python 静态文件服务器用于预览。

---

### Task 1: 静态应用骨架

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `pet-engine.mjs`
- Create: `tests/pet-engine.test.mjs`

- [ ] 创建 HTML 结构，包含左侧导航、顶部状态栏、指标面板、任务看板、在线同事、暗号频道、老板键报表。
- [ ] 创建 CSS，采用安静的企业后台视觉，避免营销页和大面积单色调。
- [ ] 创建 JavaScript 初始数据，渲染工位宠物、任务、消息和指标。

### Task 2: 摸鱼互动

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`

- [ ] 添加昵称输入和状态选择。
- [ ] 添加“一键摸鱼”动作，随机生成行动记录和指标变化。
- [ ] 添加宠物互动动作：投喂、摸头、送咖啡、代开会，并更新宠物状态条。
- [ ] 添加暗号发送框，消息进入频道并保存到本地。
- [ ] 添加“老板键”，切换为严肃报表视图，再次点击恢复摸鱼办公室。

### Task 3: 验证与预览

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `app.js`

- [ ] 运行静态服务器：`python3 -m http.server 4173`
- [ ] 用浏览器或 HTTP 请求确认页面资源可访问。
- [ ] 检查移动端和桌面端布局没有明显遮挡。
