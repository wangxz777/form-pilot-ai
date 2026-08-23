import { describe, it, expect } from 'vitest'
import { formSchema, textFieldSchema, numberFieldSchema } from './form-schema'

describe('textFieldSchema', () => {
  it('验证文字表单', () => {
    const result = textFieldSchema.safeParse({
      id: '1',
      label: 'Name',
      type: 'text',
      required: true,
    })
    expect(result.success).toBe(true)
  })

  it('验证minLength和maxLength', () => {
    const result = textFieldSchema.safeParse({
      id: '1',
      label: 'Name',
      type: 'text',
      minLength: 5,
      maxLength: 3,
    })

    const result2 = textFieldSchema.safeParse({
      id: '1',
      label: 'Name',
      type: 'text',
      minLength: 3,
      maxLength: 5,
    })

    const result3 = textFieldSchema.safeParse({
      id: '1',
      label: 'Name',
      type: 'text',
      minLength: -1,
      maxLength: 5,
    })

    const result4 = textFieldSchema.safeParse({
      id: '1',
      label: 'Name',
      type: 'text',
      minLength: 1,
      maxLength: 1.5,
    })

    expect(result.success).toBe(false)
    expect(result2.success).toBe(true)
    expect(result3.success).toBe(false)
    expect(result4.success).toBe(false)
  })
})

describe('numberFieldSchema', () => {
  it('验证数字表单', () => {
    const result = numberFieldSchema.safeParse({
      id: '1',
      label: 'Age',
      type: 'number',
      required: true,
    })
    expect(result.success).toBe(true)
  })

  it('验证min和max', () => {
    const result = numberFieldSchema.safeParse({
      id: '1',
      label: 'Age',
      type: 'number',
      min: 5,
      max: 3,
    })

    const result2 = numberFieldSchema.safeParse({
      id: '1',
      label: 'Age',
      type: 'number',
      min: 3,
      max: 5,
    })

    const result3 = numberFieldSchema.safeParse({
      id: '1',
      label: 'Age',
      type: 'number',
      min: 1,
      max: Number.POSITIVE_INFINITY,
    })

    expect(result.success).toBe(false)
    expect(result2.success).toBe(true)
    expect(result3.success).toBe(false)
  })
})

describe('formSchema', () => {
  it('验证schemaVersion', () => {
    const result = formSchema.safeParse({
      schemaVersion: '1',
      title: 'Sample Form',
      fields: [
        {
          id: '1',
          label: 'Name',
          type: 'text',
          required: true,
        },
        {
          id: '2',
          label: 'Age',
          type: 'number',
          required: false,
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('验证text，number类型', () => {
    const result = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [
        {
          id: '1',
          label: 'Name',
          type: 'text',
          required: true,
        },
        {
          id: '2',
          label: 'Age',
          type: 'number',
          required: false,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('字段 ID 唯一时验证成功', () => {
    const result = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [
        {
          id: 'name',
          label: 'Name',
          type: 'text',
        },
        {
          id: 'age',
          label: 'Age',
          type: 'number',
        },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('字段 ID 重复时验证失败并定位重复字段', () => {
    const result = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [
        {
          id: 'contact',
          label: 'Name',
          type: 'text',
        },
        {
          id: 'contact',
          label: 'Age',
          type: 'number',
        },
      ],
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['fields', 1, 'id'])
    }
  })

  it('验证fields字段', () => {
    const result = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [
        {
          id: '1',
          label: 'Name',
          type: 'textarea',
          required: true,
        },
      ],
    })

    const result2 = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
      fields: [],
    })

    const result3 = formSchema.safeParse({
      schemaVersion: 1,
      title: 'Sample Form',
    })

    expect(result.success).toBe(false)
    expect(result2.success).toBe(true)
    expect(result3.success).toBe(false)
  })
})
