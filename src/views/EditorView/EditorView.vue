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
