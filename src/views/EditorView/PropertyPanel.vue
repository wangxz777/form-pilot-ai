<template>
  <aside class="editor-panel property-panel" aria-labelledby="property-title">
    <h2 id="property-title">字段属性</h2>
    <div v-if="selectedField" class="property-content">
      <div
        v-for="setting in settings"
        :key="setting.id"
        class="property-item"
        :class="{ 'property-required-row': setting.control === 'boolean' }"
      >
        <span class="property-label">{{ setting.label }}</span>

        <ElInput
          v-if="setting.control === 'text'"
          :class="{ 'property-value-code': setting.id === 'id' }"
          :model-value="setting.modelValue"
          :disabled="setting.readonly"
          @update:model-value="setting.onUpdate?.($event)"
        />

        <ElSwitch
          v-else-if="setting.control === 'boolean'"
          :model-value="setting.modelValue"
          @update:model-value="handleBooleanSettingChange(setting, $event)"
        />

        <ElInputNumber
          v-else-if="setting.control === 'number'"
          :model-value="setting.modelValue"
          :min="setting.min"
          @update:model-value="setting.onUpdate"
        />

        <p v-if="setting.control === 'number' && setting.error" class="property-error">
          {{ setting.error }}
        </p>
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
import { storeToRefs } from 'pinia'
import { ElSwitch, ElInput, ElInputNumber, ElButton } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import {
  usePropertySettings,
  type BooleanSetting,
} from './usePropertySettings'

const formEditorStore = useFormEditorStore()
const { selectedField } = storeToRefs(formEditorStore)
const {
  updateFieldProperties,
  updateTextFieldConstraints,
  updateNumberFieldConstraints,
  removeField,
} = formEditorStore

const { settings } = usePropertySettings(selectedField, {
  updateFieldProperties,
  updateTextFieldConstraints,
  updateNumberFieldConstraints,
})

function handleBooleanSettingChange(
  setting: BooleanSetting,
  value: string | number | boolean
) {
  if (typeof value !== 'boolean') return
  setting.onUpdate(value)
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

.property-error {
  margin: 0;
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 960px) {
  .property-panel {
    border-left: 0;
  }
}
</style>
