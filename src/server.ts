import { Application, Router, Middleware, defaultConfig } from "./deps.ts";
import { adminRouter } from "./routes/admin.ts";
import { nodeRouter } from "./routes/node.ts";
import { authRouter } from "./routes/auth.ts";
import { errorMiddleware } from "./middlewares/error.ts";
import { loggerMiddleware } from "./middlewares/logger.ts";
import { authMiddleware } from "./middlewares/auth.ts";

// 从配置中获取应用设置
const appConfig = defaultConfig.app;

const app = new Application();
const router = new Router();

// API版本和信息端点
router.get("/api", (ctx) => {
  ctx.response.body = {
    success: true,
    data: {
      name: appConfig.name,
      version: appConfig.version,
      description: "提供隐私计算任务的创建、数据推送和结果获取功能"
    }
  };
});

// 全局中间件
app.use(errorMiddleware);
app.use(loggerMiddleware);

// 应用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 身份验证路由 - 用于身份验证操作(无需认证)
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// 管理员路由 - 用于主节点操作(需要认证)
app.use(authMiddleware);
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());

// 节点路由 - 用于数据节点操作(需要认证)
app.use(nodeRouter.routes());
app.use(nodeRouter.allowedMethods());

// 404处理
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = {
    success: false,
    code: "NOT_FOUND",
    message: `未找到路由: ${ctx.request.url}`
  };
});

// 从配置中获取端口和主机
const port = appConfig.port;
const host = appConfig.host;

console.log(`🚀 隐私计算API服务启动中, ${host}:${port}`);

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(`✅ 服务已启动: http://${hostname}:${port}`);
  console.log(`环境: ${appConfig.environment}`);
});

await app.listen({ hostname: host, port }); 