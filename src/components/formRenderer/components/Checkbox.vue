<template>
  <ElCheckbox v-model="checkboxValue" :aria-label="field.label" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElCheckbox } from 'element-plus'
import type { CheckboxField, FormValue } from '@/types/form-schema'
defineProps<{ field: CheckboxField }>()

const modelValue = defineModel<FormValue>({ required: true })

const checkboxValue = computed<boolean>({
  get: () => (typeof modelValue.value === 'boolean' ? modelValue.value : false),
  set: (value) => {
    modelValue.value = value
  },
})
</script>

<style scoped lang="scss"></style>
