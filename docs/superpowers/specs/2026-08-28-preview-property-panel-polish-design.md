# 预览画布与字段属性面板优化设计

## 目标

进一步明确编辑器中间区域和右侧属性面板的职责：预览画布只展示、选中和排序字段，不承担真实表单校验；属性面板减少内部标识信息，改用更直观的字段类型摘要。

## 预览画布

- `.form-canvas` 取消 `760px` 最大宽度，宽度占满 `preview-panel` 的可用内容区。
- 保留真实 Element Plus 控件外观、字段选中高亮和拖拽排序。
- 从 `PreviewPanel.vue` 移除 `createFormRules`、计算规则、`ElForm` 的 `rules` 以及 `ElFormItem` 的 `prop`。
- 添加字段后不再因为规则列表变化触发 Element Plus 校验。
- 本次只移除设计画布中的表单校验，不删除 `form-rules.ts`；该工具继续服务未来的真实填写或提交场景。

## 属性面板

- 右侧属性面板继续保留。
- 公共设置中移除只读的“字段 ID”和“字段类型”，仅保留字段名称、是否必填及各字段特有设置。
- 选中字段后，面板顶部显示字段类型摘要：类型图标、中文类型名称和简短用途说明。
- 未选中字段时显示普通“字段属性”标题和原有空状态。

字段类型摘要与添加字段弹窗使用同一份元数据，避免图标名、类型名称和说明在多个组件内重复维护。共享元数据按 `FormField['type']` 建立完整映射，供添加字段弹窗、左侧字段列表和右侧属性面板读取。

## 图标规范

- 七种字段类型统一使用 Element Plus Icons 的图形风格。
- 将需要的 SVG 保存到 `src/assets/svg`，通过现有 `SvgIcon.vue` 和 SVG sprite 加载，不直接在模板中写字符图标。
- 不新增 `@element-plus/icons-vue` 运行时依赖。
- 本地文件使用 `field-<type>.svg` 命名；SVG 使用 `viewBox="0 0 1024 1024"` 和 `fill="currentColor"`，使颜色受现有 CSS 控制。
- 删除按钮继续使用现有 `delete.svg`。

## 数据与组件边界

- `field-type-meta.ts` 只保存展示元数据，不包含 Store 操作或响应式状态。
- `AddFieldDialog.vue` 仍维护当前选中类型，仅从共享元数据生成七种选项。
- `EditorPanel.vue` 只根据字段类型读取对应图标名。
- `PropertyPanel.vue` 根据 `selectedField.type` 计算当前摘要，并继续通过 `usePropertySettings` 渲染设置列表。
- `usePropertySettings.ts` 不再创建 ID、类型设置，其余类型安全配置结构不变。

## 验证

- 添加必填字段后，预览画布不显示校验错误。
- 预览字段仍可选中和拖拽，控件仍不可输入。
- `form-canvas` 占满中间面板可用宽度。
- 右栏不再显示字段 ID 和字段类型输入框。
- 七种字段在添加弹窗、左侧字段列表和右侧摘要中使用一致的 SVG 图标。
- 属性编辑、选项维护和删除字段行为保持不变。
- 运行现有 `pnpm test` 和 `pnpm build` 作为关键节点验证，不扩充重复 UI 测试。

## 非目标

- 不删除 Schema 校验或属性约束错误提示。
- 不实现真实填写／提交模式。
- 不新增图标依赖。
- 不拆分新的 Vue 属性子组件。

## 实施结果（2026-08-28）

- 设计画布已移除表单规则和宽度上限，保留真实控件外观、不可输入状态、选中高亮和拖拽排序。
- 属性面板已隐藏字段 ID 和字段类型输入项，改为使用共享元数据展示图标、中文名称和用途说明。
- 七种字段图标已保存到 `src/assets/svg` 并统一通过 `SvgIcon` 使用，没有新增 `@element-plus/icons-vue` 依赖。
- 实现提交为 `5b7608c feat: polish preview and property panel`；后续候选 Schema 确认弹窗继续复用相同的只读控件呈现原则。
