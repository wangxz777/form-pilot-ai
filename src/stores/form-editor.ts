import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'

import type { FormSchema, FormValue } from '@/types/form-schema'
import { createFormValues, getDefaultValue } from '@/utils/form-values'
import { jobApplicationSchema } from '@/data/job-application-schema'

import type { FormField } from '@/types/form-schema'

type EditableFieldProperties = Partial<Pick<FormField, 'label' | 'required'>>

const fieldLabels: Record<FormField['type'], string> = {
  text: '单行文本',
  number: '数字',
  textarea: '多行文本',
  select: '下拉选择',
  radio: '单选',
  checkbox: '复选框',
  date: '日期',
}
function createField(type: FormField['type']): FormField {
  const baseField = {
    id: crypto.randomUUID(),
    label: fieldLabels[type],
    required: false,
  }

  switch (type) {
    case 'text':
      return {
        ...baseField,
        type: 'text',
      }

    case 'number':
      return {
        ...baseField,
        type: 'number',
      }

    case 'textarea':
      return {
        ...baseField,
        type: 'textarea',
      }

    case 'select':
      return {
        ...baseField,
        type: 'select',
        options: [{ label: '选项 1', value: 'option-1' }],
      }

    case 'radio':
      return {
        ...baseField,
        type: 'radio',
        options: [{ label: '选项 1', value: 'option-1' }],
      }

    case 'checkbox':
      return {
        ...baseField,
        type: 'checkbox',
      }

    case 'date':
      return {
        ...baseField,
        type: 'date',
      }
  }
}
export const useFormEditorStore = defineStore('formEditor', () => {
  const formSchema = reactive<FormSchema>(jobApplicationSchema)

  const formValues = reactive<Record<string, FormValue>>(createFormValues(formSchema.fields))

  const selectedFieldId = ref<string | null>(null)

  const selectedField = computed(() => {
    return formSchema.fields.find((field) => field.id === selectedFieldId.value) ?? null
  })

  function updateFormValue(fieldId: string, value: FormValue) {
    formValues[fieldId] = value
  }

  function selectField(fieldId: string) {
    selectedFieldId.value = fieldId
  }

  function updateFieldProperties(fieldId: string, properties: EditableFieldProperties) {
    const field = formSchema.fields.find((field) => field.id === fieldId)

    if (!field) return

    Object.assign(field, properties)
  }

  function addField(type: FormField['type']) {
    const newField = createField(type)
    formSchema.fields.push(newField)
    formValues[newField.id] = getDefaultValue(newField)
    selectField(newField.id)
  }

  function removeField(fieldId: string) {
    formSchema.fields = formSchema.fields.filter((field) => field.id !== fieldId)
    if (selectedFieldId.value === fieldId) {
      selectedFieldId.value = null
    }
    delete formValues[fieldId]
  }

  function moveField(oldIndex: number, newIndex: number) {
    if (
      oldIndex === newIndex ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= formSchema.fields.length ||
      newIndex >= formSchema.fields.length
    ) {
      return
    }

    const [field] = formSchema.fields.splice(oldIndex, 1)
    if (!field) return

    formSchema.fields.splice(newIndex, 0, field)
  }

  return {
    formSchema,
    formValues,
    selectedFieldId,
    selectedField,
    updateFormValue,
    selectField,
    updateFieldProperties,
    addField,
    removeField,
    moveField,
  }
})
