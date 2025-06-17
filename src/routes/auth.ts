import { Hono, Status } from "../deps.ts";
import { AuthService } from "../services/auth.ts";

const router = new Hono();

// 登录接口
router.post("/token", async (c) => {
  try {
    // 获取请求体
    const body = await c.req.json();
    
    // 验证必要字段
    if (!body.username || !body.password) {
      return c.json({
        success: false,
        code: "MISSING_CREDENTIALS",
        message: "用户名和密码是必填字段"
      }, Status.BadRequest);
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
      
      return c.json({
        success: true,
        data: {
          token,
          expiresIn,
          tokenType: "Bearer",
          role: authResult.role,
          nodeId: authResult.nodeId
        }
      });
    } else {
      return c.json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: authResult.message || "授权失败"
      }, Status.Unauthorized);
    }
  } catch (error) {
    return c.json({
      success: false,
      code: "AUTH_ERROR",
      message: "认证服务出错"
    }, Status.InternalServerError);
  }
});

// 令牌验证接口（用于客户端主动检查令牌有效性）
router.get("/verify", (c) => {
  // 这个接口利用了全局auth中间件进行验证
  // 如果代码能执行到这里，说明令牌有效
  
  // 从Hono上下文获取用户信息
  const user = c.get('user');
  const { role, nodeId } = user || {};
  
  return c.json({
    success: true,
    data: {
      role,
      nodeId,
      permissions: role === "admin" 
        ? ["read", "write", "admin", "create_task", "view_result"] 
        : (role === "node" ? ["read", "write", "push_data"] : ["read"])
    }
  });
});

export { router as authRouter }; 