---
name: next-auth-routing-guard
description: 设计和审查 Next.js App Router 项目中的认证、授权、重定向和受保护路由。当 Codex 需要更新中间件、路由守卫、登录重定向、权限检查、受保护布局、基于 Cookie 的认证流程或私有路由的 SEO 行为时使用。
---

# Next 认证路由守卫

将路由访问首先视为服务端关注点。

## 核心工作流

1. 识别公开路由、需认证路由和有权限范围的路由。
2. 在 `middleware.ts` 中保留粗粒度的访问检查。
3. 在获取或变更受保护数据的位置重新检查授权。
4. 确保重定向、禁止访问状态和 noindex 行为是一致的。
5. 验证路由新增不会绕过现有的权限模型。

## 默认行为

- 中间件处理路由级别的门控。
- 服务端数据访问处理记录级别的授权。
- 登录、403 和其他认证工具路由保持明确且易于审计。
- 私有路由不应被意外索引。

## 使用附带脚本

运行 `scripts/route_guard_audit.py` 来盘点路由文件，并与中间件白名单模式进行比对。

修改路由守卫之前，阅读 [auth-routing-patterns.md](./references/auth-routing-patterns.md)。
