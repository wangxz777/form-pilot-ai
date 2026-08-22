# FormPilot AI V1 设计

## 目标

构建一个 Vue 3 + TypeScript 动态表单作品：用户可以编辑受约束的七类字段、实时预览与校验表单、保存单份本地草稿、导入导出 JSON，并通过受保护的真实百炼接口从自然语言生成 Schema。

## 范围

- 支持 `text`、`number`、`textarea`、`select`、`radio`、`checkbox`、`date`。
- 支持字段添加、删除、拖拽和按钮排序，以及基础与类型专属属性编辑。
- 支持一份自动保存草稿、JSON 导入导出、Mock AI 和真实百炼 AI。
- 不做历史记录、模板库、登录、数据库、复杂联动、低代码画布或 AI 定点修改。

## 架构

- `/` 为作品入口，`/editor` 为三栏编辑器：字段列表、实时预览、属性面板。
- Zod Schema 是运行时和 TypeScript 类型的共同事实源；外部数据一律经 Zod 校验。
- Pinia 管理当前 Schema、选中字段、草稿状态与 AI 请求状态；浏览器仓储只保存最新有效草稿。
- `FormRenderer` 负责表单值、验证和提交，`FormFieldRenderer` 在控件边界把宽联合值适配为 string、number、boolean、option 四类明确值。
- CloudBase 静态托管承载 Vue/Vite SPA，Node.js 20 HTTP 云函数 `generateForm` 根据 `AI_MODE` 选择 Mock 或百炼 Provider。
- 使用两套 CloudBase 环境：公开环境使用 Mock，受控演示环境使用真实 Key。前端通过公开的 `VITE_API_BASE_URL` 调用 HTTP 云函数，密钥只存在云函数环境变量。

## 数据契约

- `FormSchema` 包含 `schemaVersion: 1`、`id`、`title` 和 `fields`。
- `FormValue = string | number | boolean | undefined`。
- number/select/radio 默认 `undefined`，文本/textarea/date 默认空字符串，checkbox 默认 `false`。
- Schema 校验字段 ID 唯一、选项非空、长度/数值上下界顺序合法。
- AI 请求为 `{ prompt: string }`；成功响应为 `{ source: 'mock' | 'bailian', schema }`；失败响应为 `{ error: { code, message } }`。

## 失败与安全

- 导入、草稿和 AI 输出失败时不覆盖当前 Schema，并提供可读错误。
- AI 请求支持取消与显式重试；上游错误不向客户端泄露密钥或原始敏感信息。
- `DASHSCOPE_API_KEY` 只存在 CloudBase 云函数环境，禁止使用 `VITE_` 前缀；`VITE_API_BASE_URL` 只能保存公开的函数地址。
- HTTP 云函数按 `ALLOWED_ORIGINS` 校验跨域来源，不把上游错误体或环境变量写入客户端响应。
- 损坏的草稿不覆盖原始内容，应用回退到静态求职 Schema。

## 验收

- 每个增量通过相关 Vitest 测试与 `pnpm build`；测试聚焦高价值行为，不设覆盖率指标。
- E2E 覆盖编辑排序、填写校验、AI 生成应用和导入导出。
- 真实 AI 在受控 CloudBase 环境人工验证三条不同需求，不进入 CI。
