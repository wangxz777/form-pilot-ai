# 候选 Schema 确认与本地 JSON 导入实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 删除独立预览按钮，让用户选择本地 JSON 文件后先查看不可交互的候选表单，确认后才整体替换当前编辑内容。

**架构：** Pinia Store 只保存已经应用的表单状态，并提供原子替换 action；JSON 文本解析与 Zod 校验放在纯函数中；`EditorView` 管理本地文件选择、候选 Schema 和确认弹窗，`SchemaConfirmDialog` 只展示合法候选数据并发出确认或取消事件。

**技术栈：** Vue 3、TypeScript、Pinia、Element Plus、Zod、Vitest

---

## 文件结构

- 创建 `src/utils/form-schema-json.ts`：解析 JSON 文本并用 Zod 验证候选 Schema。
- 创建 `src/utils/form-schema-json.test.ts`：保护合法、JSON 语法错误和 Schema 结构错误三种导入边界。
- 创建 `src/views/EditorView/SchemaConfirmDialog.vue`：展示不可交互的候选表单并发出应用或取消事件。
- 修改 `src/stores/form-editor.ts`：隔离初始 Schema，并新增整体替换 action。
- 修改 `src/stores/form-editor.test.ts`：保护 Schema、表单值与选中状态同时替换的契约。
- 修改 `src/views/EditorView/EditorView.vue`：删除预览按钮，接入本地 JSON 文件选择和确认流程。

本计划只完成本地 JSON 导入与确认闭环。JSON 导出和 AI 生成分别使用独立计划，但 AI 生成必须复用本计划建立的候选 Schema 确认组件。

### 任务 1：实现安全的 Store 整体替换

**文件：**
- 修改：`src/stores/form-editor.test.ts`
- 修改：`src/stores/form-editor.ts`

- [x] **步骤 1：编写 Store 替换契约测试**

在 `src/stores/form-editor.test.ts` 增加一个测试，使用单个 checkbox 字段的新 Schema：

```ts
it('整体替换 Schema 时重建字段值并清空选中状态', () => {
  store.selectField(fieldId)
  store.updateFormValue(fieldId, '旧值')

  store.replaceFormSchema({
    schemaVersion: 1,
    title: '导入的确认表',
    fields: [
      {
        id: 'confirmed',
        type: 'checkbox',
        label: '确认信息',
        required: true,
      },
    ],
  })

  expect(store.formSchema.title).toBe('导入的确认表')
  expect(store.formSchema.fields.map((field) => field.id)).toEqual(['confirmed'])
  expect(store.formValues).toEqual({ confirmed: false })
  expect(store.selectedFieldId).toBeNull()
})
```

- [x] **步骤 2：运行 Store 测试确认失败**

运行：`pnpm test -- src/stores/form-editor.test.ts`

预期：FAIL，提示 `store.replaceFormSchema is not a function`。

- [x] **步骤 3：隔离初始数据并实现 replaceFormSchema**

Store 初始化时克隆静态示例，避免测试或运行时修改 `jobApplicationSchema` 模块对象：

```ts
const formSchema = reactive<FormSchema>(structuredClone(jobApplicationSchema))
```

新增 action：

```ts
function replaceFormSchema(nextSchema: FormSchema) {
  const schema = structuredClone(nextSchema)

  formSchema.schemaVersion = schema.schemaVersion
  formSchema.title = schema.title
  formSchema.fields = schema.fields

  Object.keys(formValues).forEach((fieldId) => {
    delete formValues[fieldId]
  })
  Object.assign(formValues, createFormValues(schema.fields))

  selectedFieldId.value = null
}
```

把 `replaceFormSchema` 加入 Store 返回对象。

- [x] **步骤 4：运行 Store 测试确认通过**

运行：`pnpm test -- src/stores/form-editor.test.ts`

预期：Store 测试通过，旧字段值不存在，新 checkbox 默认值为 `false`。

- [x] **步骤 5：提交 Store 原子替换能力**

```bash
git add src/stores/form-editor.ts src/stores/form-editor.test.ts
git commit -m "feat: replace editor form schema"
```

### 任务 2：实现 JSON 文本解析与 Zod 边界

**文件：**
- 创建：`src/utils/form-schema-json.ts`
- 创建：`src/utils/form-schema-json.test.ts`

- [x] **步骤 1：编写 JSON 导入边界测试**

