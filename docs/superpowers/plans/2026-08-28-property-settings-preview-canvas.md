# 属性配置与预览画布实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [x]`）语法来跟踪进度。

**目标：** 将 PropertyPanel 的配置生成逻辑抽到类型安全的组合式函数，并把 PreviewPanel 改为只支持字段展示、选中和拖拽的设计画布。

**架构：** `usePropertySettings.ts` 根据当前字段类型生成带实际值和更新回调的可辨识联合配置，`PropertyPanel.vue` 只保留统一循环渲染。`PreviewPanel.vue` 使用不可交互容器保留真实控件外观，字段外层连接 Store 的选中和移动 action。

**技术栈：** Vue 3 Composition API、TypeScript、Pinia、Element Plus、Zod、vue-draggable-plus、Vitest、Vue Test Utils

---

## 文件结构

- 创建：`src/views/EditorView/usePropertySettings.ts`——定义设置描述类型，生成公共与字段专属设置，并提取 Zod 约束错误。
- 创建：`src/views/EditorView/use-property-settings.test.ts`——保护设置生成、错误映射和 action 回调契约。
- 修改：`src/views/EditorView/PropertyPanel.vue`——移除字段类型拼装逻辑，统一循环渲染组合式函数返回的设置。
- 修改：`src/views/EditorView/PreviewPanel.vue`——增加字段画布包装、选中高亮、非交互控件层和拖拽排序。
- 创建：`src/views/EditorView/PreviewPanel.test.ts`——保护字段外层选中、高亮及控件非交互标记。
- 保留：`src/types/form-schema.ts`、`src/types/form-schema.test.ts`——保留当前未提交的中文约束 issue 与元数据回归测试。

### 任务 1：提取类型安全的属性配置

**文件：**

- 创建：`src/views/EditorView/usePropertySettings.ts`
- 创建：`src/views/EditorView/use-property-settings.test.ts`
- 修改：`src/views/EditorView/PropertyPanel.vue`
- 保留：`src/types/form-schema.ts`
- 保留：`src/types/form-schema.test.ts`

- [x] **步骤 1：编写属性配置失败测试**

创建 `use-property-settings.test.ts`，使用 `ref<FormField | null>` 和带 `vi.fn()` 的 `PropertySettingActions`。测试非法 text 字段生成公共设置及两个数字设置，并验证：

```ts
expect(settings.value.map((setting) => setting.id)).toEqual([
  'label',
  'id',
  'type',
  'required',
  'minLength',
  'maxLength',
])

const maxLengthSetting = settings.value.find(
  (setting) => setting.id === 'maxLength' && setting.control === 'number'
)

expect(maxLengthSetting?.error).toBe('最小长度不能大于最大长度')
```

从 `label` 配置调用 `onUpdate('候选人姓名')`，断言 `updateFieldProperties` 收到字段 ID 和 `{ label: '候选人姓名' }`。再把 ref 改成 number 字段，断言生成 `min`、`max` 且最大值配置显示“最小值不能大于最大值”。

- [x] **步骤 2：运行新测试确认失败**

运行：

```bash
pnpm test -- src/views/EditorView/use-property-settings.test.ts
```

预期：FAIL，原因是 `usePropertySettings.ts` 和相关导出尚不存在。

- [x] **步骤 3：定义设置描述类型和 action 接口**

在 `usePropertySettings.ts` 中定义并导出：

```ts
export type TextSetting = {
  id: string
  label: string
  control: 'text'
  modelValue: string
  readonly?: boolean
  onUpdate?: (value: string) => void
}

export type BooleanSetting = {
  id: string
  label: string
  control: 'boolean'
  modelValue: boolean
  onUpdate: (value: boolean) => void
}

export type NumberSetting = {
  id: string
  label: string
  control: 'number'
  modelValue: number | undefined
  min?: number
  error?: string
  onUpdate: (value: number | undefined) => void
}

export type PropertySetting = TextSetting | BooleanSetting | NumberSetting

export type PropertySettingActions = {
  updateFieldProperties: (
    fieldId: string,
    properties: Partial<Pick<FormField, 'label' | 'required'>>
  ) => void
  updateTextFieldConstraints: (
    fieldId: string,
    constraints: { minLength?: number; maxLength?: number }
  ) => void
  updateNumberFieldConstraints: (
    fieldId: string,
    constraints: { min?: number; max?: number }
  ) => void
}
```

