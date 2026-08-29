import { describe, expect, it, vi } from 'vitest'

import { requestGeneratedForm } from './form-generator'

describe('requestGeneratedForm', () => {
  it('发送提示词并返回通过 Zod 校验的 FormSchema', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            schema: {
              schemaVersion: 1,
              title: '活动报名表',
              fields: [{ id: 'name', type: 'text', label: '姓名', required: true }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const result = await requestGeneratedForm('生成活动报名表', {
      endpoint: 'https://example.com/generate-form',
      fetchImpl: fetchMock,
    })
    const request = fetchMock.mock.calls[0]

    if (!request) throw new Error('应调用生成接口')

    expect(result).toMatchObject({ success: true, data: { title: '活动报名表' } })
    expect(request[0]).toBe('https://example.com/generate-form')
    expect(request[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ prompt: '生成活动报名表' }),
    })
  })

  it('拒绝服务端返回的不合法 Schema，并保留服务端公开错误', async () => {
    const invalidSchemaResult = await requestGeneratedForm('生成表单', {
      endpoint: 'https://example.com/generate-form',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            schema: { schemaVersion: 2, title: '错误表单', fields: [] },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ),
    })
    const serverErrorResult = await requestGeneratedForm('生成表单', {
      endpoint: 'https://example.com/generate-form',
      fetchImpl: async () =>
        new Response(JSON.stringify({ message: 'AI 服务暂时不可用，请稍后重试' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }),
    })

    expect(invalidSchemaResult).toMatchObject({ success: false })

    if (invalidSchemaResult.success) throw new Error('非法 Schema 不应通过校验')

    expect(invalidSchemaResult.message).toContain('schemaVersion')
    expect(serverErrorResult).toEqual({
      success: false,
      message: 'AI 服务暂时不可用，请稍后重试',
    })
  })
})
