import type { FormSchema } from '@/types/form-schema'

export const jobApplicationSchema: FormSchema = {
  schemaVersion: 1,
  id: 'job-application',
  title: 'Job Application Form',
  fields: [
    {
      id: 'name',
      label: '姓名',
      type: 'text',
      placeholder: '请输入姓名',
      required: true,
      minLength: 2,
      maxLength: 18,
    },
    {
      id: 'age',
      label: '年龄',
      type: 'number',
      required: true,
      min: 0,
      max: 120,
    },
    {
      id: 'position',
      label: '应聘岗位',
      type: 'select',
      required: true,
      options: [
        { label: '前端开发', value: 'frontend' },
        { label: '后端开发', value: 'backend' },
        { label: 'UI设计', value: 'ui' },
      ],
    },
    {
      id: 'contact',
      label: '联系方式',
      type: 'text',
      placeholder: '请输入联系方式',
    },
    {
      id: 'salary',
      label: '薪资',
      type: 'number',
    },
    { type: 'textarea', id: 'self-introduction', label: '自我介绍', placeholder: '请输入自我介绍' },
    {
      id: 'work-mode',
      label: '工作方式',
      type: 'radio',
      required: true,
      options: [
        { label: '远程', value: 'remote' },
        { label: '现场', value: 'onsite' },
        { label: '混合', value: 'hybrid' },
      ],
    },
    {
      id: 'available-date',
      label: '可入职日期',
      type: 'date',
    },
    {
      id: 'confirm-info',
      label: '确认信息真实',
      type: 'checkbox',
      required: true,
    },
  ],
}
