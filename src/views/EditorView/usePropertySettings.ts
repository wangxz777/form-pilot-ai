import { computed, type Ref } from 'vue'

import {
  formFieldSchema,
  type FormField,
  type NumberField,
  type TextField,
  type TextareaField,
  type FieldOption,
  type RadioField,
  type SelectField,
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

export type OptionsSetting = {
  id: string
  label: string
  control: 'options'
  options: FieldOption[]
  errors: Array<string | undefined>
  onAdd: () => void
  onUpdateLabel: (optionValue: string, label: string) => void
  onRemove: (optionValue: string) => void
}

export type PropertySetting = TextSetting | BooleanSetting | NumberSetting | OptionsSetting

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
  addFieldOption: (fieldId: string) => void
  updateFieldOptionLabel: (fieldId: string, optionValue: string, label: string) => void
  removeFieldOption: (fieldId: string, optionValue: string) => void
}

function getConstraintError(field: FormField, path: 'maxLength' | 'max'): string | undefined {
  const result = formFieldSchema.safeParse(field)

  if (result.success) return undefined

  return result.error.issues.find((issue) => issue.path[0] === path)?.message
}

function createBaseSettings(field: FormField, actions: PropertySettingActions): PropertySetting[] {
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
      onUpdate: (value) => actions.updateTextFieldConstraints(field.id, { minLength: value }),
    },
    {
      id: 'maxLength',
      label: '最大长度',
      control: 'number',
      modelValue: field.maxLength,
      min: 0,
      error: getConstraintError(field, 'maxLength'),
      onUpdate: (value) => actions.updateTextFieldConstraints(field.id, { maxLength: value }),
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

function getOptionErrors(field: SelectField | RadioField): Array<string | undefined> {
  const result = formFieldSchema.safeParse(field)
  const errors: Array<string | undefined> = []

  if (result.success) return errors

  result.error.issues.forEach((issue) => {
    const [property, index, optionProperty] = issue.path

    if (property === 'options' && typeof index === 'number' && optionProperty === 'label') {
      errors[index] = issue.message
    }
  })

  return errors
}

function createOptionsSetting(
  field: SelectField | RadioField,
  actions: PropertySettingActions
): OptionsSetting {
  return {
    id: 'options',
    label: '选项设置',
    control: 'options',
    options: field.options,
    errors: getOptionErrors(field),
    onAdd: () => actions.addFieldOption(field.id),
    onUpdateLabel: (optionValue, label) =>
      actions.updateFieldOptionLabel(field.id, optionValue, label),
    onRemove: (optionValue) => actions.removeFieldOption(field.id, optionValue),
  }
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

    if (field.type === 'select' || field.type === 'radio') {
      return [...baseSettings, createOptionsSetting(field, actions)]
    }

    return baseSettings
  })

  return { settings }
}
