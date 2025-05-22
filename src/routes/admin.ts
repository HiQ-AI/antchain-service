import { Router, Status, PrivacyComputeType } from "../deps.ts";
import { PrivacyService } from "../services/privacy.ts";

const router = new Router({ prefix: "/api/admin" });

// 获取所有支持的隐私计算类型
router.get("/compute-types", (ctx) => {
  ctx.response.body = {
    success: true,
    data: {
      types: Object.values(PrivacyComputeType),
      descriptions: {
        [PrivacyComputeType.TEE]: "可信执行环境 - 在隔离安全环境中执行计算",
        [PrivacyComputeType.MPC]: "多方安全计算 - 允许多方在不泄露原始数据的情况下共同计算",
        [PrivacyComputeType.FHE]: "全同态加密 - 在加密状态下直接进行计算，无需解密",
        [PrivacyComputeType.FEDERATED]: "联邦学习 - 分布式机器学习方法，数据不离开本地",
        [PrivacyComputeType.SMPC]: "安全多方计算 - 多方在保护隐私的前提下共同计算"
      }
    }
  };
});

// 创建隐私计算任务
router.post("/tasks", async (ctx) => {
  try {
    // 获取请求体
    const body = await ctx.request.body({ type: "json" }).value;
    
    // 验证必要字段
    if (!body.computeType || !body.inputData) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "MISSING_FIELDS",
        message: "计算类型和输入数据是必填字段"
      };
      return;
    }
    
    // 验证计算类型是否有效
    if (!Object.values(PrivacyComputeType).includes(body.computeType)) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "INVALID_COMPUTE_TYPE",
        message: `无效的计算类型: ${body.computeType}，支持的类型: ${Object.values(PrivacyComputeType).join(", ")}`
      };
      return;
    }
    
    // 创建任务参数
    const params = {
      computeType: body.computeType,
      inputData: body.inputData,
      encryptionLevel: body.encryptionLevel,
      timeoutSeconds: body.timeoutSeconds,
      parties: body.parties,
      resultEncrypted: body.resultEncrypted
    };
    
    // 结果配置
    const resultConfig = {
      callbackUrl: body.callbackUrl,
      saveToBlockchain: body.saveToBlockchain !== false, // 默认为true
      notifyParties: body.notifyParties !== false // 默认为true
    };
    
    // 调用服务创建任务
    const result = await PrivacyService.createTask(params, resultConfig);
    
    if (result.success) {
      ctx.response.status = Status.Created;
      ctx.response.body = {
        success: true,
        data: {
          taskId: result.taskId,
          message: "隐私计算任务创建成功"
        }
      };
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        success: false,
        code: "TASK_CREATION_FAILED",
        message: result.message || "创建隐私计算任务失败"
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

// 获取任务状态
router.get("/tasks/:taskId/status", async (ctx) => {
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
      ctx.response.body = {
        success: true,
        data: {
          taskId,
          status: result.status,
          progress: result.progress || 0
        }
      };
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        success: false,
        code: "STATUS_QUERY_FAILED",
        message: result.message || "查询任务状态失败"
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

// 获取计算结果
router.get("/tasks/:taskId/result", async (ctx) => {
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
    
    // 调用服务获取计算结果
    const result = await PrivacyService.getTaskResult(taskId);
    
    if (result.success) {
      ctx.response.body = {
        success: true,
        data: {
          taskId,
          result: result.result,
          proof: result.proof
        }
      };
    } else {
      // 使用400状态码，因为任务可能未完成而非服务器错误
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        success: false,
        code: "RESULT_QUERY_FAILED",
        message: result.message || "获取计算结果失败"
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

// 取消任务
router.delete("/tasks/:taskId", async (ctx) => {
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
    
    // 获取取消原因（可选）
    let reason = "管理员手动取消";
    try {
      const body = await ctx.request.body({ type: "json" }).value;
      if (body && body.reason) {
        reason = body.reason;
      }
    } catch (e) {
      // 忽略解析错误，使用默认原因
    }
    
    // 调用服务取消任务
    const result = await PrivacyService.cancelTask(taskId, reason);
    
    if (result.success) {
      ctx.response.body = {
        success: true,
        data: {
          taskId,
          message: "任务已成功取消"
        }
      };
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        success: false,
        code: "TASK_CANCELLATION_FAILED",
        message: result.message || "取消任务失败"
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

// 获取所有任务列表（实际项目中应增加分页和筛选功能）
router.get("/tasks", (ctx) => {
  // 此处应访问数据库或区块链获取任务列表
  // 由于我们的中间件没有此功能，这里只返回一个假示例
  ctx.response.body = {
    success: true,
    data: {
      tasks: [
        {
          taskId: "示例任务ID-1",
          computeType: PrivacyComputeType.TEE,
          status: "COMPLETED",
          createTime: new Date(Date.now() - 86400000).toISOString(),
          completedTime: new Date().toISOString()
        },
        {
          taskId: "示例任务ID-2",
          computeType: PrivacyComputeType.MPC,
          status: "PROCESSING",
          createTime: new Date().toISOString(),
          progress: 45
        }
      ],
      total: 2,
      message: "注意: 这是示例数据，实际应用中需连接数据库或区块链"
    }
  };
});

export { router as adminRouter }; 