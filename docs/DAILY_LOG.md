# FormPilot AI 每日学习记录

## 使用方法

每天学习结束后，由 Codex 检查实际改动和命令结果，再更新当天总结。只记录有代码、命令结果或学习者复述支持的事实；没有证据的完成、测试或理解不写入记录。

## Day 1 — 2026-08-21

### 今日目标

- 创建 Vue 3 + Vite + TypeScript 项目并验证构建。
- 定义第一版表单 Schema 和静态求职申请 Schema。
- 展示字段摘要，实现默认值并动态渲染首批字段。

### 完成情况

- 使用 `pnpm` 完成项目初始化，配置了 `@/` 路径别名。
- 定义了第一版 Schema 类型和包含 5 个字段的静态求职申请 Schema。
- 实现 `getDefaultValue`、`getFieldSummary`，并动态渲染 text、number、select 三类控件和收集表单值。

### 验证结果

- Vue `^3.5.40`、TypeScript `~6.0.2`、Vite `^8.2.0`。
- `pnpm build` 成功，`vue-tsc -b && vite build` 退出码为 0。

### 学习与问题

- 已通过代码练习 `FormSchema`、`FormField`、可辨识联合类型和路径别名，但尚未通过独立复述确认掌握。
- `FieldType` 与 `FormField` 的职责区别，以及动态字段 ID 与具体值类型的关系仍需巩固。

### 明日第一步

- 为现有字段实现 required、长度和数字范围校验。

---

## Day 2 — 2026-08-22

### 今日目标

- 完成 required、minLength、maxLength、min、max 校验。
- 展示提交状态和字段错误。
- 安装 Vitest 并为表单纯函数补充单元测试。

### 完成情况

- 实现 `validateField`、`validateForm`，并在页面展示字段错误和提交成功状态。
- 将 Schema 和动态渲染扩展到 text、number、textarea、select、radio、checkbox、date 七类字段。
- 安装 Vitest `^4.1.11`，为默认值、摘要、校验和整表校验编写 12 个测试。

### 验证结果

- 首次 `pnpm test` 因测试文件为空而失败；补充用例后 12/12 通过。
- `pnpm build` 失败：`src/App.vue` 的 textarea `v-model` 报 TS2322，值类型可能包含 `boolean`。
- Git 断点提交：`6d908bb chore: checkpoint dynamic form renderer`；提交后工作区干净。

### 学习与问题

- 测试发现年龄用例期望最小值 18，但测试 Schema 未声明 `min: 18`；补充规则后通过。
- checkbox 使 `FormValues` 加入 `boolean`，暴露动态字典值无法随字段类型同步收窄的问题。
- 已确认 `as string` 只会隐藏类型错误，不会转换运行时值；核心类型和数据流仍未通过独立复述确认。

### 明日第一步

- 抽取字段渲染组件，用类型明确的 computed 适配器解决 TS2322，并重新运行测试和构建。

---

## Day 3 — 2026-08-23

### 今日目标

- 将前两天的业务实现清空，以新的学习方式重新开始。
- 参考 `docs/ui` 先搭建可导航的前端整体骨架。
- 明确由学习者主导核心模块实现，Codex 负责指引、审查和验证。
- 从空白重新定义第一版 Zod 表单 Schema。
- 建立 text、number 字段约束、表单版本约束和字段 ID 唯一性校验。
- 扩展 checkbox、date 字段并用运行时测试验证数据契约。

### 完成情况

- 清空旧表单页面，并删除旧 Schema、示例数据、表单工具和测试文件；这些删除当前尚未提交。
- 接入 Vue Router、Pinia 和 Element Plus，完成 `/` 首页与 `/editor` 编辑器路由。
- 编辑器页已具备参考 UI 的顶部工具栏、字段区、实时预览区、属性区和窄屏单列布局；未实现 Store、Schema、字段渲染、弹窗或 AI 业务。
- 新增前端薄骨架设计和实施计划；骨架提交为 `7479c56 feat: build frontend app shell`。
- 使用 `z.literal(1)` 固定 V1 版本，并通过 `z.discriminatedUnion` 建立 text、number 字段联合类型。
- 为文本长度和数字范围增加可选边界及 min/max 关系校验；为根表单增加字段 ID 唯一性检查和具体错误路径。
- 从 Zod Schema 通过 `z.infer` 导出 TypeScript 类型，没有使用 `any` 或类型断言。
- 完成 text、number、textarea、select、radio、checkbox、date 七类字段 Schema，并修正 checkbox 与 date 的提前设计。
- 完成统一动态 `FormFieldRenderer` 及七个字段子组件；各子组件使用 computed 将宽联合 `FormValue` 适配为控件需要的 string、number、boolean 或 option string。
- 将测试收缩为 5 个高价值用例，不再为基础字段保留重复测试。

### 验证结果

- 修改文件：`src/main.ts`、`src/App.vue`、`src/router/index.ts`、`src/views/HomeView.vue`、`src/views/EditorView.vue`、`src/styles/main.css`、依赖清单及锁文件。
- `pnpm build` 成功：Vite 转换 1593 个模块并产出 `dist`；Element Plus 整体引入触发单个 JS chunk 超过 500 kB 的非阻断警告。
- 学习者已自行审查页面；Codex 的后续浏览器视觉复验按学习者要求跳过。
- Schema 修改文件：`src/types/form-schema.ts`、`src/types/form-schema.test.ts`。
- `pnpm test`：5 个测试全部通过。
- `vue-tsc -b` 与 Vite 生产构建成功；七类动态渲染组件通过类型检查。
- `git diff --check`：通过。
- Git 提交：`c9b56ca docs: define frontend app shell design`、`7479c56 feat: build frontend app shell`、`9836bfa feat: define initial form schema`、`5e95a57 feat: support seven form field schemas`；字段渲染器将在验证后提交。

### 学习与问题

- 已确定后续协作方式：学习者负责核心类型、组件和状态逻辑，Codex 默认不代写业务代码。
- 今天的框架代码由 Codex 执行，学习者对入口注册、Router 数据流和三栏 CSS 的理解尚未通过复述确认。
- `@vue/test-utils`、`jsdom` 当前尚未使用；包体拆分留到出现真实性能需求时处理。
- 已确认理解：`z.literal(1)` 同时约束运行时值和推导类型；空数组与可选属性含义不同；`superRefine` 可以读取整个表单并添加多条、可定位路径的错误。
- 仍需巩固：字段配置 Schema 与填写值类型的职责边界；不要为尚未进入范围的能力提前增加字段。
- 关键问题与结论：动态组件父层负责分发，子组件内部通过 computed 完成精确值类型适配；类型检查和构建通过不能代替业务契约测试。

### 明日第一步

- 实现表单默认值纯函数，再将七类字段渲染器接入 `EditorView` 的静态预览。

---

## 后续每日记录模板

## Day N — YYYY-MM-DD

### 今日目标

-

### 完成情况

-

### 验证结果

- 修改文件：
- 命令与结果：
- Git 提交：

### 学习与问题

- 已确认理解：
- 仍需巩固：
- 关键问题与结论：

### 明日第一步

-
