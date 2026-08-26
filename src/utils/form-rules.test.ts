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
})
