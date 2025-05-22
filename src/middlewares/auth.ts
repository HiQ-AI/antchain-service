import { BlockchainAuth } from "../core/blockchain/auth/index.ts";
import { UserRole } from "../core/blockchain/auth/types.ts";
import { Context, Middleware } from "../deps.ts";

// Re-export the UserRole enum for backwards compatibility
export { UserRole };

/**
 * Authentication middleware for Oak
 * Verifies the authentication token and adds it to the context
 */
export const authMiddleware: Middleware = async (ctx: Context, next) => {
  try {
    // Get an instance of the BlockchainAuth class
    const auth = new BlockchainAuth();
    
    // Get authentication token
    const token = await auth.getToken();
    
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        code: "UNAUTHORIZED",
        message: "认证失败，请检查访问凭证"
      };
      return;
    }
    
    // Add token to context state for use in other middlewares or routes
    ctx.state.token = token;
    
    // Continue to next middleware
    await next();
  } catch (error) {
    console.error("Authentication error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: "AUTH_ERROR",
      message: "认证过程中出现错误"
    };
  }
}; 