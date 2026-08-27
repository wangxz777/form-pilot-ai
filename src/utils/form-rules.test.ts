import { describe, expect, it } from 'vitest'

import { createFormRules } from './form-rules'

describe('createFormRules', () => {
  it('为必填字段创建统一规则', () => {
    const rules = createFormRules([
      { id: 'name', type: 'text', label: '姓名', required: true },
    ])

    expect(rules.name).toEqual([
      {
        required: true,
        message: '请填写姓名',
        trigger: ['blur', 'change'],
      },
    ])
  })

  it('不为非必填字段创建规则', () => {
    const rules = createFormRules([
      { id: 'bio', type: 'textarea', label: '个人介绍' },
      { id: 'newsletter', type: 'checkbox', label: '订阅通知', required: false },
    ])

    expect(rules).toEqual({})
  })

  it('必填复选框只接受已勾选状态', () => {
    const rules = createFormRules([
      { id: 'agreement', type: 'checkbox', label: '同意用户协议', required: true },
    ])

    expect(rules.agreement).toEqual([
      {
        required: true,
        type: 'enum',
        enum: [true],
        message: '请勾选同意用户协议',
        trigger: ['change'],
      },
    ])
  })

  it('按字段 id 为多个必填字段创建规则', () => {
    const rules = createFormRules([
      { id: 'name', type: 'text', label: '姓名', required: true },
      { id: 'startDate', type: 'date', label: '入职日期', required: true },
    ])

    expect(rules).toMatchObject({
      name: [{ required: true, message: '请填写姓名' }],
      startDate: [{ required: true, message: '请填写入职日期' }],
    })
  })

  it('只为文本字段明确配置的长度边界创建规则', () => {
    const rules = createFormRules([
      { id: 'summary', type: 'text', label: '简介', minLength: 2 },
      { id: 'bio', type: 'textarea', label: '个人介绍', maxLength: 200 },
    ])

    expect(rules).toEqual({
      summary: [{ min: 2, message: '简介至少输入 2 个字符', trigger: ['blur'] }],
      bio: [{ max: 200, message: '个人介绍最多输入 200 个字符', trigger: ['blur'] }],
    })
  })

  it('只为数字字段明确配置的范围边界创建规则', () => {
    const rules = createFormRules([
      { id: 'floor', type: 'number', label: '下限', min: -10 },
      { id: 'ceiling', type: 'number', label: '上限', max: -1 },
    ])

    expect(rules).toEqual({
      floor: [
        {
          type: 'number',
          min: -10,
          message: '下限最小值为 -10',
          trigger: ['blur'],
        },
      ],
      ceiling: [
        {
          type: 'number',
          max: -1,
          message: '上限最大值为 -1',
          trigger: ['blur'],
        },
      ],
    })
  })
})
