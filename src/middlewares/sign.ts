// 使用Deno的标准库导入
import { crypto } from "https://deno.land/std@0.220.0/crypto/mod.ts";

/**
 * 对请求进行签名，计算待签名内容为：
 * URL 路径 + 排序后的请求头拼接字符串 + 排序后的查询参数拼接字符串 + 请求体字符串
 */
export async function calculateSignature(
  isvSk: string,
  urlPath: string, 
  headers: Record<string, string> = {},
  params: Record<string, string | string[]> = {}, 
  body: unknown = null
): Promise<string> {
  // 确保 headers 和 params 是对象
  headers = headers || {};
  params = params || {};

  // 1. 排序并拼接请求头（格式 key=value，用 & 连接）
  const sortedHeaderKeys = Object.keys(headers).sort();
  const headerString = sortedHeaderKeys
    .map((key) => `${key}=${headers[key]}`)
    .join("&");

  // 2. 处理并排序拼接查询参数
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // 多值参数用逗号连接
      queryParams[key] = value.join(',');
    } else {
      queryParams[key] = value;
    }
  }
  const sortedQueryKeys = Object.keys(queryParams).sort();
  const queryString = sortedQueryKeys
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&");

  // 3. 处理请求体
  let bodyString = "";
  if (body !== undefined && body !== null) {
    if (typeof body === "string") {
      bodyString = body;
    } else if (typeof body === "object") {
      try {
        bodyString = JSON.stringify(body);
      } catch (e) {
        console.error("无法将 body 转为字符串：", e);
        bodyString = "";
      }
    } else {
      bodyString = String(body);
    }
  }

  // 4. 拼接待签名内容
  const signContent = urlPath + headerString + queryString + bodyString;
  
  // 输出内容以便调试
  console.log('String to sign:');
  console.log(signContent);

  // 5. 使用 TextEncoder 转换字符串为字节
  const encoder = new TextEncoder();
  const signContentBytes = encoder.encode(signContent);
  const keyBytes = encoder.encode(isvSk);

  // 6. 导入 HMAC 密钥并计算签名（SHA-256）
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, signContentBytes);

  // 7. 将签名结果转换为 Base64 字符串
  const signatureArray = new Uint8Array(signatureBuffer);
  const base64Signature = btoa(String.fromCharCode(...signatureArray));

  return base64Signature;
}

/**
 * 对URL对象直接进行签名
 */
export async function signRequest(
  url: URL,
  headers: Record<string, string>,
  body: unknown,
  isvSk: string,
): Promise<string> {
  const encoder = new TextEncoder();

  // 1. 获取并编码URL路径
  const pathBytes = encoder.encode(url.pathname);
  
  // 2. 处理headers并编码
  const headerItems: string[] = [];
  Object.keys(headers).sort().forEach(key => {
    headerItems.push(`${key}=${headers[key]}`);
  });
  const headersStr = headerItems.join("&");
  const headersBytes = encoder.encode(headersStr);
  
  // 3. 处理查询参数并编码
  const paramItems: string[] = [];
  const searchParams = new URLSearchParams(url.search);
  Array.from(searchParams.keys()).sort().forEach(key => {
    paramItems.push(`${key}=${searchParams.getAll(key).join(',')}`);
  });
  const paramsStr = paramItems.join("&");
  const paramsBytes = encoder.encode(paramsStr);
  
  // 4. 创建一个组合字节数组，模拟Java的Buffer写入
  // 先计算总长度
  let totalLength = pathBytes.length + headersBytes.length + paramsBytes.length;
  let bodyBytes = new Uint8Array(0);
  
  // 5. 如果有请求体，直接转为字节
  if (body !== undefined && body !== null) {
    if (typeof body === 'string') {
      // 如果body已经是字符串，直接编码
      bodyBytes = encoder.encode(body);
    } else if (body instanceof Uint8Array) {
      // 如果已经是字节数组，直接使用
      bodyBytes = body;
    } else {
      // 否则序列化为JSON字符串再编码
      try {
        const bodyStr = JSON.stringify(body);
        bodyBytes = encoder.encode(bodyStr);
      } catch (e) {
        console.error("无法将body转为JSON:", e);
      }
    }
    
    // 更新总长度
    totalLength += bodyBytes.length;
  }
  
  // 6. 创建完整的签名字节数组
  const signatureBytes = new Uint8Array(totalLength);
  
  // 7. 填充字节数组（模拟Java中的Buffer追加操作）
  let offset = 0;
  
  // 先写入路径
  signatureBytes.set(pathBytes, offset);
  offset += pathBytes.length;
  
  // 写入headers
  signatureBytes.set(headersBytes, offset);
  offset += headersBytes.length;
  
  // 写入参数
  signatureBytes.set(paramsBytes, offset);
  offset += paramsBytes.length;
  
  // 写入body（如果存在）
  if (bodyBytes.length > 0) {
    signatureBytes.set(bodyBytes, offset);
  }
  
  // 输出调试信息
  console.log('签名前的内容结构:');
  console.log(`Path(${pathBytes.length}字节): ${url.pathname}`);
  console.log(`Headers(${headersBytes.length}字节): ${headersStr}`);
  console.log(`Params(${paramsBytes.length}字节): ${paramsStr}`);
  console.log(`Body(${bodyBytes.length}字节)`);
  console.log(`总计: ${totalLength}字节`);
  
  // 8. 导入HMAC密钥并计算签名
  const keyBytes = encoder.encode(isvSk);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, signatureBytes);
  
  // 9. 将签名转换为Base64
  const signatureArray = new Uint8Array(signatureBuffer);
  const base64Signature = btoa(String.fromCharCode(...signatureArray));
  
  return base64Signature;
}

