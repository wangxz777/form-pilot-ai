import { parseFormSchemaValue } from '@/utils/form-schema-json'
import type { FormSchema } from '@/types/form-schema'

const DEFAULT_GENERATE_FORM_API_URL =
  'https://form-pilot-ai-d6g3opa0t18bca732-1477454063.ap-shanghai.app.tcloudbase.com/generate-form'

export type GenerateFormResult =
  | { success: true; data: FormSchema }
  | { success: false; message: string }

type GenerateFormOptions = {
  signal?: AbortSignal
  endpoint?: string
  fetchImpl?: typeof fetch
}

function readErrorMessage(value: unknown): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null

  const message = Reflect.get(value, 'message')
  return typeof message === 'string' && message.length > 0 ? message : null
}

function readSchema(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined

  return Reflect.get(value, 'schema')
}

export async function requestGeneratedForm(
  prompt: string,
  options: GenerateFormOptions = {}
): Promise<GenerateFormResult> {
  const endpoint =
    options.endpoint || import.meta.env.VITE_GENERATE_FORM_API_URL || DEFAULT_GENERATE_FORM_API_URL
  const fetchImpl = options.fetchImpl || fetch
  let response: Response

  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: '已取消生成' }
    }

    return { success: false, message: 'AI 服务连接失败，请稍后重试' }
  }

  let responseBody: unknown

  try {
    responseBody = await response.json()
  } catch {
    return { success: false, message: 'AI 服务返回了无法解析的响应' }
  }

  if (!response.ok) {
    return {
      success: false,
      message: readErrorMessage(responseBody) || 'AI 生成失败，请稍后重试',
    }
  }

  const result = parseFormSchemaValue(readSchema(responseBody))

  if (!result.success) {
    return { success: false, message: `AI 生成结果不可用：${result.message}` }
  }

  return result
}
