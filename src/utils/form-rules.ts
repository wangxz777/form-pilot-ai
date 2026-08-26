import type { FormItemRule, FormRules } from 'element-plus'

import type { FormField } from '@/types/form-schema'

const requiredRule = (label: string): FormItemRule => ({
  required: true,
  message: `请填写${label}`,
  trigger: ['blur', 'change'],
})

export function createFormRules(fields: FormField[]): FormRules {
  return fields.reduce<FormRules>((rules, field) => {
    if (field.required) {
      rules[field.id] = [requiredRule(field.label)]
    }
    return rules
  }, {})
}
