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
- `EditorView` 管理当前静态 Schema 与表单值，`PreviewPanel` 组织预览表单；`FormFieldRenderer` 动态分发七类字段组件，各子组件在控件边界把宽联合值适配为 string、number、boolean、option string 四类明确值。后续提交校验出现时再决定是否抽取整表渲染组件。
- CloudBase 静态托管承载 Vue/Vite SPA，Node.js 20 HTTP 云函数 `generateForm` 根据 `AI_MODE` 选择 Mock 或百炼 Provider。
- 使用两套 CloudBase 环境：公开环境使用 Mock，受控演示环境使用真实 Key。前端通过公开的 `VITE_API_BASE_URL` 调用 HTTP 云函数，密钥只存在云函数环境变量。

## 数据契约

- `FormSchema` 包含 `schemaVersion: 1`、`id`、`title` 和 `fields`。
- `FormValue = string | number | boolean | undefined`。
- number 默认 `undefined`，文本/textarea/select/radio/date 默认空字符串，checkbox 默认 `false`。
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

## 当前实现状态（2026-08-24）

- 已完成应用骨架、七类 Zod 字段 Schema、整表字段 ID 唯一性校验和 5 个高价值测试。
- 已完成统一动态字段渲染器及七个精确类型子组件，相关提交已推送到 `codex/formpilot-v1`。
- 静态求职 Schema、默认值工具和 `PreviewPanel` 集成已写入工作区，但字段标签、required 展示、Schema 驱动标题/数量/空状态及浏览器输入验证仍待完成。
- Pinia 编辑器状态、草稿、导入导出、AI 和部署尚未开始。

## 实施更新（2026-09-05）

- AI 第一版最终采用一个 CloudBase 环境直接连接真实百炼，没有实现原设计中的公开 Mock／受控真实双环境。当前学习和演示阶段通过网关单 IP 限流控制成本。
- 云函数使用 Node.js 原生 `fetch` 调用百炼兼容接口，没有引入 OpenAI SDK；请求仍使用 strict JSON Schema，前端继续以 Zod 作为最终运行时边界。
- 实际成功响应为 `{ schema }`，失败响应为 `{ message }`；没有保留原设计中的 `source` 与嵌套 `error`，因为当前只有一个真实 Provider。
- CORS 改由 CloudBase 网关统一处理。云函数重复写入响应头会形成非法的多个 Origin 值，因此原设计中的 `ALLOWED_ORIGINS` 云函数校验未采用。
- 候选 Schema 仍遵守“确认后应用”；Store 使用 `toRaw` 后再 `structuredClone`，兼容 Vue 响应式 Proxy 并保持状态隔离。
- 百炼曾生成 30 个相同 ID 的字段；由于当前 strict JSON Schema 不接受数组 `uniqueItems`，云函数增加按字段 ID 去重的确定性兜底。
- Vue/Vite SPA 已部署到 CloudBase 静态托管。`createWebHistory` 保持不变，托管错误文档设置为 `index.html`，并关闭原始错误状态以保证 `/editor` 直接访问返回 HTTP 200。
- 最终用户填写／提交入口按学习者 2026-08-29 的决定暂不实现；当前作品范围聚焦 AI 生成与表单设计器。
