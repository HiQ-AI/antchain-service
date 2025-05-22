# 区块链与智能合约中间件

这个中间件提供了一套统一的API，用于与区块链和智能合约进行交互。它处理了认证、数据操作、合约操作和隐私计算等功能。

## 功能特点

- **模块化设计**: 将区块链功能分解为独立的模块，便于维护和扩展
- **统一API**: 提供简洁一致的接口进行区块链操作
- **类型安全**: 使用TypeScript类型确保API调用的正确性
- **令牌缓存**: 自动缓存和管理认证令牌，减少不必要的认证请求
- **错误处理**: 提供统一的错误处理机制
- **可配置**: 支持自定义配置，适应不同的区块链环境
- **隐私计算**: 支持多种隐私计算方式，包括TEE、MPC、FHE等

## 模块结构

- **auth**: 处理认证和令牌管理
- **data**: 处理区块链数据存储和查询
- **contract**: 处理智能合约调用
- **privacy**: 处理隐私计算任务
- **base**: 提供通用工具和配置

## 使用方法

### 导入中间件

```typescript
// 导入整个中间件
import { blockchain } from './middleware/index.ts';

// 或者导入特定模块
import { authMiddleware } from './middleware/auth.ts';
import { dataMiddleware } from './middleware/data.ts';
import { contractMiddleware } from './middleware/contract.ts';
import { privacyMiddleware } from './middleware/privacy.ts';
```

### 认证操作

```typescript
// 获取认证令牌
const token = await blockchain.auth.getToken();

// 可以指定密钥文件路径
const token = await blockchain.auth.getToken('../path/to/private_key.key');
```

### 数据操作

```typescript
// 存储数据到区块链 (自动获取令牌)
const depositResult = await blockchain.data.deposit('Hello, Blockchain!');

// 或者提供令牌
const depositResult = await blockchain.data.deposit('Hello, Blockchain!', token);

// 查询交易
const txHash = depositResult.data;
const queryResult = await blockchain.data.queryTransaction(txHash);
```

### 合约操作

```typescript
// 调用合约方法获取名称
const contractName = 'your_contract_name';
const getNameResult = await blockchain.contract.getName(contractName);

// 设置新名称
const setNameResult = await blockchain.contract.setName(contractName, 'NewName');

// 调用自定义合约方法
const result = await blockchain.contract.callMethod({
  contractName: 'your_contract_name',
  methodSignature: 'yourMethod(string,int)',
  inputParams: ['param1', 123],
  outputTypes: ['string', 'int'],
  isLocalTransaction: true
});
```

### 隐私计算操作

```typescript
import { PrivacyComputeType } from './middleware/index.ts';

// 创建隐私计算任务
const taskResult = await blockchain.privacy.createPrivacyTask({
  computeType: PrivacyComputeType.TEE, // 使用可信执行环境
  inputData: {
    function: "function process(data) { /* 处理逻辑 */ }",
    schema: { /* 数据模式 */ }
  },
  encryptionLevel: 2,
  timeoutSeconds: 600
});

// 推送数据到任务
const taskId = taskResult.data.taskId;
await blockchain.privacy.pushData(taskId, yourData);

// 查询任务状态
const statusResult = await blockchain.privacy.queryTaskStatus(taskId);

// 获取计算结果
const computeResult = await blockchain.privacy.getPrivacyResult(taskId);

// 取消任务
await blockchain.privacy.cancelTask(taskId, '任务已不需要');
```

### 自定义配置

```typescript
import { BlockchainAuth, BlockchainData, BlockchainContract, BlockchainPrivacy } from './middleware/index.ts';

// 自定义配置
const customConfig = {
  restUrl: 'https://your-api-endpoint.com',
  accessId: 'your_access_id',
  tenantId: 'your_tenant_id',
  account: 'your_account',
  bizId: 'your_biz_id',
  kmsKeyId: 'your_kms_key_id'
};

// 创建自定义实例
const auth = new BlockchainAuth(customConfig);
const data = new BlockchainData(customConfig);
const contract = new BlockchainContract(customConfig);
const privacy = new BlockchainPrivacy(customConfig);

// 使用自定义实例
const token = await auth.getToken();
const result = await data.deposit('Custom configuration');
```

## 完整示例

- 查看 `src/example.ts` 获取区块链和智能合约操作的完整示例
- 查看 `src/privacy-example.ts` 获取隐私计算的完整示例

## 隐私计算说明

隐私计算模块支持以下计算类型：

- **TEE (可信执行环境)**: 在隔离的安全环境中执行计算
- **MPC (多方安全计算)**: 允许多方在不泄露原始数据的情况下共同计算
- **FHE (全同态加密)**: 在加密状态下直接进行计算，无需解密
- **FEDERATED (联邦学习)**: 分布式机器学习方法，数据不离开本地
- **SMPC (安全多方计算)**: 多方在保护隐私的前提下共同计算

使用隐私计算的一般流程：

1. 创建隐私计算任务，指定计算方法和参数
2. 推送数据到计算任务
3. 定期查询任务状态
4. 任务完成后获取计算结果
5. 如需取消任务，可以调用取消API

## 开发说明

### 扩展功能

如需添加新的区块链功能，您可以:

1. 在对应模块中添加新方法
2. 或创建新的中间件模块并导出到index.ts

### 贡献指南

1. 确保代码遵循TypeScript规范
2. 为新功能添加适当的文档
3. 添加错误处理和日志记录
4. 提交前测试您的更改 