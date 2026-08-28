// @vitest-environment jsdom

import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PreviewPanel from './PreviewPanel.vue'
import { useFormEditorStore } from '@/stores/form-editor'

describe('PreviewPanel', () => {
  it('将真实字段包装为不可交互且可选中的画布项', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useFormEditorStore()
    const wrapper = mount(PreviewPanel, {
      global: {
        plugins: [pinia],
        stubs: {
          FormFieldRenderer: {
            template: '<div data-test="field-renderer"></div>',
          },
        },
      },
    })

    const previewFields = wrapper.findAll('.preview-field')

    expect(previewFields).toHaveLength(store.formSchema.fields.length)
    expect(wrapper.find('.preview-field-control').attributes()).toHaveProperty('inert')

    await previewFields[0]?.trigger('click')

    expect(store.selectedFieldId).toBe(store.formSchema.fields[0]?.id)
    expect(previewFields[0]?.classes()).toContain('is-selected')

    wrapper.unmount()
  })
})
