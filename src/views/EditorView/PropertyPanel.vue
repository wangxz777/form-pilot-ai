<template>
  <aside class="editor-panel property-panel" aria-labelledby="property-title">
    <h2 id="property-title">字段属性</h2>
    <div v-if="selectedField">
      <div v-for="setting in settings" :key="setting.label" class="property-item">
        <span class="property-label">{{ setting.label }}</span>
        <span class="property-value">{{ selectedField ? selectedField[setting.value] : '' }}</span>
      </div>
    </div>
    <p v-else class="panel-empty-state">请选择一个字段进行编辑</p>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import type { FormField } from '@/types/form-schema'
type Setting = {
  label: string
  value: keyof FormField
}

const formEditorStore = useFormEditorStore()
const { selectedField } = storeToRefs(formEditorStore)

const baseSettings: Setting[] = [
  { label: '字段名称', value: 'label' },
  { label: '字段ID', value: 'id' },
  { label: '字段类型', value: 'type' },
  { label: '是否必填', value: 'required' },
]
const settings = computed<Setting[]>(() => {
  return baseSettings
})
</script>

<style scoped lang="scss"></style>