```ts
import { describe, expect, it } from 'vitest'

import { parseFormSchemaJson } from './form-schema-json'

describe('parseFormSchemaJson', () => {
  it('只接受语法和 Schema 都合法的 JSON', () => {
    const validResult = parseFormSchemaJson(
      JSON.stringify({
        schemaVersion: 1,
        title: '导入表单',
        fields: [],
      })
    )
    const syntaxErrorResult = parseFormSchemaJson('{')
    const schemaErrorResult = parseFormSchemaJson(
      JSON.stringify({ schemaVersion: 2, title: '错误版本', fields: [] })
    )

    expect(validResult).toMatchObject({ success: true })
    expect(syntaxErrorResult).toEqual({ success: false, message: 'JSON 格式错误' })
    expect(schemaErrorResult).toEqual({ success: false, message: '表单结构不符合要求' })
  })
})
```

- [x] **步骤 2：运行纯函数测试确认失败**

运行：`pnpm test -- src/utils/form-schema-json.test.ts`

预期：FAIL，提示无法找到 `form-schema-json` 模块。

- [x] **步骤 3：实现可辨识的解析结果**

```ts
import { formSchema, type FormSchema } from '@/types/form-schema'

export type ParseFormSchemaJsonResult =
  | { success: true; data: FormSchema }
  | { success: false; message: string }

export function parseFormSchemaJson(source: string): ParseFormSchemaJsonResult {
  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(source)
  } catch {
    return { success: false, message: 'JSON 格式错误' }
  }

  const result = formSchema.safeParse(parsedValue)

  if (!result.success) {
    return { success: false, message: '表单结构不符合要求' }
  }

  return { success: true, data: result.data }
}
```

- [x] **步骤 4：运行纯函数测试确认通过**

运行：`pnpm test -- src/utils/form-schema-json.test.ts`

预期：合法 JSON 返回已收窄的 `FormSchema`，两个错误分支返回稳定中文消息。

- [x] **步骤 5：提交 JSON 解析边界**

```bash
git add src/utils/form-schema-json.ts src/utils/form-schema-json.test.ts
git commit -m "feat: validate imported form schema"
```

### 任务 3：实现只读候选 Schema 确认弹窗

**文件：**
- 创建：`src/views/EditorView/SchemaConfirmDialog.vue`

- [x] **步骤 1：建立弹窗数据接口**

```ts
import { computed } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem } from 'element-plus'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { createFormValues } from '@/utils/form-values'
import type { FormSchema } from '@/types/form-schema'

const props = defineProps<{ schema: FormSchema }>()
const visible = defineModel<boolean>({ required: true })
const emit = defineEmits<{
  apply: []
  cancel: []
}>()

const previewValues = computed(() => createFormValues(props.schema.fields))
```

- [x] **步骤 2：渲染候选表单且不注册校验**

弹窗模板使用以下结构：

```vue
<ElDialog
  v-model="visible"
  title="确认导入表单"
  width="min(720px, calc(100vw - 32px))"
  @closed="emit('cancel')"
>
  <section class="schema-confirmation">
    <h2>{{ schema.title }}</h2>
    <ElForm :model="previewValues">
      <ElFormItem v-for="field in schema.fields" :key="field.id">
        <template #label>
          <span class="confirmation-label">
            {{ field.label }}
            <span v-if="field.required" class="required-mark" aria-label="必填">*</span>
          </span>
        </template>
        <div class="confirmation-control" inert>
          <FormFieldRenderer
            :field="field"
            :model-value="previewValues[field.id]"
          />
        </div>
      </ElFormItem>
    </ElForm>
  </section>

  <template #footer>
    <ElButton @click="visible = false">取消</ElButton>
    <ElButton type="primary" @click="emit('apply')">应用</ElButton>
  </template>
</ElDialog>
```

不得为 `ElForm` 设置 `rules`，不得为 `ElFormItem` 设置 `prop` 或 `required`。

- [x] **步骤 3：加入不可交互和布局样式**

```scss
.confirmation-control {
  width: 100%;
  pointer-events: none;
  user-select: none;
}

.schema-confirmation :deep(.el-form) {
  margin-top: 20px;
}

.schema-confirmation :deep(.el-select),
.schema-confirmation :deep(.el-date-editor),
.schema-confirmation :deep(.el-input-number) {
  width: 100%;
}

.required-mark {
  margin-left: 3px;
  color: #f56c6c;
}
```

