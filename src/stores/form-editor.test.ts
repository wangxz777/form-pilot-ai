import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useFormEditorStore } from './form-editor'
import { formSchema } from '@/types/form-schema'
import type { FormField } from '@/types/form-schema'

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

  it('创建七种合法字段并初始化默认值和选中状态', () => {
    const fieldTypes: FormField['type'][] = [
      'text',
      'number',
      'textarea',
      'select',
      'radio',
      'checkbox',
      'date',
    ]
    const addedFieldIds: string[] = []

    try {
      fieldTypes.forEach((type) => {
        store.addField(type)

        const addedField = store.formSchema.fields.at(-1)
        if (!addedField) throw new Error('新增字段后 Schema 不应为空')

        addedFieldIds.push(addedField.id)
        expect(addedField.type).toBe(type)
        expect(store.formValues).toHaveProperty(addedField.id)
        expect(store.selectedFieldId).toBe(addedField.id)
      })

      expect(formSchema.safeParse(store.formSchema).success).toBe(true)
    } finally {
      addedFieldIds.forEach((id) => store.removeField(id))
    }
  })

  it('移动字段时保留字段值和选中状态', () => {
    const originalFieldIds = store.formSchema.fields.map((field) => field.id)
    const movedFieldId = originalFieldIds[0]
    if (!movedFieldId) throw new Error('测试 Schema 至少需要一个字段')

    store.selectField(movedFieldId)
    store.updateFormValue(movedFieldId, '已填写内容')

    try {
      store.moveField(0, 2)

      expect(store.formSchema.fields[2]?.id).toBe(movedFieldId)
      expect(store.formValues[movedFieldId]).toBe('已填写内容')
      expect(store.selectedFieldId).toBe(movedFieldId)
    } finally {
      store.moveField(2, 0)
      store.updateFormValue(movedFieldId, '')
    }
  })
})
