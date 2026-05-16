# Job Tracker — 项目启动规则

> 本文件是项目的核心约定。所有参与本项目开发的 AI Agent 在执行任何编码任务前，
> 必须完整阅读并遵守以下规则。

---

## 📖 编码前置阅读要求

在编写任何代码之前，必须按顺序完整阅读以下文件：

1. ✅ **`memory_bank/@architecture.md`** — 架构设计文档（含系统架构图、模块划分、接口约定）
2. ✅ **`memory_bank/@main_functions.md`** — 功能规格书（含功能清单、用户故事、验收标准）

**违反后果**: 未阅读以上文件直接编写的代码将被视为无效提交，必须重做。

---

## 🔄 里程碑更新规则

每完成以下任一里程碑后，**必须更新** `memory_bank/@architecture.md`：

- [ ] 完成一个新的功能模块（如手动录入、列表展示、Gmail 集成等）
- [ ] 完成数据库 Schema 变更
- [ ] 引入新的技术依赖或服务集成
- [ ] 完成前端路由/页面组
- [ ] 完成 API 集成（Gmail、OpenAI）

**更新内容要求**:
- 同步最新的模块依赖关系
- 更新接口变更说明
- 补充新的架构决策记录 (ADR)
- 标注更新日期和原因

---

## 🏗️ 架构文档首次创建

如果 `@architecture.md` 尚不存在（通常首次执行 Step 1 时创建），
基于 `@tech_stack.md` 的技术方案创建它，至少包含：
- 系统整体架构图 (ASCII 或文本描述)
- 前后端分层结构（本项目为纯前端，描述组件树和数据流）
- 数据流向说明
- 关键技术决策及理由

---

## 🔐 安全约束

- OpenAI API Key 和 Google OAuth Client ID 必须通过 `.env` 文件注入，不得硬编码
- Gmail 邮件扫描结果仅提取元数据（发件人、时间、标题），不存储邮件正文到 IndexedDB
- 所有 OAuth Token 存储在浏览器内存中（Zustand），不持久化到 localStorage

---

## 📐 代码风格约束

- TypeScript strict 模式
- 组件使用函数式声明 + Hooks，禁止 Class Component
- 文件名：组件 PascalCase，工具函数 camelCase，类型文件 index.ts
- 提交前确保 `npm run build` 和 `npm run lint` 零错误
