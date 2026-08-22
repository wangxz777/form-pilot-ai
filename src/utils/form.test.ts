import { describe, expect, it } from 'vitest'

import { validateField, validateForm, getDefaultValue, getFieldSummary } from './form'
import { jobApplicationSchema } from '@/data/job-application-schema'
import type {
  TextField,
  NumberField,
  SelectField,
  CheckboxField,
  DateField,
  RadioField,
  TextareaField,
  FormSchema,
} from '@/types/form-schema'
import { FormSchemaSchema } from '@/types/form-schema'
describe('getDefaultValue', () => {
  it('各类型Field默认值', () => {
    const textField: TextField = { id: 'field1', label: 'Field 1', type: 'text' }
    expect(getDefaultValue(textField)).toBe('')

    const selectField: SelectField = {
      id: 'field3',
      label: 'Field 3',
      type: 'select',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    }
    expect(getDefaultValue(selectField)).toBeUndefined()

    const checkboxField: CheckboxField = { id: 'field4', label: 'Field 4', type: 'checkbox' }
    expect(getDefaultValue(checkboxField)).toBe(false)

    const dateField: DateField = { id: 'field5', label: 'Field 5', type: 'date' }
    expect(getDefaultValue(dateField)).toBe('')

    const RadioField: RadioField = {
      id: 'field6',
      label: 'Field 6',
      type: 'radio',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    }
    expect(getDefaultValue(RadioField)).toBeUndefined()

    const TextareaField: TextareaField = {
      id: 'field7',
      label: 'Field 7',
      type: 'textarea',
    }
    expect(getDefaultValue(TextareaField)).toBe('')
  })

  it('number 默认值为 undefined，防止空输入被误当作 0', () => {
    const numberField: NumberField = { id: 'field2', label: 'Field 2', type: 'number' }

    expect(getDefaultValue(numberField)).toBeUndefined()
  })
})

describe('getFieldSummary', () => {
  it('下拉摘要包含真实选项数量', () => {
    const field: SelectField = {
      id: 'position',
      label: '应聘岗位',
      type: 'select',
      options: [
        { label: '前端', value: 'frontend' },
        { label: '后端', value: 'backend' },
      ],
    }

    const result = getFieldSummary(field)

    expect(result).toBe('下拉选择（2 个选项）')
  })
})

describe('validateForm', () => {
  it('验证表单', () => {
    const schema: FormSchema = {
      schemaVersion: 1,
      id: 'job-application',
      title: 'Job Application',
      fields: [
        { id: 'name', label: '姓名', type: 'text', required: true },
        { id: 'age', label: '年龄', type: 'number', required: true, min: 18 },
        {
          id: 'position',
          label: '应聘岗位',
          type: 'select',
          required: true,
          options: [
            { label: '前端', value: 'frontend' },
            { label: '后端', value: 'backend' },
          ],
        },
      ],
    }

    const values = {
      name: '',
      age: 16,
      position: undefined,
    }

    const errors = validateForm(schema, values)

    expect(errors).toEqual({
      name: '姓名 为必填项',
      age: '年龄 不能小于 18',
      position: '应聘岗位 为必填项',
    })
  })
})

describe('FormSchemaSchema', () => {
  it('可解析静态求职表单 schema，防止其结构漂移', () => {
    expect(FormSchemaSchema.safeParse(jobApplicationSchema).success).toBe(true)
  })

  it('拒绝重复字段 ID，防止表单值互相覆盖', () => {
    const schema = {
      schemaVersion: 1,
      id: 'duplicate-id',
      title: 'Duplicate ID',
      fields: [
        { id: 'name', label: '姓名', type: 'text' },
        { id: 'name', label: '另一个姓名', type: 'text' },
      ],
    }

    expect(FormSchemaSchema.safeParse(schema).success).toBe(false)
  })

  it('拒绝没有选项的 select，防止无法选择的字段进入渲染器', () => {
    const schema = {
      schemaVersion: 1,
      id: 'empty-options',
      title: 'Empty options',
      fields: [{ id: 'position', label: '岗位', type: 'select', options: [] }],
    }

    expect(FormSchemaSchema.safeParse(schema).success).toBe(false)
  })

  it('拒绝反向 number min/max，防止不可能满足的范围进入渲染器', () => {
    const schema = {
      schemaVersion: 1,
      id: 'inverted-range',
      title: 'Inverted range',
      fields: [{ id: 'age', label: '年龄', type: 'number', min: 120, max: 0 }],
    }

    expect(FormSchemaSchema.safeParse(schema).success).toBe(false)
  })
})

