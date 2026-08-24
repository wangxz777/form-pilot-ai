import type { FormSchema } from '@/types/form-schema'

export const jobApplicationSchema = {
  schemaVersion: 1,
  title: '求职申请表',
  fields: [
    {
      id: 'full-name',
      type: 'text',
      label: '姓名',
      required: true,
      minLength: 2,
      maxLength: 40,
    },
    {
      id: 'age',
      type: 'number',
      label: '年龄',
      required: true,
      min: 18,
      max: 65,
    },
    {
      id: 'self-introduction',
      type: 'textarea',
      label: '个人介绍',
      maxLength: 500,
    },
    {
      id: 'department',
      type: 'select',
      label: '应聘部门',
      required: true,
      options: [
        { label: '工程研发', value: 'engineering' },
        { label: '产品设计', value: 'product' },
        { label: '市场运营', value: 'marketing' },
      ],
    },
    {
      id: 'work-mode',
      type: 'radio',
      label: '期望办公方式',
      required: true,
      options: [
        { label: '现场办公', value: 'onsite' },
        { label: '混合办公', value: 'hybrid' },
        { label: '远程办公', value: 'remote' },
      ],
    },
    {
      id: 'available-date',
      type: 'date',
      label: '可入职日期',
      required: true,
    },
    {
      id: 'terms-accepted',
      type: 'checkbox',
      label: '我确认以上信息真实有效',
      required: true,
    },
  ],
} satisfies FormSchema
