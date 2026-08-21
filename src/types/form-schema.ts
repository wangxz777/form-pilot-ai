export interface BaseField {
  id: string
  label: string
  required?: boolean
}

export interface TextField extends BaseField {
  type: 'text'
  placeholder?: string
  minLength?: number
  maxLength?: number
}

export interface NumberField extends BaseField {
  type: 'number'
  placeholder?: string
  min?: number
  max?: number
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectField extends BaseField {
  type: 'select'
  placeholder?: string
  options: SelectOption[]
}

export type FormField = TextField | NumberField | SelectField

export type FieldType = FormField['type']

export interface FormSchema {
  id: string
  title: string
  fields: FormField[]
}
