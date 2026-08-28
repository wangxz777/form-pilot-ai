<template>
  <main class="preview-panel" aria-label="表单设计画布">
    <section class="form-canvas" aria-labelledby="form-title">
      <input
        v-if="isEditingTitle"
        id="form-title"
        ref="titleInputRef"
        v-model="titleDraft"
        class="form-title-input"
        aria-label="表单标题"
        @blur="saveFormTitle"
      />
      <h3
        v-else
        id="form-title"
        class="form-title"
        title="双击编辑表单标题"
        @dblclick="startEditingTitle"
      >
        {{ formSchema.title }}
      </h3>
      <p class="form-description">点击选择字段，拖拽调整顺序</p>
      <ElForm :model="formValues" :rules="formRules">
        <div ref="previewFieldListRef" class="preview-field-list">
          <div
            v-for="field in formSchema.fields"
            :key="field.id"
            class="preview-field"
            :class="{ 'is-selected': selectedFieldId === field.id }"
            role="button"
            tabindex="0"
            :aria-pressed="selectedFieldId === field.id"
            @click="selectField(field.id)"
            @keydown.enter="selectField(field.id)"
            @keydown.space.prevent="selectField(field.id)"
          >
            <ElFormItem :prop="field.id">
              <template #label>
                {{ field.label }}
              </template>
              <div class="preview-field-control" inert>
                <FormFieldRenderer
                  :field="field"
                  :model-value="formValues[field.id]"
                />
              </div>
            </ElFormItem>
          </div>
        </div>
      </ElForm>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDraggable } from 'vue-draggable-plus'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { ElForm, ElFormItem } from 'element-plus'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import { createFormRules } from '@/utils/form-rules'

const formEditorStore = useFormEditorStore()
const { formSchema, formValues, selectedFieldId } = storeToRefs(formEditorStore)
const { selectField, moveField, updateFormTitle } = formEditorStore
const formRules = computed(() => createFormRules(formSchema.value.fields))
const previewFieldListRef = ref<HTMLElement | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)
const isEditingTitle = ref(false)
const titleDraft = ref('')

function startEditingTitle() {
  titleDraft.value = formSchema.value.title
  isEditingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function saveFormTitle() {
  const title = titleDraft.value.trim()

  if (title) updateFormTitle(title)

  isEditingTitle.value = false
}

useDraggable(previewFieldListRef, undefined, {
  animation: 150,
  onUpdate(event) {
    if (event.oldIndex === undefined || event.newIndex === undefined) return
    moveField(event.oldIndex, event.newIndex)
  },
})
</script>

<style scoped lang="scss">
.preview-panel {
  background: #f5f7fa;
}

.form-canvas {
  width: min(100%, 760px);
  min-height: 420px;
  margin: 0 auto;
  padding: 20px 20px 24px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(31 45 61 / 9%);
}

.form-title,
.form-title-input {
  margin: 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}

.form-title {
  cursor: text;
}

.form-title-input {
  width: min(100%, 360px);
  padding: 0 8px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #409eff;
  border-radius: 4px;
  outline: none;
  box-shadow: 0 0 0 2px rgb(64 158 255 / 12%);
}

.form-description {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.form-canvas :deep(.el-form) {
  margin-top: 18px;
  text-align: left;
}

.preview-field-list {
  display: grid;
  gap: 10px;
}

.preview-field {
  padding: 12px;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: grab;
  outline: none;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.preview-field:hover,
.preview-field:focus-visible {
  background: #f5f9ff;
  border-color: #a0cfff;
}

.preview-field:focus-visible {
  box-shadow: 0 0 0 2px rgb(64 158 255 / 16%);
}

.preview-field.is-selected {
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgb(64 158 255 / 12%);
}

.preview-field:active {
  cursor: grabbing;
}

.preview-field.sortable-ghost {
  opacity: 0.45;
}

.preview-field-control {
  width: 100%;
  pointer-events: none;
  user-select: none;
}

.preview-field :deep(.el-form-item) {
  margin-bottom: 0;
}

.form-canvas :deep(.el-select),
.form-canvas :deep(.el-date-editor) {
  width: 100%;
}

@media (max-width: 960px) {
  .preview-panel {
    border-bottom: 1px solid #dcdfe6;
  }
}

@media (max-width: 520px) {
  .form-canvas {
    min-height: 320px;
    padding: 18px 14px 22px;
  }
}
</style>
