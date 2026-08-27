import type { FormItemRule, FormRules } from 'element-plus'

import type { FormField } from '@/types/form-schema'

const requiredRule = (label: string): FormItemRule => ({
  required: true,
  message: `请填写${label}`,
  trigger: ['blur', 'change'],
})

const checkboxRequiredRule = (label: string): FormItemRule => ({
  required: true,
  type: 'enum',
  enum: [true],
  message: `请勾选${label}`,
  trigger: ['change'],
})

const textLengthRule = (label: string, minLength?: number, maxLength?: number): FormItemRule[] => {
  const rules: FormItemRule[] = []

  if (minLength !== undefined) {
    rules.push({
      min: minLength,
      message: `${label}至少输入 ${minLength} 个字符`,
      trigger: ['blur'],
    })
  }

  if (maxLength !== undefined) {
    rules.push({
      max: maxLength,
      message: `${label}最多输入 ${maxLength} 个字符`,
      trigger: ['blur'],
    })
  }

  return rules
}

const numberRule = (label: string, min?: number, max?: number): FormItemRule[] => {
  const rules: FormItemRule[] = []

  if (min !== undefined) {
    rules.push({
      type: 'number',
      min: min,
      message: `${label}最小值为 ${min}`,
      trigger: ['blur'],
    })
  }

  if (max !== undefined) {
    rules.push({
      type: 'number',
      max: max,
      message: `${label}最大值为 ${max}`,
      trigger: ['blur'],
    })
  }

  return rules
}

export function createFormRules(fields: FormField[]): FormRules {
  return fields.reduce<FormRules>((rules, field) => {
    const fieldRules: FormItemRule[] = []

    if (field.required && field.type === 'checkbox') {
      fieldRules.push(checkboxRequiredRule(field.label))
    } else if (field.required) {
      fieldRules.push(requiredRule(field.label))
    }

    if (field.type === 'text' || field.type === 'textarea') {
      fieldRules.push(...textLengthRule(field.label, field.minLength, field.maxLength))
    }

    if (field.type === 'number') {
      fieldRules.push(...numberRule(field.label, field.min, field.max))
    }

    if (fieldRules.length > 0) {
      rules[field.id] = fieldRules
    }

    return rules
  }, {})
}
