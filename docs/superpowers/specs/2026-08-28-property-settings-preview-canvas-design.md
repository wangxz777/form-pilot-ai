# 属性配置与预览画布设计

## 目标

在不拆分 Vue 属性子组件的前提下，提高 `PropertyPanel.vue` 面对大量字段设置时的可维护性；同时将 `PreviewPanel.vue` 从可填写表单调整为只支持字段展示、选中和拖拽排序的设计画布。

本批次包含两项改动：

- 使用 `usePropertySettings.ts` 生成类型安全的属性配置，`PropertyPanel.vue` 保留统一 `settings` 循环渲染。
- 保留真实 Element Plus 控件外观，但阻止预览区中的控件交互；字段外层负责选中、高亮和拖拽排序。

## PropertyPanel 架构

### 组件职责

`PropertyPanel.vue` 继续作为唯一的属性面板 Vue 组件，不新增字段类型属性子组件。它只负责：

- 从 Store 获取 `selectedField`。
- 调用 `usePropertySettings` 获取响应式 `settings`。
- 根据每项配置的 `control` 渲染 `ElInput`、`ElSwitch` 或 `ElInputNumber`。
- 显示配置错误和删除字段按钮。

新增 `src/views/EditorView/usePropertySettings.ts`，负责：

- 生成所有字段共有的名称、ID、类型和必填配置。
- 根据 `field.type` 生成文本长度或数字范围配置。
- 将已收窄字段的实际值写入配置项，不通过字符串动态访问联合类型字段。
- 将配置项更新回调连接到对应 Store action。
- 使用 `formFieldSchema.safeParse` 提取文本长度和数字范围错误。

Pinia Store 继续负责实际修改 Schema；Zod Schema 继续作为运行时合法性事实源。

### Setting 类型

使用 `control` 作为可辨识字段：

```ts
type TextSetting = {
  id: string
  label: string
  control: 'text'
  modelValue: string
  readonly?: boolean
  onUpdate?: (value: string) => void
}

type BooleanSetting = {
  id: string
  label: string
  control: 'boolean'
  modelValue: boolean
  onUpdate: (value: boolean) => void
}

type NumberSetting = {
  id: string
  label: string
  control: 'number'
  modelValue: number | undefined
  min?: number
  error?: string
  onUpdate: (value: number | undefined) => void
}

export type PropertySetting = TextSetting | BooleanSetting | NumberSetting
```

本批次只为当前已存在的三种控件建立描述类型，不预先增加尚未使用的 options、date 或 textarea 设置控件。

### 配置生成

`usePropertySettings` 接收选中字段 ref 和必要的 Store actions，而不是依赖整个 Store 实例。内部通过一个计算属性生成配置：

1. 没有选中字段时返回空数组。
2. 始终创建公共配置。
3. text／textarea 字段追加 `minLength`、`maxLength`。
4. number 字段追加 `min`、`max`。
5. 其他字段只返回公共配置。

每项配置直接保存已经解析的 `modelValue` 和 `onUpdate`。禁止恢复以下动态访问方式：

```ts
selectedField[setting.value]
```

关系错误只挂在对应的最大值配置上：文本使用 `maxLength` issue，数字使用 `max` issue。用户把范围改回合法状态后，计算属性重新生成配置并清除错误。

### 更新事件

文本和数字控件直接调用配置项的类型化 `onUpdate`。由于 Element Plus `ElSwitch` 的更新事件类型可能包含 string、number 和 boolean，`PropertyPanel.vue` 使用一个小型边界函数确认值为 boolean 后再调用 `BooleanSetting.onUpdate`，不在配置类型中扩大为不必要的联合类型。

## PreviewPanel 设计画布

### 职责变化

`PreviewPanel.vue` 不再承担表单填写职责。它只负责：

- 展示真实字段控件外观。
- 点击字段外层后更新 `selectedField`。
- 高亮当前 `selectedFieldId` 对应字段。
- 拖拽字段并通过 `moveField(oldIndex, newIndex)` 更新顺序。

它不再调用 `updateFormValue`，用户操作预览画布不会修改 `formValues`。

### DOM 结构

`ElForm` 内增加一个拖拽列表容器，每个字段的 `ElFormItem` 外层包裹独立的 `.preview-field`：

