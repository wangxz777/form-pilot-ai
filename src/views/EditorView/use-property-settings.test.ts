import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  usePropertySettings,
  type PropertySettingActions,
} from './usePropertySettings'
import type { FormField } from '@/types/form-schema'

describe('usePropertySettings', () => {
  it('按字段类型生成设置、映射约束错误并通过 action 更新', () => {
    const selectedField = ref<FormField | null>({
      id: 'name',
      label: '姓名',
      type: 'text',
      minLength: 20,
      maxLength: 3,
    })
    const actions: PropertySettingActions = {
      updateFieldProperties: vi.fn(),
      updateTextFieldConstraints: vi.fn(),
      updateNumberFieldConstraints: vi.fn(),
    }
    const { settings } = usePropertySettings(selectedField, actions)

    expect(settings.value.map((setting) => setting.id)).toEqual([
      'label',
      'id',
      'type',
      'required',
      'minLength',
      'maxLength',
    ])

    const labelSetting = settings.value.find((setting) => setting.id === 'label')
    const maxLengthSetting = settings.value.find((setting) => setting.id === 'maxLength')

    if (!labelSetting || labelSetting.control !== 'text') {
      throw new Error('字段名称应生成文本设置')
    }
    if (!maxLengthSetting || maxLengthSetting.control !== 'number') {
      throw new Error('最大长度应生成数字设置')
    }

    labelSetting.onUpdate?.('候选人姓名')

    expect(actions.updateFieldProperties).toHaveBeenCalledWith('name', {
      label: '候选人姓名',
    })
    expect(maxLengthSetting.error).toBe('最小长度不能大于最大长度')

    selectedField.value = {
      id: 'age',
      label: '年龄',
      type: 'number',
      min: 65,
      max: 18,
    }

    expect(settings.value.map((setting) => setting.id)).toEqual([
      'label',
      'id',
      'type',
      'required',
      'min',
      'max',
    ])

    const maxSetting = settings.value.find((setting) => setting.id === 'max')

    if (!maxSetting || maxSetting.control !== 'number') {
      throw new Error('最大值应生成数字设置')
    }

    expect(maxSetting.error).toBe('最小值不能大于最大值')
  })
})
