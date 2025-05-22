import { Router, Status } from "../deps.ts";
import { PrivacyService } from "../services/privacy.ts";

const router = new Router({ prefix: "/api/node" });

// 获取当前节点可参与的任务列表
router.get("/available-tasks", (ctx) => {
  // 在实际项目中应该查询适合该节点参与的任务
  // 这里返回示例数据
  const nodeId = ctx.state.user?.nodeId || "未知节点";
  
  ctx.response.body = {
    success: true,
    data: {
      tasks: [
        {
          taskId: "示例任务ID-1",
          description: "平均收入计算",
          requiredFields: ["income", "age", "region"],
          deadline: new Date(Date.now() + 86400000).toISOString(),
          reward: "10积分",
          status: "等待数据"
        },
        {
          taskId: "示例任务ID-2",
          description: "医疗数据分析",
          requiredFields: ["bloodPressure", "heartRate", "cholesterol"],
          deadline: new Date(Date.now() + 172800000).toISOString(),
          reward: "20积分",
          status: "等待数据"
        }
      ],
      message: `节点 ${nodeId} 可参与的任务`
    }
  };
});

// 获取任务详情
router.get("/tasks/:taskId", async (ctx) => {
  try {
    const { taskId } = ctx.params;
    
    if (!taskId) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      };
      return;
    }
    
    // 调用服务获取任务状态
    const result = await PrivacyService.getTaskStatus(taskId);
    
    if (result.success) {
      // 实际项目中应从数据库获取更多任务详情
      ctx.response.body = {
        success: true,
        data: {
          taskId,
          status: result.status,
          progress: result.progress || 0,
          description: "任务详情示例",
          requiredFields: ["field1", "field2", "field3"],
          dataFormat: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field1: { type: "number" },
                field2: { type: "string" },
                field3: { type: "boolean" }
              }
            }
          }
        }
      };
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        success: false,
        code: "TASK_QUERY_FAILED",
        message: result.message || "查询任务详情失败"
      };
    }
  } catch (error) {
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = {
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    };
  }
});

// 推送数据到任务
router.post("/tasks/:taskId/data", async (ctx) => {
  try {
    const { taskId } = ctx.params;
    
    if (!taskId) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      };
      return;
    }
    
    // 获取请求体
    const body = await ctx.request.body({ type: "json" }).value;
    
    if (!body.data) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_DATA",
        message: "缺少数据字段"
      };
      return;
    }
    
    // 获取节点ID
    const nodeId = ctx.state.user?.nodeId || "unknown";
    
    // 调用服务推送数据
    const result = await PrivacyService.pushData(taskId, body.data, nodeId);
    
    if (result.success) {
      ctx.response.body = {
        success: true,
        data: {
          taskId,
          message: "数据推送成功",
          timestamp: new Date().toISOString()
        }
      };
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        success: false,
        code: "DATA_PUSH_FAILED",
        message: result.message || "推送数据失败"
      };
    }
  } catch (error) {
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = {
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    };
  }
});

// 获取节点参与的任务列表
router.get("/my-tasks", (ctx) => {
  // 在实际项目中应该查询节点参与的任务
  // 这里返回示例数据
  const nodeId = ctx.state.user?.nodeId || "未知节点";
  
  ctx.response.body = {
    success: true,
    data: {
      tasks: [
        {
          taskId: "示例任务ID-1",
          description: "平均收入计算",
          status: "COMPLETED",
          contributionTime: new Date(Date.now() - 86400000).toISOString(),
          reward: "已获得10积分"
        },
        {
          taskId: "示例任务ID-3",
          description: "健康数据分析",
          status: "PROCESSING",
          contributionTime: new Date(Date.now() - 43200000).toISOString(),
          reward: "待发放15积分"
        }
      ],
      message: `节点 ${nodeId} 参与的任务`
    }
  };
});

// 节点报告任务问题
router.post("/tasks/:taskId/report", async (ctx) => {
  try {
    const { taskId } = ctx.params;
    
    if (!taskId) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      };
      return;
    }
    
    // 获取请求体
    const body = await ctx.request.body({ type: "json" }).value;
    
    if (!body.reason) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_REASON",
        message: "缺少报告原因"
      };
      return;
    }
    
    // 获取节点ID
    const nodeId = ctx.state.user?.nodeId || "unknown";
    
    // 实际项目中应保存报告信息到数据库
    // 这里只返回成功响应
    ctx.response.body = {
      success: true,
      data: {
        taskId,
        reportId: crypto.randomUUID(),
        message: "问题报告已提交，管理员将尽快处理",
        reportTime: new Date().toISOString()
      }
    };
  } catch (error) {
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = {
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    };
  }
});

export { router as nodeRouter }; 