- [x] **步骤 4：运行生产构建验证组件类型**

运行：`pnpm build`

预期：`FormSchema` prop、`previewValues` 和 `FormFieldRenderer` 的 model 类型检查通过。

- [x] **步骤 5：提交确认弹窗**

```bash
git add src/views/EditorView/SchemaConfirmDialog.vue
git commit -m "feat: add schema confirmation dialog"
```

### 任务 4：接入本地文件导入与确认应用流程

**文件：**
- 修改：`src/views/EditorView/EditorView.vue`

- [x] **步骤 1：调整工具栏并增加隐藏文件输入**

将 `EditorView.vue` 的脚本依赖调整为：

```ts
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import EditorPanel from './EditorPanel.vue'
import PreviewPanel from './PreviewPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import SchemaConfirmDialog from './SchemaConfirmDialog.vue'
import { useFormEditorStore } from '@/stores/form-editor'
import { parseFormSchemaJson } from '@/utils/form-schema-json'
import type { FormSchema } from '@/types/form-schema'
```

删除“预览”按钮，让“导入”按钮调用文件选择：

```vue
<ElButton @click="openImportPicker">导入</ElButton>
<input
  ref="importInputRef"
  class="import-input"
  type="file"
  accept=".json,application/json"
  @change="handleImportFile"
/>
```

- [x] **步骤 2：管理候选 Schema 与文件读取**

```ts
const formEditorStore = useFormEditorStore()
const { replaceFormSchema } = formEditorStore
const importInputRef = ref<HTMLInputElement | null>(null)
const pendingSchema = ref<FormSchema | null>(null)
const confirmDialogVisible = ref(false)

function openImportPicker() {
  importInputRef.value?.click()
}

async function handleImportFile(event: Event) {
  const input = event.currentTarget
  if (!(input instanceof HTMLInputElement)) return

  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const result = parseFormSchemaJson(await file.text())

  if (!result.success) {
    ElMessage.error(result.message)
    return
  }

  pendingSchema.value = result.data
  confirmDialogVisible.value = true
}
```

- [x] **步骤 3：接入确认弹窗的应用与取消事件**

```vue
<SchemaConfirmDialog
  v-if="pendingSchema"
  v-model="confirmDialogVisible"
  :schema="pendingSchema"
  @apply="applyPendingSchema"
  @cancel="cancelPendingSchema"
/>
```

```ts
function applyPendingSchema() {
  if (!pendingSchema.value) return

  replaceFormSchema(pendingSchema.value)
  confirmDialogVisible.value = false
  pendingSchema.value = null
  ElMessage.success('表单已导入')
}

function cancelPendingSchema() {
  confirmDialogVisible.value = false
  pendingSchema.value = null
}
```

- [x] **步骤 4：隐藏原生文件输入并保持响应式布局**

```scss
.import-input {
  display: none;
}
```

- [x] **步骤 5：运行关键验证**

运行：`pnpm test && pnpm build`

预期：所有测试通过，生产构建成功；导入入口只把通过 Zod 的 Schema 交给确认弹窗。

- [x] **步骤 6：提交完整导入确认闭环**

```bash
git add src/views/EditorView/EditorView.vue
git commit -m "feat: confirm imported form schema"
```

## 完成后的人工验收

1. 点击“导入”只允许选择本地 JSON 文件。
2. 取消系统文件选择不会报错或修改当前表单。
3. JSON 语法错误和 Schema 结构错误显示错误消息，不打开确认弹窗。
4. 合法文件打开确认弹窗，控件保持真实外观但不可输入。
5. 点击“取消”后当前标题、字段、值和选中状态保持不变。
6. 点击“应用”后当前表单整体替换，旧值清除，属性面板回到未选中状态。

## 实施结果（2026-08-28）

- Store 整体替换、候选解析、只读确认弹窗和本地文件导入已完成，功能提交为 `9111552 feat: confirm imported form schema`。
- 实现中扩展了 Schema 错误反馈，错误消息会显示具体路径、首条 Zod 原因和剩余问题数量。
- 后续独立切片已完成 JSON 导出和单份本地草稿，提交分别为 `d3c530e` 和 `0781835`。
- 日终验证为 `pnpm test` 24/24 通过、`pnpm build` 成功，最大编辑器 JavaScript 产物约 482 kB。
- 未执行浏览器人工交互验收，不将上述人工验收项记录为已验证。
