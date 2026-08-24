import { describe, expect, it } from 'vitest'
import {
  formSchema,
  numberFieldSchema,
  radioFieldSchema,
  selectFieldSchema,
  textFieldSchema,
  textareaFieldSchema,
} from './form-schema'

describe('textFieldSchema', () => {
  it('验证文本长度范围', () => {
    const valid = textFieldSchema.safeParse({
      id: 'name',
      label: 'Name',
      type: 'text',
      minLength: 3,
      maxLength: 20,
    })
    const reversed = textFieldSchema.safeParse({
      id: 'name',
      label: 'Name',
      type: 'text',
      minLength: 20,
      maxLength: 3,
    })
    const invalidLength = textFieldSchema.safeParse({
      id: 'name',
      label: 'Name',
      type: 'text',
      minLength: -1,
      maxLength: 1.5,
    })

    expect(valid.success).toBe(true)
    expect(reversed.success).toBe(false)
    expect(invalidLength.success).toBe(false)
  })
})

describe('textareaFieldSchema', () => {
  it('验证多行文本长度范围', () => {
    const valid = textareaFieldSchema.safeParse({
      id: 'description',
      label: 'Description',
      type: 'textarea',
      minLength: 10,
      maxLength: 200,
    })
    const invalid = textareaFieldSchema.safeParse({
      id: 'description',
      label: 'Description',
      type: 'textarea',
      minLength: 200,
      maxLength: 10,
    })

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

describe('numberFieldSchema', () => {
  it('验证数字范围', () => {
    const valid = numberFieldSchema.safeParse({
      id: 'age',
      label: 'Age',
      type: 'number',
      min: 18,
      max: 65,
    })
    const reversed = numberFieldSchema.safeParse({
      id: 'age',
      label: 'Age',
      type: 'number',
      min: 65,
      max: 18,
    })
    const infinite = numberFieldSchema.safeParse({
      id: 'age',
      label: 'Age',
      type: 'number',
      max: Number.POSITIVE_INFINITY,
    })

    expect(valid.success).toBe(true)
    expect(reversed.success).toBe(false)
    expect(infinite.success).toBe(false)
  })
})

describe('option field schemas', () => {
  it('验证 select 和 radio 的选项约束', () => {
    const validSelect = selectFieldSchema.safeParse({
      id: 'department',
      label: 'Department',
      type: 'select',
      options: [{ label: 'Engineering', value: 'engineering' }],
    })
    const emptySelect = selectFieldSchema.safeParse({
      id: 'department',
      label: 'Department',
      type: 'select',
      options: [],
    })
    const validRadio = radioFieldSchema.safeParse({
      id: 'employment-type',
      label: 'Employment Type',
      type: 'radio',
      options: [{ label: 'Full-time', value: 'full-time' }],
    })
    const blankRadioOption = radioFieldSchema.safeParse({
      id: 'employment-type',
      label: 'Employment Type',
      type: 'radio',
      options: [{ label: 'Full-time', value: '   ' }],
    })

    expect(validSelect.success).toBe(true)
    expect(emptySelect.success).toBe(false)
    expect(validRadio.success).toBe(true)
    expect(blankRadioOption.success).toBe(false)
  })
})

describe('formSchema', () => {
  it('验证整表核心契约', () => {
    const validForm = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [
        { id: '1', label: 'Name', type: 'text' },
        { id: '2', label: 'Age', type: 'number' },
        { id: '3', label: 'Description', type: 'textarea' },
        { id: '4', label: 'Agreement', type: 'checkbox' },
        { id: '5', label: 'Start Date', type: 'date' },
        {
          id: '6',
          label: 'Department',
          type: 'select',
          options: [{ label: 'Engineering', value: 'engineering' }],
        },
        {
          id: '7',
          label: 'Employment Type',
          type: 'radio',
          options: [{ label: 'Full-time', value: 'full-time' }],
        },
      ],
    })
    const emptyForm = formSchema.safeParse({ schemaVersion: 1, title: 'Empty Form', fields: [] })
    const wrongVersion = formSchema.safeParse({ schemaVersion: '1', title: 'Form', fields: [] })
    const missingFields = formSchema.safeParse({ schemaVersion: 1, title: 'Form' })
    const unsupportedField = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Form',
      fields: [{ id: '1', label: 'Unknown', type: 'unsupported' }],
    })
    const duplicateId = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Form',
      fields: [
        { id: 'contact', label: 'Name', type: 'text' },
        { id: 'contact', label: 'Age', type: 'number' },
      ],
    })

    expect(validForm.success).toBe(true)
    expect(emptyForm.success).toBe(true)
    expect(wrongVersion.success).toBe(false)
    expect(missingFields.success).toBe(false)
    expect(unsupportedField.success).toBe(false)
    expect(duplicateId.success).toBe(false)

    if (!duplicateId.success) {
      expect(duplicateId.error.issues[0]?.path).toEqual(['fields', 1, 'id'])
    }
  })
})
