import { BlockchainAuth } from "../core/blockchain/auth/index.ts";
import { UserRole } from "../core/blockchain/auth/types.ts";
import { Context, MiddlewareHandler } from "../deps.ts";

// Re-export the UserRole enum for backwards compatibility
export { UserRole };

/**
 * Authentication middleware for Hono
 * Verifies the authentication token and adds it to the context
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    // Get an instance of the BlockchainAuth class
    const auth = new BlockchainAuth();
    
    // Get authentication token
    const token = await auth.getToken();
    
    if (!token) {
      return c.json({
        success: false,
        code: "UNAUTHORIZED",
        message: "认证失败，请检查访问凭证"
      }, 401);
    }
    
    // Add token and user info to context for use in other middlewares or routes
    c.set('token', token);
    c.set('user', { role: 'admin', nodeId: 'node1' }); // 示例用户信息，实际应该从token解析
    
    // Continue to next middleware
    await next();
  } catch (error) {
    console.error("Authentication error:", error);
    return c.json({
      success: false,
      code: "AUTH_ERROR",
      message: "认证过程中出现错误"
    }, 500);
  }
}; 