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

### 完成情况

- 清空旧表单页面，并删除旧 Schema、示例数据、表单工具和测试文件；这些删除当前尚未提交。
- 接入 Vue Router、Pinia 和 Element Plus，完成 `/` 首页与 `/editor` 编辑器路由。
- 编辑器页已具备参考 UI 的顶部工具栏、字段区、实时预览区、属性区和窄屏单列布局；未实现 Store、Schema、字段渲染、弹窗或 AI 业务。
- 新增前端薄骨架设计和实施计划；骨架提交为 `7479c56 feat: build frontend app shell`。

### 验证结果

- 修改文件：`src/main.ts`、`src/App.vue`、`src/router/index.ts`、`src/views/HomeView.vue`、`src/views/EditorView.vue`、`src/styles/main.css`、依赖清单及锁文件。
- `pnpm build` 成功：Vite 转换 1593 个模块并产出 `dist`；Element Plus 整体引入触发单个 JS chunk 超过 500 kB 的非阻断警告。
- 学习者已自行审查页面；Codex 的后续浏览器视觉复验按学习者要求跳过。
- Git 提交：`c9b56ca docs: define frontend app shell design`、`7479c56 feat: build frontend app shell`。

### 学习与问题

- 已确定后续协作方式：学习者负责核心类型、组件和状态逻辑，Codex 默认不代写业务代码。
- 今天的框架代码由 Codex 执行，学习者对入口注册、Router 数据流和三栏 CSS 的理解尚未通过复述确认。
- `@vue/test-utils`、`jsdom` 当前尚未使用；包体拆分留到出现真实性能需求时处理。

### 明日第一步

- 由学习者从零设计第一版 Zod 表单 Schema，运行时 Schema 使用小驼峰命名，TypeScript 类型使用大驼峰命名。

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
