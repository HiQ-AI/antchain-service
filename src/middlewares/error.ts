import { Context, Status } from "../deps.ts";

/**
 * Checks if an error is an HTTP error with status code
 */
function isHttpError(err: unknown): err is { status: number; message: string } {
  return (
    typeof err === "object" && 
    err !== null && 
    "status" in err && 
    typeof (err as any).status === "number"
  );
}

/**
 * Error handling middleware for Oak
 * Catches errors and formats them as JSON responses
 */
export const errorMiddleware = async (
  ctx: Context,
  next: () => Promise<unknown>
): Promise<void> => {
  try {
    await next();
  } catch (err: unknown) {
    let status = Status.InternalServerError;
    let message = "服务器内部错误";
    let code = "INTERNAL_ERROR";

    // Handle HTTP errors
    if (isHttpError(err)) {
      status = err.status;
      message = err.message;
      code = `HTTP_${status}`;
    } else if (err instanceof Error) {
      // Handle standard errors
      message = err.message;
    }

    // Log the error
    console.error(`[ERROR] ${status} - ${message}`, err);

    // Send JSON response
    ctx.response.status = status;
    ctx.response.body = {
      success: false,
      code,
      message
    };
  }
}; 