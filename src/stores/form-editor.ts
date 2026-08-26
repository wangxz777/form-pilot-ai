import { defineStore } from 'pinia'
import { reactive } from 'vue'

import type { FormSchema, FormValue } from '@/types/form-schema'
import { createFormValues } from '@/utils/form-values'
import { jobApplicationSchema } from '@/data/job-application-schema'
export const useFormEditorStore = defineStore('formEditor', () => {
  const formSchema = reactive<FormSchema>(jobApplicationSchema)

  const formValues = reactive<Record<string, FormValue>>(createFormValues(formSchema.fields))

  function updateFormValue(fieldId: string, value: FormValue) {
    formValues[fieldId] = value
  }

  return {
    formSchema,
    formValues,
    updateFormValue,
  }
})
