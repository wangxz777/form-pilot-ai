<template>
  <aside class="editor-panel property-panel" aria-labelledby="property-title">
    <div v-if="selectedFieldMeta" class="property-heading">
      <span class="property-type-icon" aria-hidden="true">
        <SvgIcon :name="selectedFieldMeta.icon" />
      </span>
      <span class="property-heading-copy">
        <h2 id="property-title">{{ selectedFieldMeta.label }}</h2>
        <span class="property-type-description">{{ selectedFieldMeta.description }}</span>
      </span>
    </div>
    <h2 v-else id="property-title">字段属性</h2>

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
          :model-value="setting.modelValue"
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

        <div v-else-if="setting.control === 'options'" class="property-options">
          <div
            v-for="(option, optionIndex) in setting.options"
            :key="option.value"
            class="property-option"
          >
            <div class="property-option-input">
              <ElInput
                :model-value="option.label"
                @update:model-value="setting.onUpdateLabel(option.value, $event)"
              />
              <p v-if="setting.errors[optionIndex]" class="property-error">
                {{ setting.errors[optionIndex] }}
              </p>
            </div>

            <ElButton
              :disabled="setting.options.length <= 1"
              @click="setting.onRemove(option.value)"
            >
              删除
            </ElButton>
          </div>

          <ElButton plain @click="setting.onAdd()"> 添加选项 </ElButton>
        </div>

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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElSwitch, ElInput, ElInputNumber, ElButton } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'

import { useFormEditorStore } from '@/stores/form-editor.ts'
import { usePropertySettings, type BooleanSetting } from './usePropertySettings'
import { fieldTypeMeta } from './field-type-meta'

const formEditorStore = useFormEditorStore()
const { selectedField } = storeToRefs(formEditorStore)
const selectedFieldMeta = computed(() => {
  const field = selectedField.value
  return field ? fieldTypeMeta[field.type] : null
})
const {
  updateFieldProperties,
  updateTextFieldConstraints,
  updateNumberFieldConstraints,
  addFieldOption,
  updateFieldOptionLabel,
  removeFieldOption,
  removeField,
} = formEditorStore

const { settings } = usePropertySettings(selectedField, {
  updateFieldProperties,
  updateTextFieldConstraints,
  updateNumberFieldConstraints,
  addFieldOption,
  updateFieldOptionLabel,
  removeFieldOption,
})

function handleBooleanSettingChange(setting: BooleanSetting, value: string | number | boolean) {
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

.property-heading {
  display: flex;
  gap: 12px;
  align-items: center;
}

.property-type-icon {
  display: inline-grid;
  width: 38px;
  height: 38px;
  flex: none;
  color: #4e5969;
  place-items: center;
  background: #f7f8fa;
  border: 1px solid #c9cdd4;
  border-radius: 6px;
}

.property-type-icon :deep(.svg-icon) {
  width: 20px;
  height: 20px;
}

.property-heading-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.property-type-description {
  color: #909399;
  font-size: 13px;
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

.property-options {
  display: grid;
  gap: 10px;
}

.property-option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}

.property-option-input {
  display: grid;
  gap: 4px;
  min-width: 0;
}

@media (max-width: 960px) {
  .property-panel {
    border-left: 0;
  }
}
</style>
