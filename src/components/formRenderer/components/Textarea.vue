<template>
  <ElInput
    v-model="textValue"
    type="textarea"
    :aria-label="field.label"
    :maxlength="field.maxLength"
    :minlength="field.minLength"
    :placeholder="`请输入${field.label}`"
    :show-word-limit="field.maxLength !== undefined"
    clearable
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { FormValue, TextareaField } from '@/types/form-schema'
import { ElInput } from 'element-plus'

defineProps<{
  field: TextareaField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const textValue = computed<string>({
  get: () => (typeof modelValue.value === 'string' ? modelValue.value : ''),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped lang="scss"></style>
