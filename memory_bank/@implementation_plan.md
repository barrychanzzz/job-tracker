# Job Tracker — 实施计划

> 本文件是 AI 开发者的分步指令指南。
> **严格按顺序执行，每步完成后验证通过才可进行下一步。**

## 前置条件

- 开始前确保已阅读：
  - `memory_bank/@main_functions.md`（功能规格）
  - `memory_bank/@tech_stack.md`（技术栈方案）
  - `memory_bank/@init.md`（项目启动规则）
- 确认开发环境已安装：Node.js >= 20、npm >= 10
- 准备环境变量（`.env`）：
  - `VITE_GOOGLE_CLIENT_ID` — Google OAuth Client ID（阶段 3 需要，本地开发可用 localhost）
- 阶段 2 OCR 使用 PaddleOCR.js（本地免费，无需 API Key）

---

## 阶段 1：核心骨架

### Step 0: 项目初始化

**指令**
使用 Vite 脚手架创建 React + TypeScript 项目，安装核心依赖：MUI、Tailwind CSS、React Router、Zustand、Dexie.js、Lucide React。

**验证方式**
- 目录下存在 `package.json`，包含上述所有依赖
- 运行 `npm run dev` 后浏览器访问 `http://localhost:5173` 看到 Vite 默认页
- 运行 `npm run build` 编译成功，无错误

**预期产出**
- `package.json`、`tsconfig.json`、`vite.config.ts`
- `index.html`、`src/main.tsx`、`src/App.tsx`
- Tailwind 和 MUI 主题已配置

---

### Step 1: 类型系统 + 数据库 Schema

**指令**
定义所有 TypeScript 类型（JobApplication, Attachment, ActivityLog 及其状态枚举），使用 Dexie.js 初始化 IndexedDB 数据库，定义表结构和索引。

**验证方式**
- `src/types/index.ts` 存在，包含 JobApplication 类型及所有状态枚举
- `src/db/database.ts` 存在，Dexie 实例已定义且有 applications、attachments、activityLogs 三张表
- 运行 `npm run build` 编译成功，类型检查通过

**预期产出**
- `src/types/index.ts`
- `src/db/database.ts`

---

### Step 2: 状态管理 Store

**指令**
创建 Zustand Store（applicationStore）：提供记录的 CRUD 操作（增删改查）、状态切换方法（遵循两级状态机规则）。创建 uiStore：管理当前 Tab、搜索词、排序字段和方向。

**验证方式**
- `src/stores/applicationStore.ts` 存在，导出 useApplicationStore
- `src/stores/uiStore.ts` 存在，导出 useUiStore
- 方法签名类型正确，无 TypeScript 错误

**预期产出**
- `src/stores/applicationStore.ts`
- `src/stores/uiStore.ts`

---

### Step 3: 状态工具 + 日期工具

**指令**
实现状态机流转工具函数（验证主状态→子状态的合法组合、生成可选子状态列表）、日期格式化工具函数（ISO 8601 解析/展示）。

**验证方式**
- `src/utils/status.ts` 导出 isValidTransition、getSubStates 等函数
- `src/utils/date.ts` 导出 formatDate、formatRelative 等函数
- 边界情况处理正确（如无效状态返回 false）

**预期产出**
- `src/utils/status.ts`
- `src/utils/date.ts`

---

### Step 4: 路由 + 布局外壳

**指令**
使用 React Router 设置路由：`/` → Dashboard，`/applications` → 列表页，`/applications/:id` → 详情页。创建 AppBar + 侧边导航的布局外壳。

**验证方式**
- 访问 `/applications` 看到空列表页（含 AppBar 和导航）
- 访问 `/` 看到 Dashboard 占位页
- 侧边导航有两个入口：仪表盘、求职记录

**预期产出**
- `src/routes/Dashboard.tsx`（占位）
- `src/routes/Applications.tsx`（占位）
- `src/routes/ApplicationDetail.tsx`（占位）
- `src/components/layout/AppLayout.tsx`
- `src/App.tsx` 更新路由配置

