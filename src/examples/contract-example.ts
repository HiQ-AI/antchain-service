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

/**
 * 解析交易回执结果
 * @param receiptResult 交易回执结果
 * @returns 交易回执结果数据
 */
function parseReceiptResult(receiptResult: any) {
  let receiptResultData = receiptResult.data;
  console.log('receiptResultData:', receiptResultData);
  if (typeof receiptResultData === 'string') {
    receiptResultData = JSON.parse(receiptResultData);
  }
  if (receiptResultData.output) {

    const outputBytes = base64ToUint8Array(receiptResultData.output);
    let outputText = '';
    try {
      outputText = new TextDecoder().decode(outputBytes);
      try {
        const outputJson = JSON.parse(outputText);
        console.log('合约 output（JSON）:', outputJson);
      } catch {
        console.log('合约 output（文本）:', outputText);
      }
    } catch {
      console.log('合约 output（原始字节）:', outputBytes);
    }
  }
  return receiptResultData;
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
    // const getNameResult = await blockchain.contract.callWasmContract(token,'GetName()');
    const params = {
      inputParams: [],
      outputTypes: '[string]',
      contractName: 'carbon-contract-v4',
      methodSignature: 'GetName()'
    }
    const getNameResult = await blockchain.contract.callMethod(params,token);
    console.log('===== Raw GetName response =====');
    console.log(JSON.stringify(getNameResult, null, 2));
    console.log('================================');
    if (!getNameResult.success) {
      throw new Error(`GetName failed: ${getNameResult.message} (Code: ${getNameResult.code})`);
    }
    console.log('GetName call successful!');
    console.log('GetName 交易hash:', getNameResult.data);

    const receiptResult = await blockchain.data.queryReceipt(getNameResult.data,token);
    console.log('===== Raw receipt response =====');
    console.log(JSON.stringify(receiptResult, null, 2));
    console.log('================================');
    if (!receiptResult.success) {
      throw new Error(`queryReceipt failed: ${receiptResult.message} (Code: ${receiptResult.code})`);
    }

    const receiptResultData = parseReceiptResult(receiptResult);
    console.log('receiptResultData:', receiptResultData);

    // Step 3: Call WASM contract setName method
    const newName = 'newFishName324';
    const setNameParams = {
      inputParamListStr: '["' + newName + '"]',
      outputTypes: '[string]',
      contractName: 'carbon-contract-v4',
      methodSignature: 'SetName(string)'
    }
    console.log(`\n3. Calling WASM contract setName('${newName}') ...`);
    const setNameResult = await blockchain.contract.callMethod(setNameParams,token);
    console.log('===== Raw setName response =====');
    console.log(JSON.stringify(setNameResult, null, 2));
    console.log('================================');
    const setNameReceiptHash = setNameResult.data;
    // const setNameReceiptHash = '4bcc5b671785136583eab7a1551013f65838384345f21b0a280cfe6da1f7eab0';

    console.log('等待2秒,待交易执行完毕')
    await new Promise(resolve => setTimeout(resolve, 2000));
    const setNameReceiptResult = await blockchain.data.queryReceipt(setNameReceiptHash,token);
    console.log('===== Raw setName receipt response =====');
    console.log(JSON.stringify(setNameReceiptResult, null, 2));
    console.log('================================');
    const setNameReceiptResultData = parseReceiptResult(setNameReceiptResult);
    console.log('setNameReceiptResultData:', setNameReceiptResultData);


    // Step 4: Call WASM contract GetName method
    const getNameResult2 = await blockchain.contract.callMethod(params,token);
    console.log('===== Raw GetName response =====');
    console.log(JSON.stringify(getNameResult2, null, 2));
    console.log('================================');
    if (!getNameResult2.success) {
      throw new Error(`GetName failed: ${getNameResult2.message} (Code: ${getNameResult2.code})`);
    }
    console.log('GetName call successful!');
    console.log('GetName 交易hash:', getNameResult2.data);

    const getNameResult2ReceiptResult = await blockchain.data.queryReceipt(getNameResult2.data,token);
    console.log('===== Raw GetName receipt response =====');
    console.log(JSON.stringify(getNameResult2ReceiptResult, null, 2));
    console.log('================================');
    const getNameResult2ReceiptResultData = parseReceiptResult(getNameResult2ReceiptResult);
    console.log('getNameResult2ReceiptResultData:', getNameResult2ReceiptResultData);

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
