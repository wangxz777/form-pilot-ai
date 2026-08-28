import { describe, expect, it } from 'vitest'

import { parseFormSchemaJson, serializeFormSchemaJson } from './form-schema-json'

describe('parseFormSchemaJson', () => {
  it('只接受语法和 Schema 都合法的 JSON', () => {
    const validResult = parseFormSchemaJson(
      JSON.stringify({
        schemaVersion: 1,
        title: '导入表单',
        fields: [],
      })
    )
    const syntaxErrorResult = parseFormSchemaJson('{')
    const schemaErrorResult = parseFormSchemaJson(
      JSON.stringify({ schemaVersion: 2, title: '错误版本', fields: [] })
    )

    expect(validResult).toMatchObject({ success: true })
    expect(syntaxErrorResult).toEqual({ success: false, message: 'JSON 格式错误' })

    if (schemaErrorResult.success) {
      throw new Error('错误版本不应通过 Schema 校验')
    }

    expect(schemaErrorResult.message).toContain('表单结构不符合要求')
    expect(schemaErrorResult.message).toContain('schemaVersion')
  })

  it('只序列化通过 Schema 校验的表单', () => {
    const validResult = serializeFormSchemaJson({
      schemaVersion: 1,
      title: '导出表单',
      fields: [],
    })
    const invalidResult = serializeFormSchemaJson({
      schemaVersion: 1,
      title: '错误表单',
      fields: [
        {
          id: 'description',
          type: 'text',
          label: '说明',
          minLength: 10,
          maxLength: 2,
        },
      ],
    })

    if (!validResult.success) throw new Error('合法 Schema 应允许序列化')
    if (invalidResult.success) throw new Error('非法 Schema 不应允许序列化')

    expect(JSON.parse(validResult.data)).toMatchObject({ title: '导出表单' })
    expect(invalidResult.message).toContain('fields[0].maxLength')
  })
})