/**
 * 连接参数映射为字符串，模拟Java版本的connectParamMap方法
 */
function connectParamMap(paramMap: Map<string, string>): string {
  if (paramMap.size === 0) {
    return "";
  }
  
  let result = "";
  let first = true;
  
  // 确保按键排序遍历
  Array.from(paramMap.keys()).sort().forEach(key => {
    const value = paramMap.get(key) || "";
    if (!first) {
      result += "&";
    }
    result += `${key}=${value}`;
    first = false;
  });
  
  return result;
}
// 定义常量
const isvSk = '73y8jTkIr64Tw826'; // 替换为实际的密钥
// const method = 'GET';
const urlPath = '/api/project/pageQuery';

// 首先构建所有需要的headers
const headers: Record<string, string> = {
  "x-authentication-version": "1.0",
  "x-authentication-type": "isv",
  "x-tenant-id": "pds1Admin",
  "x-isv-ak": "pzeUK+obho+uFPeS",
  "x-signature-method": "SHA256_HMAC",
};

// 查询参数示例
const params = {
  // 如果有URL参数，放在这里
  // 示例：多值参数
  // "tags": ["tag1", "tag2"]
  "page": "1",
  "pageSize": "10"
};


// 示例一：使用calculateSignature
async function example1() {
  // 添加timestamp
  // const timestamp = Date.now();
  // headers["x-timestamp"] = timestamp.toString();
  const method = 'GET';
  // 计算签名
  const signature = await calculateSignature(isvSk, urlPath, headers, params, body);

  // 添加签名到headers
  headers["x-signature"] = signature;

  console.log('\n计算结果 (calculateSignature):');
  console.log(`签名值: ${signature}`);
  console.log('\n完整的curl命令:');
  
  // 构建查询参数字符串
  const queryParts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
      }
    } else {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  
  // 构建curl命令 - 对于GET请求，参数应该在URL中
  let curlCommand = `curl -X ${method} http://123.57.86.188:32081${urlPath}${queryString}`;
  
  // 添加所有的headers
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }
  
  // 对于GET请求，不添加请求体
  if (method !== 'GET' && body !== null) {
    curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  }
  
  console.log(curlCommand);

  // 输出更多调试信息
  console.log('\n调试信息:');
  console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
  console.log(`Query Parameters: ${JSON.stringify(params, null, 2)}`);
  console.log(`Request Body: ${JSON.stringify(body)}`);
}

// 示例二：使用signRequest
async function example2() {
  const method = 'GET';
  // 创建URL
  const url = new URL(`http://123.57.86.188:32081${urlPath}`);
  // 添加查询参数（如果有）
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        url.searchParams.append(key, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  // 使用signRequest签名
  const signature = await signRequest(url, headers, body, isvSk);
  
  // 添加签名到headers
  headers["x-signature"] = signature;

  console.log('\n计算结果 (signRequest):');
  console.log(`签名值: ${signature}`);
  console.log('\n完整的curl命令:');
  
  // 构建curl命令 - URL已经包含了查询参数
  let curlCommand = `curl -X ${method} ${url.toString()}`;
  
  // 添加所有的headers
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }
  
  // 对于GET请求，不添加请求体
  if (method !== 'GET' && body !== null) {
    curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  }
  
  console.log(curlCommand);

  // 输出更多调试信息
  console.log('\n调试信息:');
  console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
  console.log(`URL: ${url.toString()}`);
  console.log(`Request Body: ${JSON.stringify(body)}`);
}

