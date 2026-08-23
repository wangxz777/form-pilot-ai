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
