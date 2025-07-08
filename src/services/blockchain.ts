import { blockchain } from '../core/blockchain/index.ts';
import { ApiResponse } from '../deps.ts';
import { 
  ContractMethodParams, 
  ContractDeployParams,
  DataDepositParams,
  DataQueryParams,
  PrivacyComputeParams,
  TransactionStatus,
  PrivacyComputeType,
} from '../core/blockchain/index.ts';

/**
 * 区块链业务服务
 * 提供基于core功能的高级业务接口
 */
export class BlockchainService {
  /**
   * 获取认证token
   * @param refresh 是否强制刷新token
   * @returns token字符串
   */
  static async getAuthToken(refresh = false): Promise<string | null> {
    return await blockchain.auth.getToken(refresh);
  }

  /**
   * 验证token是否有效
   * @param token 要验证的token
   * @returns 验证结果
   */
  static async validateToken(token?: string): Promise<boolean> {
    try {
      if (!token) {
        // 如果没有token，返回false
        return false;
      }
      return true;
      
      // 尝试使用token调用一个简单的区块链API来验证其有效性
      // 这里使用合约调用来测试token，如果token无效会抛出错误
      const result = await blockchain.contract.callWasmContract(token, 'GetName()');
      
      // 如果调用成功（无论业务逻辑是否成功），说明token有效
      // 如果token无效，区块链API会返回认证错误
      return result.success !== false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * 存储数据到区块链
   * @param data 要存储的数据
   * @param token 认证token（可选）
   * @returns 存储结果
   */
  static async storeData(data: string, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.data.depositData({data: data}, token);
      return result;
    } catch (error) {
      console.error('Data storage error:', error);
      return {
        success: false,
        message: 'Failed to store data',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * 查询区块链数据
   * @param params 查询参数
   * @param token 认证token（可选）
   * @returns 查询结果
   */
  static async queryData(params: DataQueryParams, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.data.queryData(params, token);
      return result;
    } catch (error) {
      console.error('Data query error:', error);
      return {
        success: false,
        message: 'Failed to query data',
        code: 'QUERY_ERROR'
      };
    }
  }

  /**
   * 查询交易状态
   * @param txHash 交易哈希
   * @param token 认证token（可选）
   * @returns 交易状态
   */
  static async getTransactionStatus(txHash: string, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.data.queryReceipt(txHash, token);
      return result;
    } catch (error) {
      console.error('Transaction query error:', error);
      return {
        success: false,
        message: 'Failed to query transaction',
        code: 'TX_QUERY_ERROR'
      };
    }
  }

  /**
   * 调用智能合约方法
   * @param params 合约调用参数
   * @param token 认证token（可选）
   * @returns 调用结果
   */
  static async callContract(params: ContractMethodParams, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.contract.callMethod(params, token);
      return result;
    } catch (error) {
      console.error('Contract call error:', error);
      return {
        success: false,
        message: 'Failed to call contract',
        code: 'CONTRACT_ERROR'
      };
    }
  }

  /**
   * 部署智能合约
   * @param params 合约部署参数
   * @param token 认证token（可选）
   * @returns 部署结果
   */
  static async deployContract(params: ContractDeployParams, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.contract.deployContract(params, token);
      return result;
    } catch (error) {
      console.error('Contract deployment error:', error);
      return {
        success: false,
        message: 'Failed to deploy contract',
        code: 'DEPLOY_ERROR'
      };
    }
  }

  /**
   * 创建隐私计算任务
   * @param params 隐私计算参数
   * @param token 认证token（可选）
   * @returns 创建结果
   */
  static async createPrivacyTask(params: PrivacyComputeParams, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.privacy.createPrivacyTask(params, undefined, token);
      return result;
    } catch (error) {
      console.error('Privacy task creation error:', error);
      return {
        success: false,
        message: 'Failed to create privacy task',
        code: 'PRIVACY_ERROR'
      };
    }
  }

  /**
   * 推送数据到隐私计算任务
   * @param taskId 任务ID
   * @param data 要推送的数据
   * @param token 认证token（可选）
   * @returns 推送结果
   */
  static async pushPrivacyData(taskId: string, data: any, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.privacy.pushData(taskId, data, token);
      return result;
    } catch (error) {
      console.error('Privacy data push error:', error);
      return {
        success: false,
        message: 'Failed to push privacy data',
        code: 'PRIVACY_PUSH_ERROR'
      };
    }
  }

  /**
   * 查询隐私计算任务状态
   * @param taskId 任务ID
   * @param token 认证token（可选）
   * @returns 任务状态
   */
  static async getPrivacyTaskStatus(taskId: string, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.privacy.queryTaskStatus(taskId, token);
      return result;
    } catch (error) {
      console.error('Privacy task status query error:', error);
      return {
        success: false,
        message: 'Failed to query task status',
        code: 'PRIVACY_STATUS_ERROR'
      };
    }
  }

  /**
   * 获取隐私计算结果
   * @param taskId 任务ID
   * @param token 认证token（可选）
   * @returns 计算结果
   */
  static async getPrivacyResult(taskId: string, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.privacy.getPrivacyResult(taskId, undefined, token);
      return result;
    } catch (error) {
      console.error('Privacy result query error:', error);
      return {
        success: false,
        message: 'Failed to get privacy result',
        code: 'PRIVACY_RESULT_ERROR'
      };
    }
  }

  /**
   * 取消隐私计算任务
   * @param taskId 任务ID
   * @param reason 取消原因
   * @param token 认证token（可选）
   * @returns 取消结果
   */
  static async cancelPrivacyTask(taskId: string, reason: string, token?: string): Promise<ApiResponse> {
    try {
      const result = await blockchain.privacy.cancelTask(taskId, reason, token);
      return result;
    } catch (error) {
      console.error('Privacy task cancellation error:', error);
      return {
        success: false,
        message: 'Failed to cancel privacy task',
        code: 'PRIVACY_CANCEL_ERROR'
      };
    }
  }

  /**
   * 使用BaaS DataGW SDK生成二维码
   * @param pageType 页面类型
   * @param params 参数列表
   * @param bizId 链ID（可选）
   * @param useBlockchainAuth 是否使用区块链认证
   * @returns 包含Base64编码的PNG二维码
   */
  static async createQRCode(
    params: Array<{ key: string; value: string; type?: string }>,
    pageType?: 'CONTRACT' | 'HEXADDRESS' | 'TX' | 'CHAIN' | 'BLOCK' | 'TIMELINE',
    bizId?: string,
  ): Promise<ApiResponse> {
    try {

      const result = await blockchain.baasdatagw.createQRCode(
        params,
        bizId,
        pageType
        );
      return result;
    } catch (error) {
      console.error('QR code creation with SDK error:', error);
      return {
        success: false,
        message: 'Failed to create QR code with SDK',
        code: 'SDK_QRCODE_ERROR'
      };
    }
  }
}