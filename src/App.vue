<template>
  <main>
    <form novalidate @submit.prevent="handleSubmit">
      <h4>{{ jobApplicationSchema.title }} - {{ jobApplicationSchema.fields.length }}</h4>
      <div v-if="jobApplicationSchema.fields.length > 0">
        <div v-for="item in jobApplicationSchema.fields" :key="item.id">
          <div>
            <label :for="item.id"> {{ item.label }} - {{ getFieldSummary(item) }}</label>

            <input
              v-if="item.type === 'text'"
              type="text"
              :id="item.id"
              v-model="formValues[item.id]"
              :placeholder="item.placeholder"
              :required="item.required"
              :minlength="item.minLength"
              :maxlength="item.maxLength"
            />
            <input
              v-else-if="item.type === 'number'"
              type="number"
              :id="item.id"
              v-model.number="formValues[item.id]"
              :placeholder="item.placeholder"
              :required="item.required"
              :min="item.min"
              :max="item.max"
            />
            <select
              v-else-if="item.type === 'select'"
              :id="item.id"
              v-model="formValues[item.id]"
              :required="item.required"
            >
              <option :value="undefined" disabled>请选择{{ item.label }}</option>
              <option v-for="option in item.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <textarea
              v-else-if="item.type === 'textarea'"
              :id="item.id"
              v-model="formValues[item.id]"
              :placeholder="item.placeholder"
              :required="item.required"
              :minlength="item.minLength"
              :maxlength="item.maxLength"
            ></textarea>
            <input
              v-if="item.type === 'date'"
              type="date"
              :id="item.id"
              v-model="formValues[item.id]"
              :required="item.required"
            />
            <input
              v-else-if="item.type === 'checkbox'"
              type="checkbox"
              :id="item.id"
              v-model="formValues[item.id]"
              :required="item.required"
            />
            <div v-else-if="item.type === 'radio'">
              <div v-for="option in item.options" :key="option.value">
                <input
                  type="radio"
                  :id="`${item.id}-${option.value}`"
                  :name="item.id"
                  :value="option.value"
                  v-model="formValues[item.id]"
                  :required="item.required"
                />
                <label :for="`${item.id}-${option.value}`">{{ option.label }}</label>
              </div>
            </div>
          </div>
          <span v-if="formErrors[item.id]" class="error">{{ formErrors[item.id] }}</span>
        </div>
      </div>
      <div>
        {{
          Object.entries(formValues)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        }}
      </div>

      <button type="submit">Submit</button>
      <div v-if="submitSuccess">
        <p>提交成功</p>
        <pre>{{ JSON.stringify(formValues, null, 2) }}</pre>
      </div>
    </form>
  </main>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { jobApplicationSchema } from '@/data/job-application-schema'
import { getFieldSummary, getDefaultValue, validateForm } from '@/utils/form'
import type { FormErrors, FormValues } from '@/utils/form'

const formValues = reactive<FormValues>({})
const formErrors = ref<FormErrors>({})

const submitSuccess = ref(false)

const initFormValues = () => {
  for (const field of jobApplicationSchema.fields) {
    formValues[field.id] = getDefaultValue(field)
  }
}

initFormValues()

const handleSubmit = () => {
  formErrors.value = validateForm(jobApplicationSchema, formValues)

  submitSuccess.value = Object.keys(formErrors.value).length === 0
  // if (submitSuccess.value) {
  //   // initFormValues()
  // } else {
  // }
}
</script>
