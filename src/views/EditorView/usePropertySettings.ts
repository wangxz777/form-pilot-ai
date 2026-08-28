import { computed, type Ref } from 'vue'

import {
  formFieldSchema,
  type FormField,
  type NumberField,
  type TextField,
  type TextareaField,
} from '@/types/form-schema'

export type TextSetting = {
  id: string
  label: string
  control: 'text'
  modelValue: string
  readonly?: boolean
  onUpdate?: (value: string) => void
}

export type BooleanSetting = {
  id: string
  label: string
  control: 'boolean'
  modelValue: boolean
  onUpdate: (value: boolean) => void
}

export type NumberSetting = {
  id: string
  label: string
  control: 'number'
  modelValue: number | undefined
  min?: number
  error?: string
  onUpdate: (value: number | undefined) => void
}

export type PropertySetting = TextSetting | BooleanSetting | NumberSetting

export type PropertySettingActions = {
  updateFieldProperties: (
    fieldId: string,
    properties: Partial<Pick<FormField, 'label' | 'required'>>
  ) => void
  updateTextFieldConstraints: (
    fieldId: string,
    constraints: { minLength?: number; maxLength?: number }
  ) => void
  updateNumberFieldConstraints: (
    fieldId: string,
    constraints: { min?: number; max?: number }
  ) => void
}

function getConstraintError(
  field: FormField,
  path: 'maxLength' | 'max'
): string | undefined {
  const result = formFieldSchema.safeParse(field)

  if (result.success) return undefined

  return result.error.issues.find((issue) => issue.path[0] === path)?.message
}

function createBaseSettings(
  field: FormField,
  actions: PropertySettingActions
): PropertySetting[] {
  return [
    {
      id: 'label',
      label: '字段名称',
      control: 'text',
      modelValue: field.label,
      onUpdate: (value) => actions.updateFieldProperties(field.id, { label: value }),
    },
    {
      id: 'id',
      label: '字段 ID',
      control: 'text',
      modelValue: field.id,
      readonly: true,
    },
    {
      id: 'type',
      label: '字段类型',
      control: 'text',
      modelValue: field.type,
      readonly: true,
    },
    {
      id: 'required',
      label: '是否必填',
      control: 'boolean',
      modelValue: field.required ?? false,
      onUpdate: (value) => actions.updateFieldProperties(field.id, { required: value }),
    },
  ]
}

function createTextSettings(
  field: TextField | TextareaField,
  actions: PropertySettingActions
): NumberSetting[] {
  return [
    {
      id: 'minLength',
      label: '最小长度',
      control: 'number',
      modelValue: field.minLength,
      min: 0,
      onUpdate: (value) =>
        actions.updateTextFieldConstraints(field.id, { minLength: value }),
    },
    {
      id: 'maxLength',
      label: '最大长度',
      control: 'number',
      modelValue: field.maxLength,
      min: 0,
      error: getConstraintError(field, 'maxLength'),
      onUpdate: (value) =>
        actions.updateTextFieldConstraints(field.id, { maxLength: value }),
    },
  ]
}

function createNumberSettings(
  field: NumberField,
  actions: PropertySettingActions
): NumberSetting[] {
  return [
    {
      id: 'min',
      label: '最小值',
      control: 'number',
      modelValue: field.min,
      onUpdate: (value) => actions.updateNumberFieldConstraints(field.id, { min: value }),
    },
    {
      id: 'max',
      label: '最大值',
      control: 'number',
      modelValue: field.max,
      error: getConstraintError(field, 'max'),
      onUpdate: (value) => actions.updateNumberFieldConstraints(field.id, { max: value }),
    },
  ]
}

export function usePropertySettings(
  selectedField: Ref<FormField | null>,
  actions: PropertySettingActions
) {
  const settings = computed<PropertySetting[]>(() => {
    const field = selectedField.value

    if (!field) return []

    const baseSettings = createBaseSettings(field, actions)

    if (field.type === 'text' || field.type === 'textarea') {
      return [...baseSettings, ...createTextSettings(field, actions)]
    }

    if (field.type === 'number') {
      return [...baseSettings, ...createNumberSettings(field, actions)]
    }

    return baseSettings
  })

  return { settings }
}
