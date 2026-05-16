# @architecture.md — 架构设计

## 系统整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器 (Client)                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  React SPA   │  │  Zustand     │  │  Dexie.js     │  │
│  │  (Vite +     │──│  (State)     │──│  (IndexedDB)  │  │
│  │  React Router)│  │              │  │               │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │                                                │
│         ├── PaddleOCR.js (本地 OCR)                      │
│         └── Gmail API (OAuth 2.0 PKCE)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 分层结构

```
src/
├── routes/          # 页面级组件（路由入口）
│   ├── Dashboard    # 统计面板
│   ├── Applications # 列表视图
│   └── ApplicationDetail # 详情/编辑
├── components/      # 可复用 UI 组件
├── stores/          # Zustand 全局状态
├── db/              # Dexie.js 数据库定义
├── services/        # 外部服务封装 (Gmail, OCR)
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 数据流

```
用户操作 → Zustand Action → Dexie CRUD → IndexedDB
                ↓
          React 组件自动重渲染 (Zustand subscription)
```

- **Gmail 扫描**: Gmail API → 匹配规则 → Zustand draft → 用户确认 → Zustand Action → IndexedDB
- **OCR 录入**: 截图上传 → Tesseract.js → 预览确认 → Zustand Action → IndexedDB

## 关键技术决策

1. **Web SPA 而非 Electron**: Gmail OAuth PKCE / OCR 均原生支持浏览器，无需桌面能力
2. **Dexie.js 而非 SQLite WASM**: IndexedDB 即满足需求，无需额外 WASM 加载
3. **Tesseract.js 替代 PaddleOCR**: PaddleOCR 无维护中的 npm 包，Tesseract.js v5 + chi_sim+eng 对中文印刷体识别实用可行
4. **Zustand 而非 Redux**: 单用户本地应用，Zustand 更轻量
5. **GitHub Pages 部署**: 零成本、自动构建、链接直发

## 阶段 2 实现记录 (2026-05-16)

### OCR 服务 (src/services/ocr.ts)
- Tesseract.js worker 封装，支持 chi_sim+eng 双语言识别
- 结构化字段提取：通过关键词（岗位/职位/公司）定位岗位名和公司名
- 实时进度回调（加载模型/识别文本）
- Worker 使用后立即终止释放内存

### OCR 上传组件 (src/components/ocr/OcrUploader.tsx)
- 拖拽区域 + 点击上传，仅接受 image/*
- 识别进度：LinearProgress + 百分比
- 双列预览：左侧截图 | 右侧识别结果
- 修改模式：TextField 编辑识别结果
- 确认后回调父组件填充表单

### 附件管理 (src/components/application/AttachmentManager.tsx)
- FileReader 转 Base64 存入 IndexedDB attachments 表
- Chip 列表展示，点击预览、删除
- 全屏遮罩图片预览（点击关闭）
- readOnly 模式禁止上传/删除
- 集成到详情页编辑模式
