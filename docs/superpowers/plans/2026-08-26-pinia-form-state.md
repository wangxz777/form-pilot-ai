# Pinia 表单状态迁移实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将静态编辑器的 `formSchema` 与 `formValues` 迁移到同一个 Pinia Store，并让三个编辑器组件从该唯一事实源读取和更新状态。

**架构：** `useFormEditorStore` 持有 Schema、表单值和单字段更新 action。`EditorView`、`EditorPanel`、`PreviewPanel` 直接使用 Store；通用 `FormFieldRenderer` 和七个控件保持 Pinia 无关，通过现有 `modelValue` 契约通信。

**技术栈：** Vue 3 Composition API、TypeScript、Pinia、Element Plus、Vitest、Vite

---

## 文件结构

- 创建：`src/stores/form-editor.ts`——编辑器 Schema、表单值和字段值更新 action 的唯一状态源。
- 修改：`src/views/EditorView/EditorView.vue`——移除本地状态与 Provide，改用 Store 提供标题和页面级状态。
- 修改：`src/views/EditorView/EditorPanel.vue`——保留现有列表结构，改为从 Store 读取字段。
- 修改：`src/views/EditorView/PreviewPanel.vue`——从 Store 读取 Schema/值，并通过 action 接收字段更新。

当前工作区已有学习者未提交的 `EditorPanel`、标题和表单标签改动。实施时必须在这些改动上继续，不得还原文件；`AGENTS.md` 的流程规则不包含在本功能提交中。

### 任务 1：迁移静态表单状态到 Pinia

**文件：**

- 创建：`src/stores/form-editor.ts`
- 修改：`src/views/EditorView/EditorView.vue`
- 修改：`src/views/EditorView/EditorPanel.vue`
- 修改：`src/views/EditorView/PreviewPanel.vue`

- [x] **步骤 1：验证迁移前基线**

运行：

```bash
pnpm test
pnpm build
```

预期：5 个现有测试全部通过；生产构建成功，只允许保留已经记录的 500 kB chunk 非阻断警告。如果基线失败，先停止并审查当前未提交改动，不带着失败开始迁移。

- [x] **步骤 2：创建最小 Pinia Store**

在 `src/stores/form-editor.ts` 使用 Setup Store，保持以下公开接口：

```ts
export const useFormEditorStore = defineStore('formEditor', () => {
  const formSchema = reactive<FormSchema>(jobApplicationSchema)
  const formValues = reactive<Record<string, FormValue>>(
    createFormValues(formSchema.fields)
  )

  function updateFormValue(fieldId: string, value: FormValue) {
    formValues[fieldId] = value
  }

  return { formSchema, formValues, updateFormValue }
})
```

需要从现有模块导入 `defineStore`、`reactive`、`jobApplicationSchema`、`createFormValues`、`FormSchema` 和 `FormValue`。不要增加 `selectedFieldId`、字段编辑、草稿或校验逻辑。

- [x] **步骤 3：让 `EditorView` 使用 Store**

删除 `reactive`、`provide`、静态 Schema、默认值工具和 `FormSchema` 的本地导入及初始化，改为：

```ts
const formEditorStore = useFormEditorStore()
```

模板中完成三项调整：

```vue
<h1 class="toolbar-form-name">{{ formEditorStore.formSchema.title }}</h1>
<EditorPanel />
<PreviewPanel />
```

不再向两个子面板传递 `formSchema` 或 `formValues` props，也不保留 `provide('formSchema', ...)`。

- [x] **步骤 4：让 `EditorPanel` 使用 Store**

删除 `defineProps` 与 `FormSchema` 类型导入，创建同一个 Store 实例：

```ts
const formEditorStore = useFormEditorStore()
```

将模板中所有 `formSchema.fields` 替换为 `formEditorStore.formSchema.fields`。保留学习者已经完成的字段数量、空状态、`field.id` key 和静态字段列表结构，不扩展添加、选择或删除行为。

- [x] **步骤 5：让 `PreviewPanel` 通过 Store action 更新字段值**

删除 `defineProps`、`FormSchema` 与 `FormValue` 的 props 类型导入，创建 Store 实例。标题和循环均从 `formEditorStore.formSchema` 读取。

把直接修改 prop 的 `v-model` 改为显式读取和 action 更新：

```vue
<FormFieldRenderer
  :field="field"
  :model-value="formEditorStore.formValues[field.id]"
  @update:model-value="formEditorStore.updateFormValue(field.id, $event)"
/>
```

同时修复标题引用关系：

```vue
<section class="form-canvas" aria-labelledby="form-title">
  <h3 id="form-title">{{ formEditorStore.formSchema.title }}</h3>
</section>
```

`aria-labelledby` 的值必须是标题元素的 ID `form-title`，不能绑定为标题文字。

- [x] **步骤 6：运行自动验证**

依次运行：

```bash
pnpm test
pnpm build
git diff --check
```

预期：5/5 测试通过；类型检查和生产构建成功；无空白错误。构建仍可保留已知的 chunk 体积警告。

- [ ] **步骤 7：完成浏览器交互验证**

状态：按学习者协作规则暂缓，仅在学习者明确要求时执行，不影响本计划的代码完成状态。

打开 `/editor` 并逐项确认：

1. 顶部标题和预览标题均为“求职申请表”。
2. 左栏数量为 `7`，不显示“暂未添加字段”。
3. 姓名可输入文字，年龄可输入数字，个人介绍可输入多行文字。
4. 应聘部门可选择“工程研发”，办公方式可选择“混合办公”。
5. 可入职日期可选择日期，真实性确认复选框可切换。
6. 所有修改后的控件保持所选值，控制台无运行时错误。
7. 标签、必填标识和现有字段列表继续显示。

- [x] **步骤 8：审查并提交本功能文件**

审查实际差异，确认没有 `any`、类型断言、Provide/Inject 残留或范围外功能。只暂存本功能文件：

```bash
git add src/stores/form-editor.ts \
  src/views/EditorView/EditorView.vue \
  src/views/EditorView/EditorPanel.vue \
  src/views/EditorView/PreviewPanel.vue
git commit -m "feat: manage form state with Pinia"
```

不要把当前未提交的 `AGENTS.md` 流程规则混入该功能提交。提交后再次运行 `git status --short`，确认剩余改动符合预期。

## 实施结果（2026-08-27）

- Pinia 表单状态迁移已完成，功能提交为 `81724b4 feat: manage form state with Pinia`。
- 实施中使用 `storeToRefs` 解构响应式 state，action 继续从 Store 实例获取，避免普通解构丢失响应性。
- 后续阶段已在同一 Store 增加字段选择状态，并完成 Schema 驱动校验；这些属于本计划完成后的扩展，不修改本计划原始目标。
- 最新自动验证为 `pnpm test` 10/10 通过、`pnpm build` 成功。
