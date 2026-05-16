# Job Tracker — 技术栈方案

## 选型依据

基于 `main_functions.md` 的功能需求分析：

- 纯本地应用（无后端服务），数据存入浏览器 IndexedDB
- 需要 Gmail OAuth 2.0 授权（客户端 PKCE 流程）
- 需要截图 OCR 能力（本地免费方案）
- 需要图表可视化
- 用户技术背景：React/TypeScript、ECharts、MUI、Vite 开发经验
- macOS 开发环境

## 项目形态

**Web SPA（单页应用）** — 选择理由：

- 无需 Electron 的桌面能力（文件对话框等原生 API 非必需）
- Gmail OAuth PKCE 流程在浏览器中原生支持
- 开发调试链路短（浏览器 DevTools 即可）
- 部署到 GitHub Pages（免费静态托管），开源分发零运营成本

## 前端

| 层面 | 方案 | 理由 |
|------|------|------|
| 构建工具 | Vite 6 | 极速 HMR，开箱即用 TypeScript，用户已有经验 |
| UI 框架 | React 19 + TypeScript | 用户主技术栈，生态最丰富 |
| 组件库 | MUI 6 | 成熟的 Material Design 组件，用户默认偏好 |
| 样式 | Tailwind CSS 4 + MUI sx | Tailwind 处理布局/间距，MUI 处理复杂组件 |
| 状态管理 | Zustand | 比 Redux 轻量，比 Context 性能好，适合单用户本地应用 |
| 路由 | React Router 7 | SPA 路由标准方案 |
| 图表 | ECharts | 用户已熟练掌握，功能强大 |
| 图标 | Lucide React | 轻量、美观、Tree-shakable |

## 数据层

| 层面 | 方案 | 理由 |
|------|------|------|
| 本地数据库 | Dexie.js (IndexedDB) | 浏览器原生持久化，Promise API 友好，支持索引和事务 |
| Schema 定义 | Dexie Table Schema | 内建版本迁移机制 |

## 第三方服务

| 用途 | 服务 | 备选 | 理由 |
|------|------|------|------|
| Gmail API | Google Gmail API + OAuth 2.0 PKCE | — | 官方 API，客户端授权无需服务端 |
| 截图 OCR | PaddleOCR.js | Tesseract.js | 百度开源，中文精度业界领先，完全免费本地运行，首次加载 ~12MB 模型 |
| Google OAuth | @react-oauth/google | — | React 封装，处理弹窗和回调 |

## 部署

| 层面 | 方案 | 理由 |
|------|------|------|
| 静态托管 | GitHub Pages | 免费，自动从 GitHub 仓库构建部署，零运营成本 |
| CI/CD | GitHub Actions | 推送即自动构建，部署到 gh-pages 分支 |
| 域名 | `{username}.github.io/job-tracker` | 无需额外购买域名 |

## 不采用的方案

| 候选方案 | 不选原因 |
|----------|---------|
| Electron | MVP 阶段不需要原生能力，增加构建复杂度 |
| Next.js | SSR 对本应用无价值，纯 CSR 更简单 |
| SQLite (WASM) | 需要额外加载 WASM 文件，IndexedDB 即够用 |
| Tesseract.js | 中文 OCR 精度不足，JD 截图识别效果差 |
| OpenAI Vision API | 需要花钱、需要 API Key，不符合零成本要求 |
| Redux Toolkit | 本地单用户应用不需要如此复杂的全局状态 |

## 项目结构建议

```
job-tracker/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── src/
│   ├── main.tsx                    # 入口
│   ├── App.tsx                     # 路由 + 布局外壳
│   ├── routes/
│   │   ├── Dashboard.tsx           # 统计面板
│   │   ├── Applications.tsx        # 列表主视图
│   │   └── ApplicationDetail.tsx   # 记录详情/编辑
│   ├── components/
│   │   ├── layout/                 # AppBar, Sidebar, TabBar
│   │   ├── application/            # ApplicationCard, StatusBadge, ApplicationForm
│   │   ├── gmail/                  # GmailAuthButton, ScanResultList
│   │   ├── ocr/                    # OcrUploader, OcrPreview
│   │   ├── dashboard/              # StatCard, StatusPieChart, ActivityTimeline
│   │   └── shared/                 # ConfirmDialog, SearchBar, EmptyState
│   ├── stores/
│   │   ├── applicationStore.ts     # Zustand — 求职记录 CRUD
│   │   ├── uiStore.ts              # Zustand — 搜索词、排序、筛选状态
│   │   └── gmailStore.ts           # Zustand — Gmail 授权状态、扫描结果
│   ├── db/
│   │   ├── database.ts             # Dexie 实例 + Schema 定义
│   │   └── migrations.ts           # 数据库版本迁移
│   ├── services/
│   │   ├── gmail.ts                # Gmail API 封装（OAuth、扫描、提取）
│   │   ├── ocr.ts                  # PaddleOCR.js 封装（模型加载、图像识别）
│   │   └── export.ts               # JSON/CSV 导出
│   ├── types/
│   │   └── index.ts                # 共享类型定义
│   └── utils/
│       ├── status.ts               # 状态机流转逻辑
│       └── date.ts                 # 日期格式化工具
└── public/
    └── favicon.svg
```
