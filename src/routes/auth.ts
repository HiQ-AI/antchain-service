import { Router, Status } from "../deps.ts";
import { AuthService } from "../services/auth.ts";

const router = new Router({ prefix: "/api/auth" });

// 登录接口
router.post("/token", async (ctx) => {
  try {
    // 获取请求体
    const body = await ctx.request.body({ type: "json" }).value;
    
    // 验证必要字段
    if (!body.username || !body.password) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_CREDENTIALS",
        message: "用户名和密码是必填字段"
      };
      return;
    }
    
    // 验证用户凭据
    const authResult = await AuthService.authenticate(body.username, body.password);
    
    if (authResult.success) {
      // 生成令牌 - 默认1小时过期
      const expiresIn = body.expiresIn || 3600;
      const token = AuthService.generateToken(
        authResult.role!,
        authResult.nodeId!,
        expiresIn
      );
      
      ctx.response.body = {
        success: true,
        data: {
          token,
          expiresIn,
          tokenType: "Bearer",
          role: authResult.role,
          nodeId: authResult.nodeId
        }
      };
    } else {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: authResult.message || "授权失败"
      };
    }
  } catch (error) {
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = {
      success: false,
      code: "AUTH_ERROR",
      message: "认证服务出错"
    };
  }
});

// 令牌验证接口（用于客户端主动检查令牌有效性）
router.get("/verify", (ctx) => {
  // 这个接口利用了全局auth中间件进行验证
  // 如果代码能执行到这里，说明令牌有效
  
  // 返回用户信息
  const { role, nodeId } = ctx.state.user;
  
  ctx.response.body = {
    success: true,
    data: {
      role,
      nodeId,
      permissions: role === "admin" 
        ? ["read", "write", "admin", "create_task", "view_result"] 
        : (role === "node" ? ["read", "write", "push_data"] : ["read"])
    }
  };
});

export { router as authRouter }; 