<template>
  <aside class="editor-panel property-panel" aria-labelledby="property-title">
    <h2 id="property-title">字段属性</h2>
    <div v-if="selectedField" class="property-content">
      <div class="property-item">
        <span class="property-label">字段名称</span>
        <ElInput
          :model-value="selectedField.label"
          @update:model-value="updateFieldProperties(selectedField.id, { label: $event })"
        />
      </div>

      <div class="property-item">
        <span class="property-label">字段 ID</span>
        <ElInput class="property-value-code" :model-value="selectedField.id" disabled />
      </div>

      <div class="property-item">
        <span class="property-label">字段类型</span>
        <ElInput :model-value="selectedField.type" disabled />
      </div>

      <div class="property-item property-required-row">
        <span class="property-label">是否必填</span>
        <ElSwitch
          :model-value="selectedField.required ?? false"
          @update:model-value="handleRequiredChange"
        />
      </div>

      <template v-if="selectedField.type === 'text' || selectedField.type === 'textarea'">
        <div class="property-item">
          <span class="property-label">最小长度</span>
          <ElInputNumber
            :model-value="selectedField.minLength"
            :min="0"
            @update:model-value="
              updateTextFieldConstraints(selectedField.id, { minLength: $event })
            "
          />
        </div>

        <div class="property-item">
          <span class="property-label">最大长度</span>
          <ElInputNumber
            :model-value="selectedField.maxLength"
            :min="0"
            @update:model-value="
              updateTextFieldConstraints(selectedField.id, { maxLength: $event })
            "
          />
        </div>
      </template>

      <template v-else-if="selectedField.type === 'number'">
        <div class="property-item">
          <span class="property-label">最小值</span>
          <ElInputNumber
            :model-value="selectedField.min"
            @update:model-value="updateNumberFieldConstraints(selectedField.id, { min: $event })"
          />
        </div>

        <div class="property-item">
          <span class="property-label">最大值</span>
          <ElInputNumber
            :model-value="selectedField.max"
            @update:model-value="updateNumberFieldConstraints(selectedField.id, { max: $event })"
          />
        </div>
      </template>

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

const formEditorStore = useFormEditorStore()
const { selectedField } = storeToRefs(formEditorStore)
const {
  updateFieldProperties,
  updateTextFieldConstraints,
  updateNumberFieldConstraints,
  removeField,
} = formEditorStore

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
