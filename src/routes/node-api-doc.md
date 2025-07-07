# AntChain Node API Documentation

## Base URL Configuration

The base URL varies by environment:

- **Local Development**: `http://localhost:8080`
- **Dev Environment**: `http://192.168.8.8:30980`
<!-- - **Production**: `http://123.57.86.188:32081` -->

Replace `{BASE_URL}` in the examples below with your environment-specific URL.

## Data Store Endpoint

### POST /api/node/data/store

Store data to the blockchain. 

Forbidden to store test data in the production environment.

#### Request Headers

- `x-antchain-token` (string, optional): Authentication token for blockchain access

#### Request Body

```json
{
  "data": any // Required. Can be string or object (will be stringified)
}
```

#### Response

##### Success (201 Created)

```json
{
  "success": true,
  "data": {
    // Transaction details returned by blockchain service
  },
  "message": "数据存储成功"
}
```

##### Error Responses

- 400 Bad Request: Missing data field

```json
{
  "success": false,
  "code": "MISSING_DATA",
  "message": "缺少数据字段"
}
```

- 500 Internal Server Error: Storage failed or server error

```json
{
  "success": false,
  "code": "STORAGE_FAILED" | "SERVER_ERROR",
  "message": "数据存储失败" | "服务器处理请求时发生错误"
}
```

## Data Query Endpoint

### POST /api/node/data/query

Query data from the blockchain.

#### Request Headers

- `x-antchain-token` (string, optional): Authentication token for blockchain access

#### Request Body

```json
{
  "dataId": string,     // Optional: ID of specific data
  "hash": string,       // Optional: Hash of data to query
  "timestamp": number,  // Optional: Timestamp filter
  "filters": object     // Optional: Additional filter criteria (default: {})
}
```

#### Response

##### Success (200 OK)

```json
{
  "success": true,
  "data": {
    // Query results from blockchain
  }
}
```

##### Error Responses

- 500 Internal Server Error: Query failed or server error

```json
{
  "success": false,
  "code": "QUERY_FAILED" | "SERVER_ERROR",
  "message": "数据查询失败" | "服务器处理请求时发生错误"
}
```

## Data Parse Endpoint

### POST /api/node/data/parse

Parse blockchain data using the built-in data parser.

#### Request Body

```json
{
  "data": any // Required. Data to be parsed
}
```

#### Response

##### Success (200 OK)

```json
{
  "success": true,
  "data": {
    // Parsed data result
  }
}
```

#### Notes

- This endpoint does not require authentication
- The parsing is performed locally using the `parseData` function from the core blockchain module
- No error handling is implemented for this endpoint

## Real-world Examples

### Store Data

Simple string data:

```bash
## 连接到区块链的生产环境, 尽量不要上传测试数据
curl -X POST {BASE_URL}/api/node/data/store \
  -d '{"data": "Hello, World!"}'
```

Complex object data:

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

### Query Data

Query by dataId:

```bash
curl -X POST {BASE_URL}/api/node/data/query \
  -d '{"dataId": "2b50c37a1bcd977d21c928477bdfa9e8163c50f927e6d3431488fc0067fab210"}'
```

Query with filters:

```bash
curl -X POST {BASE_URL}/api/node/data/query \
  -H "Content-Type: application/json" \
  -H "x-antchain-token: your-token-here" \
  -d '{
    "dataId": "12345",
    "filters": {
      "type": "user_record"
    }
  }'
```

### Parse Data

Parse blockchain response data:

```bash
curl -X POST {BASE_URL}/api/node/data/parse \
  -d '{
    "success": true,
    "data": "{\"blockNumber\":220718,\"hash\":\"2b50c37a1bcd977d21c928477bdfa9e8163c50f927e6d3431488fc0067fab210\",\"transactionDO\":{\"data\":\"IkhlbGxvLCBXb3JsZCEi\",\"timestamp\":1750814699065,\"txType\":\"TX_DEPOSIT_DATA\"}}"
  }'
```

The parser will decode the base64 data (`IkhlbGxvLCBXb3JsZCEi` decodes to `"Hello, World!"`) and return the parsed blockchain transaction details.
