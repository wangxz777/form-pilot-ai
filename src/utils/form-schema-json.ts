import { formSchema, type FormSchema } from '@/types/form-schema'

export type ParseFormSchemaJsonResult =
  | { success: true; data: FormSchema }
  | { success: false; message: string }

export function parseFormSchemaJson(source: string): ParseFormSchemaJsonResult {
  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(source)
  } catch {
    return { success: false, message: 'JSON 格式错误' }
  }

  const result = formSchema.safeParse(parsedValue)

  if (!result.success) {
    const [firstIssue, ...remainingIssues] = result.error.issues

    if (!firstIssue) {
      return { success: false, message: '表单结构不符合要求' }
    }

    const issuePath = firstIssue.path.reduce<string>((path, segment) => {
      if (typeof segment === 'number') return `${path}[${segment}]`

      return path ? `${path}.${String(segment)}` : String(segment)
    }, '')
    const remainingMessage =
      remainingIssues.length > 0 ? `（另有 ${remainingIssues.length} 处错误）` : ''

    return {
      success: false,
      message: `表单结构不符合要求：${issuePath || '根节点'}：${firstIssue.message}${remainingMessage}`,
    }
  }

  return { success: true, data: result.data }
}
