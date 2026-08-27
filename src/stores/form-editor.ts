import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'

import type { FormSchema, FormValue } from '@/types/form-schema'
import { createFormValues } from '@/utils/form-values'
import { jobApplicationSchema } from '@/data/job-application-schema'

import type { FormField } from '@/types/form-schema'

type EditableFieldProperties = Partial<Pick<FormField, 'label' | 'required'>>

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

  return {
    formSchema,
    formValues,
    selectedFieldId,
    selectedField,
    updateFormValue,
    selectField,
    updateFieldProperties,
  }
})
