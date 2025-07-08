import { ApiResponse } from 'src/deps.ts';
import { BlockchainConfig, defaultConfig } from 'src/config/blockchain.ts';
import { BlockchainAuth } from '../auth/index.ts';
// @deno-types="npm:@antchain/baasdatagw"
import * as BaasdatagwSDK from 'npm:@antchain/baasdatagw@1.4.10';
import * as $Util from 'npm:@alicloud/tea-util@1.4.7';

// Type aliases for better readability
type Config = BaasdatagwSDK.Config;
type CreateChaininsightQrcodeRequest = BaasdatagwSDK.CreateChaininsightQrcodeRequest;
type CreateChaininsightQrcodeResponse = BaasdatagwSDK.CreateChaininsightQrcodeResponse;
type MapEntry = BaasdatagwSDK.MapEntry;

/**
 * Class for handling BaaS DataGW operations using official SDK
 */
export class BaasDataGW {
  private config: BlockchainConfig;
  private auth: BlockchainAuth;
  private client!: any;

  /**
   * Create a new BaasDataGW instance
   * @param config Configuration options
   */
  constructor(config?: Partial<BlockchainConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.auth = new BlockchainAuth(config);
    
  }

  async initClient(): Promise<any> {
    const sdkConfig = new BaasdatagwSDK.Config({
      accessKey: this.config.openapiAccessKey,
      accessKeyId: this.config.openapiAccessKey,
      kmsKeyId: this.config.kmsKeyId,
      accessKeySecret: this.config.openapiAccessSecret,
      endpoint: Deno.env.get('BAAS_ENDPOINT') || 'openapi.antchain.antgroup.com',
      // endpoint: this.config.restUrl || 'openapi.antchain.antgroup.com',
      protocol: 'https',
      userAgent: 'antchain-dev/1.0.0',
      readTimeout: 10000,
      connectTimeout: 5000
    });
    console.log('SDK Config:', sdkConfig);
    this.client = new (BaasdatagwSDK.default as any).default(sdkConfig);
  }

  /**
   * Get blockchain auth token
   * @returns Authentication token or null
   */
  async getAuthToken(): Promise<string | null> {
    return await this.auth.getToken();
  }

  /**
   * Create QR code using official SDK
   * @param bizId Chain ID
   * @param pageType QR code type
   * @param params Parameters for the QR code
   * @param useBlockchainAuth Optional flag to include blockchain auth token
   * @returns Response with base64 encoded PNG
   */
  async createQRCode(
    params: Array<{ key: string; value: string; type?: string }>,
    bizId?: string,
    pageType: 'CONTRACT' | 'HEXADDRESS' | 'TX' | 'CHAIN' | 'BLOCK' | 'TIMELINE' = 'TX',
  ): Promise<ApiResponse> {
    try {
      await this.initClient();

      const defaultParamList = [
        {
          "key": "unionId",
          "value": this.config.blockChainUnionId,
          "type": "String"
        },
        {
          "key": "bizId", 
          "value": this.config.bizId,
          "type": "String"
        },
        {
          "key": "hexAddresses",
          "value": `['${this.config.blockChainHexAddress}','${this.config.blockChainHexAddress}']`,
          "type": "JSONArray"
        }
      ]
      const paramList = [...defaultParamList, ...params]
      console.log('Param List:', paramList);
      // Convert params to MapEntry format
      const paramMap: MapEntry[] = paramList.map(param => new BaasdatagwSDK.MapEntry({
        key: param.key,
        value: param.value,
        type: param.type || 'String'
      }));

      console.log('Param Map:', paramMap);

      // Create request
      const request = new BaasdatagwSDK.CreateChaininsightQrcodeRequest({
        // authToken: await this.auth.getToken(),
        bizId: bizId || this.config.bizId,
        pageType: pageType,
        paramMap: paramMap,
        // productInstanceId: this.config.productInstanceId
      });

      // Prepare headers
      const headers: {[key: string]: string} = {};
      
      console.log('Creating QR code with SDK:', { 
        bizId: request.bizId,
        pageType: request.pageType,
        paramMap: request.paramMap,
      });

      // Prepare runtime options
      const runtime = new $Util.RuntimeOptions({
        // autoretry: true,
        // maxAttempts: 3,
        // backoffPolicy: 'fixed',
        // backoffPeriod: 1000,
        readTimeout: 10000,
        // connectTimeout: 5000
      });

      console.log('Request:', request);
      console.log('Headers:', headers);
      console.log('Runtime:', runtime);

      // Call SDK method with extended parameters
      const response: CreateChaininsightQrcodeResponse = await this.client.createChaininsightQrcodeEx(
        request,
        headers,
        runtime
      );
      console.log('Response:', response);
      const pngData = 'data:image/png;base64,' + response.result;

      // Process response
      if (response.resultCode === 'OK') {
        return {
          success: true,
          data: {
            qrCodePng: pngData, // base64 encoded PNG
            requestId: response.reqMsgId
          },
          message: 'QR code created successfully',
          code: 'SUCCESS'
        };
      } else {
        return {
          success: false,
          message: response.resultMsg || 'Failed to create QR code',
          code: response.resultCode || 'ERROR'
        };
      }
    } catch (error) {
      console.error('Error creating QR code with SDK:', error);
      return {
        success: false,
        message: `Failed to create QR code: ${error instanceof Error ? error.message : String(error)}`,
        code: 'SDK_ERROR'
      };
    }
  }
}