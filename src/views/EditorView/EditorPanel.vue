<template>
  <aside class="editor-panel field-panel" aria-labelledby="field-list-title">
    <div class="panel-heading">
      <div class="panel-title-group">
        <h2 id="field-list-title">字段</h2>
        <span class="field-count">{{ formSchema.fields.length }}</span>
      </div>
      <el-button type="primary" plain @click="addFieldDialogVisible = true">添加字段</el-button>
    </div>

    <div class="panel-body">
      <p v-if="formSchema.fields.length === 0" class="panel-empty-state">暂未添加字段</p>
      <div v-else ref="fieldListRef" class="field-list">
        <button
          v-for="field in formSchema.fields"
          :key="field.id"
          type="button"
          class="field-item"
          :class="{ 'is-selected': selectedFieldId === field.id }"
          :aria-pressed="selectedFieldId === field.id"
          @click="selectField(field.id)"
        >
          <span class="field-drag" aria-hidden="true">⠿</span>
          <span class="field-card">
            <span class="field-type-icon" aria-hidden="true">{{ fieldTypeMeta[field.type] }}</span>
            <span class="field-name">{{ field.label }}</span>
            <span class="field-grip" aria-hidden="true">≡</span>
          </span>
        </button>
      </div>
    </div>

    <AddFieldDialog v-model="addFieldDialogVisible" @confirm="handleAddField" />
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import AddFieldDialog from './AddFieldDialog.vue'
import { useDraggable } from 'vue-draggable-plus'
import { useFormEditorStore } from '@/stores/form-editor.ts'

import type { FormField } from '@/types/form-schema'

const fieldTypeMeta: Record<FormField['type'], string> = {
  text: 'T',
  number: '123',
  textarea: '¶',
  select: '⌄',
  radio: '◉',
  checkbox: '✓',
  date: '□',
}

const formEditorStore = useFormEditorStore()
const { formSchema, selectedFieldId } = storeToRefs(formEditorStore)

const { addField, moveField, selectField } = formEditorStore
const addFieldDialogVisible = ref(false)

const fieldListRef = ref<HTMLElement | null>(null)

useDraggable(fieldListRef, undefined, {
  animation: 150,
  handle: '.field-drag',
  onUpdate(event) {
    if (event.oldIndex === undefined || event.newIndex === undefined) return
    moveField(event.oldIndex, event.newIndex)
  },
})

function handleAddField(type: FormField['type']) {
  addField(type)
  addFieldDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.field-panel {
  border-right: 1px solid #dcdfe6;
}

.panel-heading,
.panel-title-group {
  display: flex;
  align-items: center;
}

.panel-heading {
  justify-content: space-between;
  gap: 12px;
}

.panel-title-group {
  gap: 10px;
}

h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.field-count {
  display: inline-grid;
  min-width: 24px;
  min-height: 24px;
  padding: 0 7px;
  color: #606266;
  font-size: 13px;
  place-items: center;
  background: #f2f3f5;
  border-radius: 12px;
}

.panel-body {
  margin-top: 20px;
}

.field-list {
  display: grid;
  gap: 10px;
}

.field-item {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 0;
  color: #606266;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.field-drag,
.field-grip {
  color: #a8abb2;
  font-size: 16px;
  line-height: 1;
  text-align: center;
}

.field-card {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 18px;
  gap: 10px;
  align-items: center;
  min-height: 50px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.field-type-icon {
  display: inline-grid;
  width: 28px;
  height: 28px;
  color: #4e5969;
  font-size: 12px;
  font-weight: 600;
  place-items: center;
  background: #f7f8fa;
  border: 1px solid #c9cdd4;
  border-radius: 5px;
}

.field-name {
  overflow: hidden;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-item:hover .field-card {
  border-color: #a0cfff;
  box-shadow: 0 2px 8px rgb(64 158 255 / 10%);
}

.field-item.is-selected .field-card {
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgb(64 158 255 / 16%);
}

.field-item.is-selected .field-name,
.field-item.is-selected .field-type-icon {
  color: #1677ff;
}

.field-item:focus-visible {
  outline: none;
}

.field-item:focus-visible .field-card {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.panel-empty-state {
  margin: 48px 0 0;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 1200px) {
  .field-card {
    grid-template-columns: 28px minmax(0, 1fr) 16px;
    gap: 8px;
    padding-inline: 10px;
  }
}

@media (max-width: 960px) {
  .field-panel {
    border-right: 0;
    border-bottom: 1px solid #dcdfe6;
  }
}
</style>
