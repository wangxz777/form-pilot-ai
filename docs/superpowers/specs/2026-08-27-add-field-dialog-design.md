# 添加字段弹窗设计

## 目标

将编辑器左栏的“添加字段”按钮接入一个参考 `docs/ui/formpilot-editor-add-field-dialog.png` 的字段类型选择弹窗。用户选择一种字段类型并确认后，调用现有 Store action 创建字段、初始化默认值并自动选中新字段。

本批次只实现添加字段弹窗，不实现拖拽排序或删除确认。

## 组件边界

新增 `src/views/EditorView/AddFieldDialog.vue`，保持为不感知 Pinia 的展示组件：

- 通过 `v-model` 接收和更新弹窗可见状态。
- 在组件内部保存当前选中的 `FormField['type']`，每次打开默认选中 `text`。
- 确认时发出携带字段类型的 `confirm` 事件，不直接修改 Store。
- 取消、关闭按钮、Esc 或遮罩关闭均只关闭弹窗，不创建字段。

`EditorPanel.vue` 负责：

- 点击“添加字段”时打开弹窗。
- 接收 `confirm(type)` 后调用现有 `addField(type)` action。
- 添加成功后关闭弹窗；Store 继续负责字段创建、默认值初始化和选中状态。

## 视觉与交互

- 使用 Element Plus `ElDialog`，标题为“添加字段”，说明为“选择要添加到表单的字段类型”。
- 七种字段类型使用两列卡片布局：文本输入、数字输入、多行文本、下拉选择、单选框、复选框、日期。
- 每张卡片显示当前项目已有的简洁类型符号、中文名称和一句说明，不新增图标依赖。
- 卡片使用原生 `button`，选中状态具备蓝色边框、浅蓝背景、勾选标记和 `aria-pressed`。
- 底部操作为“取消”和“添加字段”；默认已有选中项，因此确认按钮始终可用。
- 窄屏下卡片改为单列，弹窗宽度不超出视口。

## 数据流与失败边界

1. `EditorPanel` 打开弹窗。
2. 用户在弹窗内选择字段类型。
3. 弹窗发出 `confirm(type)`。
4. `EditorPanel` 调用 `addField(type)`。
5. Store 创建合法 `FormField`、写入 `formSchema.fields`、初始化 `formValues[id]` 并更新 `selectedFieldId`。
6. 左栏、预览和属性面板响应式刷新。

字段类型来自固定的 `FormField['type']` 列表，不接受外部任意字符串。当前 Store action 为同步操作，没有需要在弹窗展示的异步失败状态。

## 验证

- 点击“添加字段”能打开弹窗，默认选中文本输入。
- 七种卡片均可切换选中状态；确认事件携带当前选择的字段类型。
- 取消或关闭弹窗不创建字段；重新打开时恢复默认文本类型。
- 确认后字段数量增加，新字段出现在预览中并成为当前选中字段。
- 运行 `pnpm test` 和 `pnpm build`，只允许保留已有的 Element Plus chunk 体积警告。

## 实施结果（2026-08-27）

- 添加字段弹窗已按本设计完成，七种字段类型均通过现有 `addField` action 创建并自动选中。
- 后续根据学习者的新要求扩大同一字段管理批次：左侧列表使用 `vue-draggable-plus` 拖拽排序，右侧属性面板提供直接删除，不再显示二次确认。
- SVG 删除图标通过现有 `SvgIcon` 组件接入；`vite-plugin-svg-icons` 的扫描目录修正为 `src/assets/svg`，并补齐其运行所需依赖。
- Element Plus 已改为组件局部导入，编辑器路由使用懒加载；最终构建不再出现超过 500 kB 的 chunk 警告，因此原验证条件中的已知警告已消除。
- 最终自动验证为 `pnpm test` 16/16 通过、`pnpm build` 成功。
