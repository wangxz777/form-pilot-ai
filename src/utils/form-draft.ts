import { parseFormSchemaJson, serializeFormSchemaJson } from './form-schema-json'
import type { FormSchema } from '@/types/form-schema'

export const FORM_DRAFT_STORAGE_KEY = 'formpilot-draft'

type FormDraftStorage = Pick<Storage, 'getItem' | 'setItem'>

export type SaveFormDraftResult =
  | { success: true }
  | { success: false; message: string }

export type LoadFormDraftResult =
  | { success: true; data: FormSchema | null }
  | { success: false; message: string }

export function saveFormDraft(
  storage: FormDraftStorage,
  schema: FormSchema
): SaveFormDraftResult {
  const result = serializeFormSchemaJson(schema)

  if (!result.success) return result

  try {
    storage.setItem(FORM_DRAFT_STORAGE_KEY, result.data)
  } catch {
    return { success: false, message: '本地草稿保存失败' }
  }

  return { success: true }
}

export function loadFormDraft(storage: FormDraftStorage): LoadFormDraftResult {
  let source: string | null

  try {
    source = storage.getItem(FORM_DRAFT_STORAGE_KEY)
  } catch {
    return { success: false, message: '本地草稿读取失败' }
  }

  if (source === null) return { success: true, data: null }

  const result = parseFormSchemaJson(source)

  if (!result.success) {
    return { success: false, message: `本地草稿不可用：${result.message}` }
  }

  return result
}