describe('validateField', () => {
  it('必填文本拒绝纯空格', () => {
    const requiredField: TextField = {
      id: 'field1',
      label: 'Field 1',
      type: 'text',
      required: true,
    }
    expect(validateField(requiredField, ' ')).toBe('Field 1 为必填项')
  })

  it('可选文本允许空字符串', () => {
    const unRequiredField: TextField = {
      id: 'field1',
      label: 'Field 1',
      type: 'text',
      required: false,
    }
    expect(validateField(unRequiredField, ' ')).toBeUndefined()
  })

  it('数字 0 不触发必填错误', () => {
    const requiredField: NumberField = {
      id: 'field2',
      label: 'Field 2',
      type: 'number',
      required: true,
    }
    expect(validateField(requiredField, 0)).toBeUndefined()
  })

  it('校验文本最小和最大长度边界', () => {
    const field: TextField = {
      id: 'username',
      label: '用户名',
      type: 'text',
      minLength: 2,
      maxLength: 4,
    }

    expect(validateField(field, 'a')).toBe('用户名 不能少于 2 个字符')
    expect(validateField(field, 'ab')).toBeUndefined()
    expect(validateField(field, 'abcd')).toBeUndefined()
    expect(validateField(field, 'abcde')).toBe('用户名 不能超过 4 个字符')
  })

  it('校验数字最小和最大值边界', () => {
    const field: NumberField = {
      id: 'age',
      label: '年龄',
      type: 'number',
      min: 0,
      max: 120,
    }

    expect(validateField(field, -1)).toBe('年龄 不能小于 0')
    expect(validateField(field, 0)).toBeUndefined()
    expect(validateField(field, 120)).toBeUndefined()
    expect(validateField(field, 121)).toBe('年龄 不能大于 120')
  })

  it('textarea 长度校验', () => {
    const field: TextareaField = {
      id: 'bio',
      label: '自我介绍',
      type: 'textarea',
      minLength: 10,
      maxLength: 100,
    }

    expect(validateField(field, 'short')).toBe('自我介绍 不能少于 10 个字符')
    expect(validateField(field, 'This is a valid bio.')).toBeUndefined()
    expect(validateField(field, 'a'.repeat(101))).toBe('自我介绍 不能超过 100 个字符')
  })

  it('必填 radio 未选择时报错', () => {
    const field: RadioField = {
      id: 'work-mode',
      label: '工作方式',
      type: 'radio',
      required: true,
      options: [
        { label: '远程', value: 'remote' },
        { label: '现场', value: 'onsite' },
        { label: '混合', value: 'hybrid' },
      ],
    }

    expect(validateField(field, undefined)).toBe('工作方式 为必填项')
    expect(validateField(field, 'remote')).toBeUndefined()
  })

  it('必填 checkbox 为 false 时报错、true 通过。', () => {
    const field: CheckboxField = {
      id: 'confirm-info',
      label: '确认信息真实',
      type: 'checkbox',
      required: true,
    }

    expect(validateField(field, false)).toBe('确认信息真实 必须被选中')
    expect(validateField(field, true)).toBeUndefined()
  })

  it('必填 date 为空时报错、有值通过。', () => {
    const field: DateField = {
      id: 'available-date',
      label: '可入职日期',
      type: 'date',
      required: true,
    }

    expect(validateField(field, undefined)).toBe('可入职日期 为必填项')
    expect(validateField(field, '2024-01-01')).toBeUndefined()
  })
})