async function example3() {
  const body = {
    "projectId": "PROJ_20250323163915_2nW3f7wz",
    "envId": "ENV_20250323163915_8EJkp60z",
    "appId": "APP_20250323164059_kHFeIqTg",
    "dynamicParam": "{\"dynamicParameter\":\"\",\"operatorList\":[{\"code\":\"dataset_reader\",\"id\":\"1af6c6a3-f40f-4c99-8d36-3f995e6ce816\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"0352d09d-db26-4729-b207-2dcdf6c9a75b\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164852_moyjsDA0\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"dataset_reader\",\"id\":\"475f757e-beae-4b70-9e78-892bf5f59855\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"04650d44-4eb5-4d29-b70c-ce86bfdff684\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164711_44Uq3G97\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"data_writer\",\"id\":\"c9706900-23d8-48a9-b1c3-30d70f7d9db1\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATA_WRITER\\\",\\\"params\\\":{\\\"isCipherText\\\":false}},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"storage_type\\\":\\\"true\\\",\\\"owner_did\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\",\\\"format_type\\\":\\\"CSV\\\",\\\"name\\\":\\\"result\\\",\\\"is_manage\\\":true}\"},{\"code\":\"scql\",\"id\":\"550a900b-58ea-4bb9-a976-cedd1c54b88e\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"SQL\\\",\\\"params\\\":{\\\"receiverRoleName\\\":\\\"receiver\\\"}},\\\"enablePreConfig\\\":true,\\\"preset\\\":\\\"preset-shape-double-knife\\\",\\\"checkRules\\\":[{\\\"parameterPaths\\\":[\\\"$.dp_{workerIndex}__ccl.column_ccl.keySet()\\\"],\\\"constraintRule\\\":\\\"EXIST_IN_DATASET_FIELD\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]},{\\\"constraintRule\\\":\\\"WORKER_NOT_SAME\\\",\\\"params\\\":{\\\"roleList\\\":[\\\"dp\\\"]}},{\\\"parameterPaths\\\":[\\\"$.dp_0__table_name\\\",\\\"$.dp_1__table_name\\\"],\\\"params\\\":\\\"^[A-Za-z0-9_$]*$\\\",\\\"constraintRule\\\":\\\"REG_EX\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]}],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"WORKER_NUM\\\",\\\"role\\\":\\\"dp\\\",\\\"mapParams\\\":{\\\"1\\\":{\\\"module\\\":\\\"scql_single_dp\\\"}}}}\",\"dynamicParameter\":\"{\\\"dp_0__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"result_table_create_cmd\\\":\\\"CREATE table result_table (average_value double)\\\",\\\"query_cmd\\\":\\\"SELECT AVG(combined_values) AS average_value FROM ( SELECT value_0 AS combined_values FROM t1 UNION ALL SELECT value_0 AS combined_values FROM t2 ) AS combined_data\\\",\\\"dp_1__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"dp_0__table_name\\\":\\\"t1\\\",\\\"dp_1__table_name\\\":\\\"t2\\\",\\\"_worker\\\":{\\\"receiver\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\"}}\"}]}"
  };
  
  // 设置URL和请求信息
  const urlPath = '/api/app/instance/create';
  const baseUrl = 'http://123.57.86.188:32081';
  const url = new URL(`${baseUrl}${urlPath}`);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "x-authentication-version": "1.0",
    "x-authentication-type": "isv",
    "x-tenant-id": "pds1Admin",
    "x-isv-ak": "pzeUK+obho+uFPeS",
    "x-signature-method": "SHA256_HMAC",
  };
  
  console.log("API Endpoint:", `${baseUrl}${urlPath}`);
  console.log("Headers Before Signing:");
  console.log(headers);

  const signature = await signRequest(url, headers, body, isvSk);
  console.log("Generated Signature:", signature);
  
  // 添加签名到Headers
  headers["x-signature"] = signature;
  
  // 构建curl命令，确保使用相同的字符串
  let curlCommand = `curl -X POST "${baseUrl}${urlPath}"`;
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }
  // 使用完全相同的bodyString构建命令
  curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  
  console.log("\n完整的curl命令:");
  console.log(curlCommand);

}


