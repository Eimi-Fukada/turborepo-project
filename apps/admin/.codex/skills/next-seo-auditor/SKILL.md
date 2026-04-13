---
name: next-seo-auditor
description: 审计、实现和完善 Next.js App Router 项目中的 SEO 行为。当 Codex 需要添加或审查元数据、robots 规则、canonical 处理、Open Graph 标签、结构化数据、站点地图行为、爬取边界，或公开/私有路由的 SEO 相关服务端渲染决策时使用。
---

# Next SEO 审计器

将 SEO 视为路由架构的一部分，而非后处理。

## 核心工作流

1. 将每个路由分类为公开、半公开或私有。
2. 检查路由是否在服务端渲染了有意义的内容。
3. 通过 Metadata API 添加或审查路由元数据。
4. 有意识地设置 `robots`、canonical 和分享行为。
5. 检查是否有受认证保护或内部内容被意外爬取。

## 默认行为

- 公开路由应有有意义的 `title`、`description` 和服务端渲染的标题。
- 私有路由应默认为 noindex 行为。
- 优先在拥有路由意图的最接近的布局或页面中放置元数据。
- 避免在嵌套路由段之间重复元数据逻辑，除非层级确实不同。

## 使用附带脚本

运行 `scripts/metadata_audit.py` 可以快速获取路由清单，显示元数据存在、缺失或可能不完整的位置。

## 审查重点

- 公开路由缺少元数据
- 私有路由缺少 `robots`
- SEO 关键内容仅在 hydration 之后才渲染
- 元数据的路由归属重复或不明确

获取路由分类指引，阅读 [route-seo-policy.md](./references/route-seo-policy.md)。
