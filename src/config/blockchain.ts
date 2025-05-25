export interface BlockchainConfig {
    restUrl: string;
    accessId: string;
    tenantId: string;
    account: string;
    bizId: string;
    kmsKeyId: string;
    contractName: string;
  }
  
  /**
   * Default configuration values
   */
  export const defaultConfig: BlockchainConfig = {
    restUrl: 'http://123.57.145.236:8088',
    accessId: '80cd5f70-a6fa-4b64-97f1-7b22c2d3d88e',
    tenantId: '80cd5f70-a6fa-4b64-97f1-7b22c2d3d88e',
    account: 'shi',
    bizId: 'M250226181949',
    kmsKeyId: '80cd5f70-a6fa-4b64-97f1-7b22c2d3d88e_1741933298091_key',
    contractName: 'carbon-contract-v4'
  };

export const blockChainEndpoint = {
    contract:{
      chainCallForBiz: '/api/contract/chainCallForBiz',
      chainCall: '/api/contract/chainCall',
      shakeHand: '/api/contract/shakeHand',
    }
}