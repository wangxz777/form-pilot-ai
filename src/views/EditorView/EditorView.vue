<template>
  <div class="editor-view">
    <header class="editor-toolbar">
      <div class="toolbar-identity">
        <span class="toolbar-brand">FormPilot AI</span>
      </div>

      <nav class="toolbar-actions" aria-label="表单操作">
        <ElButton @click="saveDraft">保存草稿</ElButton>
        <ElButton @click="openImportPicker">导入</ElButton>
        <ElButton @click="exportFormSchema">导出</ElButton>
        <ElButton type="primary" @click="aiDialogVisible = true">AI 生成</ElButton>
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

    <AiGenerateDialog
      v-model="aiDialogVisible"
      :loading="aiGenerating"
      @generate="generateWithAi"
      @cancel="cancelAiGeneration"
    />

    <SchemaConfirmDialog
      v-if="pendingSchema"
      v-model="confirmDialogVisible"
      :schema="pendingSchema"
      :dialog-title="pendingSource === 'ai' ? '确认 AI 生成表单' : '确认导入表单'"
      @apply="applyPendingSchema"
      @cancel="cancelPendingSchema"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import PreviewPanel from './PreviewPanel.vue'
import EditorPanel from './EditorPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import AiGenerateDialog from './AiGenerateDialog.vue'
import SchemaConfirmDialog from './SchemaConfirmDialog.vue'
import { requestGeneratedForm } from '@/services/form-generator'
import { useFormEditorStore } from '@/stores/form-editor'
import { loadFormDraft, saveFormDraft } from '@/utils/form-draft'
import { parseFormSchemaJson, serializeFormSchemaJson } from '@/utils/form-schema-json'
import type { FormSchema } from '@/types/form-schema'

const formEditorStore = useFormEditorStore()
const { replaceFormSchema } = formEditorStore
const importInputRef = ref<HTMLInputElement | null>(null)
const pendingSchema = ref<FormSchema | null>(null)
const pendingSource = ref<'import' | 'ai'>('import')
const confirmDialogVisible = ref(false)
const aiDialogVisible = ref(false)
const aiGenerating = ref(false)
let aiRequestController: AbortController | null = null

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

  pendingSource.value = 'import'
  pendingSchema.value = result.data
  confirmDialogVisible.value = true
}

async function generateWithAi(prompt: string) {
  aiRequestController?.abort()

  const controller = new AbortController()
  aiRequestController = controller
  aiGenerating.value = true

  const result = await requestGeneratedForm(prompt, { signal: controller.signal })

  if (controller.signal.aborted) return

  if (!result.success) {
    ElMessage.error(result.message)
    aiGenerating.value = false
    aiRequestController = null
    return
  }

  pendingSource.value = 'ai'
  pendingSchema.value = result.data
  aiDialogVisible.value = false
  confirmDialogVisible.value = true
  aiGenerating.value = false
  aiRequestController = null
}

function cancelAiGeneration() {
  aiRequestController?.abort()
  aiRequestController = null
  aiGenerating.value = false
}

function applyPendingSchema() {
  if (!pendingSchema.value) return

  const appliedSource = pendingSource.value
  replaceFormSchema(pendingSchema.value)
  confirmDialogVisible.value = false
  pendingSchema.value = null
  pendingSource.value = 'import'
  ElMessage.success(appliedSource === 'ai' ? 'AI 表单已应用' : '表单已导入')
}

function cancelPendingSchema() {
  confirmDialogVisible.value = false
  pendingSchema.value = null
  pendingSource.value = 'import'
}

function exportFormSchema() {
  const result = serializeFormSchemaJson(formEditorStore.formSchema)

  if (!result.success) {
    ElMessage.error(result.message)
    return
  }

  const file = new Blob([result.data], { type: 'application/json;charset=utf-8' })
  const fileUrl = URL.createObjectURL(file)
  const downloadLink = document.createElement('a')

  downloadLink.href = fileUrl
  downloadLink.download = 'formpilot-schema.json'
  document.body.append(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(fileUrl)

  ElMessage.success('表单已导出')
}

function saveDraft() {
  const result = saveFormDraft(localStorage, formEditorStore.formSchema)

  if (!result.success) {
    ElMessage.error(result.message)
    return
  }

  ElMessage.success('草稿已保存')
}

function restoreDraft() {
  const result = loadFormDraft(localStorage)

  if (!result.success) {
    ElMessage.error(result.message)
    return
  }

  if (!result.data) return

  replaceFormSchema(result.data)
  ElMessage.success('已恢复本地草稿')
}

onMounted(restoreDraft)
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
