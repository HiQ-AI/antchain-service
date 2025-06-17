/**
 * Middlewares 中间件导出
 * 提供HTTP请求处理的中间件功能
 */

// 认证中间件
export { authMiddleware } from './auth.ts';

// 错误处理中间件
export { errorMiddleware } from './error.ts';

// 日志中间件
export { loggerMiddleware } from './logger.ts';

// 导出核心区块链功能
// 这允许从一个导入点访问所有功能
export { blockchain, PrivacyComputeType } from '../core/blockchain/index.ts';

// 默认导出所有中间件的集合
export default {
  auth: authMiddleware,
  error: errorMiddleware,
  logger: loggerMiddleware
}; 