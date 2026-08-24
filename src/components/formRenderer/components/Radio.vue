<template>
  <ElRadioGroup v-model="radioValue" :aria-label="field.label">
    <ElRadio v-for="option in field.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </ElRadio>
  </ElRadioGroup>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElRadioGroup, ElRadio } from 'element-plus'
import type { RadioField, FormValue } from '@/types/form-schema'
defineProps<{
  field: RadioField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const radioValue = computed<string>({
  get: () => (typeof modelValue.value === 'string' ? modelValue.value : ''),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped lang="scss"></style>
