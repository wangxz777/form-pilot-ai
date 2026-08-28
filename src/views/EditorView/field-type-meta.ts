import type { FormField } from '@/types/form-schema'

export type FieldTypeMeta = {
  type: FormField['type']
  label: string
  description: string
  icon: string
}

export const fieldTypeMeta: Record<FormField['type'], FieldTypeMeta> = {
  text: {
    type: 'text',
    label: '文本输入',
    description: '单行文本内容',
    icon: 'field-text',
  },
  number: {
    type: 'number',
    label: '数字输入',
    description: '数值与范围',
    icon: 'field-number',
  },
  textarea: {
    type: 'textarea',
    label: '多行文本',
    description: '较长的文本内容',
    icon: 'field-textarea',
  },
  select: {
    type: 'select',
    label: '下拉选择',
    description: '从列表中选择一项',
    icon: 'field-select',
  },
  radio: {
    type: 'radio',
    label: '单选框',
    description: '平铺显示单选项',
    icon: 'field-radio',
  },
  checkbox: {
    type: 'checkbox',
    label: '复选框',
    description: '是或否的选项',
    icon: 'field-checkbox',
  },
  date: {
    type: 'date',
    label: '日期',
    description: '选择一个日期',
    icon: 'field-date',
  },
}

export const fieldTypeOptions = Object.values(fieldTypeMeta)
