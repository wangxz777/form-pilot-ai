# 预览画布与字段属性面板优化实现计划

> **面向 AI 代理的工作者：** 在当前会话内按顺序执行；步骤使用复选框（`- [ ]`）跟踪进度。项目约定只在关键节点补充测试，不扩充重复 UI 测试。

**目标：** 让预览画布占满中间面板并彻底移除设计态校验，同时用统一的 Element Plus SVG 图标和字段类型摘要精简属性面板。

**架构：** 新建纯数据模块集中维护七种字段的中文名称、说明和 SVG 名称，添加字段弹窗、字段列表和属性面板共同读取。预览画布移除规则计算和 Element Plus 校验绑定；属性设置生成器不再暴露 ID 与类型，只保留可编辑配置。

**技术栈：** Vue 3、TypeScript、Pinia、Element Plus、vite-plugin-svg-icons、Vitest

---

## 文件结构

- 创建 `src/views/EditorView/field-type-meta.ts`：七种字段类型的共享展示元数据。
- 创建 `src/assets/svg/field-*.svg`：七个 Element Plus 风格字段类型图标。
- 修改 `src/views/EditorView/AddFieldDialog.vue`：使用共享元数据和 `SvgIcon`。
- 修改 `src/views/EditorView/EditorPanel.vue`：左侧字段列表改用共享 SVG 图标。
- 修改 `src/views/EditorView/PropertyPanel.vue`：增加字段类型摘要，隐藏 ID 与类型设置。
- 修改 `src/views/EditorView/usePropertySettings.ts`：公共设置仅生成名称和必填。
- 修改 `src/views/EditorView/use-property-settings.test.ts`：保护公共设置不再包含 ID 与类型的契约。
- 修改 `src/views/EditorView/PreviewPanel.vue`：画布占满面板并移除设计态校验。

### 任务 1：统一字段类型元数据与 SVG 图标

**文件：**
- 创建：`src/views/EditorView/field-type-meta.ts`
- 创建：`src/assets/svg/field-text.svg`
- 创建：`src/assets/svg/field-number.svg`
- 创建：`src/assets/svg/field-textarea.svg`
- 创建：`src/assets/svg/field-select.svg`
- 创建：`src/assets/svg/field-radio.svg`
- 创建：`src/assets/svg/field-checkbox.svg`
- 创建：`src/assets/svg/field-date.svg`
- 修改：`src/views/EditorView/AddFieldDialog.vue`
- 修改：`src/views/EditorView/EditorPanel.vue`
- 修改：`src/views/EditorView/PropertyPanel.vue`

- [x] **步骤 1：建立完整的字段类型元数据映射**

```ts
export type FieldTypeMeta = {
  type: FormField['type']
  label: string
  description: string
  icon: string
}

export const fieldTypeMeta: Record<FormField['type'], FieldTypeMeta> = {
  text: {
    type: 'text',
    label: '文本输入',
    description: '单行文本内容',
    icon: 'field-text',
  },
  number: {
    type: 'number',
    label: '数字输入',
    description: '数值与范围',
    icon: 'field-number',
  },
  textarea: {
    type: 'textarea',
    label: '多行文本',
    description: '较长的文本内容',
    icon: 'field-textarea',
  },
  select: {
    type: 'select',
    label: '下拉选择',
    description: '从列表中选择一项',
    icon: 'field-select',
  },
  radio: {
    type: 'radio',
    label: '单选框',
    description: '平铺显示单选项',
    icon: 'field-radio',
  },
  checkbox: {
    type: 'checkbox',
    label: '复选框',
    description: '是或否的选项',
    icon: 'field-checkbox',
  },
  date: {
    type: 'date',
    label: '日期',
    description: '选择一个日期',
    icon: 'field-date',
  },
}

export const fieldTypeOptions = Object.values(fieldTypeMeta)
```

- [x] **步骤 2：加入七个 Element Plus 风格 SVG**

每个文件使用 `viewBox="0 0 1024 1024"` 与 `fill="currentColor"`。从当前锁定版本 `@element-plus/icons-vue@2.3.2` 的本地构建产物复制对应图形路径，映射为：文本 `EditPen`、数字 `DataAnalysis`、多行文本 `Document`、下拉选择 `ArrowDownBold`、单选 `CircleCheck`、复选 `Finished`、日期 `Calendar`。

- [x] **步骤 3：三个入口统一使用共享元数据与 SvgIcon**

`AddFieldDialog.vue`、`EditorPanel.vue` 和 `PropertyPanel.vue` 均通过：

```vue
<SvgIcon :name="fieldTypeMeta[field.type].icon" />
```

属性面板选中字段时渲染摘要：

```vue
<div v-if="selectedField" class="property-heading">
  <span class="property-type-icon">
    <SvgIcon :name="selectedFieldMeta.icon" />
  </span>
  <span class="property-heading-copy">
    <h2 id="property-title">{{ selectedFieldMeta.label }}</h2>
    <span>{{ selectedFieldMeta.description }}</span>
  </span>
</div>
```

- [x] **步骤 4：运行生产构建确认 SVG sprite 与类型通过**

运行：`pnpm build`

预期：`vue-tsc` 与 Vite 构建成功，七种图标名均能生成 sprite symbol。

### 任务 2：精简属性设置并移除预览校验

**文件：**
- 修改：`src/views/EditorView/usePropertySettings.ts`
- 修改：`src/views/EditorView/use-property-settings.test.ts`
- 修改：`src/views/EditorView/PreviewPanel.vue`

- [x] **步骤 1：先修改关键设置契约测试**

将文本字段和数字字段的期望设置 ID 改为：

```ts
expect(settings.value.map((setting) => setting.id)).toEqual([
  'label',
  'required',
  'minLength',
  'maxLength',
])
```

```ts
expect(settings.value.map((setting) => setting.id)).toEqual([
  'label',
  'required',
  'min',
  'max',
])
```

- [x] **步骤 2：运行单个测试确认当前实现不满足新契约**

运行：`pnpm test -- src/views/EditorView/use-property-settings.test.ts`

预期：测试因实际结果仍含 `id`、`type` 而失败。

- [x] **步骤 3：从公共设置中删除 ID 与类型项**

`createBaseSettings` 仅返回 `label` 和 `required` 配置；保留现有类型分支、约束错误和选项设置逻辑。

- [x] **步骤 4：移除 PreviewPanel 的校验依赖与宽度上限**

模板改为不传规则和字段 prop：

```vue
<ElForm :model="formValues">
  <ElFormItem>
```

脚本删除 `computed`、`createFormRules` 和 `formRules`；样式将 `.form-canvas` 改为 `width: 100%`。

- [x] **步骤 5：运行关键验证**

运行：`pnpm test && pnpm build`

预期：现有测试全部通过，生产构建成功。

实现代码在用户检查前保持未提交；用户明确要求后再提交。
