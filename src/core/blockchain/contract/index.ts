import { ApiResponse } from 'src/deps.ts';
import { 
  defaultHeaders, 
  generateUUID, 
  sendRequest, 
  parseResponse
} from '../base.ts';
import { BlockchainConfig, defaultConfig } from 'src/config/blockchain.ts';
import { BlockchainAuth } from '../auth/index.ts';
import { ContractMethodParams, ContractDeployParams } from './types.ts';

/**
 * Class for handling blockchain contract operations
 */
export class BlockchainContract {
  private config: BlockchainConfig;
  private auth: BlockchainAuth;

  /**
   * Create a new BlockchainContract instance
   * @param config Configuration options (optional)
   */
  constructor(config?: Partial<BlockchainConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.auth = new BlockchainAuth(config);
  }

  /**
   * Call a contract method
   * @param params Contract method parameters
   * @param token Authentication token (optional)
   * @returns Response containing the call result
   */
  async callMethod(
    params: ContractMethodParams,
    token?: string
  ): Promise<ApiResponse> {
    try {
      // Get token if not provided
      if (!token) {
        const authToken = await this.auth.getToken();
        if (!authToken) {
          return {
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR'
          };
        }
        token = authToken;
      }

      const url = `${this.config.restUrl}/contract/call`;
      
      // Prepare request body
      const requestBody = {
        ...params,
        txId: generateUUID(), // Generate transaction ID
        timestamp: new Date().toISOString()
      };
      
      // Prepare headers
      const headers = {
        ...defaultHeaders,
        'Authorization': `Bearer ${token}`
      };
      
      // Send request
      const response = await sendRequest(
        url,
        'POST',
        headers,
        requestBody
      );
      
      return await parseResponse(response);
    } catch (error) {
      console.error('Error calling contract method:', error);
      return {
        success: false,
        message: 'Failed to call contract method',
        code: 'REQUEST_ERROR'
      };
    }
  }

  /**
   * Deploy a new contract
   * @param params Contract deployment parameters
   * @param token Authentication token (optional)
   * @returns Response containing the deployment result
   */
  async deployContract(
    params: ContractDeployParams,
    token?: string
  ): Promise<ApiResponse> {
    try {
      // Get token if not provided
      if (!token) {
        const authToken = await this.auth.getToken();
        if (!authToken) {
          return {
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR'
          };
        }
        token = authToken;
      }

      const url = `${this.config.restUrl}/contract/deploy`;
      
      // Prepare request body
      const requestBody = {
        ...params,
        txId: generateUUID(), // Generate transaction ID
        timestamp: new Date().toISOString()
      };
      
      // Prepare headers
      const headers = {
        ...defaultHeaders,
        'Authorization': `Bearer ${token}`
      };
      
      // Send request
      const response = await sendRequest(
        url,
        'POST',
        headers,
        requestBody
      );
      
      return await parseResponse(response);
    } catch (error) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        message: 'Failed to deploy contract',
        code: 'REQUEST_ERROR'
      };
    }
  }
} 