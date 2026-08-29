import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'

import { createFormSchemaGenerator, FormGenerationError } from './generate-form.js'
import { createGenerateFormServer } from './index.js'

async function startTestServer(t, generateFormSchema) {
  const server = createGenerateFormServer({ generateFormSchema })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')

  t.after(() => server.close())

  const address = server.address()
  assert(address && typeof address === 'object')

  return `http://127.0.0.1:${address.port}`
}

test('百炼请求使用严格 JSON Schema 并解析生成结果', async () => {
  let requestUrl = ''
  let requestInit
  const generatedSchema = {
    schemaVersion: 1,
    title: '活动报名表',
    fields: [
      { id: 'email', type: 'text', label: '邮箱' },
      { id: 'email', type: 'text', label: '邮箱' },
    ],
  }
  const expectedSchema = {
    schemaVersion: 1,
    title: '活动报名表',
    fields: [{ id: 'email', type: 'text', label: '邮箱' }],
  }
  const generateFormSchema = createFormSchemaGenerator({
    env: {
      DASHSCOPE_API_KEY: 'test-key',
      DASHSCOPE_BASE_URL: 'https://example.com/compatible-mode/v1/',
      DASHSCOPE_MODEL: 'qwen3.8-flash',
    },
    fetchImpl: async (url, init) => {
      requestUrl = url
      requestInit = init

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(generatedSchema) } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    },
  })

  const schema = await generateFormSchema('生成活动报名表')
  const requestBody = JSON.parse(requestInit.body)

  assert.deepEqual(schema, expectedSchema)
  assert.equal(requestUrl, 'https://example.com/compatible-mode/v1/chat/completions')
  assert.equal(requestInit.headers.Authorization, 'Bearer test-key')
  assert.equal(requestBody.model, 'qwen3.8-flash')
  assert.equal(requestBody.response_format.type, 'json_schema')
  assert.equal(requestBody.response_format.json_schema.strict, true)
  assert.equal(
    requestBody.response_format.json_schema.schema.properties.fields.items.anyOf.length,
    7
  )
})

test('本地路径和网关转发根路径都会返回生成的 Schema', async (t) => {
  const receivedPrompts = []
  const expectedSchema = { schemaVersion: 1, title: '报名表', fields: [] }
  const baseUrl = await startTestServer(t, async (prompt) => {
    receivedPrompts.push(prompt)
    return expectedSchema
  })

  for (const path of ['/generate-form', '/']) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '  生成报名表  ' }),
    })

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
    assert.deepEqual(await response.json(), { schema: expectedSchema })
  }

  assert.deepEqual(receivedPrompts, ['生成报名表', '生成报名表'])
})

test('空提示词返回 400 且不调用百炼', async (t) => {
  let called = false
  const baseUrl = await startTestServer(t, async () => {
    called = true
    return {}
  })

  const response = await fetch(`${baseUrl}/generate-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '   ' }),
  })

  assert.equal(response.status, 400)
  assert.equal(called, false)
  assert.deepEqual(await response.json(), { message: '请输入表单需求' })
})

test('百炼失败只返回安全的公开错误', async (t) => {
  const baseUrl = await startTestServer(t, async () => {
    throw new FormGenerationError('AI 服务暂时不可用，请稍后重试', 502)
  })

  const response = await fetch(`${baseUrl}/generate-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '生成报名表' }),
  })
  const body = await response.json()

  assert.equal(response.status, 502)
  assert.deepEqual(body, { message: 'AI 服务暂时不可用，请稍后重试' })
  assert.equal(JSON.stringify(body).includes('DASHSCOPE_API_KEY'), false)
})
