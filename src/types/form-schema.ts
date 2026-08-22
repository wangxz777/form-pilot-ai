import { z } from 'zod'

export const BaseFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().optional(),
})

export type BaseField = z.infer<typeof BaseFieldSchema>

export const TextFieldSchema = BaseFieldSchema.extend({
  type: z.literal('text'),
  placeholder: z.string().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().nonnegative().optional(),
})

export type TextField = z.infer<typeof TextFieldSchema>

export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number'),
  placeholder: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

export type NumberField = z.infer<typeof NumberFieldSchema>

export const SelectOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
})

export type SelectOption = z.infer<typeof SelectOptionSchema>

export const SelectFieldSchema = BaseFieldSchema.extend({
  type: z.literal('select'),
  placeholder: z.string().optional(),
  options: z.array(SelectOptionSchema).min(1),
})

export type SelectField = z.infer<typeof SelectFieldSchema>

export const TextareaFieldSchema = BaseFieldSchema.extend({
  type: z.literal('textarea'),
  placeholder: z.string().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().nonnegative().optional(),
})

export type TextareaField = z.infer<typeof TextareaFieldSchema>

export const RadioFieldSchema = BaseFieldSchema.extend({
  type: z.literal('radio'),
  options: z.array(SelectOptionSchema).min(1),
})

export type RadioField = z.infer<typeof RadioFieldSchema>

export const CheckboxFieldSchema = BaseFieldSchema.extend({
  type: z.literal('checkbox'),
})

export type CheckboxField = z.infer<typeof CheckboxFieldSchema>

export const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal('date'),
})

export type DateField = z.infer<typeof DateFieldSchema>

export const FormFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  NumberFieldSchema,
  SelectFieldSchema,
  TextareaFieldSchema,
  RadioFieldSchema,
  CheckboxFieldSchema,
  DateFieldSchema,
])

export type FormField = z.infer<typeof FormFieldSchema>

export type FieldType = FormField['type']

export const FormSchemaSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    title: z.string().min(1),
    fields: z.array(FormFieldSchema),
  })
  .superRefine((schema, context) => {
    const fieldIds = new Set<string>()

    for (const [index, field] of schema.fields.entries()) {
      if (fieldIds.has(field.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `字段 ID ${field.id} 重复`,
          path: ['fields', index, 'id'],
        })
      }
      fieldIds.add(field.id)

      if (
        (field.type === 'text' || field.type === 'textarea') &&
        field.minLength !== undefined &&
        field.maxLength !== undefined &&
        field.minLength > field.maxLength
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'minLength 不能大于 maxLength',
          path: ['fields', index],
        })
      }

      if (
        field.type === 'number' &&
        field.min !== undefined &&
        field.max !== undefined &&
        field.min > field.max
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'min 不能大于 max',
          path: ['fields', index],
        })
      }
    }
  })

export type FormSchema = z.infer<typeof FormSchemaSchema>
