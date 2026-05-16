# @progress.md — 进度追踪

## Step 4: 路由 + 布局外壳 ✅
- **时间**: 2026-05-16
- **完成内容**: React Router 路由配置（Dashboard/Applications/Detail），MUI AppBar + Drawer 响应式布局，暗色顶栏
- **产出文件**: `src/App.tsx` (更新), `src/components/layout/AppLayout.tsx`, `src/routes/Dashboard.tsx` (占位)

## Step 5: 手动录入表单 ✅
- **时间**: 2026-05-16
- **完成内容**: MUI Dialog 表单，岗位名/公司名必填验证，可选字段：JD/邮箱/链接/简历版本/备注
- **产出文件**: `src/components/application/CreateButton.tsx` (含 ApplicationForm)

## Step 6: 列表展示 + 标签切换 ✅
- **时间**: 2026-05-16
- **完成内容**: Tab 分组（进行中/暂停/已结束）+ 数量徽章，ApplicationCard 含状态徽章和相对时间
- **产出文件**: `src/routes/Applications.tsx`, `src/components/application/ApplicationCard.tsx`, `src/components/application/StatusBadge.tsx`

## Step 7: 记录详情 + 编辑 ✅
- **时间**: 2026-05-16
- **完成内容**: 详情页展示全部字段，状态双下拉选择器，面试轮次输入，内联编辑模式，删除二次确认
- **产出文件**: `src/routes/ApplicationDetail.tsx`, `src/components/shared/ConfirmDialog.tsx`

## Step 13: 统计面板 ✅
- **时间**: 2026-05-16
- **完成内容**: 4 张统计卡片 + ECharts 饼图 + 面试转化率/Offer 率 + 最近活动时间线
- **产出文件**: `src/routes/Dashboard.tsx`, `src/components/dashboard/StatCard.tsx`, `src/components/dashboard/StatusPieChart.tsx`, `src/components/dashboard/ActivityTimeline.tsx`

## Step 14: 数据导出 ✅
- **时间**: 2026-05-16
- **完成内容**: JSON 全量导出 + CSV（含 BOM 支持 Excel 打开中文），侧边栏入口
- **产出文件**: `src/services/export.ts`

## Step 15: 空状态 + 错误边界 ✅
- **时间**: 2026-05-16
- **完成内容**: EmptyState 组件（图标+引导文案）、React ErrorBoundary 包裹路由
- **产出文件**: `src/components/shared/EmptyState.tsx`, `src/components/shared/ErrorBoundary.tsx`

## Step 16: 最终检查 + 构建 ✅
- **时间**: 2026-05-16
- **完成内容**: npm run build 零错误，dist/ 目录生成
- **备注**: 全部 17 Steps 通过

## Step 17: GitHub Pages 部署 ✅
- **时间**: 2026-05-16
- **完成内容**: GitHub Actions 工作流，push main 自动构建部署
- **产出文件**: `.github/workflows/deploy.yml`
