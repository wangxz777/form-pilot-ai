<template>
  <aside class="editor-panel field-panel" aria-labelledby="field-list-title">
    <div class="panel-heading">
      <div class="panel-title-group">
        <h2 id="field-list-title">{{ '表单列表' }}</h2>
        <span class="field-count">{{ formSchema.fields.length }}</span>
      </div>
      <el-button type="primary" plain>添加字段</el-button>
    </div>

    <div class="panel-body">
      <p v-if="formSchema.fields.length === 0" class="panel-empty-state">暂未添加字段</p>
      <template v-else>
        <button
          v-for="field in formSchema.fields"
          :key="field.id"
          class="field-item"
          :class="{ 'is-selected': selectedFieldId === field.id }"
          @click="selectField(field.id)"
        >
          <span class="field-name">{{ field.id }}</span>
          <span class="field-type">{{ field.type }}</span>
        </button>
      </template>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useFormEditorStore } from '@/stores/form-editor.ts'

const formEditorStore = useFormEditorStore()
const { formSchema, selectedFieldId } = storeToRefs(formEditorStore)

const { selectField } = formEditorStore
</script>

<style scoped lang="scss"></style>
