import type { FormField, FormValue } from '@/types/form-schema'

export function getDefaultValue(field: FormField): FormValue {
  if (field.type === 'number') {
    return undefined
  }
  if (field.type === 'checkbox') {
    return false
  }
  return ''
}

export function createFormValues(fields: FormField[]): Record<string, FormValue> {
  return fields.reduce<Record<string, FormValue>>((acc, field) => {
    acc[field.id] = getDefaultValue(field)
    return acc
  }, {})
}
