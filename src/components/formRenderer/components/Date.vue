<template>
  <ElDatePicker
    v-model="dateValue"
    :placeholder="`请选择${field.label}`"
    type="date"
    value-format="YYYY-MM-DD"
    :aria-label="field.label"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { FormValue, DateField } from '@/types/form-schema'
import { ElDatePicker } from 'element-plus'

defineProps<{
  field: DateField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const dateValue = computed<string>({
  get: () => (typeof modelValue.value === 'string' ? modelValue.value : ''),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped lang="scss"></style>
