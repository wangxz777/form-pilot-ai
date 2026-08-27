import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useFormEditorStore } from './form-editor'

describe('useFormEditorStore', () => {
  let store: ReturnType<typeof useFormEditorStore>
  let fieldId: string
  let originalLabel: string
  let originalRequired: boolean | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useFormEditorStore()

    const field = store.formSchema.fields[0]
    if (!field) throw new Error('测试 Schema 至少需要一个字段')

    fieldId = field.id
    originalLabel = field.label
    originalRequired = field.required
  })

  afterEach(() => {
    store.updateFieldProperties(fieldId, {
      label: originalLabel,
      required: originalRequired,
    })
  })

  it('通过 action 同步更新字段和当前选中字段的基础属性', () => {
    store.selectField(fieldId)
    store.updateFieldProperties(fieldId, {
      label: '候选人姓名',
      required: false,
    })

    expect(store.formSchema.fields[0]).toMatchObject({
      label: '候选人姓名',
      required: false,
    })
    expect(store.selectedField).toMatchObject({
      label: '候选人姓名',
      required: false,
    })
  })

  it('字段 ID 不存在时不修改 Schema', () => {
    const originalFields = JSON.stringify(store.formSchema.fields)

    store.updateFieldProperties('missing-field', {
      label: '不应写入',
      required: false,
    })

    expect(JSON.stringify(store.formSchema.fields)).toBe(originalFields)
  })
})
