import { formSchema, type FormSchema } from '@/types/form-schema'

export type ParseFormSchemaJsonResult =
  | { success: true; data: FormSchema }
  | { success: false; message: string }

export type SerializeFormSchemaJsonResult =
  | { success: true; data: string }
  | { success: false; message: string }

type SchemaIssue = {
  path: readonly PropertyKey[]
  message: string
}

function formatSchemaIssues(issues: readonly SchemaIssue[]): string {
  const [firstIssue, ...remainingIssues] = issues

  if (!firstIssue) return '表单结构不符合要求'

  const issuePath = firstIssue.path.reduce<string>((path, segment) => {
    if (typeof segment === 'number') return `${path}[${segment}]`

    return path ? `${path}.${String(segment)}` : String(segment)
  }, '')
  const remainingMessage =
    remainingIssues.length > 0 ? `（另有 ${remainingIssues.length} 处错误）` : ''

  return `表单结构不符合要求：${issuePath || '根节点'}：${firstIssue.message}${remainingMessage}`
}

export function parseFormSchemaValue(value: unknown): ParseFormSchemaJsonResult {
  const result = formSchema.safeParse(value)

  if (!result.success) {
    return {
      success: false,
      message: formatSchemaIssues(result.error.issues),
    }
  }

  return { success: true, data: result.data }
}

export function parseFormSchemaJson(source: string): ParseFormSchemaJsonResult {
  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(source)
  } catch {
    return { success: false, message: 'JSON 格式错误' }
  }

  return parseFormSchemaValue(parsedValue)
}

export function serializeFormSchemaJson(schema: FormSchema): SerializeFormSchemaJsonResult {
  const result = formSchema.safeParse(schema)

  if (!result.success) {
    return {
      success: false,
      message: formatSchemaIssues(result.error.issues),
    }
  }

  return { success: true, data: JSON.stringify(result.data, null, 2) }
}
