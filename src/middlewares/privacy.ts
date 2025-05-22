import { ApiResponse } from '../deps.ts';
import { 
  defaultHeaders, 
  generateUUID, 
  sendRequest, 
  parseResponse,
  logRequest,
  logResponse
} from './base.ts';
import { authMiddleware } from './auth.ts';
import { BlockchainConfig,defaultConfig } from "src/config/index.ts";

/**
 * 隐私计算类型定义
 */
export interface PrivateCalculateType {
  calculateTypeId: string;  // 隐私计算类型ID
  calculateType: string;    // 隐私计算类型
  function: any;            // 隐私计算函数
}

/**
 * 数据请求任务类型定义
 */
export interface DataRequestTask {
  taskId: string;                       // 数据请求任务ID
  privateCalculateType: PrivateCalculateType; // 隐私计算类型
  toProcess: any;                       // 结果数据保存到的目标Process
}

/**
 * 数据推送类型定义
 */
export interface PushData {
  taskId: string;   // 数据请求任务ID
  data: any;        // 推送的数据
}

/**
 * 隐私计算方法类型枚举
 */
export enum PrivacyComputeType {
  MPC = 'MPC',           // 多方安全计算
  TEE = 'TEE',           // 可信执行环境
  FHE = 'FHE',           // 全同态加密
  FEDERATED = 'FEDERATED', // 联邦学习
  SMPC = 'SMPC'          // 安全多方计算
}

/**
 * 隐私计算请求参数
 */
export interface PrivacyComputeParams {
  computeType: PrivacyComputeType;  // 计算类型
  inputData: any;                   // 输入数据
  encryptionLevel?: number;         // 加密级别（可选）
  timeoutSeconds?: number;          // 超时时间（秒）
  parties?: string[];               // 参与方（多方计算时使用）
  resultEncrypted?: boolean;        // 结果是否需要加密
}

/**
 * 隐私计算结果接收配置
 */
export interface ResultConfig {
  callbackUrl?: string;            // 回调URL
  saveToBlockchain?: boolean;      // 是否保存到区块链
  notifyParties?: boolean;         // 是否通知所有参与方
}

/**
 * 隐私数据查询参数
 */
export interface PrivacyDataQueryParams {
  taskId: string;                  // 任务ID
  requesterInfo?: {                // 请求方信息
    id: string;                    // 请求方ID
    certificate?: string;          // 请求方证书
  };
  withProof?: boolean;             // 是否需要证明
}

/**
 * 隐私计算中间件类
 */
export class BlockchainPrivacy {
  private config: BlockchainConfig;

