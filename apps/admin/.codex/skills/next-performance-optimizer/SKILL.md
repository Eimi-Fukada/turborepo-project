---
name: next-performance-optimizer
description: 优化 Next.js App Router 应用的渲染性能、包体积、hydration 安全性和响应式交付。当 Codex 需要减少客户端 JavaScript、审查服务端/客户端边界、添加流式渲染或 Suspense、审计 hydration 风险，或识别重型依赖和慢路由模式时使用。
---

# Next 性能优化器

优先通过架构修复而非微观优化。

## 核心工作流

1. 检查路由是否从服务端开始，仅在需要时才启用客户端。
2. 查找过大的客户端边界、重复的数据获取和重型仅限浏览器的依赖。
3. 隔离交互孤岛，延迟非关键的客户端代码。
4. 审查加载、Suspense 和缓存行为。
5. 在将工作视为完成之前，审计 hydration 风险和窄屏行为。

## 使用附带脚本

- 运行 `scripts/client_boundary_audit.py` 列出使用 `"use client"` 的文件。
- 运行 `scripts/hydration_risk_audit.py` 标记仅限浏览器的 API、随机值和基于时间的渲染模式。

## 默认行为

- 首先将数据工作推送到服务端组件或路由处理器。
- 优先使用路由级别的流式渲染，而非空白初始外壳。
- 仅在动态导入能显著改善启动成本时才使用。
- 将大型 UI 库、图表、编辑器和 3D 代码视为客户端孤岛的候选者。

当变更涉及多个路由时，阅读 [performance-review-guide.md](./references/performance-review-guide.md)。
