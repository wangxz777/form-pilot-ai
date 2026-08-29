const baseFieldProperties = {
  id: {
    type: 'string',
    pattern: '^[a-z][a-z0-9_]*$',
    description: '字段唯一标识，使用简短的 snake_case 英文名称',
  },
  label: {
    type: 'string',
    minLength: 1,
    description: '展示给用户的中文字段名称',
  },
  required: {
    type: 'boolean',
    description: '是否必填',
  },
}

const optionSchema = {
  type: 'object',
  properties: {
    label: {
      type: 'string',
      minLength: 1,
      description: '展示给用户的选项名称',
    },
    value: {
      type: 'string',
      minLength: 1,
      description: '选项值，同一字段内保持唯一',
    },
  },
  required: ['label', 'value'],
  additionalProperties: false,
}

function createFieldSchema(type, properties = {}, required = []) {
  return {
    type: 'object',
    properties: {
      ...baseFieldProperties,
      type: { const: type },
      ...properties,
    },
    required: ['id', 'label', 'type', ...required],
    additionalProperties: false,
  }
}

const lengthProperties = {
  minLength: {
    type: 'integer',
    minimum: 0,
    description: '允许输入的最小字符数',
  },
  maxLength: {
    type: 'integer',
    minimum: 0,
    description: '允许输入的最大字符数',
  },
}

const numberProperties = {
  min: {
    type: 'number',
    description: '允许输入的最小数字',
  },
  max: {
    type: 'number',
    description: '允许输入的最大数字',
  },
}

const optionsProperties = {
  options: {
    type: 'array',
    minItems: 1,
    items: optionSchema,
    description: '可供用户选择的选项',
  },
}

export const formSchemaResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'form_schema',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        schemaVersion: {
          const: 1,
          description: 'FormPilot Schema 版本，固定为 1',
        },
        title: {
          type: 'string',
          minLength: 1,
          description: '表单标题',
        },
        fields: {
          type: 'array',
          minItems: 1,
          maxItems: 30,
          items: {
            anyOf: [
              createFieldSchema('text', lengthProperties),
              createFieldSchema('number', numberProperties),
              createFieldSchema('textarea', lengthProperties),
              createFieldSchema('select', optionsProperties, ['options']),
              createFieldSchema('radio', optionsProperties, ['options']),
              createFieldSchema('checkbox'),
              createFieldSchema('date'),
            ],
          },
        },
      },
      required: ['schemaVersion', 'title', 'fields'],
      additionalProperties: false,
    },
  },
}