  /**
   * 创建隐私计算中间件实例
   * @param config 配置选项（可选）
   */
  constructor(config?: Partial<BlockchainConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 创建隐私计算任务
   * @param computeParams 计算参数
   * @param resultConfig 结果配置（可选）
   * @param token 认证令牌（可选，未提供时会自动获取）
   * @returns API响应或空（如果失败）
   */
  async createPrivacyTask(
    computeParams: PrivacyComputeParams,
    resultConfig?: ResultConfig,
    token?: string
  ): Promise<ApiResponse | null> {
    try {
      // 获取令牌（如果未提供）
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('获取认证令牌失败');
        return null;
      }

      // 设置API端点
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCallForBiz';
      
      // 生成唯一任务ID
      const taskId = generateUUID();
      console.log(`生成隐私计算任务ID: ${taskId}`);
      
      // 构建隐私计算类型对象
      const privateCalculateType: PrivateCalculateType = {
        calculateTypeId: generateUUID(),
        calculateType: computeParams.computeType,
        function: typeof computeParams.inputData === 'function' 
          ? computeParams.inputData.toString() 
          : JSON.stringify(computeParams.inputData)
      };
      
      // 构建请求参数
      const requestData = {
        'accessId': this.config.accessId,
        'account': this.config.account,
        'bizid': this.config.bizId,
        'gas': 0,
        'method': 'CREATEPRIVACYTASK',
        'mykmsKeyId': this.config.kmsKeyId,
        'orderId': taskId,
        'tenantid': this.config.tenantId,
        'token': authToken,
        'withGasHold': false,
        'taskData': {
          taskId,
          privateCalculateType,
          computeParams: {
            encryptionLevel: computeParams.encryptionLevel || 1,
            timeoutSeconds: computeParams.timeoutSeconds || 300,
            parties: computeParams.parties || [],
            resultEncrypted: computeParams.resultEncrypted || false
          },
          resultConfig: resultConfig || {
            saveToBlockchain: true,
            notifyParties: true
          }
        }
      };

      // 记录并发送请求
      logRequest('PRIVACY_TASK_CREATE', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // 解析并记录响应
      const response = parseResponse(responseText);
      logResponse('PRIVACY_TASK_CREATE', response);
      
      return response;
    } catch (error) {
      console.error('创建隐私计算任务失败:', error);
      return null;
    }
  }

  /**
   * 推送数据到隐私计算任务
   * @param taskId 任务ID
   * @param data 要推送的数据
   * @param token 认证令牌（可选，未提供时会自动获取）
   * @returns API响应或空（如果失败）
   */
  async pushData(
    taskId: string, 
    data: any, 
    token?: string
  ): Promise<ApiResponse | null> {
    try {
      // 获取令牌（如果未提供）
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('获取认证令牌失败');
        return null;
      }

      // 设置API端点
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCallForBiz';
      
      // 生成唯一订单ID
      const orderId = generateUUID();
      
      // 构建请求参数
      const pushData: PushData = {
        taskId,
        data: typeof data === 'object' ? JSON.stringify(data) : data
      };
      
      const requestData = {
        'accessId': this.config.accessId,
        'account': this.config.account,
        'bizid': this.config.bizId,
        'gas': 0,
        'method': 'PUSHPRIVACYDATA',
        'mykmsKeyId': this.config.kmsKeyId,
        'orderId': orderId,
        'tenantid': this.config.tenantId,
        'token': authToken,
        'withGasHold': false,
        'pushData': pushData
      };

      // 记录并发送请求
      logRequest('PRIVACY_DATA_PUSH', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // 解析并记录响应
      const response = parseResponse(responseText);
      logResponse('PRIVACY_DATA_PUSH', response);
      
      return response;
    } catch (error) {
      console.error('推送隐私数据失败:', error);
      return null;
    }
  }

  /**
   * 查询隐私计算任务状态
   * @param taskId 任务ID
   * @param token 认证令牌（可选，未提供时会自动获取）
   * @returns API响应或空（如果失败）
   */
  async queryTaskStatus(
    taskId: string, 
    token?: string
  ): Promise<ApiResponse | null> {
    try {
      // 获取令牌（如果未提供）
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('获取认证令牌失败');
        return null;
      }

      // 设置API端点
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCall';
      
      // 构建请求参数
      const requestData = {
        'accessId': this.config.accessId,
        'bizid': this.config.bizId,
        'method': 'QUERYPRIVACYTASK',
        'token': authToken,
        'taskId': taskId
      };

      // 记录并发送请求
      logRequest('PRIVACY_TASK_QUERY', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // 解析并记录响应
      const response = parseResponse(responseText);
      logResponse('PRIVACY_TASK_QUERY', response);
      
      return response;
    } catch (error) {
      console.error('查询隐私计算任务状态失败:', error);
      return null;
    }
  }

  /**
   * 获取隐私计算结果
   * @param taskId 任务ID
   * @param queryParams 查询参数（可选）
   * @param token 认证令牌（可选，未提供时会自动获取）
   * @returns API响应或空（如果失败）
   */
  async getPrivacyResult(
    taskId: string,
    queryParams?: Partial<PrivacyDataQueryParams>,
    token?: string
  ): Promise<ApiResponse | null> {
    try {
      // 获取令牌（如果未提供）
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('获取认证令牌失败');
        return null;
      }

      // 设置API端点
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCall';
      
      // 构建请求参数
      const requestData = {
        'accessId': this.config.accessId,
        'bizid': this.config.bizId,
        'method': 'GETPRIVACYRESULT',
        'token': authToken,
        'taskId': taskId,
        ...(queryParams?.requesterInfo && { 'requesterInfo': queryParams.requesterInfo }),
        ...(queryParams?.withProof !== undefined && { 'withProof': queryParams.withProof })
      };

      // 记录并发送请求
      logRequest('PRIVACY_RESULT_GET', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // 解析并记录响应
      const response = parseResponse(responseText);
      logResponse('PRIVACY_RESULT_GET', response);
      
      return response;
    } catch (error) {
      console.error('获取隐私计算结果失败:', error);
      return null;
    }
  }

  /**
   * 取消隐私计算任务
   * @param taskId 任务ID
   * @param reason 取消原因（可选）
   * @param token 认证令牌（可选，未提供时会自动获取）
   * @returns API响应或空（如果失败）
   */
  async cancelTask(
    taskId: string,
    reason?: string,
    token?: string
  ): Promise<ApiResponse | null> {
    try {
      // 获取令牌（如果未提供）
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('获取认证令牌失败');
        return null;
      }

      // 设置API端点
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCallForBiz';
      
      // 生成唯一订单ID
      const orderId = generateUUID();
      
      // 构建请求参数
      const requestData = {
        'accessId': this.config.accessId,
        'account': this.config.account,
        'bizid': this.config.bizId,
        'gas': 0,
        'method': 'CANCELPRIVACYTASK',
        'mykmsKeyId': this.config.kmsKeyId,
        'orderId': orderId,
        'tenantid': this.config.tenantId,
        'token': authToken,
        'withGasHold': false,
        'taskId': taskId,
        'reason': reason || '用户取消'
      };

      // 记录并发送请求
      logRequest('PRIVACY_TASK_CANCEL', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // 解析并记录响应
      const response = parseResponse(responseText);
      logResponse('PRIVACY_TASK_CANCEL', response);
      
      return response;
    } catch (error) {
      console.error('取消隐私计算任务失败:', error);
      return null;
    }
  }
}

// 默认实例
export const privacyMiddleware = new BlockchainPrivacy(); 