---

### Step 5: 手动录入表单

**指令**
实现新增记录的对话框/表单：岗位名称和公司名称为必填，其他字段可选。状态初始化为主状态「进行中」子状态「已发送求职邮件」。使用 MUI Dialog + TextField 实现。

**验证方式**
- 点击「新增记录」按钮弹出表单
- 填写必填字段后提交，记录出现在列表中
- 空必填字段时提交被阻止，显示验证错误

**预期产出**
- `src/components/application/ApplicationForm.tsx`
- `src/components/application/CreateButton.tsx`

---

### Step 6: 列表展示 + 标签切换

**指令**
实现按主状态分组的列表视图：三个 Tab（进行中/暂停/已结束），每条记录显示岗位名、公司名、子状态徽章、最后更新时间。支持点击进入详情页。

**验证方式**
- 三个 Tab 正常切换，各显示对应主状态的记录
- 每条记录右侧显示彩色子状态徽章
- 点击记录跳转到详情页

**预期产出**
- `src/components/application/ApplicationCard.tsx`
- `src/components/application/StatusBadge.tsx`
- `src/routes/Applications.tsx` 完整实现

---

### Step 7: 记录详情 + 编辑

**指令**
实现记录详情页：显示所有字段，支持编辑修改（包括状态切换为下拉选择器），支持删除（二次确认）。记录状态变更时自动追加 ActivityLog。

**验证方式**
- 详情页显示所有字段信息
- 编辑任意字段后保存，列表刷新
- 删除操作弹出确认弹窗，确认后记录消失

**预期产出**
- `src/routes/ApplicationDetail.tsx` 完整实现
- `src/components/shared/ConfirmDialog.tsx`

---

### Step 8: 搜索 + 排序 + 筛选

**指令**
在列表页顶部添加搜索框（模糊匹配岗位名/公司名）、排序下拉（按创建时间/更新时间降序/升序）、主状态筛选器。

**验证方式**
- 输入搜索词即时过滤列表
- 切换排序方式后列表顺序改变
- 组合搜索+排序+筛选功能正常工作

**预期产出**
- `src/components/shared/SearchBar.tsx`
- 更新 `src/routes/Applications.tsx` 添加搜索排序筛选逻辑

---

## 阶段 2：录入增强

### Step 9: 截图 OCR 录入

**指令**
实现截图上传组件：拖拽或点击上传图片 → 加载 PaddleOCR.js 模型（首次 ~12MB）→ 调用 OCR 识别引擎提取文本 → 从识别文本中解析岗位名称、公司名称、职位描述 → 展示 OCR 提取结果预览 → 用户修改确认后创建记录。截图保存到附件。

**验证方式**
- 上传一张 JD 截图，PaddleOCR 返回识别文本
- 预览弹窗显示提取的岗位名、公司名、JD 文本
- 用户可修改 OCR 结果后确认创建
- 创建后记录包含附件（截图文件）
- 模型加载时显示进度提示

**预期产出**
- `src/services/ocr.ts`
- `src/components/ocr/OcrUploader.tsx`
- `src/components/ocr/OcrPreview.tsx`

---

### Step 10: 附件管理

**指令**
在编辑表单和详情页中支持多附件上传、查看、删除。附件存入 IndexedDB attachments 表。

**验证方式**
- 编辑页可上传多个附件（图片/PDF）
- 详情页显示附件列表，可点击查看
- 可删除单个附件

**预期产出**
- `src/components/application/AttachmentManager.tsx`
- 更新表单和详情页集成附件管理

---

## 阶段 3：Gmail 自动化

### Step 11: Gmail OAuth 接入

**指令**
使用 `@react-oauth/google` 实现 Google OAuth 2.0 PKCE 授权流程。授权后获取 access token，存入 Zustand gmailStore（仅内存）。

**验证方式**
- 点击「连接 Gmail」按钮弹出 Google 授权窗口
- 授权成功后按钮状态变为「已连接」
- 刷新页面后需重新授权（token 不持久化，符合安全要求）
- 如缺少 Client ID，显示配置提示而非崩溃

