/**
 * 项目依赖统一管理文件
 * 集中导入所有第三方依赖，便于版本控制和管理
 */

// ======== Deno 标准库 ========
// 加密
export { crypto } from "std/crypto/mod.ts";
export { encodeBase64, decodeBase64 } from "std/encoding/base64.ts";
export { encodeHex, decodeHex } from "std/encoding/hex.ts";

// 文件系统和路径
export * as path from "std/path/mod.ts";

// ======== Web 框架 ========
// Oak 框架
export { 
  Application, 
  Router, 
  Context, 
  Status, 
  isHttpError,
  httpErrors 
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

export type { 
  RouterContext, 
  Middleware, 
  State,
  RouteParams
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

// ======== 工具库 ========
// UUID 生成
export { v4 as uuidv4 } from "uuid";

// JWT 相关
export { 
  create as createJwt,
  verify as verifyJwt, 
} from "https://deno.land/x/djwt@v2.8/mod.ts";
export type { Header as JwtHeader, Payload as JwtPayload } from "https://deno.land/x/djwt@v2.8/mod.ts";

// ======== 项目类型定义 ========
// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
  rawResponse?: string; // Raw response text for error handling
}

// 分页响应
export interface PaginatedResponse<T = any> extends ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}> {}

// ======== 项目配置导入 ========
// 导出配置，方便直接从 deps 导入
export { defaultConfig, getConfig } from "./config/index.ts"; 