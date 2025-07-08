# AntChain Node API 文档

## 基础 URL 配置

基础 URL 根据环境不同而变化：

- **本地开发**: `http://localhost:8080`
- **开发环境**: `http://192.168.8.8:30980`
<!-- - **生产环境**: `http://123.57.86.188:32081` -->

在下面的示例中，请将 `{BASE_URL}` 替换为您的环境特定 URL。

## 数据存储端点

### POST /api/node/data/store

将数据存储到区块链。

禁止在生产环境中存储测试数据。

#### 请求头

- `x-antchain-token` (字符串, 可选): 区块链访问的认证令牌

#### 请求体

```json
{
  "data": any // 必需。可以是字符串或对象（将被字符串化）
}
```

#### 响应

##### 成功 (201 Created)

```json
{
  "success": true,
  "data": {
    // Transaction details returned by blockchain service
  },
  "message": "数据存储成功"
}
```

##### 错误响应

- 400 Bad Request: 缺少数据字段

```json
{
  "success": false,
  "code": "MISSING_DATA",
  "message": "缺少数据字段"
}
```

- 500 Internal Server Error: 存储失败或服务器错误

```json
{
  "success": false,
  "code": "STORAGE_FAILED" | "SERVER_ERROR",
  "message": "数据存储失败" | "服务器处理请求时发生错误"
}
```

## 数据查询端点

### POST /api/node/data/query

从区块链查询数据。

#### 请求头

- `x-antchain-token` (字符串, 可选): 区块链访问的认证令牌

#### 请求体

```json
{
  "dataId": string,     // 可选: 特定数据的 ID
  "hash": string,       // 可选: 要查询的数据哈希
  "timestamp": number,  // 可选: 时间戳过滤器
  "filters": object     // 可选: 额外的过滤条件 (默认: {})
}
```

#### 响应

##### 成功 (200 OK)

```json
{
  "success": true,
  "data": {
    // 从区块链返回的查询结果
  }
}
```

##### 错误响应

- 500 Internal Server Error: 查询失败或服务器错误

```json
{
  "success": false,
  "code": "QUERY_FAILED" | "SERVER_ERROR",
  "message": "数据查询失败" | "服务器处理请求时发生错误"
}
```

## 数据解析端点

### POST /api/node/data/parse

使用内置数据解析器解析区块链数据。

#### 请求体

```json
{
  "data": any // 必需。要解析的数据
}
```

#### 响应

##### 成功 (200 OK)

```json
{
  "success": true,
  "data": {
    // 解析后的数据结果
  }
}
```

## 二维码生成端点

### POST /api/node/qrcode/create

生成可用支付宝扫描访问的二维码

#### 请求体

```json
{
  "params": [
    {
      "key": "txId",
      "value": "0b2e18ad5477f174dcda9174f7c97841087d0f583429287c73ab8cc236d66b29", // 哈希值
      "type": "String"
    }
  ]
}
```

#### 响应

```json
{
  "success": true,
  "data": {
    "qrCodePng": "data:image/png;base64,..."
  }
}
```

#### 注意事项

- 此端点不需要认证
- 解析是使用核心区块链模块的 `parseData` 函数在本地执行的
- 此端点未实现错误处理

## 实际示例

### 存储数据

简单字符串数据:

```bash
## 连接到区块链的生产环境, 尽量不要上传测试数据
curl -X POST {BASE_URL}/api/node/data/store \
  -d '{"data": "Hello, World!"}'
```

复杂对象数据:

```bash
curl -X POST {BASE_URL}/api/node/data/store \
  -H "Content-Type: application/json" \
  -H "x-antchain-token: your-token-here" \
  -d '{
    "data": {
      "type": "user_record",
      "name": "John Doe",
      "timestamp": 1704067200
    }
  }'
```

### 查询数据

通过 dataId 查询:

```bash
curl -X POST {BASE_URL}/api/node/data/query \
  -d '{"dataId": "2b50c37a1bcd977d21c928477bdfa9e8163c50f927e6d3431488fc0067fab210"}'
```

### 解析数据

解析区块链响应数据:

```bash
curl -X POST {BASE_URL}/api/node/data/parse \
  -d '{
    "success": true,
    "data": "{\"blockNumber\":220718,\"hash\":\"2b50c37a1bcd977d21c928477bdfa9e8163c50f927e6d3431488fc0067fab210\",\"transactionDO\":{\"data\":\"IkhlbGxvLCBXb3JsZCEi\",\"timestamp\":1750814699065,\"txType\":\"TX_DEPOSIT_DATA\"}}"
  }'
```

解析器将解码 base64 数据（`IkhlbGxvLCBXb3JsZCEi` 解码为 `"Hello, World!"`）并返回解析后的区块链交易详情。
