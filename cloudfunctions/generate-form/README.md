# generate-form HTTP 云函数

将自然语言表单需求发送给阿里云百炼，并返回受 JSON Schema 约束的候选表单结构。

## 接口

```http
POST /generate-form
Content-Type: application/json

{
  "prompt": "生成一份活动报名表"
}
```

成功响应：

```json
{
  "schema": {
    "schemaVersion": 1,
    "title": "活动报名表",
    "fields": []
  }
}
```

## CloudBase 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DASHSCOPE_API_KEY` | 是 | 百炼 API Key，只配置在云函数环境中 |
| `DASHSCOPE_BASE_URL` | 是 | 百炼 OpenAI 兼容接口 Base URL |
| `DASHSCOPE_MODEL` | 否 | 默认 `qwen3.8-flash` |
| `ALLOWED_ORIGIN` | 否 | 允许跨域访问的前端 Origin；未配置时为 `*` |

北京业务空间的 Base URL：

```text
https://ws-h4lw3w055gewflh0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

## 本地验证

```bash
pnpm test:cloud-function
```

如需进行真实本地调用，在当前终端临时设置环境变量后运行：

```bash
cd cloudfunctions/generate-form
node index.js
```

服务监听 `0.0.0.0:9000`。不要创建或提交包含真实 API Key 的 `.env` 文件。

## CloudBase 部署要点

- 环境 ID：`form-pilot-ai-d6g3opa0t18bca732`
- 函数类型：HTTP 云函数
- Node.js 运行时：18 或更高版本
- 启动文件：`scf_bootstrap`
- 函数超时时间应大于百炼请求的 45 秒超时
- `cloudbaserc.json` 会把网关路径 `/generate-form` 关联到该函数
- 不设置 `public: true`；新环境的空 Rego 策略会导致 CLI 自动开放匿名访问失败，HTTP 路由使用默认的 `enableAuth: false`
- 当前线上路由限制总 QPS 为 20，并按客户端 IP 限制为每秒 2 次；浏览器收到 `429` 时应提示稍后重试

项目根目录执行：

```bash
cp .env.example .env
# 只在本地 .env 中填写真实 DASHSCOPE_API_KEY
pnpm dlx --package @cloudbase/cli tcb login
pnpm dlx --package @cloudbase/cli tcb fn deploy generate-form
```

`.env` 已被 Git 忽略。CloudBase 网关默认会移除匹配到的路径前缀，因此函数同时接受内部 `/` 和本地调试使用的 `/generate-form`。
