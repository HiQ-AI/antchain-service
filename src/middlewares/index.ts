/**
 * 中间件统一导出文件
 * 提供所有HTTP中间件的访问点
 */

// 导入中间件
import { authMiddleware, UserRole } from './auth.ts';
import { errorMiddleware } from './error.ts';
import { loggerMiddleware } from './logger.ts';

// 导出所有中间件
export { authMiddleware, UserRole };
export { errorMiddleware };
export { loggerMiddleware };

// 导出核心区块链功能
// 这允许从一个导入点访问所有功能
export { blockchain, PrivacyComputeType } from '../core/blockchain/index.ts';

// 默认导出所有中间件的集合
export default {
  auth: authMiddleware,
  error: errorMiddleware,
  logger: loggerMiddleware
}; 