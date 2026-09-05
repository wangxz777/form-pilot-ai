# FormPilot AI V1 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 完成可编辑、可校验、可导入导出并能由真实百炼模型生成 Schema 的 Vue 3 动态表单作品。

**架构：** Zod 是 Schema 事实源；Pinia 保存单份编辑草稿；Element Plus 字段渲染器在组件边界归一化动态值；CloudBase Node.js 20 HTTP 云函数隔离 Mock/百炼 Provider 与服务端密钥。

**技术栈：** Vue 3、TypeScript、Vite、Element Plus、Vue Router、Pinia、Zod、vue-draggable-plus、Vitest、Vue Test Utils、Playwright、CloudBase 静态托管与 Node.js 20 HTTP 云函数、OpenAI Node SDK（百炼兼容模式）。

**当前进度：** 15%（截至 2026-08-24）。应用骨架、Zod Schema 和七类字段渲染器已完成；静态预览集成处于未提交断点，尚未通过 UI 审查。

---

## 全局约束

- 只实现设计文档列出的 V1；不增加历史、模板、登录、数据库或 AI 定点修改。
- 不使用 `any` 或无法说明理由的类型断言。
- 新依赖在首次使用它的任务中安装，不预建空壳业务文件。
- 学习者主导核心类型、组件数据流和状态逻辑；Codex 负责指引、审查和验证，除非学习者明确要求实现。
- 测试只覆盖真实且高价值的契约与流程；基础字段行为不重复补用例，不追求覆盖率数字。
- 每个任务结束时运行相关测试和 `pnpm build`；任务 1 允许保留计划内、由任务 2 修复的现有 TS2322。
- 每个任务独立提交，不修改无关代码。

### 任务 1：建立 Zod Schema 事实源

**文件：**
- 修改：`src/types/form-schema.ts`
- 创建：`src/types/form-schema.test.ts`
- 创建：`src/data/job-application-schema.ts`
- 创建：`src/utils/form-values.ts`
- 修改：`package.json`、`pnpm-lock.yaml`

- [x] **步骤 1：安装 Zod，并为核心契约编写测试**

  当前保留 5 个高价值测试，覆盖文本/多行文本长度、数字范围、选项约束，以及整表版本、字段联合和重复字段 ID。

- [x] **步骤 2：运行 Schema 定向测试**

  运行：`pnpm test src/types/form-schema.test.ts`

- [x] **步骤 3：用 Zod 可辨识联合重建七类字段和 FormSchema**

  导出运行时 Schema 与 `z.infer` 类型；增加 `schemaVersion: 1` 和跨字段语义校验，保留现有公开类型名称。

- [x] **步骤 4：创建静态 Schema 和默认值实现**

  静态求职 Schema 覆盖七类字段并使用 `satisfies FormSchema`；number 默认值为 `undefined`，checkbox 为 `false`，其余类型为空字符串。

- [x] **步骤 5：验证 Schema 与字段渲染器基线**

  `pnpm test` 为 5/5 通过，`pnpm build` 通过，TS2322 已消失。Schema 与字段渲染器提交分别为 `9836bfa`、`5e95a57`、`1bf9dac`。

### 任务 2：搭建可运行应用骨架与字段渲染器

**文件：**
- 修改：`src/main.ts`、`src/App.vue`
- 创建：`src/router/index.ts`
- 创建：`src/views/HomeView.vue`、`src/views/EditorView/EditorView.vue`、`src/views/EditorView/PreviewPanel.vue`
- 创建：`src/components/formRenderer/FormFieldRenderer.vue`
- 创建：`src/components/formRenderer/components/{Text,Number,Textarea,Select,Radio,Checkbox,Date}.vue`
- 创建：`src/styles/main.scss`
- 修改：`package.json`、`pnpm-lock.yaml`、`vite.config.ts`

- [x] **步骤 1：安装 Vue Router、Pinia、Element Plus、Vue Test Utils、jsdom 与 Sass**
- [x] **步骤 2：实现字段值适配边界**

  七个子组件使用 string、number、boolean、option string 四类 computed 适配器，不为基础控件重复添加组件测试。

- [x] **步骤 3：实现 Router、应用入口和两个页面骨架**

  `/` 提供项目说明和编辑器入口；`/editor` 提供三栏可运行骨架，暂不创建未来功能空文件。

