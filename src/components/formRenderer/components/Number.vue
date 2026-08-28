<template>
  <ElInputNumber
    v-model="numberValue"
    align="left"
    :aria-label="field.label"
    :max="field.max"
    :min="field.min"
    :placeholder="`请输入${field.label}`"
    class="number-control"
    controls-position="right"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElInputNumber } from 'element-plus'
import type { FormValue, NumberField } from '@/types/form-schema'

defineProps<{
  field: NumberField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const numberValue = computed<number | undefined>({
  get: () => (typeof modelValue.value === 'number' ? modelValue.value : undefined),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped>
.number-control {
  width: 100%;
}
</style>