- [x] **步骤 4：实现设置工厂和组合式函数**

实现以下内部函数：

```ts
function createBaseSettings(
  field: FormField,
  actions: PropertySettingActions
): PropertySetting[]

function createTextSettings(
  field: TextField | TextareaField,
  actions: PropertySettingActions
): NumberSetting[]

function createNumberSettings(
  field: NumberField,
  actions: PropertySettingActions
): NumberSetting[]

function getConstraintError(
  field: FormField,
  path: 'maxLength' | 'max'
): string | undefined
```

`getConstraintError` 使用 `formFieldSchema.safeParse(field)`，只返回路径第一段等于指定 path 的 issue 文案。`createTextSettings` 将错误放在 `maxLength` 设置，`createNumberSettings` 将错误放在 `max` 设置。

导出组合式函数：

```ts
export function usePropertySettings(
  selectedField: Ref<FormField | null>,
  actions: PropertySettingActions
) {
  const settings = computed<PropertySetting[]>(() => {
    const field = selectedField.value
    if (!field) return []

    const baseSettings = createBaseSettings(field, actions)

    if (field.type === 'text' || field.type === 'textarea') {
      return [...baseSettings, ...createTextSettings(field, actions)]
    }

    if (field.type === 'number') {
      return [...baseSettings, ...createNumberSettings(field, actions)]
    }

    return baseSettings
  })

  return { settings }
}
```

- [x] **步骤 5：运行属性配置测试确认通过**

运行：

```bash
pnpm test -- src/views/EditorView/use-property-settings.test.ts
```

预期：新测试全部通过。

- [x] **步骤 6：将 PropertyPanel 改为统一 settings 渲染**

在 `PropertyPanel.vue` 中：

- 删除本地 `constraintError`、`computed` 和 `formFieldSchema` import。
- 调用 `usePropertySettings(selectedField, actions)` 获取 `settings`。
- 用一个 `v-for` 渲染配置。
- `control === 'text'` 使用 `ElInput`。
- `control === 'boolean'` 使用 `ElSwitch`。
- `control === 'number'` 使用 `ElInputNumber` 并显示该设置的 `error`。
- 删除原来的 `handleRequiredChange`，改为接收 `BooleanSetting` 的边界函数：

```ts
function handleBooleanSettingChange(
  setting: BooleanSetting,
  value: string | number | boolean
) {
  if (typeof value !== 'boolean') return
  setting.onUpdate(value)
}
```

配置循环使用 `setting.id` 作为 key，required 行通过 `setting.control === 'boolean'` 添加现有布局类，ID 代码样式通过 `setting.id === 'id'` 添加。

- [x] **步骤 7：运行任务 1 验证**

运行：

```bash
pnpm test
pnpm build
```

预期：所有测试通过；生产构建成功；字段名称、必填、范围配置类型检查通过，最大 JavaScript chunk 低于 500 kB。

### 任务 2：将 PreviewPanel 改为设计画布

**文件：**

- 修改：`src/views/EditorView/PreviewPanel.vue`
- 创建：`src/views/EditorView/PreviewPanel.test.ts`
- 依赖现有：`src/stores/form-editor.ts`

- [x] **步骤 1：编写预览画布失败测试**

创建 Pinia 并挂载 `PreviewPanel`。测试第一个 `.preview-field`：

```ts
expect(wrapper.findAll('.preview-field')).toHaveLength(store.formSchema.fields.length)
expect(wrapper.find('.preview-field-control').attributes()).toHaveProperty('inert')

await wrapper.findAll('.preview-field')[0]?.trigger('click')

expect(store.selectedFieldId).toBe(store.formSchema.fields[0]?.id)
expect(wrapper.findAll('.preview-field')[0]?.classes()).toContain('is-selected')
```

