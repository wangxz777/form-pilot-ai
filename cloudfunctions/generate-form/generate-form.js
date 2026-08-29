import { formSchemaResponseFormat } from './form-schema-output.js'

const DEFAULT_MODEL = 'qwen3.8-flash'
const REQUEST_TIMEOUT = 45_000
const SYSTEM_PROMPT = `你是 FormPilot AI 的表单设计助手。
请把用户的自然语言需求转换为一份可直接渲染的表单 Schema。

规则：
1. 只使用 text、number、textarea、select、radio、checkbox、date 七种字段类型。
2. 字段 id 必须唯一，使用有意义的 snake_case 英文名称。
3. label 和 title 使用简洁、自然的中文。
4. select 和 radio 至少提供一个选项，且同一字段内 option.value 唯一。
5. minLength 不得大于 maxLength，min 不得大于 max。
6. 只在用户需求明确时添加长度或数字范围限制，不要擅自增加字段。
7. 每个业务字段只生成一次；用户明确要求一个字段时，fields 只能包含一个元素。`

export class FormGenerationError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'FormGenerationError'
    this.statusCode = statusCode
  }
}

function readConfig(env) {
  const apiKey = env.DASHSCOPE_API_KEY?.trim()
  const baseUrl = env.DASHSCOPE_BASE_URL?.trim().replace(/\/$/, '')
  const model = env.DASHSCOPE_MODEL?.trim() || DEFAULT_MODEL

  if (!apiKey || !baseUrl) {
    throw new FormGenerationError('AI 服务尚未完成配置', 500)
  }

  return { apiKey, baseUrl, model }
}

function readSchemaFromCompletion(completion) {
  const content = completion?.choices?.[0]?.message?.content

  if (typeof content !== 'string' || content.length === 0) {
    throw new FormGenerationError('AI 未返回有效的表单内容', 502)
  }

  let schema

  try {
    schema = JSON.parse(content)
  } catch {
    throw new FormGenerationError('AI 返回的表单不是有效 JSON', 502)
  }

  if (schema === null || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new FormGenerationError('AI 返回的表单结构无效', 502)
  }

  if (!Array.isArray(schema.fields)) return schema

  const fieldIds = new Set()
  const fields = schema.fields.filter((field) => {
    const fieldId = field?.id

    if (typeof fieldId !== 'string') return true
    if (fieldIds.has(fieldId)) return false

    fieldIds.add(fieldId)
    return true
  })

  return { ...schema, fields }
}

export function createFormSchemaGenerator({ fetchImpl = globalThis.fetch, env = process.env } = {}) {
  return async function generateFormSchema(prompt) {
    const { apiKey, baseUrl, model } = readConfig(env)
    let response

    try {
      response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          response_format: formSchemaResponseFormat,
        }),
      })
    } catch (error) {
      console.error('Bailian request failed', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
      })
      throw new FormGenerationError('AI 服务暂时不可用，请稍后重试', 502)
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('Bailian response failed', {
        status: response.status,
        body: errorBody.slice(0, 1000),
      })
      throw new FormGenerationError('AI 服务暂时不可用，请稍后重试', 502)
    }

    let completion

    try {
      completion = await response.json()
    } catch {
      throw new FormGenerationError('AI 服务返回了无法解析的响应', 502)
    }

    return readSchemaFromCompletion(completion)
  }
}
