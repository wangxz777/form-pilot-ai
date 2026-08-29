import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

import { createFormSchemaGenerator, FormGenerationError } from './generate-form.js'

const DEFAULT_PORT = 9000
const MAX_BODY_SIZE = 64 * 1024
const MAX_PROMPT_LENGTH = 2000
const GENERATE_FORM_PATHS = new Set(['/', '/generate-form'])

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(data))
}

async function readRequestBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length

    if (size > MAX_BODY_SIZE) {
      throw new FormGenerationError('请求内容过大', 413)
    }

    chunks.push(chunk)
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new FormGenerationError('请求体必须是有效 JSON', 400)
  }
}

function readPrompt(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new FormGenerationError('请求体必须是 JSON 对象', 400)
  }

  const prompt = body.prompt

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new FormGenerationError('请输入表单需求', 400)
  }

  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    throw new FormGenerationError(`表单需求不能超过 ${MAX_PROMPT_LENGTH} 个字符`, 400)
  }

  return prompt.trim()
}

export function createRequestHandler({
  generateFormSchema = createFormSchemaGenerator(),
} = {}) {
  return async function requestHandler(request, response) {
    if (request.method === 'OPTIONS') {
      response.writeHead(204)
      response.end()
      return
    }

    const requestPath = new URL(request.url || '/', 'http://localhost').pathname

    if (request.method !== 'POST' || !GENERATE_FORM_PATHS.has(requestPath)) {
      sendJson(response, 404, { message: '接口不存在' })
      return
    }

    try {
      const body = await readRequestBody(request)
      const prompt = readPrompt(body)
      const schema = await generateFormSchema(prompt)

      sendJson(response, 200, { schema })
    } catch (error) {
      if (error instanceof FormGenerationError) {
        sendJson(response, error.statusCode, { message: error.message })
        return
      }

      console.error('Generate form request failed', error)
      sendJson(response, 500, { message: '服务器内部错误' })
    }
  }
}

export function createGenerateFormServer(options) {
  return createServer(createRequestHandler(options))
}

const isEntryFile = process.argv[1] === fileURLToPath(import.meta.url)

if (isEntryFile) {
  const port = Number(process.env.PORT) || DEFAULT_PORT
  const server = createGenerateFormServer()

  server.listen(port, '0.0.0.0', () => {
    console.log(`Generate form function listening on port ${port}`)
  })
}