async function example4() {
  const body = {
    "name": "api_test",
    "description": "api_test",
    "writable": true,
    "type": "MYSQL",
    "connConfig": "{\"host\":\"127.0.0.1\",\"port\":3306,\"username\":\"root\",\"password\":\"123456\",\"database\":\"test\",\"schema\":\"\"}"
  };
  const method = 'POST';
  const urlPath = '/api/datasource/create';
  const url = new URL(`http://123.57.86.188:32081${urlPath}`);
  // 添加查询参数（如果有）
  const params = {  };
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        url.searchParams.append(key, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  // 使用signRequest签名
  const signature = await signRequest(url, headers, body, isvSk);

  // 添加签名到headers
  headers["x-signature"] = signature;

  console.log('\n计算结果 (signRequest):');
  console.log(`签名值: ${signature}`);
  console.log('\n完整的curl命令:');

  // 构建curl命令 - URL已经包含了查询参数
  let curlCommand = `curl -X ${method} ${url.toString()}`;

  // 添加所有的headers
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }

  // 对于GET请求，不添加请求体
  if (method !== 'GET' && body !== null) {
    curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  }

  console.log(curlCommand);

  // 输出更多调试信息
  console.log('\n调试信息:');
  console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
  console.log(`URL: ${url.toString()}`);
  console.log(`Request Body: ${JSON.stringify(body)}`);

  
}


async function example5() {
  const body = {
    "projectId": "PROJ_20250323163915_2nW3f7wz",
    "envId": "ENV_20250323163915_8EJkp60z",
    "appId": "APP_20250323164059_kHFeIqTg",
    "dynamicParam": "{\"dynamicParameter\":\"\",\"operatorList\":[{\"code\":\"dataset_reader\",\"id\":\"1af6c6a3-f40f-4c99-8d36-3f995e6ce816\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"0352d09d-db26-4729-b207-2dcdf6c9a75b\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164852_moyjsDA0\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"dataset_reader\",\"id\":\"475f757e-beae-4b70-9e78-892bf5f59855\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"04650d44-4eb5-4d29-b70c-ce86bfdff684\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164711_44Uq3G97\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"data_writer\",\"id\":\"c9706900-23d8-48a9-b1c3-30d70f7d9db1\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATA_WRITER\\\",\\\"params\\\":{\\\"isCipherText\\\":false}},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"storage_type\\\":\\\"true\\\",\\\"owner_did\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\",\\\"format_type\\\":\\\"CSV\\\",\\\"name\\\":\\\"result\\\",\\\"is_manage\\\":true}\"},{\"code\":\"scql\",\"id\":\"550a900b-58ea-4bb9-a976-cedd1c54b88e\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"SQL\\\",\\\"params\\\":{\\\"receiverRoleName\\\":\\\"receiver\\\"}},\\\"enablePreConfig\\\":true,\\\"preset\\\":\\\"preset-shape-double-knife\\\",\\\"checkRules\\\":[{\\\"parameterPaths\\\":[\\\"$.dp_{workerIndex}__ccl.column_ccl.keySet()\\\"],\\\"constraintRule\\\":\\\"EXIST_IN_DATASET_FIELD\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]},{\\\"constraintRule\\\":\\\"WORKER_NOT_SAME\\\",\\\"params\\\":{\\\"roleList\\\":[\\\"dp\\\"]}},{\\\"parameterPaths\\\":[\\\"$.dp_0__table_name\\\",\\\"$.dp_1__table_name\\\"],\\\"params\\\":\\\"^[A-Za-z0-9_$]*$\\\",\\\"constraintRule\\\":\\\"REG_EX\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]}],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"WORKER_NUM\\\",\\\"role\\\":\\\"dp\\\",\\\"mapParams\\\":{\\\"1\\\":{\\\"module\\\":\\\"scql_single_dp\\\"}}}}\",\"dynamicParameter\":\"{\\\"dp_0__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"result_table_create_cmd\\\":\\\"CREATE table result_table (average_value double)\\\",\\\"query_cmd\\\":\\\"SELECT AVG(combined_values) AS average_value FROM ( SELECT value_0 AS combined_values FROM t1 UNION ALL SELECT value_0 AS combined_values FROM t2 ) AS combined_data\\\",\\\"dp_1__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"dp_0__table_name\\\":\\\"t1\\\",\\\"dp_1__table_name\\\":\\\"t2\\\",\\\"_worker\\\":{\\\"receiver\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\"}}\"}]}"
  };
  const method = 'POST';
  const urlPath = '/api/app/instance/create';
  const url = new URL(`http://123.57.86.188:32081${urlPath}`);
  // 添加查询参数（如果有）
  const params = {  };
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        url.searchParams.append(key, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  // 使用signRequest签名
  const signature = await signRequest(url, headers, body, isvSk);

  // 添加签名到headers
  headers["x-signature"] = signature;
  headers["Content-Type"] = "application/json";

  console.log('\n计算结果 (signRequest):');
  console.log(`签名值: ${signature}`);
  console.log('\n完整的curl命令:');

  // 构建curl命令 - URL已经包含了查询参数
  let curlCommand = `curl -X ${method} ${url.toString()}`;

  // 添加所有的headers
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }

  // 对于GET请求，不添加请求体
  if (method !== 'GET' && body !== null) {
    curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  }

  console.log(curlCommand);

  // 输出更多调试信息
  console.log('\n调试信息:');
  console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
  console.log(`URL: ${url.toString()}`);
  console.log(`Request Body: ${JSON.stringify(body)}`);
}


