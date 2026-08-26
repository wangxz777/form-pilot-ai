<template>
  <main class="preview-panel" aria-labelledby="preview-title">
    <h2 id="preview-title">实时预览</h2>
    <section class="form-canvas" aria-labelledby="form-title">
      <h3 id="form-title">{{ formSchema.title }}</h3>
      <p class="form-description">请填写以下信息</p>
      <ElForm :model="formValues" :rules="formRules">
        <ElFormItem
          v-for="field in formSchema.fields"
          :key="field.id"
          :label="field.label"
          :prop="field.id"
        >
          <FormFieldRenderer
            :field="field"
            :model-value="formValues[field.id]"
            @update:model-value="(v) => updateFormValue(field.id, v)"
            @click="selectField(field.id)"
          />
        </ElFormItem>
      </ElForm>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { ElForm, ElFormItem } from 'element-plus'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import { createFormRules } from '@/utils/form-rules'

const formEditorStore = useFormEditorStore()
const { formSchema, formValues } = storeToRefs(formEditorStore)
const { updateFormValue, selectField } = formEditorStore
const formRules = computed(() => createFormRules(formSchema.value.fields))
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

.form-canvas :deep(.el-form-item) {
  margin-bottom: 20px;
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
