import { ApiResponse } from 'src/deps.ts';
import { 
  defaultHeaders, 
  generateUUID, 
  sendRequest, 
  parseResponse,
  logRequest,
  logResponse
} from './base.ts';
import { BlockchainAuth } from '../core/blockchain/auth/index.ts';
import { BlockchainConfig,defaultConfig } from "src/config/index.ts";
import { authMiddleware } from './auth.ts';

/**
 * Interface for contract method parameters
 */
export interface ContractMethodParams {
  contractName: string;
  methodSignature: string;
  inputParams?: any[];
  outputTypes?: string[];
  isLocalTransaction?: boolean;
}

/**
 * Class for handling smart contract operations
 */
export class BlockchainContract {
  private config: BlockchainConfig;

  /**
   * Create a new BlockchainContract instance
   * @param config Configuration options (optional)
   */
  constructor(config?: Partial<BlockchainConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Call a WASM contract method
   * @param params Contract method parameters
   * @param token Authentication token (optional, will be fetched if not provided)
   * @returns API response or null if failed
   */
  async callMethod(params: ContractMethodParams, token?: string): Promise<ApiResponse | null> {
    try {
      // Get token if not provided
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('Failed to get authentication token');
        return null;
      }

      // Set API endpoint
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCallForBiz';
      
      // Generate unique order ID
      const orderId = generateUUID();
      console.log(`Generated ${params.methodSignature} request orderId:`, orderId);
      
      // Format input parameters
      const inputParamListStr = JSON.stringify(params.inputParams || []);
      
      // Format output types
      const outTypes = params.outputTypes ? JSON.stringify(params.outputTypes) : '[]';
      
      // Organize request parameters
      const requestData = {
        'accessId': this.config.accessId,
        'account': this.config.account,
        'bizid': this.config.bizId,
        'gas': 0,
        'inputParamListStr': inputParamListStr,
        'method': 'CALLWASMCONTRACTASYNC',
        'methodSignature': params.methodSignature,
        'mykmsKeyId': this.config.kmsKeyId,
        'orderId': orderId,
        'outTypes': outTypes,
        'tenantid': this.config.tenantId,
        'token': authToken,
        'withGasHold': false,
        'contractName': params.contractName,
        ...(params.isLocalTransaction ? { 'isLocalTransaction': true } : {})
      };

      // Log and send request
      logRequest(`CONTRACT:${params.methodSignature}`, requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // Parse and log response
      const response = parseResponse(responseText);
      logResponse(`CONTRACT:${params.methodSignature}`, response);
      
      return response;
    } catch (error) {
      console.error(`Error in contract method ${params.methodSignature}:`, error);
      return null;
    }
  }

  /**
   * Get name from contract (example method)
   * @param contractName Contract name
   * @param token Authentication token (optional)
   * @returns API response or null if failed
   */
  async getName(contractName: string, token?: string): Promise<ApiResponse | null> {
    return this.callMethod({
      contractName: contractName,
      methodSignature: 'GetName()',
      outputTypes: ['string']
    }, token);
  }

  /**
   * Set name in contract (example method)
   * @param contractName Contract name
   * @param newName New name to set
   * @param token Authentication token (optional)
   * @returns API response or null if failed
   */
  async setName(contractName: string, newName: string, token?: string): Promise<ApiResponse | null> {
    return this.callMethod({
      contractName: contractName,
      methodSignature: 'setName(string)',
      inputParams: [newName],
      isLocalTransaction: true
    }, token);
  }
}

// Default instance
export const contractMiddleware = new BlockchainContract(); 