import { blockchain } from 'src/core/blockchain/index.ts';

/**
 * 将16进制字符串解码为utf8字符串，自动去除结尾的0x00
 */

// 辅助函数：转换base64为Uint8Array
function base64ToUint8Array(base64Str: string): Uint8Array {
  const binary = atob(base64Str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 辅助函数：将hex字符串转为Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// 尝试解码合约返回的data字段
function tryDecodeData(data: any): any {
  if (typeof data === 'string' && /^[0-9a-fA-F]+$/.test(data) && data.length % 2 === 0) {
    // 1. hex转Uint8Array
    let bytes = hexToUint8Array(data);
    // 2. 去除结尾0x00
    let end = bytes.length;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        end = i;
        break;
      }
    }
    bytes = bytes.slice(0, end);
    // 3. 尝试utf8解码
    let text = '';
    try {
      text = new TextDecoder().decode(bytes);
    } catch {
      return data;
    }
    // 4. 如果是JSON字符串，自动parse
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return data;
}

/**
 * Example for WASM blockchain contract operations
 * Demonstrates how to call WASM contract methods (GetName/setName)
 */
async function run() {
  try {
    console.log('WASM Blockchain Contract Operations Example');
    console.log('==========================================');

    // Step 1: Get authentication token
    console.log('\n1. Authenticating...');
    const token = await blockchain.auth.getToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }
    console.log('Authentication successful');

    // Step 2: Call WASM contract GetName method
    console.log(`\n2. Calling WASM contract GetName() ...`);
    const getNameResult = await blockchain.contract.callWasmContract(token,'GetName()');
    console.log('===== Raw GetName response =====');
    console.log(JSON.stringify(getNameResult, null, 2));
    console.log('================================');
    if (!getNameResult.success) {
      throw new Error(`GetName failed: ${getNameResult.message} (Code: ${getNameResult.code})`);
    }
    const decodedName = tryDecodeData(getNameResult.data);
    console.log('GetName call successful!');
    console.log('GetName 交易hash:', getNameResult.data);
    const queryResult = await blockchain.data.queryData({ dataId: getNameResult.data });
    console.log('===== Raw queryData response =====');
    console.log(JSON.stringify(queryResult, null, 2));
    if (!queryResult.success) {
      throw new Error(`queryData failed: ${queryResult.message} (Code: ${queryResult.code})`);
    }
    // 尝试解码链上存储的原始数据
    if (queryResult.data) {
      try {
        const resultObj = typeof queryResult.data === 'string' ? JSON.parse(queryResult.data) : queryResult.data;
        const base64Data = resultObj.transactionDO?.data;
        if (base64Data) {
          const decodedText = new TextDecoder().decode(base64ToUint8Array(base64Data));
          let parsed;
          try {
            parsed = JSON.parse(decodedText);
          } catch {
            parsed = decodedText;
          }
          console.log('链上存储的原始数据:', parsed);
        } else {
          console.log('未找到链上原始数据字段');
        }
      } catch (error) {
        console.error('解析链上数据失败:', error);
      }
    }

  //   if (!queryResult.success) {
  //     throw new Error(`queryData failed: ${queryResult.message} (Code: ${queryResult.code})`);
  //   }
  //   const decodedQueryResult = tryDecodeData(queryResult.data);
  //   console.log('GetName result (decoded):', decodedQueryResult); 

  //   console.log('GetName result (decoded):', decodedName);

  //   // Step 3: Call WASM contract setName method
  //   const newName = 'newFishName';
  //   console.log(`\n3. Calling WASM contract setName('${newName}') ...`);
  //   const setNameResult = await blockchain.contract.setContractName(token, newName);
  //   console.log('===== Raw setName response =====');
  //   console.log(JSON.stringify(setNameResult, null, 2));
  //   console.log('================================');
  //   if (!setNameResult.success) {
  //     throw new Error(`setName failed: ${setNameResult.message} (Code: ${setNameResult.code})`);
  //   }
  //   console.log('setName call successful!');
  //   console.log('setName result:', JSON.stringify(setNameResult.data, null, 2));

  //   // Step 4: Verify the name was updated
  //   console.log(`\n4. Verifying updated name with GetName() ...`);
  //   const verifyResult = await blockchain.contract.callWasmContract(token);
  //   console.log('===== Raw verify GetName response =====');
  //   console.log(JSON.stringify(verifyResult, null, 2));
  //   console.log('================================');
  //   const verifyDecoded = tryDecodeData(verifyResult.data);
  //   if (!verifyResult.success) {
  //     throw new Error(`Verification GetName failed: ${verifyResult.message} (Code: ${verifyResult.code})`);
  //   }
  //   console.log('Verification GetName call successful!');
  //   console.log('Updated name (decoded):', verifyDecoded);

  //   console.log('\nAll WASM contract operations completed successfully!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

interface CarbonRecord {
  uuid: string;
  data: any;
}

async function runCarbonContract() {
  const token = await blockchain.auth.getToken();
  const carbonRecord: CarbonRecord = {
    uuid: '1234567890',
    data: {
      carbonAmount: 100,
      carbonType: 'CO2',
      timestamp: Date.now()
    }
  };
  if (!token) {
    throw new Error('Failed to get authentication token');
  }
  console.log('\n=== 调用 AddCarbonRecord 合约方法 ===');
  console.log('参数:', JSON.stringify(carbonRecord, null, 2));
  const result = await blockchain.contract.callWasmContract(token, `AddCarbonRecord(${JSON.stringify(carbonRecord)})`);
  console.log('===== Raw QueryCarbonRecord 合约方法 =====');
  const queryHash = await blockchain.contract.callWasmContract(token, `QueryCarbonRecord(${carbonRecord.uuid})`);
  console.log(JSON.stringify(result, null, 2));
  const txHash = result.data;
  if (!txHash || typeof txHash !== 'string') {
    throw new Error('AddCarbonRecord未返回有效的交易hash');
  }
  console.log('AddCarbonRecord 交易hash:', txHash);

  // 使用hash查询链上数据
  console.log('\n=== 根据交易hash查询链上数据 ===');
  const queryResult = await blockchain.data.queryData({ dataId: txHash });
  console.log('===== Raw queryData response =====');
  console.log(JSON.stringify(queryResult, null, 2));
  if (!queryResult.success) {
    throw new Error(`queryData failed: ${queryResult.message} (Code: ${queryResult.code})`);
  }
  // 尝试解码链上存储的原始数据
  if (queryResult.data) {
    try {
      const resultObj = typeof queryResult.data === 'string' ? JSON.parse(queryResult.data) : queryResult.data;
      const base64Data = resultObj.transactionDO?.data;
      if (base64Data) {
        const decodedText = new TextDecoder().decode(base64ToUint8Array(base64Data));
        let parsed;
        try {
          parsed = JSON.parse(decodedText);
        } catch {
          parsed = decodedText;
        }
        console.log('链上存储的原始数据:', parsed);
      } else {
        console.log('未找到链上原始数据字段');
      }
    } catch (error) {
      console.error('解析链上数据失败:', error);
    }
  }
}

// Run the example  
run();
// runCarbonContract();

// Execute with:
// deno run -A src/examples/contract-example.ts
