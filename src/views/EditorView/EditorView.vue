<template>
  <div class="editor-view">
    <header class="editor-toolbar">
      <div class="toolbar-identity">
        <span class="toolbar-brand">FormPilot AI</span>
      </div>

      <nav class="toolbar-actions" aria-label="表单操作">
        <ElButton @click="openImportPicker">导入</ElButton>
        <ElButton>导出</ElButton>
        <ElButton type="primary">AI 生成</ElButton>
        <input
          ref="importInputRef"
          class="import-input"
          type="file"
          accept=".json,application/json"
          @change="handleImportFile"
        />
      </nav>
    </header>

    <div class="editor-layout">
      <EditorPanel />
      <PreviewPanel />
      <PropertyPanel />
    </div>

    <SchemaConfirmDialog
      v-if="pendingSchema"
      v-model="confirmDialogVisible"
      :schema="pendingSchema"
      @apply="applyPendingSchema"
      @cancel="cancelPendingSchema"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import PreviewPanel from './PreviewPanel.vue'
import EditorPanel from './EditorPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import SchemaConfirmDialog from './SchemaConfirmDialog.vue'
import { useFormEditorStore } from '@/stores/form-editor'
import { parseFormSchemaJson } from '@/utils/form-schema-json'
import type { FormSchema } from '@/types/form-schema'

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

  let source: string

  try {
    source = await file.text()
  } catch {
    ElMessage.error('文件读取失败')
    return
  }

  const result = parseFormSchemaJson(source)

  if (!result.success) {
    ElMessage.error(result.message)
    return
  }

  pendingSchema.value = result.data
  confirmDialogVisible.value = true
}

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
</script>

<style scoped lang="scss">
.editor-layout {
  display: grid;
  flex: 1;
  grid-template-columns: 288px minmax(560px, 1fr) 272px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-layout > :deep(.editor-panel),
.editor-layout > :deep(.preview-panel) {
  min-width: 0;
  min-height: 0;
  padding: 24px 16px;
  overflow-y: auto;
}

.editor-layout > :deep(.editor-panel) {
  background: #ffffff;
}

.import-input {
  display: none;
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 260px minmax(440px, 1fr) 248px;
  }
}

@media (max-width: 960px) {
  .editor-layout {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .editor-layout > :deep(.editor-panel),
  .editor-layout > :deep(.preview-panel) {
    padding: 24px 20px;
    overflow: visible;
  }
}
</style>
