import { describe, expect, it } from 'vitest'

import {
  FORM_DRAFT_STORAGE_KEY,
  loadFormDraft,
  saveFormDraft,
} from './form-draft'
import type { FormSchema } from '@/types/form-schema'

function createStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('form draft', () => {
  it('保存并恢复合法 Schema，同时拒绝损坏的草稿', () => {
    const storage = createStorage()
    const schema: FormSchema = {
      schemaVersion: 1,
      title: '本地草稿',
      fields: [],
    }

    expect(saveFormDraft(storage, schema)).toEqual({ success: true })
    expect(loadFormDraft(storage)).toEqual({ success: true, data: schema })

    storage.setItem(FORM_DRAFT_STORAGE_KEY, '{')
    const invalidResult = loadFormDraft(storage)

    if (invalidResult.success) throw new Error('损坏的草稿不应恢复')

    expect(invalidResult.message).toContain('JSON 格式错误')
  })
})
