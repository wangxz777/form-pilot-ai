<template>
  <component :is="renderComponent(field)" v-model="modelValue" :field="field" />
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import TextControl from './components/Text.vue'
import NumberControl from './components/Number.vue'
import CheckboxControl from './components/Checkbox.vue'
import DateControl from './components/Date.vue'
import TextareaControl from './components/Textarea.vue'
import SelectControl from './components/Select.vue'
import RadioControl from './components/Radio.vue'

import type { FormField, FormValue } from '@/types/form-schema.ts'

defineProps<{
  field: FormField
}>()

const modelValue = defineModel<FormValue>({ required: true })

const renderComponent = (field: FormField): Component | null => {
  switch (field.type) {
    case 'text':
      return TextControl
    case 'number':
      return NumberControl
    case 'checkbox':
      return CheckboxControl
    case 'date':
      return DateControl
    case 'textarea':
      return TextareaControl
    case 'select':
      return SelectControl
    case 'radio':
      return RadioControl
    default:
      return null
  }
}
</script>