```vue
<div ref="previewFieldListRef" class="preview-field-list">
  <div
    v-for="field in formSchema.fields"
    :key="field.id"
    class="preview-field"
    :class="{ 'is-selected': selectedFieldId === field.id }"
    role="button"
    tabindex="0"
    :aria-pressed="selectedFieldId === field.id"
    @click="selectField(field.id)"
    @keydown.enter="selectField(field.id)"
    @keydown.space.prevent="selectField(field.id)"
  >
    <ElFormItem :prop="field.id">
      <template #label>{{ field.label }}</template>

      <div class="preview-field-control" inert>
        <FormFieldRenderer
          :field="field"
          :model-value="formValues[field.id]"
        />
      </div>
    </ElFormItem>
  </div>
</div>
```

键盘 Enter 和 Space 同样可以选中字段。

### 阻止控件交互

真实 Element Plus 控件不设置 `disabled`，避免出现灰色禁用外观。控件外层同时使用：

- HTML `inert`：阻止内部控件获得焦点或接收键盘操作。
- `pointer-events: none`：让鼠标事件落到字段外层，触发选中或拖拽。
- `user-select: none`：避免拖拽时选择控件文字。

预览区控件因此保持正常视觉状态，但不能输入、选择日期、切换复选框或修改选项。

### 选中与拖拽

`.preview-field.is-selected` 使用清晰但不过度突出的主色边框和浅色背景。hover 与键盘 focus-visible 使用同一交互体系。

`useDraggable` 绑定到 `previewFieldListRef`，不直接接管 Store 数组；在 `onUpdate` 中读取 `oldIndex` 和 `newIndex`，确认二者存在后调用现有 `moveField`。这样与左侧字段列表保持同一种 action-only 状态写入方式。

整个 `.preview-field` 是拖拽区域。Sortable 会区分点击与拖拽，普通点击仍用于选择字段。

## 数据流

### 属性配置

1. Store 的 `selectedField` 变化。
2. `usePropertySettings` 按字段类型重新生成配置。
3. `PropertyPanel` 循环渲染设置。
4. 用户修改设置时调用配置项 `onUpdate`。
5. 对应 Store action 修改 `formSchema.fields`。
6. 左侧字段列表、预览画布、属性配置和校验规则响应式更新。

### 预览排序

1. 用户点击预览字段，调用 `selectField(field.id)`。
2. `selectedFieldId` 更新，预览字段和属性面板同步变化。
3. 用户拖拽字段，Sortable 提供旧索引和新索引。
4. `moveField` 重排 `formSchema.fields`。
5. 左侧字段列表和预览画布同步显示新顺序，字段值和选中状态保持不变。

## 错误与边界

- 没有选中字段时，属性面板继续显示空状态。
- 非文本和非数字字段不会生成范围设置或关系错误。
- Zod 校验可能允许编辑过程暂时产生无效 Schema；属性面板立即显示错误，后续导出功能必须拒绝输出未通过 Schema 校验的数据。
- 拖拽事件缺少索引、索引相同或越界时，现有 `moveField` 保持无操作。
- PreviewPanel 不删除 `formValues` 状态，因为它仍会被未来真实填写／预览模式使用；本批次只停止从设计画布写入该状态。

## 验证

- PropertyPanel 仍通过一个 `settings` 循环渲染全部现有设置。
- `PropertyPanel.vue` 不再包含按字段类型拼装配置和 Zod 错误提取逻辑。
- 字段名称、必填、文本长度和数字范围更新行为保持不变。
- 文本和数字反向范围继续显示对应中文错误，恢复合法范围后错误消失。
- PreviewPanel 中真实控件保持正常外观，但鼠标和键盘均不能修改值。
- 点击或键盘操作字段外层可以选中字段，当前字段显示高亮。
- 在 PreviewPanel 拖拽后，左侧字段列表和预览顺序同步更新，字段值与选中状态不丢失。
- `pnpm test` 全部通过。
- `pnpm build` 成功且不恢复超过 500 kB 的 JavaScript chunk 警告。

## 非目标

- 本批次不实现 select／radio 选项编辑。
- 本批次不实现真实的填写模式或设计／填写模式切换。
- 本批次不修改字段 Schema 结构。
- 本批次不拆分 PropertyPanel 的 Vue 子组件。
- 本批次不新增依赖。

## 实施结果与后续扩展（2026-08-28）

- 类型安全 settings 和不可填写设计画布按本设计落地，初始提交为 `7ee5766 feat: add editor preview canvas`。
- 当日后续需求扩展了本设计的非目标：select／radio 选项编辑已加入同一 settings 配置体系，仍未拆分新的 Vue 子组件，提交为 `7d35f97`。
- PreviewPanel 随后进一步移除设计态校验并改为全宽；属性面板隐藏字段 ID／类型设置并加入共享字段摘要，提交为 `5b7608c`。
- 真实填写／提交模式仍未实现，现有 `formValues` 和 `form-rules.ts` 继续保留给后续独立入口。
