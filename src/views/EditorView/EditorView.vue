<template>
  <div class="editor-view">
    <header class="editor-toolbar">
      <div class="toolbar-identity">
        <span class="toolbar-brand">FormPilot AI</span>
        <span class="toolbar-divider" aria-hidden="true"></span>
        <h1 class="toolbar-form-name">{{ formSchema.title }}</h1>
        <span class="toolbar-save-status">已自动保存</span>
      </div>

      <nav class="toolbar-actions" aria-label="表单操作">
        <el-button>预览</el-button>
        <el-button>导入</el-button>
        <el-button>导出</el-button>
        <el-button type="primary">AI 生成</el-button>
      </nav>
    </header>

    <div class="editor-layout">
      <EditorPanel />
      <PreviewPanel />
      <PropertyPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import PreviewPanel from './PreviewPanel.vue'
import EditorPanel from './EditorPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import { useFormEditorStore } from '@/stores/form-editor.ts'

const formEditorStore = useFormEditorStore()
const { formSchema } = storeToRefs(formEditorStore)
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
