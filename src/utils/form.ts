import type { FormField, FormSchema } from '@/types/form-schema'

export function getDefaultValue(field: FormField): string | number | boolean | undefined {
  switch (field.type) {
    case 'text':
      return ''
    case 'number':
      return 0
    case 'select':
      return undefined
    case 'textarea':
      return ''
    case 'radio':
      return undefined
    case 'checkbox':
      return false
    case 'date':
      return ''
    default:
      return undefined
  }
}

export function getFieldSummary(field: FormField): string {
  switch (field.type) {
    case 'text':
      return `文本输入`
    case 'number':
      return `数字输入`
    case 'select':
      return `下拉选择（${field.options.length} 个选项）`
    case 'textarea':
      return `多行文本输入`
    case 'radio':
      return `单选（${field.options.length} 个选项）`
    case 'checkbox':
      return `复选框`
    case 'date':
      return `日期选择`
    default:
      return ``
  }
}

export type FormValues = Record<string, string | number | boolean | undefined>

export type FormErrors = Record<string, string>

export function validateField(
  field: FormField,
  value: string | number | undefined | boolean
): string | undefined {
  const isEmpty = value === undefined || (typeof value === 'string' && value.trim() === '')

  if (isEmpty) {
    return field.required ? `${field.label} 为必填项` : undefined
  }

  if (field.type === 'text') {
    if (field.maxLength !== undefined) {
      if (typeof value === 'string' && value.length > field.maxLength) {
        return `${field.label} 不能超过 ${field.maxLength} 个字符`
      }
    }

    if (field.minLength !== undefined) {
      if (typeof value === 'string' && value.length < field.minLength) {
        return `${field.label} 不能少于 ${field.minLength} 个字符`
      }
    }
  }

  if (field.type === 'number') {
    if (field.max !== undefined) {
      if (typeof value === 'number' && value > field.max) {
        return `${field.label} 不能大于 ${field.max}`
      }
    }

    if (field.min !== undefined) {
      if (typeof value === 'number' && value < field.min) {
        return `${field.label} 不能小于 ${field.min}`
      }
    }
  }

  if (field.type === 'textarea') {
    if (field.maxLength !== undefined) {
      if (typeof value === 'string' && value.length > field.maxLength) {
        return `${field.label} 不能超过 ${field.maxLength} 个字符`
      }
    }

    if (field.minLength !== undefined) {
      if (typeof value === 'string' && value.length < field.minLength) {
        return `${field.label} 不能少于 ${field.minLength} 个字符`
      }
    }
  }

  if (field.type === 'checkbox') {
    if (field.required && value !== true) {
      return `${field.label} 必须被选中`
    }
  }
  return undefined
}

export function validateForm(schema: FormSchema, values: FormValues): FormErrors {
  const errors: FormErrors = {}

  for (const field of schema.fields) {
    const value = values[field.id]
    const error = validateField(field, value)
    if (error) {
      errors[field.id] = error
    }
  }

  return errors
}
