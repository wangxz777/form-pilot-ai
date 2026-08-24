<template>
  <main class="preview-panel" aria-labelledby="preview-title">
    <h2 id="preview-title">实时预览</h2>
    <section class="form-canvas" aria-labelledby="form-title">
      <h3 id="form-title">求职申请表</h3>
      <template v-for="field in formSchema.fields" :key="field.id">
        <FormFieldRenderer :field="field" v-model="formValues[field.id]" />
      </template>
    </section>
  </main>
</template>

<script lang="ts" setup>
import FormFieldRenderer from '@/components/formRenderer/FormFieldRenderer.vue'

import type { FormSchema, FormValue } from '@/types/form-schema.ts'
defineProps<{
  formSchema: FormSchema
  formValues: Record<string, FormValue>
}>()
</script>

<style scoped lang="scss"></style>
