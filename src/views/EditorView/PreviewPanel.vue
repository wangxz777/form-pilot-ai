<template>
  <main class="preview-panel" aria-labelledby="preview-title">
    <h2 id="preview-title">实时预览</h2>
    <section class="form-canvas" aria-labelledby="form-title">
      <h3 id="form-title">{{ formSchema.title }}</h3>
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
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDraggable } from 'vue-draggable-plus'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { ElForm, ElFormItem } from 'element-plus'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import { createFormRules } from '@/utils/form-rules'

const formEditorStore = useFormEditorStore()
const { formSchema, formValues, selectedFieldId } = storeToRefs(formEditorStore)
const { selectField, moveField } = formEditorStore
const formRules = computed(() => createFormRules(formSchema.value.fields))
const previewFieldListRef = ref<HTMLElement | null>(null)

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

h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.form-canvas {
  width: min(100%, 760px);
  min-height: 420px;
  margin: 16px auto 0;
  padding: 28px 24px 32px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(31 45 61 / 9%);
}

.form-canvas h3 {
  margin: 0;
  color: #1d2129;
  font-size: 28px;
  line-height: 1.4;
}

.form-description {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.form-canvas :deep(.el-form) {
  margin-top: 24px;
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
    padding: 24px 16px;
  }
}
</style>
