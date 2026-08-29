<template>
  <ElDialog
    v-model="visible"
    title="AI 生成表单"
    width="min(560px, calc(100vw - 32px))"
    align-center
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
    :show-close="!loading"
    @close="emit('cancel')"
    @closed="resetPrompt"
  >
    <div class="ai-generate-content">
      <p>描述需要收集的信息、字段类型和校验要求，AI 会生成候选表单供你确认。</p>
      <ElInput
        v-model="prompt"
        type="textarea"
        :rows="6"
        maxlength="2000"
        show-word-limit
        resize="none"
        :disabled="loading"
        placeholder="例如：生成一份活动报名表，包含姓名、手机号、报名日期和参加场次，姓名和手机号必填。"
      />
    </div>

    <template #footer>
      <ElButton @click="visible = false">
        {{ loading ? '取消生成' : '取消' }}
      </ElButton>
      <ElButton
        type="primary"
        :loading="loading"
        :disabled="prompt.trim().length === 0"
        @click="submitPrompt"
      >
        生成表单
      </ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElButton, ElDialog, ElInput } from 'element-plus'

defineProps<{ loading: boolean }>()

const visible = defineModel<boolean>({ required: true })
const emit = defineEmits<{
  generate: [prompt: string]
  cancel: []
}>()
const prompt = ref('')

function submitPrompt() {
  const normalizedPrompt = prompt.value.trim()
  if (!normalizedPrompt) return

  emit('generate', normalizedPrompt)
}

function resetPrompt() {
  prompt.value = ''
}
</script>

<style scoped lang="scss">
.ai-generate-content {
  display: grid;
  gap: 14px;
}

.ai-generate-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
}

.ai-generate-content :deep(.el-textarea__inner) {
  line-height: 1.7;
}
</style>
