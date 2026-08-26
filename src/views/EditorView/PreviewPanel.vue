<template>
  <main class="preview-panel" aria-labelledby="preview-title">
    <h2 id="preview-title">实时预览</h2>
    <section class="form-canvas" aria-labelledby="form-title">
      <h3 id="form-title">{{ formSchema.title }}</h3>
      <ElForm>
        <ElFormItem
          v-for="field in formSchema.fields"
          :key="field.id"
          :label="field.label"
          :required="field.required"
        >
          <FormFieldRenderer
            :field="field"
            :model-value="formValues[field.id]"
            @update:model-value="(v) => updateFormValue(field.id, v)"
          />
        </ElFormItem>
      </ElForm>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'
import { ElForm, ElFormItem } from 'element-plus'

import { useFormEditorStore } from '@/stores/form-editor.ts'

const formEditorStore = useFormEditorStore()
const { formSchema, formValues } = storeToRefs(formEditorStore)
const { updateFormValue } = formEditorStore
</script>

<style scoped lang="scss"></style>
