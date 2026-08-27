# FormPilot AI 项目交接摘要

## 学习目标

学习者正在通过一个可上线的中小型项目恢复现代前端开发能力，并学习如何正确使用 Codex 辅助开发。重点不是快速生成代码，而是恢复需求拆解、编码、排错、测试、上线和技术表达的完整能力。

## 学习者背景

- 过去有 4 年前端开发经验。
- 约 2 年主要开发 Vue 2 项目。
- 约 1 年 React 项目经验。
- 使用 Vue 3 做过几个小型项目，近期复习过 Vue 3 基础，但缺少完整实战。
- 过去以 JavaScript 为主。
- TypeScript 只会基础使用。
- 没有学习过 Nuxt。
- Webpack、Vite 都只有简单使用经验。
- 有两年职业间歇，目前目标是重新面试前端开发岗位。

## 目标项目

项目名称：**FormPilot AI——自然语言动态表单生成器**。

最终核心流程：

1. 用户用自然语言描述表单需求。
2. 服务端调用 AI 返回受约束的结构化表单 Schema。
3. 前端校验 Schema，并动态渲染表单。
4. 用户修改、排序、添加或删除字段。
5. 用户填写表单并验证结果。
6. 用户保存单份草稿，并导入或导出 Schema。

## 第一版技术选择

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Element Plus
- Zod
- AI 阶段使用一个很薄的服务端接口保护 API Key
- 部署平台暂定腾讯云 CloudBase
- 第一版使用本地存储，不使用数据库
- 已配置 Vitest、Vue Test Utils 和 jsdom；组件测试按核心行为逐步补充

第一版不使用 Nuxt，因为当前优先目标是完成 Vue 3、TypeScript、动态表单和 AI 结构化输出的实战闭环。

## 范围控制

第一版支持以下字段：

- text
- number
- textarea
- select
- radio
- checkbox
- date

暂不开发：

- 用户登录
- 数据库
- 多用户协作
- 支付功能
- 完整低代码画布
- 复杂字段联动
- 历史记录和模板库
- AI 定点修改
- 自动生成完整业务项目

## 六周路线

> 2026-08-23 重新开始后采用以下路线，由学习者主导核心实现，Codex 负责指引、审查和验证。

### 第 1 周

完成应用骨架、Zod Schema 事实源和七类字段渲染器，重点练习 TypeScript、可辨识联合与类型化 `v-model`。

### 第 2 周

完成字段添加、选择、删除、排序、标题及字段属性编辑。

### 第 3 周

完成表单填写与校验、单份草稿、JSON 导入导出和响应式布局。

### 第 4 周

通过 CloudBase 云函数接入真实百炼，处理结构化输出、运行时校验、错误、取消和重试。

### 第 5 周

完成集成修复、视觉打磨、移动端适配、高价值测试和部署。

### 第 6 周

完成功能冻结、README、演示视频、架构说明、项目复盘和面试准备。

## 第一周完成标准

- 使用可辨识联合类型描述表单字段。
- 根据 Schema 动态渲染七种字段。
- 使用 `v-model` 收集表单值。
- 支持 required、minLength、maxLength、min、max 校验。
- 至少有 5 个单元测试。
- 不使用 `any` 逃避类型问题。
- 类型检查、测试和生产构建通过。
- 学习者能解释核心类型和组件数据流。

## 当前实际进度

截至 2026-08-27，整体进度约 **40%**：

- 第一周基础已完成：Vue Router、Pinia、Element Plus、Zod、Vitest 和编辑器页面骨架均已接入。
- `src/types/form-schema.ts` 已定义 text、number、textarea、select、radio、checkbox、date 七类字段、`schemaVersion: 1`、选项约束、长度／范围关系及字段 ID 唯一性，并通过 `z.infer` 导出类型。
- 已完成统一 `FormFieldRenderer` 与七个字段组件；字段值通过类型化 `v-model` 写入 Pinia 的 `formValues`。
- `formSchema`、`formValues`、`selectedFieldId` 和派生的 `selectedField` 已集中到 `useFormEditorStore`，组件使用 `storeToRefs` 保持响应性，写入通过 action 完成。
- 已完成 Schema 驱动的 Element Plus 规则适配：支持 required、minLength、maxLength、min、max；复选框必填只接受已勾选状态。
- 编辑器三栏已按 `docs/ui` 参考图调整；字段支持选择、七类型弹窗新增、直接删除和拖拽排序，相关值与选中状态由 Store 同步维护。
- 属性面板支持名称、必填、文本长度和数字范围编辑；公共属性与类型专属属性使用显式模板，通过 `field.type` 保持 TypeScript 类型收窄。
- Element Plus 已移除全量组件注册，首页和编辑器使用路由懒加载；最大 JavaScript 产物约 396 kB，超过 500 kB 的构建警告已消失。
- 当前分支为 `codex/formpilot-v1`；本阶段代码和文档将在今日收尾提交。
- 最新验证为 `pnpm test` 16/16、`pnpm build` 成功。
- 尚未实现约束关系的属性面板提示、select／radio 选项编辑、表单标题编辑、草稿、JSON 导入导出、AI 接口、部署和最终作品集文档。

## 当前开发边界

- 后续由学习者主导核心类型、组件数据流和状态逻辑；Codex 默认只提供指引、审查、诊断和验证。
- 每日收尾必须记录当前总体进度，并同步维护与当天工作相关的 `docs/superpowers/plans` 和 `docs/superpowers/specs`；没有相关变化时不做无意义改写。
- CodeGraph 不再作为每日收尾步骤，仅在学习者明确要求时执行同步与状态检查。
- 日志、交接文档和每日总结不记录 `git diff` 或 `git diff --check` 结果；历史记录保持不变。
- Zod 继续作为运行时 Schema 工具。运行时 Schema 使用小驼峰命名，例如 `formSchema`；TypeScript 类型使用大驼峰命名，例如 `FormSchema`。
- 不恢复前两天的业务实现；新核心模块从空白状态逐步编写。
- 测试遵循精简原则：基础行为不重复补用例，只为关键业务契约和高风险流程增加少量测试。
- 空的 `<style scoped lang="scss"></style>` 是允许的，不作为审查问题重复提示。
- Element Plus 组件采用局部导入；保留当前全局样式入口，后续仅在有明确样式体积目标时继续拆分 CSS。

## 恢复开发时的起点

1. 为文本长度和数字范围编辑增加关系校验与可见错误提示，避免最小值大于最大值。
2. 为 select／radio 字段实现选项新增、编辑和删除，同时保证至少保留一个合法选项。
3. 完成表单标题编辑，使顶部标题与预览标题保持同步。
4. 第 2 周字段编辑闭环稳定后，进入单份草稿和 JSON 导入导出。
5. 在关键行为稳定后由 Codex 补充少量回归测试，并运行 `pnpm test` 与 `pnpm build`。
