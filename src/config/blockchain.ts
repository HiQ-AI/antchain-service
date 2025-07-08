import { load } from "std/dotenv/mod.ts";

const envConfig = await load({allowEmptyValues: true});


// 创建配置对象，优先使用环境变量，其次使用.env文件中的配置
const getConfig = (key: string, defaultValue?: string): string => {
  // 优先使用环境变量
  const envValue = Deno.env.get(key);
  if (envValue !== undefined) {
    return envValue;
  }
  // 其次使用.env文件中的值
  return envConfig[key] !== undefined ? envConfig[key] : (defaultValue || "");
};

export interface BlockchainConfig {
    restUrl: string;
    accessId: string;
    tenantId: string;
    account: string;
    bizId: string;
    kmsKeyId: string;
    contractName: string;
    openapiAccessKey: string;
    openapiAccessSecret: string;
    productInstanceId: string;
    blockChainUnionId: string;
    blockChainHexAddress: string;
  }
  
  /**
   * Default configuration values
   */
  export const defaultConfig: BlockchainConfig = {
    restUrl: getConfig('BLOCKCHAIN_REST_URL'),
    accessId: getConfig('BLOCKCHAIN_ACCESS_ID'),
    tenantId: getConfig('BLOCKCHAIN_TENANT_ID'),
    account: getConfig('BLOCKCHAIN_ACCOUNT'),
    bizId: getConfig('BLOCKCHAIN_BIZ_ID'),
    kmsKeyId: getConfig('BLOCKCHAIN_KMS_KEY_ID'),
    contractName: getConfig('BLOCKCHAIN_CONTRACT_NAME'),
    openapiAccessKey: getConfig('OPENAPI_ACCESS_KEY'),
    openapiAccessSecret: getConfig('OPENAPI_ACCESS_SECRET'),
    productInstanceId: getConfig('OPENAPI_PRODUCT_INSTANCE_ID'),
    blockChainUnionId: getConfig('BLOCKCHAIN_UNION_ID'),
    blockChainHexAddress: getConfig('BLOCKCHAIN_HEX_ADDRESS'),
  };

export const blockChainEndpoint = {
    contract:{
      chainCallForBiz: '/api/contract/chainCallForBiz',
      chainCall: '/api/contract/chainCall',
      shakeHand: '/api/contract/shakeHand',
    }
}

console.log(defaultConfig);