**预期产出**
- `src/stores/gmailStore.ts`
- `src/components/gmail/GmailAuthButton.tsx`
- `.env.example` 更新添加 VITE_GOOGLE_CLIENT_ID

---

### Step 12: 发件箱扫描 + 收件箱联动

**指令**
实现 Gmail 邮件扫描服务：调用 Gmail API messages.list + messages.get 获取发件箱邮件，匹配已有「招聘者邮箱」或关键词；收件箱匹配来自已知招聘者邮箱的邮件。匹配结果展示为待确认列表，用户手动确认后创建/更新记录。

**验证方式**
- 点击「扫描邮件」后显示匹配结果列表
- 每条结果显示邮件标题、发件人、时间、匹配理由
- 确认后创建新记录或更新已有记录
- 无匹配时显示空状态提示

**预期产出**
- `src/services/gmail.ts`
- `src/components/gmail/ScanResultList.tsx`
- `src/components/gmail/MatchCard.tsx`

---

## 阶段 4：完善

### Step 13: 统计面板

**指令**
实现 Dashboard 页面：4 张统计卡片（总投递、面试中、Offer、已拒）、饼图（主状态分布）、面试转化率和 Offer 率、最近 5 条活动时间线。

**验证方式**
- Dashboard 页面显示正确的统计数据
- 饼图使用 ECharts 渲染，数据与实际记录一致
- 活动时间线按时间倒序显示最近状态变更

**预期产出**
- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/StatusPieChart.tsx`
- `src/components/dashboard/ActivityTimeline.tsx`
- `src/routes/Dashboard.tsx` 完整实现

---

### Step 14: 数据导出

**指令**
实现数据导出功能：将所有记录导出为 JSON 文件下载；可选导出为 CSV（仅含关键字段：岗位名、公司名、主状态、子状态、面试轮次、创建时间）。

**验证方式**
- 点击「导出 JSON」下载 .json 文件，内容可被 JSON.parse 解析
- 点击「导出 CSV」下载 .csv 文件，可用 Excel 打开
- 导出内容与实际数据一致

**预期产出**
- `src/services/export.ts`
- 在 App 设置或详情页添加入口按钮

---

### Step 15: 空状态 + 错误边界

**指令**
为列表、Dashboard、搜索结果添加空状态插画和引导文案。添加 React ErrorBoundary 包裹路由，捕获渲染错误并展示友好提示。

**验证方式**
- 首次打开应用（无数据）时列表显示空状态引导
- 搜索无结果时显示「未找到匹配记录」
- 模拟组件崩溃时显示错误边界而非白屏

**预期产出**
- `src/components/shared/EmptyState.tsx`
- `src/components/shared/ErrorBoundary.tsx`

---

### Step 16: 最终检查 + 构建

**指令**
执行 `npm run build` 确保生产构建零错误、零警告。确保所有 TypeScript 类型检查通过。测试所有主要功能流程。

**验证方式**
- `npm run build` 成功，dist/ 目录生成
- `npm run preview` 可正常访问所有页面
- 核心流程手动测试：新增记录 → 编辑 → 切换状态 → 搜索 → 删除 → 统计面板数据正确

**预期产出**
- 可部署的 `dist/` 目录

---

### Step 17: GitHub Pages 部署

**指令**
配置 GitHub Actions 工作流：每次推送到 main 分支时自动构建并部署到 GitHub Pages。将 Google OAuth Client ID 的 `VITE_GOOGLE_CLIENT_ID` 设为 GitHub Actions Secret。

**验证方式**
- 推送代码后 GitHub Actions 自动触发构建
- 构建成功后访问 `{username}.github.io/job-tracker` 可看到应用
- Gmail 授权流程在部署域名下正常工作

**预期产出**
- `.github/workflows/deploy.yml`
- 配置好 GitHub Pages 的仓库和 Actions Secret
