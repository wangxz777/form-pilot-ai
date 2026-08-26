<template>
  <aside class="editor-panel field-panel" aria-labelledby="field-list-title">
    <div class="panel-heading">
      <div class="panel-title-group">
        <h2 id="field-list-title">字段</h2>
        <span class="field-count">{{ formSchema.fields.length }}</span>
      </div>
      <el-button type="primary" plain>添加字段</el-button>
    </div>

    <div class="panel-body">
      <p v-if="formSchema.fields.length === 0" class="panel-empty-state">暂未添加字段</p>
      <template v-else>
        <div v-for="field in formSchema.fields" :key="field.id" class="field-item">
          <span class="field-name">{{ field.id }}</span>
          <span class="field-type">{{ field.type }}</span>
        </div>
      </template>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useFormEditorStore } from '@/stores/form-editor.ts'

const formEditorStore = useFormEditorStore()
const { formSchema } = storeToRefs(formEditorStore)
</script>

<style scoped lang="scss"></style>