测试使用 `global.stubs` 简化 `FormFieldRenderer`，但保留 PreviewPanel 自己的字段外层结构。拖拽索引行为由已有 `form-editor.test.ts` 的 `moveField` 用例保护，不在 jsdom 中模拟 Sortable 拖拽。

- [x] **步骤 2：运行预览画布测试确认失败**

运行：

```bash
pnpm test -- src/views/EditorView/PreviewPanel.test.ts
```

预期：FAIL，因为 `.preview-field` 和 `.preview-field-control` 尚不存在。

- [x] **步骤 3：实现字段画布结构和选择行为**

在 `PreviewPanel.vue` 中：

- 从 Store refs 增加 `selectedFieldId`。
- 从 Store actions 移除 `updateFormValue`，增加 `moveField`。
- 在 `ElForm` 内增加 `previewFieldListRef` 容器。
- 每个字段使用 `.preview-field` 包裹现有 `ElFormItem`。
- 增加 `is-selected` class、`role="button"`、`tabindex="0"`、`aria-pressed`。
- 点击、Enter 和 Space 调用 `selectField(field.id)`。
- 使用带 `inert` 的 `.preview-field-control` 包裹 `FormFieldRenderer`。
- 删除 `FormFieldRenderer` 的 `@update:model-value` 监听，但继续传入当前 `modelValue` 以维持真实控件外观。

- [x] **步骤 4：接入 PreviewPanel 拖拽**

增加：

```ts
const previewFieldListRef = ref<HTMLElement | null>(null)

useDraggable(previewFieldListRef, undefined, {
  animation: 150,
  onUpdate(event) {
    if (event.oldIndex === undefined || event.newIndex === undefined) return
    moveField(event.oldIndex, event.newIndex)
  },
})
```

不把 Store 数组直接传给 `useDraggable`，确保排序写入仍只经过 Store action。

- [x] **步骤 5：增加画布交互样式**

增加以下样式职责：

- `.preview-field-list` 使用网格间距。
- `.preview-field` 提供透明边框、圆角、内边距、grab 光标和过渡。
- hover／focus-visible 使用浅主色背景和边框。
- `.preview-field.is-selected` 使用 Element Plus 主色边框和浅蓝背景。
- `.preview-field-control` 使用 `pointer-events: none`、`user-select: none` 和 `width: 100%`。
- `.preview-field .el-form-item` 将下边距归零，间距由列表统一控制。
- Sortable ghost 使用较低透明度，拖拽中保持位置反馈。

- [x] **步骤 6：运行预览画布测试确认通过**

运行：

```bash
pnpm test -- src/views/EditorView/PreviewPanel.test.ts
```

预期：字段数量、inert 标记、点击选中和高亮断言全部通过。

- [x] **步骤 7：运行最终自动验证**

运行：

```bash
pnpm test
pnpm build
```

预期：全部测试通过；类型检查与生产构建成功；不出现超过 500 kB 的 JavaScript chunk 警告。

- [x] **步骤 8：审查实现范围**

确认：

- 没有新增依赖或 PropertyPanel Vue 子组件。
- 没有恢复 `selectedField[setting.value]`。
- PreviewPanel 不再调用 `updateFormValue`。
- PreviewPanel 控件没有设置 `disabled`。
- Store、Schema 和现有左侧拖拽行为没有被范围外重构。
- 当前未提交的 Schema 中文 issue 与回归测试被保留。

实现代码在学习者审查通过前不自动提交。

## 实施结果（2026-08-28）

- 已新增 `usePropertySettings.ts`，PropertyPanel 保持单个 Vue 组件和统一 settings 循环。
- settings 使用 `control` 可辨识联合，直接携带已解析值和 Store action 回调，没有恢复动态字段索引。
- 已将 PreviewPanel 调整为非填写设计画布，真实控件通过 `inert` 和交互隔离样式保持正常外观但不可操作。
- PreviewPanel 字段外层已接入点击／键盘选中、高亮和 `moveField` 拖拽排序。
- 新增组合式函数与 PreviewPanel 两个高价值测试文件；最终 `pnpm test` 19/19 通过，`pnpm build` 成功，最大 JavaScript chunk 约 466 kB。
- 实现代码保持未提交，等待学习者审查。
