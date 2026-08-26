# FormPilot AI Pinia 表单状态设计

## 目标

将编辑器当前的 `formSchema` 与 `formValues` 从 `EditorView` 迁移到同一个 Pinia Store，使表单结构、填写值和更新入口具有唯一且可追踪的状态来源。

本次只调整静态预览阶段的数据所有权，不提前实现字段增删、选择、排序、草稿、校验或持久化。

## 状态边界

创建 `src/stores/form-editor.ts`，导出 `useFormEditorStore`。Store 当前只负责：

- 使用静态求职申请 Schema 初始化 `formSchema`。
- 根据 `formSchema.fields` 初始化 `formValues`。
- 通过 `updateFormValue(fieldId, value)` 更新单个字段值。

`formSchema` 与 `formValues` 必须同时位于 Store 中，避免一个留在页面、另一个位于 Store 的双重数据源。

Store 暂不包含 `selectedFieldId`、自动保存状态或未来字段编辑 action；这些能力在三栏编辑器任务中按实际需求增加。

## 组件职责

### `EditorView`

- 获取 `useFormEditorStore` 实例。
- 从 Store 读取表单标题。
- 负责编辑器页面布局。
- 不再创建本地 `formSchema`、`formValues`，也不再使用 `provide` 共享表单状态。

### `EditorPanel`

- 获取同一个 Store 实例。
- 从 `store.formSchema.fields` 渲染字段数量、空状态和静态字段列表。
- 不再通过 props 或 `inject` 接收 Schema。

### `PreviewPanel`

- 获取同一个 Store 实例。
- 从 `store.formSchema` 渲染标题、标签和控件。
- 读取 `store.formValues[field.id]` 作为控件当前值。
- 收到字段的 `update:modelValue` 后调用 `store.updateFormValue(field.id, value)`。
- 不再接收 `formSchema`、`formValues` props，也不直接修改 prop 的嵌套属性。

`FormFieldRenderer` 及七个字段控件保持现有接口，不感知 Pinia，继续通过 `modelValue` / `update:modelValue` 通信，以保留其独立复用能力。

## 数据流

1. Store 使用静态 Schema 和默认值工具初始化状态。
2. `PreviewPanel` 将某个字段的当前值传给 `FormFieldRenderer`。
3. 字段控件产生新值并逐层发出 `update:modelValue`。
4. `PreviewPanel` 调用 `updateFormValue(fieldId, value)`。
5. Store 更新 `formValues[fieldId]`，依赖该值的视图响应式刷新。

所有表单值写入都通过 Store action 完成。虽然 Pinia 允许直接修改 state，本阶段仍使用 action，让更新入口清晰并为后续校验、草稿状态和调试保留扩展点。

## 类型与错误边界

- `formSchema` 使用现有 `FormSchema` 类型。
- `formValues` 使用 `Record<string, FormValue>`。
- `updateFormValue` 的 `value` 参数使用 `FormValue`，不使用 `any` 或类型断言。
- 当前调用方只遍历合法 Schema 字段，因此 action 不额外处理未知字段 ID；外部 Schema 校验仍由现有 Zod 事实源负责。
- 使用 Store 时直接保留 Store 实例，或在确需解构响应式状态时使用 `storeToRefs`，不得直接解构 state 后丢失响应性。

## 当前改动的兼容处理

- 保留 `EditorPanel` 已完成的字段数量、空状态和静态字段列表结构，只替换其状态来源。
- 保留 `PreviewPanel` 已完成的 `ElForm`、`ElFormItem`、字段标签和必填标识。
- 表单标题继续来自 `formSchema.title`。
- `section` 的 `aria-labelledby` 必须引用标题元素 ID `form-title`，不能使用标题文字作为 ID 引用。
- 移除 `EditorView` 中试验性的 `provide('formSchema', formSchema)`，不同时保留 Provide/Inject 与 Pinia 两条状态路径。

## 验证

- `pnpm test`：现有 Schema 契约测试继续通过。
- `pnpm build`：Pinia 状态和组件模板通过 TypeScript 检查与生产构建。
- `git diff --check`：无空白错误。
- 浏览器交互检查：七类控件均能输入或选择，修改后控件展示的新值保持同步；字段标题、数量、空状态和必填标识保持正确。

当前 action 只是类型明确的单字段赋值，不为该基础行为单独增加单元测试。字段增删、属性更新和草稿恢复进入范围后，再为 Store 的关键业务契约补充测试。

## 非目标

- 不实现表单提交与校验规则。
- 不实现字段添加、删除、排序或属性编辑。
- 不实现草稿保存、恢复或重置。
- 不新增依赖；Pinia 已在应用入口注册。

## 实施结果（2026-08-27）

- 本设计的核心边界已经落实：`formSchema` 与 `formValues` 位于同一个 `useFormEditorStore`，字段值通过 `updateFormValue` action 更新。
- `EditorView`、`EditorPanel` 与 `PreviewPanel` 已迁移到 Store；需要解构 state 的组件使用 `storeToRefs`，七个字段控件继续保持 Pinia 无关。
- 对应功能提交为 `81724b4 feat: manage form state with Pinia`，最新自动验证为 `pnpm test` 10/10 通过、`pnpm build` 成功。
- 设计完成后的后续阶段已增加 `selectedFieldId`／`selectedField`、Schema 驱动的 `formRules` 和属性只读展示；这些能力不属于本设计原始范围，相关现状与下一步以 `docs/PROJECT_CONTEXT.md` 和 `docs/DAILY_LOG.md` 为准。