- [x] **步骤 4：实现统一字段渲染器**

  `FormFieldRenderer` 负责动态分发七类字段组件；每个子组件通过 computed 将宽联合 `FormValue` 适配为控件值。字段渲染器已提交并推送。

- [ ] **步骤 5：完成静态预览集成并提交**

  当前已接入静态求职 Schema 和默认值，但仍需用 `el-form-item` 显示字段标签与 required 状态，将标题、字段数量和空状态改为 Schema 驱动，并验证输入交互。完成后运行 `pnpm test`、`pnpm build`、`git diff --check`。

### 任务 3：实现三栏 Schema 编辑器和单份草稿

**文件：**
- 创建：`src/stores/form-editor.ts`、`src/stores/form-editor.test.ts`
- 创建：`src/repositories/draft-repository.ts`、`src/repositories/draft-repository.test.ts`
- 创建：`src/components/editor/FieldList.vue`、`FieldPalette.vue`、`FieldProperties.vue`
- 修改：`src/views/EditorView/EditorView.vue`、`src/views/EditorView/PreviewPanel.vue`、`src/styles/main.scss`
- 修改：`package.json`、`pnpm-lock.yaml`

- [ ] **步骤 1：安装 vue-draggable-plus，并先写 store/仓储失败测试**

  测试添加、删除、上下移动、字段属性更新、合法草稿往返，以及损坏草稿回退且不被覆盖。

- [ ] **步骤 2：实现 Pinia 编辑 store 与浏览器仓储**

  Store 管理当前 Schema 和 selectedFieldId；字段 ID 使用 `crypto.randomUUID()`。仓储键固定为 `formpilot:draft:v1`，只保存通过 Zod 的最新草稿。

- [ ] **步骤 3：实现字段库、列表和属性面板**

  支持七类字段添加、选择、删除、拖拽句柄、上下移；属性面板按字段类型显示现有可编辑属性与 options 编辑。

- [ ] **步骤 4：接入 500ms 自动保存和恢复/重置提示**
- [ ] **步骤 5：验证并提交**

  运行：`pnpm test`、`pnpm build`，并手动确认可从空 Schema 建出完整表单。

### 任务 4：完成表单体验与 JSON 导入导出

**文件：**
- 创建：`src/utils/schema-file.ts`、`src/utils/schema-file.test.ts`
- 创建：`src/components/editor/EditorToolbar.vue`
- 修改：`src/views/EditorView/PreviewPanel.vue`、`src/views/EditorView/EditorView.vue`、`src/views/HomeView.vue`、`src/styles/main.scss`

- [ ] **步骤 1：先写 JSON 解析、校验和导出命名失败测试**
- [ ] **步骤 2：实现导入解析与导出下载数据构建**

  导入失败返回带字段路径的可读错误且不改变 store；导出包含 `schemaVersion`，文件名来自 Schema ID。

- [ ] **步骤 3：实现工具栏、确认后导入、重置与响应式布局**
- [ ] **步骤 4：完善预览验证交互**

  首次提交显示全量错误；之后更新字段时刷新对应错误；成功提交显示结构化结果。

- [ ] **步骤 5：验证并提交**

  运行：`pnpm test`、`pnpm build`，手动完成导出后再导入的往返。

### 任务 5：实现 Mock 与真实百炼 AI 生成

**文件：**
- 创建：`src/types/ai.ts`、`src/services/form-generator.ts`
- 创建：`src/components/editor/AiGenerateDialog.vue`
- 创建：`functions/generateForm/src/server.ts`、`functions/generateForm/src/generate-form-handler.ts`、`functions/generateForm/src/providers.ts`
- 创建：`functions/generateForm/src/generate-form-handler.test.ts`
- 创建：`functions/generateForm/package.json`、`functions/generateForm/tsconfig.json`、`functions/generateForm/scf_bootstrap`
- 修改：`src/stores/form-editor.ts`、`src/components/editor/EditorToolbar.vue`
- 修改：`package.json`、`pnpm-lock.yaml`、`tsconfig.node.json`

- [ ] **步骤 1：安装 OpenAI Node SDK，并先写 API handler 失败测试**

  覆盖无效方法、空/超长 prompt、Mock 成功、Provider 失败、非法模型输出不返回 Schema。外部模型在 Provider 边界替换，断言真实 handler 响应。

