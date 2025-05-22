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
 * Class for handling blockchain data operations
 */
export class BlockchainData {
  private config: BlockchainConfig;

  /**
   * Create a new BlockchainData instance
   * @param config Configuration options (optional)
   */
  constructor(config?: Partial<BlockchainConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Send deposit request (store data in blockchain)
   * @param content Content to store in blockchain
   * @param token Authentication token (optional, will be fetched if not provided)
   * @returns API response or null if failed
   */
  async deposit(content: string, token?: string): Promise<ApiResponse | null> {
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
      
      // Organize request parameters
      const requestData = {
        'accessId': this.config.accessId,
        'account': this.config.account,
        'bizid': this.config.bizId,
        'content': content,
        'gas': 0,
        'method': 'DEPOSIT',
        'mykmsKeyId': this.config.kmsKeyId,
        'orderId': orderId,
        'tenantid': this.config.tenantId,
        'token': authToken,
        'withGasHold': false
      };

      // Log and send request
      logRequest('DEPOSIT', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // Parse and log response
      const response = parseResponse(responseText);
      logResponse('DEPOSIT', response);
      
      return response;
    } catch (error) {
      console.error('Error in deposit operation:', error);
      return null;
    }
  }

  /**
   * Query transaction details by hash
   * @param txHash Transaction hash to query
   * @param token Authentication token (optional, will be fetched if not provided)
   * @returns API response or null if failed
   */
  async queryTransaction(txHash: string, token?: string): Promise<ApiResponse | null> {
    try {
      // Get token if not provided
      const authToken = token || await authMiddleware.getToken();
      if (!authToken) {
        console.error('Failed to get authentication token');
        return null;
      }

      // Set API endpoint
      const restUrl = this.config.restUrl;
      const apiEndpoint = '/api/contract/chainCall';
      
      // Organize request parameters
      const requestData = {
        'accessId': this.config.accessId,
        'bizid': this.config.bizId,
        'hash': txHash,
        'method': 'QUERYTRANSACTION',
        'token': authToken
      };

      // Log and send request
      logRequest('QUERYTRANSACTION', requestData);
      const responseText = await sendRequest(restUrl + apiEndpoint, defaultHeaders, requestData);
      
      // Parse and log response
      const response = parseResponse(responseText);
      logResponse('QUERYTRANSACTION', response);
      
      return response;
    } catch (error) {
      console.error('Error in queryTransaction operation:', error);
      return null;
    }
  }
}

// Default instance
export const dataMiddleware = new BlockchainData(); 