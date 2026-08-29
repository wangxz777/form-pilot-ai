<template>
  <ElDialog
    v-model="visible"
    :title="dialogTitle"
    width="min(720px, calc(100vw - 32px))"
    destroy-on-close
    @closed="emit('cancel')"
  >
    <section class="schema-confirmation">
      <h2>{{ schema.title }}</h2>
      <ElForm :model="previewValues">
        <ElFormItem v-for="field in schema.fields" :key="field.id">
          <template #label>
            <span class="confirmation-label">
              {{ field.label }}
              <span v-if="field.required" class="required-mark" aria-label="必填">*</span>
            </span>
          </template>

          <div class="confirmation-control" inert>
            <FormFieldRenderer
              :field="field"
              :model-value="previewValues[field.id]"
            />
          </div>
        </ElFormItem>
      </ElForm>
    </section>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="emit('apply')">应用</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem } from 'element-plus'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { createFormValues } from '@/utils/form-values'
import type { FormSchema } from '@/types/form-schema'

const props = withDefaults(
  defineProps<{
    schema: FormSchema
    dialogTitle?: string
  }>(),
  { dialogTitle: '确认表单' }
)
const visible = defineModel<boolean>({ required: true })
const emit = defineEmits<{
  apply: []
  cancel: []
}>()

const previewValues = computed(() => createFormValues(props.schema.fields))
</script>

<style scoped lang="scss">
.schema-confirmation {
  max-height: min(66vh, 680px);
  padding: 4px 2px;
  overflow-y: auto;
}

.schema-confirmation h2 {
  margin: 0;
  color: #1d2129;
  font-size: 22px;
  line-height: 1.4;
  text-align: center;
}

.schema-confirmation :deep(.el-form) {
  margin-top: 20px;
}

.confirmation-control {
  width: 100%;
  pointer-events: none;
  user-select: none;
}

.schema-confirmation :deep(.el-select),
.schema-confirmation :deep(.el-date-editor),
.schema-confirmation :deep(.el-input-number) {
  width: 100%;
}

.required-mark {
  margin-left: 3px;
  color: #f56c6c;
}
</style>
