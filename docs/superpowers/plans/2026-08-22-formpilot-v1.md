# FormPilot AI V1 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 完成可编辑、可校验、可导入导出并能由真实百炼模型生成 Schema 的 Vue 3 动态表单作品。

**架构：** Zod 是 Schema 事实源；Pinia 保存单份编辑草稿；Element Plus 字段渲染器在组件边界归一化动态值；Vercel Function 隔离 Mock/百炼 Provider 与服务端密钥。

**技术栈：** Vue 3、TypeScript、Vite、Element Plus、Vue Router、Pinia、Zod、vue-draggable-plus、Vitest、Vue Test Utils、Playwright、Vercel Functions、OpenAI Node SDK（百炼兼容模式）。

---

## 全局约束

- 只实现设计文档列出的 V1；不增加历史、模板、登录、数据库或 AI 定点修改。
- 不使用 `any` 或无法说明理由的类型断言。
- 新依赖在首次使用它的任务中安装，不预建空壳业务文件。
- 核心行为遵循 TDD；测试只覆盖真实且高价值的行为，不追求覆盖率数字。
- 每个任务结束时运行相关测试和 `pnpm build`；任务 1 允许保留计划内、由任务 2 修复的现有 TS2322。
- 每个任务独立提交，不修改无关代码。

### 任务 1：建立 Zod Schema 事实源

**文件：**
- 修改：`src/types/form-schema.ts`
- 修改：`src/data/job-application-schema.ts`
- 修改：`src/utils/form.ts`
- 修改：`src/utils/form.test.ts`
- 修改：`package.json`、`pnpm-lock.yaml`

- [ ] **步骤 1：安装 Zod，并先为新契约编写失败测试**

  测试必须证明 number 默认值是 `undefined`，合法静态 Schema 可解析，重复字段 ID、空 options、反向 min/max 会被拒绝。每条测试点名一个具体破坏。

- [ ] **步骤 2：运行定向测试并确认因契约尚未实现而失败**

  运行：`pnpm test src/utils/form.test.ts`

- [ ] **步骤 3：用 Zod 可辨识联合重建七类字段和 FormSchema**

  导出运行时 Schema 与 `z.infer` 类型；增加 `schemaVersion: 1` 和跨字段语义校验，保留现有公开类型名称。

- [ ] **步骤 4：更新静态 Schema 和默认值实现**

  静态求职 Schema 增加版本；number 默认值改为 `undefined`，其余默认值遵循设计文档。

- [ ] **步骤 5：验证并提交**

  运行：`pnpm test src/utils/form.test.ts`、`pnpm test`。`pnpm build` 应只保留现有 textarea TS2322。

### 任务 2：搭建可运行应用骨架与字段渲染器

**文件：**
- 修改：`src/main.ts`、`src/App.vue`
- 创建：`src/router/index.ts`
- 创建：`src/views/HomeView.vue`、`src/views/EditorView.vue`
- 创建：`src/components/FormFieldRenderer.vue`、`src/components/FormRenderer.vue`
- 创建：`src/components/FormFieldRenderer.test.ts`
- 创建：`src/styles/main.css`
- 修改：`package.json`、`pnpm-lock.yaml`、`vite.config.ts`

- [ ] **步骤 1：安装 Vue Router、Pinia、Element Plus、Vue Test Utils 与 jsdom**
- [ ] **步骤 2：先写字段值适配测试并确认失败**

  用真实组件分别验证 string、number、boolean、option 四类 `update:modelValue` 行为；这些测试应能抓住把适配器错误地共用为宽联合值的回归。

- [ ] **步骤 3：实现 Router、应用入口和两个页面骨架**

  `/` 提供项目说明和编辑器入口；`/editor` 提供三栏可运行骨架，暂不创建未来功能空文件。

- [ ] **步骤 4：实现字段与整表渲染组件**

  `FormFieldRenderer` 接收 `field`、`modelValue`、`error`，发出 `update:modelValue`；内部使用四类 computed 适配器。`FormRenderer` 初始化值、执行现有校验并展示提交结果。

