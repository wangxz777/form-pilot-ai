<template>
  <div class="editor-view">
    <header class="editor-toolbar">
      <div class="toolbar-identity">
        <span class="toolbar-brand">FormPilot AI</span>
      </div>

      <nav class="toolbar-actions" aria-label="表单操作">
        <ElButton>预览</ElButton>
        <ElButton>导入</ElButton>
        <ElButton>导出</ElButton>
        <ElButton type="primary">AI 生成</ElButton>
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
import { ElButton } from 'element-plus'

import PreviewPanel from './PreviewPanel.vue'
import EditorPanel from './EditorPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
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
