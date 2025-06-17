import { Hono, Status } from "../deps.ts";
import { PrivacyService } from "../services/privacy.ts";

// 定义隐私计算类型枚举
enum PrivacyComputeType {
  TEE = "TEE",
  MPC = "MPC", 
  FHE = "FHE",
  FEDERATED = "FEDERATED",
  SMPC = "SMPC"
}

const router = new Hono();

// 获取所有支持的隐私计算类型
router.get("/compute-types", (c) => {
  return c.json({
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
  });
});

// 创建隐私计算任务
router.post("/tasks", async (c) => {
  try {
    // 获取请求体
    const body = await c.req.json();
    
    // 验证必要字段
    if (!body.computeType || !body.inputData) {
      return c.json({
        success: false,
        code: "MISSING_FIELDS",
        message: "计算类型和输入数据是必填字段"
      }, Status.BadRequest);
    }
    
    // 验证计算类型是否有效
    if (!Object.values(PrivacyComputeType).includes(body.computeType)) {
      return c.json({
        success: false,
        code: "INVALID_COMPUTE_TYPE",
        message: `无效的计算类型: ${body.computeType}，支持的类型: ${Object.values(PrivacyComputeType).join(", ")}`
      }, Status.BadRequest);
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
      return c.json({
        success: true,
        data: {
          taskId: result.taskId,
          message: "隐私计算任务创建成功"
        }
      }, Status.Created);
    } else {
      return c.json({
        success: false,
        code: "TASK_CREATION_FAILED",
        message: result.message || "创建隐私计算任务失败"
      }, Status.InternalServerError);
    }
  } catch (error) {
    return c.json({
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    }, Status.InternalServerError);
  }
});

// 获取任务状态
router.get("/tasks/:taskId/status", async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    if (!taskId) {
      return c.json({
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      }, Status.BadRequest);
    }
    
    // 调用服务获取任务状态
    const result = await PrivacyService.getTaskStatus(taskId);
    
    if (result.success) {
      return c.json({
        success: true,
        data: {
          taskId,
          status: result.status,
          progress: result.progress || 0
        }
      });
    } else {
      return c.json({
        success: false,
        code: "STATUS_QUERY_FAILED",
        message: result.message || "查询任务状态失败"
      }, Status.InternalServerError);
    }
  } catch (error) {
    return c.json({
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    }, Status.InternalServerError);
  }
});

// 获取计算结果
router.get("/tasks/:taskId/result", async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    if (!taskId) {
      return c.json({
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      }, Status.BadRequest);
    }
    
    // 调用服务获取计算结果
    const result = await PrivacyService.getTaskResult(taskId);
    
    if (result.success) {
      return c.json({
        success: true,
        data: {
          taskId,
          result: result.result,
          proof: result.proof
        }
      });
    } else {
      // 使用400状态码，因为任务可能未完成而非服务器错误
      return c.json({
        success: false,
        code: "RESULT_QUERY_FAILED",
        message: result.message || "获取计算结果失败"
      }, Status.BadRequest);
    }
  } catch (error) {
    return c.json({
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    }, Status.InternalServerError);
  }
});

// 取消任务
router.delete("/tasks/:taskId", async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    if (!taskId) {
      return c.json({
        success: false,
        code: "MISSING_TASK_ID",
        message: "缺少任务ID"
      }, Status.BadRequest);
    }
    
    // 获取取消原因
    const body = await c.req.json().catch(() => ({}));
    const reason = body.reason || "管理员取消";
    
    // 调用服务取消任务
    const result = await PrivacyService.cancelTask(taskId, reason);
    
    if (result.success) {
      return c.json({
        success: true,
        message: "任务取消成功"
      });
    } else {
      return c.json({
        success: false,
        code: "CANCEL_FAILED",
        message: result.message || "取消任务失败"
      }, Status.InternalServerError);
    }
  } catch (error) {
    return c.json({
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    }, Status.InternalServerError);
  }
});

// 获取任务列表 (示例实现)
router.get("/tasks", async (c) => {
  try {
    const query = c.req.query();
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    
    // 示例数据，实际应该从数据库或区块链获取
    const mockTasks = [
      {
        taskId: "task-1",
        computeType: PrivacyComputeType.TEE,
        status: "COMPLETED",
        createTime: new Date(Date.now() - 86400000).toISOString(),
        completedTime: new Date().toISOString()
      },
      {
        taskId: "task-2", 
        computeType: PrivacyComputeType.MPC,
        status: "PROCESSING",
        createTime: new Date().toISOString(),
        progress: 45
      }
    ];
    
    return c.json({
      success: true,
      data: {
        tasks: mockTasks,
        pagination: {
          page,
          limit,
          total: mockTasks.length,
          totalPages: Math.ceil(mockTasks.length / limit)
        }
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      code: "SERVER_ERROR",
      message: "服务器处理请求时发生错误"
    }, Status.InternalServerError);
  }
});

export { router as adminRouter }; 