# 候选 Schema 确认预览设计

## 目标

调整编辑器中的预览定位：顶部不再提供独立预览入口，预览只在 JSON 导入或 AI 生成得到候选 Schema 后弹出，帮助用户在覆盖当前表单前确认内容。

本设计取代“点击预览按钮进入真实填写与提交校验”的后续方案。中间 `PreviewPanel` 继续作为设计画布，不承担填写、提交或表单校验。

## 工具栏

- 删除顶部“预览”按钮。
- 保留“导入”“导出”和“AI 生成”。
- “导出”直接处理当前 Schema，不打开确认预览。
- “导入”和“AI 生成”共用候选 Schema 确认流程。

## 候选 Schema 状态

候选 Schema 是编辑页面内的短生命周期状态，由 `EditorView.vue` 管理，不写入 Pinia Store：

```ts
const pendingSchema = ref<FormSchema | null>(null)
const confirmDialogVisible = ref(false)
```

只有用户点击“应用”时，候选 Schema 才进入 Store。这样取消操作不需要恢复快照，也不会提前影响当前字段、字段值或选中状态。

## Schema 验证

导入结果和未来 AI 返回结果都必须先调用 `formSchema.safeParse`：

- 解析失败：显示格式错误，不设置 `pendingSchema`，不打开确认弹窗。
- 解析成功：使用 Zod 返回的 `data` 作为候选 Schema，设置 `pendingSchema` 后打开确认弹窗。

确认弹窗不接收未经 Zod 验证的对象。JSON 文本语法错误与 Schema 结构错误在导入入口处理，确认弹窗只负责展示合法候选数据。

## 确认弹窗

新增 `SchemaConfirmDialog.vue`：

- 通过 prop 接收候选 `FormSchema`。
- 展示候选表单标题和字段顺序。
- 复用 `FormFieldRenderer` 展示七种真实 Element Plus 控件外观。
- 使用候选字段生成独立默认值，仅用于满足渲染器的 `modelValue` 输入。
- 控件外层使用 `inert`、`pointer-events: none` 和 `user-select: none`，不可输入或聚焦。
- 不绑定 `formRules`，不触发 required、长度或数字范围校验。
- 使用 `ElFormItem` 的响应式 label 插槽展示字段名称；必填星号在标签插槽中自行展示，不设置 `ElFormItem.required`，避免注册校验来源。
- 底部提供“取消”和“应用”按钮。

弹窗只负责发出 `cancel` 和 `apply` 事件，不直接修改 Store。

## 应用候选 Schema

Pinia Store 新增整体替换 action：

```ts
function replaceFormSchema(nextSchema: FormSchema) {
  Object.assign(formSchema, nextSchema)
  replaceFormValues(createFormValues(nextSchema.fields))
  selectedFieldId.value = null
}
```

实际实现需要原地清理并重建 `formValues` 的键，避免旧字段值残留；不得只覆盖新字段键。

点击“应用”后的顺序：

1. `EditorView` 调用 `replaceFormSchema(pendingSchema)`。
2. Store 替换 Schema。
3. Store 根据新字段重新创建全部默认值。
4. Store 清空 `selectedFieldId`。
5. `EditorView` 关闭弹窗并把 `pendingSchema` 设为 `null`。

点击“取消”只关闭弹窗并清除候选 Schema，当前 Store 完全不变。

## JSON 导入、导出与 AI 生成边界

本设计确定三项功能的关系，但实现按独立功能切片推进：

1. 先完成工具栏按钮调整、确认弹窗和 Store 替换 action。
2. 再实现 JSON 导入，并首次接入完整确认流程。
3. 实现 JSON 导出；导出不经过确认。
4. AI 阶段将服务端返回结果接入同一个候选 Schema 入口，不再创建另一套预览弹窗。

单份本地草稿安排在 JSON 导入导出完成之后。

## 错误与边界

- 候选 Schema 为 `null` 时不打开确认弹窗。
- 重复字段 ID、无效字段类型、空选项或非法范围由现有 Zod Schema 拒绝。
- 取消确认不修改当前标题、字段、字段值或选中状态。
- 应用确认不保留旧字段值，即使新旧 Schema 中存在相同字段 ID，也统一按新 Schema 默认值初始化。
- 预览控件不可交互，因此不会产生候选表单值或校验状态。

## 验证

- 顶部不再显示“预览”按钮。
- 合法候选 Schema 能打开确认弹窗，并显示标题、字段顺序、标签、必填标识和七类控件外观。
- 确认弹窗中的控件不可输入、不可聚焦且不触发校验。
- 点击“取消”后当前 Store 状态不变。
- 点击“应用”后当前 Schema 被整体替换，旧值被清除，新字段获得默认值，选中状态清空。
- 属性面板和中间设计画布响应新 Schema 更新。
- 只为 Store 整体替换和确认／取消数据流增加少量高价值测试，不扩展重复的视觉测试。
- `pnpm test` 和 `pnpm build` 通过。

## 非目标

- 不提供独立真实填写预览。
- 不在确认弹窗内测试输入或提交。
- 不实现字段级合并。
- 不保留导入前后的历史快照。
- 不让确认弹窗直接操作 Pinia Store。