- [ ] **步骤 5：验证并提交**

  运行：`pnpm test`、`pnpm build`。TS2322 必须消失，七类字段全部可渲染。

### 任务 3：实现三栏 Schema 编辑器和单份草稿

**文件：**
- 创建：`src/stores/form-editor.ts`、`src/stores/form-editor.test.ts`
- 创建：`src/repositories/draft-repository.ts`、`src/repositories/draft-repository.test.ts`
- 创建：`src/components/editor/FieldList.vue`、`FieldPalette.vue`、`FieldProperties.vue`
- 修改：`src/views/EditorView.vue`、`src/styles/main.css`
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
- 修改：`src/components/FormRenderer.vue`、`src/views/EditorView.vue`、`src/views/HomeView.vue`、`src/styles/main.css`

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
- 创建：`api/generate-form.ts`、`api/_lib/generate-form-handler.ts`、`api/_lib/providers.ts`
- 创建：`api/_lib/generate-form-handler.test.ts`
- 修改：`src/stores/form-editor.ts`、`src/components/editor/EditorToolbar.vue`
- 修改：`package.json`、`pnpm-lock.yaml`、`tsconfig.node.json`

- [ ] **步骤 1：安装 OpenAI Node SDK，并先写 API handler 失败测试**

  覆盖无效方法、空/超长 prompt、Mock 成功、Provider 失败、非法模型输出不返回 Schema。外部模型在 Provider 边界替换，断言真实 handler 响应。

- [ ] **步骤 2：实现稳定 API 契约与 Mock Provider**

  `POST /api/generate-form` 接收 `{ prompt }`；返回计划规定的成功/失败结构，prompt 长度为 1～2000 个字符。

- [ ] **步骤 3：实现百炼 Provider**

  读取 `DASHSCOPE_API_KEY`、`DASHSCOPE_BASE_URL`、`AI_MODEL`；使用兼容 Chat Completions 与 strict JSON Schema；JSON 解析后必须再次通过应用 Zod Schema。

- [ ] **步骤 4：实现 AI 对话框和客户端状态**

  支持 Mock/真实来源标识、loading、取消、显式重试、错误提示和“确认后应用”；失败时不改变草稿。

- [ ] **步骤 5：验证并提交**

  运行：`pnpm test`、`pnpm build`。无凭据时验证 Mock；有凭据时对真实环境执行三条人工烟测。

### 任务 6：完成 E2E、部署配置与作品交付

**文件：**
- 创建：`playwright.config.ts`
- 创建：`e2e/editor.spec.ts`、`e2e/form.spec.ts`、`e2e/ai.spec.ts`、`e2e/import-export.spec.ts`
- 创建：`vercel.json`、`.env.example`
- 修改：`package.json`、`pnpm-lock.yaml`、`README.md`
- 修改：`docs/PROJECT_CONTEXT.md`、`docs/DAILY_LOG.md`

- [ ] **步骤 1：安装 Playwright，并先写四条主流程 E2E**

  覆盖编辑排序、填写校验、Mock AI 生成应用、导出后导入；运行确认至少因尚缺定位/配置而失败。

- [ ] **步骤 2：补齐稳定选择器和 Vercel SPA/API 配置**
- [ ] **步骤 3：完成 README、环境变量示例和部署说明**

  README 必须如实区分公开 Mock 与受保护真实环境，包含架构、数据流、安全、命令、测试和项目取舍。

- [ ] **步骤 4：运行完整验证**

  运行：`pnpm test`、`pnpm test:e2e`、`pnpm build`。检查无密钥构建、公开 Mock 与本地编辑流程。

- [ ] **步骤 5：部署与证据记录**

  若 Vercel 已登录则部署公开 Mock 和受保护真实 Preview；否则记录精确阻塞和可直接执行的部署命令。更新每日记录时只写实际命令与结果，不编造理解或真实 AI 成功。

