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

export interface TextareaField extends BaseField {
  type: 'textarea'
  placeholder?: string
  minLength?: number
  maxLength?: number
}

export interface RadioField extends BaseField {
  type: 'radio'
  options: SelectOption[]
}

export interface CheckboxField extends BaseField {
  type: 'checkbox'
}

export interface DateField extends BaseField {
  type: 'date'
}

export type FormField =
  | TextField
  | NumberField
  | SelectField
  | TextareaField
  | RadioField
  | CheckboxField
  | DateField

export type FieldType = FormField['type']

export interface FormSchema {
  id: string
  title: string
  fields: FormField[]
}
