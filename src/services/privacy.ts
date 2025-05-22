import { ApiResponse, blockchain, PrivacyComputeType, PrivacyComputeParams, ResultConfig } from "../deps.ts";

// 自定义错误类型
interface ServiceError extends Error {
  message: string;
}

/**
 * 隐私计算服务
 * 提供隐私计算任务相关的业务逻辑
 */
export class PrivacyService {
  /**
   * 创建隐私计算任务
   * @param params 计算参数
   * @param resultConfig 结果配置
   * @returns 创建结果
   */
  static async createTask(
    params: PrivacyComputeParams,
    resultConfig?: ResultConfig
  ): Promise<{
    taskId: string;
    success: boolean;
    message?: string;
  }> {
    try {
      // 获取令牌
      const token = await blockchain.auth.getToken();
      if (!token) {
        throw new Error("获取区块链认证令牌失败");
      }

      // 创建隐私计算任务
      const response = await blockchain.privacy.createPrivacyTask(
        params,
        resultConfig,
        token
      );

      if (!response || !response.success) {
        throw new Error(response?.message || "创建任务失败");
      }

      return {
        taskId: response.data.taskId,
        success: true
      };
    } catch (error) {
      console.error("创建隐私计算任务失败:", error);
      const err = error as ServiceError;
      return {
        taskId: "",
        success: false,
        message: err.message || "创建隐私计算任务失败"
      };
    }
  }

  /**
   * 推送数据到计算任务
   * @param taskId 任务ID
   * @param data 数据
   * @param nodeId 节点ID
   * @returns 推送结果
   */
  static async pushData(
    taskId: string,
    data: any,
    nodeId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 获取令牌
      const token = await blockchain.auth.getToken();
      if (!token) {
        throw new Error("获取区块链认证令牌失败");
      }

      // 在实际应用中，可能需要对数据进行额外处理
      // 例如添加节点标识、时间戳等
      const processedData = {
        nodeId,
        timestamp: new Date().toISOString(),
        data
      };

      // 推送数据
      const response = await blockchain.privacy.pushData(
        taskId,
        processedData,
        token
      );

      if (!response || !response.success) {
        throw new Error(response?.message || "推送数据失败");
      }

      return {
        success: true
      };
    } catch (error) {
      console.error("推送数据到计算任务失败:", error);
      const err = error as ServiceError;
      return {
        success: false,
        message: err.message || "推送数据失败"
      };
    }
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  static async getTaskStatus(taskId: string): Promise<{
    status: string;
    progress?: number;
    success: boolean;
    message?: string;
  }> {
    try {
      // 获取令牌
      const token = await blockchain.auth.getToken();
      if (!token) {
        throw new Error("获取区块链认证令牌失败");
      }

      // 查询任务状态
      const response = await blockchain.privacy.queryTaskStatus(taskId, token);

      if (!response || !response.success) {
        throw new Error(response?.message || "查询任务状态失败");
      }

      return {
        status: response.data.status,
        progress: response.data.progress,
        success: true
      };
    } catch (error) {
      console.error("获取任务状态失败:", error);
      const err = error as ServiceError;
      return {
        status: "UNKNOWN",
        success: false,
        message: err.message || "获取任务状态失败"
      };
    }
  }

  /**
   * 获取计算结果
   * @param taskId 任务ID
   * @returns 计算结果
   */
  static async getTaskResult(taskId: string): Promise<{
    result?: any;
    proof?: string;
    success: boolean;
    message?: string;
  }> {
    try {
      // 获取令牌
      const token = await blockchain.auth.getToken();
      if (!token) {
        throw new Error("获取区块链认证令牌失败");
      }

      // 查询任务状态
      const statusResponse = await blockchain.privacy.queryTaskStatus(taskId, token);
      
      if (!statusResponse || !statusResponse.success) {
        throw new Error(statusResponse?.message || "查询任务状态失败");
      }
      
      // 检查任务是否完成
      if (statusResponse.data.status !== "COMPLETED") {
        return {
          success: false,
          message: `任务尚未完成，当前状态: ${statusResponse.data.status}`
        };
      }

      // 获取计算结果
      const resultResponse = await blockchain.privacy.getPrivacyResult(
        taskId,
        {
          withProof: true
        },
        token
      );

      if (!resultResponse || !resultResponse.success) {
        throw new Error(resultResponse?.message || "获取计算结果失败");
      }

      return {
        result: resultResponse.data.result,
        proof: resultResponse.data.proof,
        success: true
      };
    } catch (error) {
      console.error("获取计算结果失败:", error);
      const err = error as ServiceError;
      return {
        success: false,
        message: err.message || "获取计算结果失败"
      };
    }
  }

  /**
   * 取消计算任务
   * @param taskId 任务ID
   * @param reason 取消原因
   * @returns 取消结果
   */
  static async cancelTask(
    taskId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // 获取令牌
      const token = await blockchain.auth.getToken();
      if (!token) {
        throw new Error("获取区块链认证令牌失败");
      }

      // 取消任务
      const response = await blockchain.privacy.cancelTask(taskId, reason, token);

      if (!response || !response.success) {
        throw new Error(response?.message || "取消任务失败");
      }

      return {
        success: true
      };
    } catch (error) {
      console.error("取消计算任务失败:", error);
      const err = error as ServiceError;
      return {
        success: false,
        message: err.message || "取消计算任务失败"
      };
    }
  }
} 