- [ ] **步骤 2：实现稳定 API 契约与 Mock Provider**

  CloudBase HTTP 云函数暴露 `POST /generate-form`，接收 `{ prompt }`；返回计划规定的成功/失败结构，prompt 长度为 1～2000 个字符。HTTP 层按 `ALLOWED_ORIGINS` 处理 CORS，业务 handler 保持与平台无关。

- [ ] **步骤 3：实现百炼 Provider**

  读取 `DASHSCOPE_API_KEY`、`DASHSCOPE_BASE_URL`、`AI_MODEL`；使用兼容 Chat Completions 与 strict JSON Schema；JSON 解析后必须再次通过应用 Zod Schema。

- [ ] **步骤 4：实现 AI 对话框和客户端状态**

  客户端从 `VITE_API_BASE_URL` 读取公开函数地址，支持 Mock/真实来源标识、loading、取消、显式重试、错误提示和“确认后应用”；失败时不改变草稿。

- [ ] **步骤 5：验证并提交**

  运行：`pnpm test`、`pnpm build`、`pnpm build:function`。无凭据时验证 Mock；有凭据时对真实 CloudBase 环境执行三条人工烟测。

### 任务 6：完成 E2E、部署配置与作品交付

**文件：**
- 创建：`playwright.config.ts`
- 创建：`e2e/editor.spec.ts`、`e2e/form.spec.ts`、`e2e/ai.spec.ts`、`e2e/import-export.spec.ts`
- 创建：`cloudbaserc.json`、`.env.example`
- 修改：`package.json`、`pnpm-lock.yaml`、`README.md`
- 修改：`docs/PROJECT_CONTEXT.md`、`docs/DAILY_LOG.md`

- [ ] **步骤 1：安装 Playwright，并先写四条主流程 E2E**

  覆盖编辑排序、填写校验、Mock AI 生成应用、导出后导入；运行确认至少因尚缺定位/配置而失败。

- [ ] **步骤 2：补齐稳定选择器和 CloudBase SPA/云函数配置**

  `cloudbaserc.json` 使用 `{{env.TCB_ENV_ID}}` 选择环境，静态应用构建命令为 `pnpm build`、输出目录为 `dist`；`generateForm` 配置为 Nodejs20.19 HTTP 云函数，超时 60 秒。密钥不写入配置文件。
- [ ] **步骤 3：完成 README、环境变量示例和部署说明**

  README 必须如实区分公开 Mock 与受保护真实环境，包含架构、数据流、安全、命令、测试和项目取舍。

- [ ] **步骤 4：运行完整验证**

  运行：`pnpm test`、`pnpm test:e2e`、`pnpm build`。检查无密钥构建、公开 Mock 与本地编辑流程。

- [ ] **步骤 5：部署与证据记录**

  若 CloudBase CLI 已登录且存在两个环境，则分别部署公开 Mock 与受控真实环境；否则记录精确阻塞和可直接执行的 `tcb app deploy`、`tcb fn deploy generateForm --httpFn` 命令。更新每日记录时只写实际命令与结果，不编造理解或真实 AI 成功。

## 实施状态更新（2026-09-05）

### 任务 5

任务 5 已按以下计划偏差完成：

- 没有安装 OpenAI Node SDK，云函数直接使用 Node.js 原生 `fetch` 调用百炼兼容 Chat Completions。
- 没有实现 Mock Provider 和双环境；当前只部署真实百炼环境，通过网关限流控制公开演示成本。
- HTTP 契约落地为 `POST /generate-form`、请求 `{ prompt }`、成功 `{ schema }`、失败 `{ message }`。
- 客户端已实现 loading、取消、错误提示、Zod 校验和确认后应用；失败不会修改当前 Store。
- 云函数测试 4/4、前端测试 26/26、生产构建均通过；真实请求已验证单字段生成和字段 ID 去重。

### 任务 6

- 步骤 2 的 CloudBase 云函数与 SPA 配置已完成；静态托管使用 Vue Router history 模式和 `index.html` 错误文档回退。
- 步骤 5 已完成单个真实环境部署与证据记录；首页、`/editor`、静态资源和生产域名 CORS 已通过 HTTP 验证。
- 没有执行原计划的双环境部署，因为 Mock 环境已从当前范围移除。
- E2E、完整作品级 README、演示材料和最终功能冻结仍未完成。
- 最终用户填写／提交入口暂不实现，因此原计划中依赖填写流程的 E2E 不再作为当前阶段前置条件；最终测试范围将在功能冻结时重新确认。