async function example6() {
  const body = {
    "name": "testdata",
    "description": "testdata",
    "datasourceType": "API",
    "locationConfig": "{}",
    "formatConfig": "{}",
    "connConfig": "{\"script\":\"package com.antgroup.antchain.fastdf.dataproxy.manager.connector.api\\n\\nimport com.alibaba.fastjson.JSONArray\\nimport com.alibaba.fastjson.JSONObject\\nimport com.antgroup.antchain.idata.rest.component.common.data.AbstractRestApiDataFetchAdaptor\\nimport com.antgroup.antchain.idata.rest.component.common.model.FetchDataResultBO\\nimport com.antgroup.antchain.idata.rest.component.common.model.RestApiDataSourceConfigBO\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetMetaTableSchemaFieldTypeEnum\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.ApiDatasetResponse\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetTableSchemaFieldData\\nimport lombok.AllArgsConstructor\\nimport lombok.Builder\\nimport lombok.Data\\nimport lombok.NoArgsConstructor\\nimport okhttp3.*\\nimport org.apache.commons.lang3.ObjectUtils\\n\\nimport javax.validation.constraints.NotBlank\\n\\nclass DatasetDemo extends AbstractRestApiDataFetchAdaptor<DatasetRequest, ApiDatasetResponse> {\\n\\n    DatasetDemo(OkHttpClient client, RestApiDataSourceConfigBO config) {\\n        super(client, config)\\n    }\\n\\n    @Override\\n    Request.Builder createNewCall(DatasetRequest validatedCondition, String token) throws Exception {\\n\\n        String url = 'https://qgzvkongdjqiiamzbbts.supabase.co/functions/v1/request_process_data'\\n\\n        JSONObject requestBody = new JSONObject()\\n        if (!ObjectUtils.isEmpty(validatedCondition)) {\\n            if (!ObjectUtils.isEmpty(validatedCondition.getId())) {\\n                requestBody.put('id', validatedCondition.getId())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getVersion())) {\\n                requestBody.put('version', validatedCondition.getVersion())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getDataSetInternalID())) {\\n                requestBody.put('dataSetInternalID', validatedCondition.getDataSetInternalID())\\n            }\\n        }\\n\\n        RequestBody body = RequestBody.create(MediaType.parse('application/json'),\\n                requestBody.toJSONString());\\n\\n        return new Request.Builder()\\n                .url(url)\\n                .post(body)\\n                .addHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnenZrb25nZGpxaWlhbXpiYnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjUyMzQsImV4cCI6MjA1NTk0MTIzNH0.PsZIcjAqexpqIg-91twpKjALyw9big6Bn4WRLLoCzTo')\\n                .addHeader('Content-Type', 'application/json')\\n                .addHeader('x_key', '1qaZ_Xsw2_Mju7');\\n    }\\n\\n    @Override\\n    protected FetchDataResultBO<ApiDatasetResponse> parseHttpResponse(DatasetRequest apiDatasetRequest, String body) {\\n\\n        JSONObject res = JSONObject.parseObject(body)\\n        JSONArray data = res.getJSONArray('value')\\n        ApiDatasetResponse response = new ApiDatasetResponse()\\n        List<List<DatasetTableSchemaFieldData>> dataList = new ArrayList<>()\\n        List<DatasetTableSchemaFieldData> datasetTableSchemaFieldDataList = new ArrayList<>()\\n\\n        for (int i = 0; i < data.size(); i++) {                \\n            DatasetTableSchemaFieldData datasetTableSchemaFieldData = new DatasetTableSchemaFieldData()\\n            datasetTableSchemaFieldData.setFieldName(\\\"value_\\\" + i)\\n            datasetTableSchemaFieldData.setFieldType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentValue(data.get(i))\\n            datasetTableSchemaFieldDataList.add(datasetTableSchemaFieldData)\\n        }\\n        \\n        dataList.add(datasetTableSchemaFieldDataList)\\n        response.setDataList(dataList)\\n        response.setJsonResult(body)\\n        return FetchDataResultBO.success(response)\\n    }\\n\\n    @Data\\n    @Builder\\n    @NoArgsConstructor\\n    @AllArgsConstructor\\n    static class DatasetRequest {\\n        @NotBlank\\n        public String id;\\n        \\n        public String version;\\n        \\n        public String dataSetInternalID;  \\n\\n        String getId() {\\n            return id;\\n        }\\n        \\n        void setId(String id) {\\n            this.id = id;\\n        }\\n        \\n        String getVersion() {\\n            return version;\\n        }\\n        \\n        void setVersion(String version) {\\n            this.version = version;\\n        }\\n        \\n        String getDataSetInternalID() { \\n            return dataSetInternalID;\\n        }\\n        \\n        void setDataSetInternalID(String dataSetInternalID) { \\n            this.dataSetInternalID = dataSetInternalID;\\n        }\\n    }\\n}\"}",
    "customParams": [
      {
        "name": "id",
        "type": "STRING",
        "description": "",
        "nullable": false,
        "value": "42d1385b-178a-4a04-b58c-1d5668c32ffd"
      },
      {
        "name": "version",
        "type": "STRING",
        "description": "",
        "nullable": true,
        "value": "00.00.001"
      },
      {
        "name": "dataSetInternalID",
        "type": "STRING",
        "description": "",
        "nullable": true,
        "value": "0"
      }
    ],
    "formatType": "API_DATA"
  }
  const method = 'POST';
  const urlPath = '/api/dataset/local/testConnecivity';
  const url = new URL(`http://123.57.86.188:32081${urlPath}`);
  // 添加查询参数（如果有）
  const params = {  };
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        url.searchParams.append(key, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  // 使用signRequest签名
  const signature = await signRequest(url, headers, body, isvSk);

  // 添加签名到headers
  headers["x-signature"] = signature;
  headers["Content-Type"] = "application/json";
  console.log('\n计算结果 (signRequest):');
  console.log(`签名值: ${signature}`);
  console.log('\n完整的curl命令:');

  // 构建curl命令 - URL已经包含了查询参数
  let curlCommand = `curl -X ${method} ${url.toString()}`;
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H "${key}: ${value}"`;
  }
  curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
  
  console.log(curlCommand);
        
}
// 执行示例函数
async function main() {
  // await example1();
  // console.log("\n------------------------------------------------\n");
  // delete headers["x-signature"];
  // await example2();
  console.log("\n------------------------------------------------\n");
  // await example3();
  await example5();
  // await example6();
}

// main();

// console.log('\n使用说明:');
// console.log('1. 将isvSk变量替换为您实际的密钥');
// console.log('2. 根据需要修改请求方法、URL路径、请求头和请求体');
// console.log('3. 运行脚本: deno run -A src/middlewares/sign.ts');
// console.log('4. 复制输出的curl命令进行使用');

//String to sign:
// http://123.57.86.188:32081/api/project/pageQueryx-authentication-type=isv&x-authentication-version=1.0&x-isv-ak=pzeUK+obho+uFPeS&x-signature-method=SHA256_HMAC&x-tenant-id=pds1Admin
//                           /api/project/pageQueryx-authentication-type=isv&x-authentication-version=1.0&x-isv-ak=pzeUK+obho+uFPeS&x-signature-method=SHA256_HMAC&x-tenant-id=pds1Adminpage=1&pageSize=10