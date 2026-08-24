// 导入 Zod 库，用于 TypeScript 的模式验证
import { z } from 'zod'

const baseFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
})

const optionSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
})

// 文本类型字段的模式定义
export const textFieldSchema = baseFieldSchema
  .extend({
    type: z.literal('text'),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
  })
  .refine(
    (field) => {
      if (field.minLength !== undefined && field.maxLength !== undefined) {
        return field.minLength <= field.maxLength
      }
      return true
    },
    {
      message: 'minLength should be less than or equal to maxLength', // 错误信息
    }
  )

export const textareaFieldSchema = baseFieldSchema
  .extend({
    type: z.literal('textarea'),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
  })
  .refine(
    (field) => {
      if (field.minLength !== undefined && field.maxLength !== undefined) {
        return field.minLength <= field.maxLength
      }
      return true
    },
    {
      message: 'minLength should be less than or equal to maxLength', // 错误信息
    }
  )

// 数字类型字段的模式定义
export const numberFieldSchema = baseFieldSchema
  .extend({
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .refine(
    (field) => {
      if (field.min !== undefined && field.max !== undefined) {
        return field.min <= field.max
      }
      return true
    },
    {
      message: 'min should be less than or equal to max', // 错误信息
    }
  )

export const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal('checkbox'),
})

export const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(optionSchema).min(1),
})

export const radioFieldSchema = baseFieldSchema.extend({
  type: z.literal('radio'),
  options: z.array(optionSchema).min(1),
})

export const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal('date'),
})

/**
 * 定义表单字段的模式验证
 * 使用 discriminatedUnion 实现字段类型的区分
 * 根据不同的 'type' 值来区分不同的字段类型
 */
export const formFieldSchema = z.discriminatedUnion('type', [
  textFieldSchema,
  numberFieldSchema,
  checkboxFieldSchema,
  dateFieldSchema,
  textareaFieldSchema,
  selectFieldSchema,
  radioFieldSchema,
])

/**
 * 定义表单的整体模式验证
 * 包含表单的版本、标题和字段列表
 */
export const formSchema = z
  .object({
    schemaVersion: z.literal(1), // 表单模式版本号
    title: z.string(), // 表单标题
    fields: z.array(formFieldSchema), // 表单字段列表，使用 formFieldSchema 进行验证
  })
  .superRefine((form, ctx) => {
    // 检查字段 ID 是否唯一
    const fieldIds = new Set<string>()

    form.fields.forEach((field, index) => {
      if (fieldIds.has(field.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Field id "${field.id}" is not unique`, // 错误信息
          path: ['fields', index, 'id'],
        })
      } else {
        fieldIds.add(field.id)
      }
    })
  })

export type TextField = z.infer<typeof textFieldSchema>
export type NumberField = z.infer<typeof numberFieldSchema>
export type CheckboxField = z.infer<typeof checkboxFieldSchema>
export type DateField = z.infer<typeof dateFieldSchema>
export type TextareaField = z.infer<typeof textareaFieldSchema>
export type SelectField = z.infer<typeof selectFieldSchema>
export type RadioField = z.infer<typeof radioFieldSchema>

export type FieldOption = z.infer<typeof optionSchema>
/**
 * 从 formSchema 模式中推断出 TypeScript 类型
 * 用于表单数据的类型定义
 */
export type FormSchema = z.infer<typeof formSchema>

/**
 * 从 formFieldSchema 模式中推断出 TypeScript 类型
 * 用于表单字段的类型定义
 */
export type FormField = z.infer<typeof formFieldSchema>

export type FormValue = string | number | boolean | undefined
