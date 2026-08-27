<template>
  <ElDialog
    v-model="visible"
    class="add-field-dialog"
    title="添加字段"
    width="min(650px, calc(100vw - 32px))"
    align-center
    @closed="resetSelection"
  >
    <p class="dialog-description">选择要添加到表单的字段类型</p>

    <div class="field-type-grid">
      <button
        v-for="option in fieldTypeOptions"
        :key="option.type"
        type="button"
        class="field-type-option"
        :class="{ 'is-selected': selectedType === option.type }"
        :aria-pressed="selectedType === option.type"
        @click="selectedType = option.type"
      >
        <span class="field-type-icon" aria-hidden="true">{{ option.icon }}</span>
        <span class="field-type-copy">
          <span class="field-type-name">{{ option.label }}</span>
          <span class="field-type-description">{{ option.description }}</span>
        </span>
        <span v-if="selectedType === option.type" class="selected-mark" aria-hidden="true">✓</span>
      </button>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmSelection">添加字段</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

import type { FormField } from '@/types/form-schema'

type FieldTypeOption = {
  type: FormField['type']
  label: string
  description: string
  icon: string
}

const fieldTypeOptions: FieldTypeOption[] = [
  { type: 'text', label: '文本输入', description: '单行文本内容', icon: 'T' },
  { type: 'number', label: '数字输入', description: '数值与范围', icon: '123' },
  { type: 'textarea', label: '多行文本', description: '较长的文本内容', icon: '¶' },
  { type: 'select', label: '下拉选择', description: '从列表中选择一项', icon: '⌄' },
  { type: 'radio', label: '单选框', description: '平铺显示单选项', icon: '◉' },
  { type: 'checkbox', label: '复选框', description: '是或否的选项', icon: '✓' },
  { type: 'date', label: '日期', description: '选择一个日期', icon: '□' },
]

const visible = defineModel<boolean>({ required: true })
const emit = defineEmits<{
  confirm: [type: FormField['type']]
}>()

const selectedType = ref<FormField['type']>('text')

function confirmSelection() {
  emit('confirm', selectedType.value)
}

function resetSelection() {
  selectedType.value = 'text'
}
</script>

<style scoped lang="scss">
.dialog-description {
  margin: -8px 0 20px;
  color: #909399;
  font-size: 14px;
}

.field-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
}

.field-type-option {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 84px;
  padding: 14px 18px;
  color: #303133;
  text-align: left;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 7px;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.field-type-option:hover {
  border-color: #a0cfff;
  box-shadow: 0 3px 12px rgb(64 158 255 / 10%);
}

.field-type-option:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.field-type-option.is-selected {
  background: #f5f9ff;
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgb(64 158 255 / 18%);
}

.field-type-icon {
  display: inline-grid;
  width: 38px;
  height: 38px;
  color: #4e5969;
  font-size: 13px;
  font-weight: 600;
  place-items: center;
  border: 1px solid #b8bec8;
  border-radius: 6px;
}

.field-type-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.field-type-name {
  font-size: 15px;
  font-weight: 600;
}

.field-type-description {
  overflow: hidden;
  color: #909399;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-mark {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-grid;
  width: 22px;
  height: 22px;
  color: #ffffff;
  font-size: 13px;
  place-items: center;
  background: #409eff;
  border-radius: 50%;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-actions :deep(.el-button) {
  min-width: 112px;
}

@media (max-width: 640px) {
  .field-type-grid {
    grid-template-columns: 1fr;
  }

  .field-type-option {
    min-height: 76px;
  }
}
</style>
