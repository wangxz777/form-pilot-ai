<template>
  <aside class="editor-panel property-panel" aria-labelledby="property-title">
    <h2 id="property-title">字段属性</h2>
    <div v-if="selectedField" class="property-content">
      <div
        v-for="setting in settings"
        :key="setting.label"
        class="property-item"
        :class="{ 'property-required-row': setting.value === 'required' }"
      >
        <span class="property-label">{{ setting.label }}</span>
        <ElSwitch
          v-if="setting.value === 'required'"
          :model-value="selectedField.required ?? false"
          @update:model-value="handleRequiredChange"
        />

        <ElInput
          v-else
          :class="{ 'property-value-code': setting.value === 'id' }"
          :model-value="selectedField[setting.value]"
          @update:model-value="updateFieldProperties(selectedField.id, { [setting.value]: $event })"
          :disabled="setting.readonly"
        />
      </div>
      <ElButton type="danger" @click="removeField(selectedField.id)">
        <SvgIcon name="delete" />
        删除字段
      </ElButton>
    </div>
    <p v-else class="panel-empty-state">请选择一个字段进行编辑</p>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElSwitch, ElInput, ElButton } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import type { FormField } from '@/types/form-schema'
type Setting = {
  label: string
  value: keyof FormField
  readonly?: boolean
}

const formEditorStore = useFormEditorStore()
const { selectedField } = storeToRefs(formEditorStore)
const { updateFieldProperties, removeField } = formEditorStore
const baseSettings: Setting[] = [
  { label: '字段名称', value: 'label' },
  { label: '字段 ID', value: 'id', readonly: true },
  { label: '字段类型', value: 'type', readonly: true },
  { label: '是否必填', value: 'required' },
]

const settings = computed<Setting[]>(() => {
  return baseSettings
})

function handleRequiredChange(value: string | number | boolean) {
  if (!selectedField.value || typeof value !== 'boolean') return
  updateFieldProperties(selectedField.value.id, { required: value })
}
</script>

<style scoped lang="scss">
.property-panel {
  border-left: 1px solid #dcdfe6;
}

h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.property-content {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}

.property-item {
  display: grid;
  gap: 8px;
}

.property-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.property-value {
  display: flex;
  min-height: 38px;
  align-items: center;
  padding: 0 10px;
  overflow: hidden;
  color: #303133;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}

.property-value-code {
  color: #606266;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
}

.property-required-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
}

.panel-empty-state {
  margin: 48px 0 0;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 960px) {
  .property-panel {
    border-left: 0;
  }
}
</style>
