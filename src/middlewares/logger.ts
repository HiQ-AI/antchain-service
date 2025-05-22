import { Context } from "../deps.ts";

/**
 * Logger middleware for Oak
 * Logs HTTP requests with method, path, status and response time
 */
export const loggerMiddleware = async (
  ctx: Context,
  next: () => Promise<unknown>
): Promise<void> => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to the context for tracking
  ctx.state.requestId = requestId;
  
  // Log request start
  console.log(
    `[${new Date().toISOString()}] [${requestId}] --> ${ctx.request.method} ${ctx.request.url}`
  );
  
  // Process the request
  await next();
  
  // Calculate processing time
  const ms = Date.now() - start;
  
  // Log request completion
  console.log(
    `[${new Date().toISOString()}] [${requestId}] <-- ${ctx.request.method} ${ctx.request.url} ${ctx.response.status} (${ms}ms)`
  );
}; 