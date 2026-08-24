<template>
  <ElSelect v-model="selectValue" :placeholder="`请选择${field.label}`" :aria-label="field.label">
    <ElOption
      v-for="item in field.options"
      :label="item.label"
      :value="item.value"
      :key="item.value"
    ></ElOption>
  </ElSelect>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElOption, ElSelect } from 'element-plus'
import type { SelectField, FormValue } from '@/types/form-schema'
defineProps<{
  field: SelectField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const selectValue = computed<string>({
  get: () => (typeof modelValue.value === 'string' ? modelValue.value : ''),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped lang="scss"></style>
