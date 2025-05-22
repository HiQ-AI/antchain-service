import { calculateSignature, signRequest } from 'src/middlewares/sign.ts';

// 基础配置
const baseUrl = 'http://123.57.86.188:32081';
const authenticationType = 'isv';
const authenticationVersion = '1.0';
const tenantId = 'pds1Admin';
const isvAk = 'pzeUK+obho+uFPeS';
const isvSk = '73y8jTkIr64Tw826'; 
const signatureMethod = 'SHA256_HMAC';

/**
 * Generates a curl command string from fetch request parameters
 * @param url The request URL
 * @param method HTTP method
 * @param headers Request headers
 * @param body Request body (for POST/PUT requests)
 * @returns A string containing the equivalent curl command
 */
function generateCurlCommand(url: URL, method: string, headers: Record<string, string>, body: any = null): string {
  let curlCommand = `curl -X ${method} '${url.toString()}'`;
  
  // Add headers
  for (const [key, value] of Object.entries(headers)) {
    curlCommand += ` \\\n  -H '${key}: ${value}'`;
  }
  
  // Add body for POST/PUT requests
  if (body && (method === 'POST' || method === 'PUT')) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    curlCommand += ` \\\n  -d '${bodyStr}'`;
  }
  
  return curlCommand;
}

export async function queryProjects() {
    // 请求配置
    const method = 'GET';
    const apiUrlPath = '/api/project/pageQuery';
    const params = {
        page: '1',
        pageSize: '10',
    };
    const url = new URL(`${baseUrl}${apiUrlPath}`);
    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    const paramsStr = new URLSearchParams(params).toString();
    const getRequestUrl = new URL(`${baseUrl}${apiUrlPath}?${paramsStr}`);
    console.log('getRequestUrl',getRequestUrl)
    const body = null;

    // const signature = await calculateSignature(isvSk, apiUrlPath, headers, params);
    const signature = await signRequest(getRequestUrl, headers, body, isvSk);
    headers['x-signature'] = signature;
    console.log('sign',signature)

    // Print curl command for debugging
    console.log('Curl command:');
    console.log(generateCurlCommand(getRequestUrl, method, headers));

    // 发送请求
    const response = await fetch(getRequestUrl, {
        method,
        headers
    });
    const data = await response.json();
    console.log(data);
    return data;
}


export async function testConnecivity(params:Record<string, any>) {
    const apiUrlPath = '/api/dataset/local/testConnecivity';
    const method = 'POST';
    const postRequestUrl = new URL(`${baseUrl}${apiUrlPath}`);
    console.log('postRequestUrl', postRequestUrl);

    const body = params;
    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    
    const signature = await signRequest(postRequestUrl, headers, body, isvSk);
    headers['x-signature'] = signature;
    headers['Content-Type'] = 'application/json';
    
    console.log('POST请求签名信息:', {
        apiUrlPath,
        headers,
        bodyLength: body.length,
        signature
    });

    // Print curl command for debugging
    console.log('Curl command:');
    console.log(generateCurlCommand(postRequestUrl, method, headers, body));

    const response = await fetch(postRequestUrl, {
        method,
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(data);
    return data;
}

export async function recognizeSchema(params:Record<string, any>) {
    const apiUrlPath = '/api/dataset/local/recognizeSchema';
    const method = 'POST';
    const postRequestUrl = new URL(`${baseUrl}${apiUrlPath}`);
    console.log('postRequestUrl', postRequestUrl);

    const body = params;
    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    
    const signature = await signRequest(postRequestUrl, headers, body, isvSk);
    headers['x-signature'] = signature;
    headers['Content-Type'] = 'application/json';

    // Print curl command for debugging
    console.log('Curl command:');
    console.log(generateCurlCommand(postRequestUrl, method, headers, body));
    
    const response = await fetch(postRequestUrl, {
        method,
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(data);
    return data;
}

export async function createCalculateInstance(params:Record<string, string>) {
    const apiUrlPath = '/api/app/instance/create';
    const method = 'POST';
    const postRequestUrl = new URL(`${baseUrl}${apiUrlPath}`);
    console.log('postRequestUrl', postRequestUrl);

    /**
     * @param {Object} params
     * {
        "networkId [当前项⽬所属的协作⽹络id 本期非必填，不填写时后端⾃动填补默认的⽹络id]": "string",
        "projectId [协作项⽬id]": "string",
        "envId [计算环境的id]": "string",
        "appId [协作应⽤id]": "string",
        "dynamicParam [执⾏实例的动态参数，json格式]": "string"
        }
        @example
        {
        "projectId": "PROJ_20250323163915_2nW3f7wz",
        "envId": "ENV_20250323163915_8EJkp60z",
        "appId": "APP_20250323164059_kHFeIqTg",
        "dynamicParam": "{\"dynamicParameter\":\"\",\"operatorList\":[{\"code\":\"dataset_reader\",\"id\":\"1af6c6a3-f40f-4c99-8d36-3f995e6ce816\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"0352d09d-db26-4729-b207-2dcdf6c9a75b\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164852_moyjsDA0\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"dataset_reader\",\"id\":\"475f757e-beae-4b70-9e78-892bf5f59855\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"04650d44-4eb5-4d29-b70c-ce86bfdff684\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164711_44Uq3G97\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"data_writer\",\"id\":\"c9706900-23d8-48a9-b1c3-30d70f7d9db1\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATA_WRITER\\\",\\\"params\\\":{\\\"isCipherText\\\":false}},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"storage_type\\\":\\\"true\\\",\\\"owner_did\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\",\\\"format_type\\\":\\\"CSV\\\",\\\"name\\\":\\\"result\\\",\\\"is_manage\\\":true}\"},{\"code\":\"scql\",\"id\":\"550a900b-58ea-4bb9-a976-cedd1c54b88e\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"SQL\\\",\\\"params\\\":{\\\"receiverRoleName\\\":\\\"receiver\\\"}},\\\"enablePreConfig\\\":true,\\\"preset\\\":\\\"preset-shape-double-knife\\\",\\\"checkRules\\\":[{\\\"parameterPaths\\\":[\\\"$.dp_{workerIndex}__ccl.column_ccl.keySet()\\\"],\\\"constraintRule\\\":\\\"EXIST_IN_DATASET_FIELD\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]},{\\\"constraintRule\\\":\\\"WORKER_NOT_SAME\\\",\\\"params\\\":{\\\"roleList\\\":[\\\"dp\\\"]}},{\\\"parameterPaths\\\":[\\\"$.dp_0__table_name\\\",\\\"$.dp_1__table_name\\\"],\\\"params\\\":\\\"^[A-Za-z0-9_$]*$\\\",\\\"constraintRule\\\":\\\"REG_EX\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]}],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"WORKER_NUM\\\",\\\"role\\\":\\\"dp\\\",\\\"mapParams\\\":{\\\"1\\\":{\\\"module\\\":\\\"scql_single_dp\\\"}}}}\",\"dynamicParameter\":\"{\\\"dp_0__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"result_table_create_cmd\\\":\\\"CREATE table result_table (average_value double)\\\",\\\"query_cmd\\\":\\\"SELECT AVG(combined_values) AS average_value FROM ( SELECT value_0 AS combined_values FROM t1 UNION ALL SELECT value_0 AS combined_values FROM t2 ) AS combined_data\\\",\\\"dp_1__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"dp_0__table_name\\\":\\\"t1\\\",\\\"dp_1__table_name\\\":\\\"t2\\\",\\\"_worker\\\":{\\\"receiver\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\"}}\"}]}"
        }
     */
    // const defaultDynamicParam = await Deno.readTextFile('./dynamicParam.json');
    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    
    const body = params;
    
    const signature = await signRequest(postRequestUrl, headers, body, isvSk);
    headers['x-signature'] = signature;
    headers['Content-Type'] = 'application/json';

    // Print curl command for debugging
    console.log('Curl command:');
    console.log(generateCurlCommand(postRequestUrl, method, headers, body));
    
    const response = await fetch(postRequestUrl, {
        method,
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();
    // console.log(data);
    return data;
}

// http://123.57.86.188:32081/api/local/dataset/authorize/queryDetail?coDatasetId=CO_DATASET_20250323164711_44Uq3G97&projectId=PROJ_20250323163915_2nW3f7wz


export async function queryCalculateInstanceDetail(params:Record<string, string>) {
    const apiUrlPath = '/api/local/dataset/authorize/queryDetail';
    const method = 'GET';
    const getRequestUrl = new URL(`${baseUrl}${apiUrlPath}`);
    console.log('getRequestUrl', getRequestUrl);
    
}
// http://123.57.86.188:32081/api/app/instance/queryInstanceExecStatus?appId=APP_20250323164059_kHFeIqTg&envId=ENV_20250323163915_8EJkp60z&instanceId=INSTANCE_20250325110405_OuCaPfgf&projectId=PROJ_20250323163915_2nW3f7wz

export async function queryInstanceExecStatus(params:Record<string, any>) {
    const apiUrlPath = '/api/app/instance/queryInstanceExecStatus';
    const method = 'GET';   
    const paramsStr = new URLSearchParams(params).toString();

    const getRequestUrl = new URL(`${baseUrl}${apiUrlPath}?${paramsStr}`);

    console.log('getRequestUrl', getRequestUrl);

    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };

    const signature = await signRequest(getRequestUrl, headers, null, isvSk);
    headers['x-signature'] = signature;

    const response = await fetch(getRequestUrl, {
        method,
        headers,
    });
    const data = await response.json();
    // console.log(data);
    return data;
}

// http://123.57.86.188:32081/api/app/instance/query?appId=APP_20250323164059_kHFeIqTg&envId=ENV_20250323163915_8EJkp60z&instanceId=INSTANCE_20250325110405_OuCaPfgf&projectId=PROJ_20250323163915_2nW3f7wz

export async function queryInstance(params:Record<string,any>) {
    const apiUrlPath = '/api/app/instance/query';
    const method = 'GET';
    const paramsStr = new URLSearchParams(params).toString();

    const getRequestUrl = new URL(`${baseUrl}${apiUrlPath}?${paramsStr}`);

    console.log('getRequestUrl', getRequestUrl);

    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    const signature = await signRequest(getRequestUrl, headers, null, isvSk);
    headers['x-signature'] = signature;
    console.log('signature',signature)
    console.log(generateCurlCommand(getRequestUrl, method, headers, null));


    const response = await fetch(getRequestUrl, {
        method,
        headers,
    });
    const data = await response.json();
    // console.log(data);
    return data;
}


export async function getCoDatasetId(params:Record<string,any>) {
    const instanceInfo = await queryInstance(params);
    const resultInfoList:Record<string,any>[] = instanceInfo.data.resultInfoList;
    const coDatasetId = resultInfoList.find((item:Record<string,any>) => item.status === 'SUCCESS')?.coDatasetId;
    return coDatasetId;
}


// http://123.57.86.188:32081/api/dataset/io/sampleDataByCoDatasetId
export async function sampleDataByCoDatasetId(params:Record<string,any>) {
    const apiUrlPath = '/api/dataset/io/sampleDataByCoDatasetId';
    const method = 'POST';
    const body = params;

    const postRequestUrl = new URL(`${baseUrl}${apiUrlPath}`);

    console.log('postRequestUrl', postRequestUrl);
    const headers:Record<string, string> = {
        'x-authentication-version': authenticationVersion,
        'x-authentication-type': authenticationType,
        'x-tenant-id': tenantId,
        'x-isv-ak': isvAk,
        "x-signature-method": signatureMethod,
    };
    const signature = await signRequest(postRequestUrl, headers, body, isvSk);
    headers['x-signature'] = signature;
    headers['Content-Type'] = 'application/json';

    const response = await fetch(postRequestUrl, {
        method,
        headers,
        body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log(data);
    return data;
}


if (import.meta.main) {
    // queryProjects().then(console.log).catch(console.error);

    // testConnecivity(
    //     {
    //         "name": "testdata",
    //         "description": "testdata",
    //         "datasourceType": "API",
    //         "locationConfig": "{}",
    //         "formatConfig": "{}",
    //         "connConfig": "{\"script\":\"package com.antgroup.antchain.fastdf.dataproxy.manager.connector.api\\n\\nimport com.alibaba.fastjson.JSONArray\\nimport com.alibaba.fastjson.JSONObject\\nimport com.antgroup.antchain.idata.rest.component.common.data.AbstractRestApiDataFetchAdaptor\\nimport com.antgroup.antchain.idata.rest.component.common.model.FetchDataResultBO\\nimport com.antgroup.antchain.idata.rest.component.common.model.RestApiDataSourceConfigBO\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetMetaTableSchemaFieldTypeEnum\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.ApiDatasetResponse\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetTableSchemaFieldData\\nimport lombok.AllArgsConstructor\\nimport lombok.Builder\\nimport lombok.Data\\nimport lombok.NoArgsConstructor\\nimport okhttp3.*\\nimport org.apache.commons.lang3.ObjectUtils\\n\\nimport javax.validation.constraints.NotBlank\\n\\nclass DatasetDemo extends AbstractRestApiDataFetchAdaptor<DatasetRequest, ApiDatasetResponse> {\\n\\n    DatasetDemo(OkHttpClient client, RestApiDataSourceConfigBO config) {\\n        super(client, config)\\n    }\\n\\n    @Override\\n    Request.Builder createNewCall(DatasetRequest validatedCondition, String token) throws Exception {\\n\\n        String url = 'https://qgzvkongdjqiiamzbbts.supabase.co/functions/v1/request_process_data'\\n\\n        JSONObject requestBody = new JSONObject()\\n        if (!ObjectUtils.isEmpty(validatedCondition)) {\\n            if (!ObjectUtils.isEmpty(validatedCondition.getId())) {\\n                requestBody.put('id', validatedCondition.getId())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getVersion())) {\\n                requestBody.put('version', validatedCondition.getVersion())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getDataSetInternalID())) {\\n                requestBody.put('dataSetInternalID', validatedCondition.getDataSetInternalID())\\n            }\\n        }\\n\\n        RequestBody body = RequestBody.create(MediaType.parse('application/json'),\\n                requestBody.toJSONString());\\n\\n        return new Request.Builder()\\n                .url(url)\\n                .post(body)\\n                .addHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnenZrb25nZGpxaWlhbXpiYnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjUyMzQsImV4cCI6MjA1NTk0MTIzNH0.PsZIcjAqexpqIg-91twpKjALyw9big6Bn4WRLLoCzTo')\\n                .addHeader('Content-Type', 'application/json')\\n                .addHeader('x_key', '1qaZ_Xsw2_Mju7');\\n    }\\n\\n    @Override\\n    protected FetchDataResultBO<ApiDatasetResponse> parseHttpResponse(DatasetRequest apiDatasetRequest, String body) {\\n\\n        JSONObject res = JSONObject.parseObject(body)\\n        JSONArray data = res.getJSONArray('value')\\n        ApiDatasetResponse response = new ApiDatasetResponse()\\n        List<List<DatasetTableSchemaFieldData>> dataList = new ArrayList<>()\\n        List<DatasetTableSchemaFieldData> datasetTableSchemaFieldDataList = new ArrayList<>()\\n\\n        for (int i = 0; i < data.size(); i++) {                \\n            DatasetTableSchemaFieldData datasetTableSchemaFieldData = new DatasetTableSchemaFieldData()\\n            datasetTableSchemaFieldData.setFieldName(\\\"value_\\\" + i)\\n            datasetTableSchemaFieldData.setFieldType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentValue(data.get(i))\\n            datasetTableSchemaFieldDataList.add(datasetTableSchemaFieldData)\\n        }\\n        \\n        dataList.add(datasetTableSchemaFieldDataList)\\n        response.setDataList(dataList)\\n        response.setJsonResult(body)\\n        return FetchDataResultBO.success(response)\\n    }\\n\\n    @Data\\n    @Builder\\n    @NoArgsConstructor\\n    @AllArgsConstructor\\n    static class DatasetRequest {\\n        @NotBlank\\n        public String id;\\n        \\n        public String version;\\n        \\n        public String dataSetInternalID;  \\n\\n        String getId() {\\n            return id;\\n        }\\n        \\n        void setId(String id) {\\n            this.id = id;\\n        }\\n        \\n        String getVersion() {\\n            return version;\\n        }\\n        \\n        void setVersion(String version) {\\n            this.version = version;\\n        }\\n        \\n        String getDataSetInternalID() { \\n            return dataSetInternalID;\\n        }\\n        \\n        void setDataSetInternalID(String dataSetInternalID) { \\n            this.dataSetInternalID = dataSetInternalID;\\n        }\\n    }\\n}\"}",
    //         "customParams": [
    //           {
    //             "name": "id",
    //             "type": "STRING",
    //             "description": "",
    //             "nullable": false,
    //             "value": "42d1385b-178a-4a04-b58c-1d5668c32ffd"
    //           },
    //           {
    //             "name": "version",
    //             "type": "STRING",
    //             "description": "",
    //             "nullable": true,
    //             "value": "00.00.001"
    //           },
    //           {
    //             "name": "dataSetInternalID",
    //             "type": "STRING",
    //             "description": "",
    //             "nullable": true,
    //             "value": "0"
    //           }
    //         ],
    //         "formatType": "API_DATA"
    //       }
    // )

    // recognizeSchema({
    //     "name": "testdata",
    //     "description": "testdata",
    //     "datasourceType": "API",
    //     "locationConfig": "{}",
    //     "formatConfig": "{}",
    //     "connConfig": "{\"script\":\"package com.antgroup.antchain.fastdf.dataproxy.manager.connector.api\\n\\nimport com.alibaba.fastjson.JSONArray\\nimport com.alibaba.fastjson.JSONObject\\nimport com.antgroup.antchain.idata.rest.component.common.data.AbstractRestApiDataFetchAdaptor\\nimport com.antgroup.antchain.idata.rest.component.common.model.FetchDataResultBO\\nimport com.antgroup.antchain.idata.rest.component.common.model.RestApiDataSourceConfigBO\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetMetaTableSchemaFieldTypeEnum\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.ApiDatasetResponse\\nimport com.antgroup.antchain.fastdf.dataproxy.manager.connector.api.relateObject.DatasetTableSchemaFieldData\\nimport lombok.AllArgsConstructor\\nimport lombok.Builder\\nimport lombok.Data\\nimport lombok.NoArgsConstructor\\nimport okhttp3.*\\nimport org.apache.commons.lang3.ObjectUtils\\n\\nimport javax.validation.constraints.NotBlank\\n\\nclass DatasetDemo extends AbstractRestApiDataFetchAdaptor<DatasetRequest, ApiDatasetResponse> {\\n\\n    DatasetDemo(OkHttpClient client, RestApiDataSourceConfigBO config) {\\n        super(client, config)\\n    }\\n\\n    @Override\\n    Request.Builder createNewCall(DatasetRequest validatedCondition, String token) throws Exception {\\n\\n        String url = 'https://qgzvkongdjqiiamzbbts.supabase.co/functions/v1/request_process_data'\\n\\n        JSONObject requestBody = new JSONObject()\\n        if (!ObjectUtils.isEmpty(validatedCondition)) {\\n            if (!ObjectUtils.isEmpty(validatedCondition.getId())) {\\n                requestBody.put('id', validatedCondition.getId())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getVersion())) {\\n                requestBody.put('version', validatedCondition.getVersion())\\n            }\\n            if (!ObjectUtils.isEmpty(validatedCondition.getDataSetInternalID())) {\\n                requestBody.put('dataSetInternalID', validatedCondition.getDataSetInternalID())\\n            }\\n        }\\n\\n        RequestBody body = RequestBody.create(MediaType.parse('application/json'),\\n                requestBody.toJSONString());\\n\\n        return new Request.Builder()\\n                .url(url)\\n                .post(body)\\n                .addHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnenZrb25nZGpxaWlhbXpiYnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjUyMzQsImV4cCI6MjA1NTk0MTIzNH0.PsZIcjAqexpqIg-91twpKjALyw9big6Bn4WRLLoCzTo')\\n                .addHeader('Content-Type', 'application/json')\\n                .addHeader('x_key', '1qaZ_Xsw2_Mju7');\\n    }\\n\\n    @Override\\n    protected FetchDataResultBO<ApiDatasetResponse> parseHttpResponse(DatasetRequest apiDatasetRequest, String body) {\\n\\n        JSONObject res = JSONObject.parseObject(body)\\n        JSONArray data = res.getJSONArray('value')\\n        ApiDatasetResponse response = new ApiDatasetResponse()\\n        List<List<DatasetTableSchemaFieldData>> dataList = new ArrayList<>()\\n        List<DatasetTableSchemaFieldData> datasetTableSchemaFieldDataList = new ArrayList<>()\\n\\n        for (int i = 0; i < data.size(); i++) {                \\n            DatasetTableSchemaFieldData datasetTableSchemaFieldData = new DatasetTableSchemaFieldData()\\n            datasetTableSchemaFieldData.setFieldName(\\\"value_\\\" + i)\\n            datasetTableSchemaFieldData.setFieldType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentType(DatasetMetaTableSchemaFieldTypeEnum.DOUBLE)\\n            datasetTableSchemaFieldData.setCurrentValue(data.get(i))\\n            datasetTableSchemaFieldDataList.add(datasetTableSchemaFieldData)\\n        }\\n        \\n        dataList.add(datasetTableSchemaFieldDataList)\\n        response.setDataList(dataList)\\n        response.setJsonResult(body)\\n        return FetchDataResultBO.success(response)\\n    }\\n\\n    @Data\\n    @Builder\\n    @NoArgsConstructor\\n    @AllArgsConstructor\\n    static class DatasetRequest {\\n        @NotBlank\\n        public String id;\\n        \\n        public String version;\\n        \\n        public String dataSetInternalID;  \\n\\n        String getId() {\\n            return id;\\n        }\\n        \\n        void setId(String id) {\\n            this.id = id;\\n        }\\n        \\n        String getVersion() {\\n            return version;\\n        }\\n        \\n        void setVersion(String version) {\\n            this.version = version;\\n        }\\n        \\n        String getDataSetInternalID() { \\n            return dataSetInternalID;\\n        }\\n        \\n        void setDataSetInternalID(String dataSetInternalID) { \\n            this.dataSetInternalID = dataSetInternalID;\\n        }\\n    }\\n}\"}",
    //     "customParams": [
    //       {
    //         "name": "id",
    //         "type": "STRING",
    //         "description": "",
    //         "nullable": false,
    //         "value": "42d1385b-178a-4a04-b58c-1d5668c32ffd"
    //       },
    //       {
    //         "name": "version",
    //         "type": "STRING",
    //         "description": "",
    //         "nullable": true,
    //         "value": "00.00.001"
    //       },
    //       {
    //         "name": "dataSetInternalID",
    //         "type": "STRING",
    //         "description": "",
    //         "nullable": true,
    //         "value": "0"
    //       }
    //     ],
    //     "formatType": "API_DATA"
    //   }).then(console.log).catch(console.error);
    // const dynamicParam = await Deno.readTextFile('src/services/dynamicParam.json');
    // console.log('dynamicParam', dynamicParam);
    // createCalculateInstance({
    //     "projectId": "PROJ_20250323163915_2nW3f7wz",
    //     "envId": "ENV_20250323163915_8EJkp60z",
    //     "appId": "APP_20250323164059_kHFeIqTg",
    //     "dynamicParam": "{\"dynamicParameter\":\"\",\"operatorList\":[{\"code\":\"dataset_reader\",\"id\":\"1af6c6a3-f40f-4c99-8d36-3f995e6ce816\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"0352d09d-db26-4729-b207-2dcdf6c9a75b\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164852_moyjsDA0\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"dataset_reader\",\"id\":\"475f757e-beae-4b70-9e78-892bf5f59855\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATASET_READER\\\"},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"custom_params\\\":{\\\"dataSetInternalID\\\":\\\"0\\\",\\\"id\\\":\\\"04650d44-4eb5-4d29-b70c-ce86bfdff684\\\",\\\"version\\\":\\\"00.00.001\\\"},\\\"co_dataset_id\\\":\\\"CO_DATASET_20250323164711_44Uq3G97\\\",\\\"requested_field_list\\\":[\\\"value_0\\\"]}\"},{\"code\":\"data_writer\",\"id\":\"c9706900-23d8-48a9-b1c3-30d70f7d9db1\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"PDS_DATA_WRITER\\\",\\\"params\\\":{\\\"isCipherText\\\":false}},\\\"checkRules\\\":[],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"ONLY_ONE\\\",\\\"mapParams\\\":{\\\"openEngineModuleName\\\":\\\"open_engine_mod_v2\\\",\\\"roleMap\\\":{\\\"worker\\\":\\\"role1\\\"}}}}\",\"dynamicParameter\":\"{\\\"storage_type\\\":\\\"true\\\",\\\"owner_did\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\",\\\"format_type\\\":\\\"CSV\\\",\\\"name\\\":\\\"result\\\",\\\"is_manage\\\":true}\"},{\"code\":\"scql\",\"id\":\"550a900b-58ea-4bb9-a976-cedd1c54b88e\",\"meta\":\"{\\\"analyzeRule\\\":{\\\"analyzerType\\\":\\\"SQL\\\",\\\"params\\\":{\\\"receiverRoleName\\\":\\\"receiver\\\"}},\\\"enablePreConfig\\\":true,\\\"preset\\\":\\\"preset-shape-double-knife\\\",\\\"checkRules\\\":[{\\\"parameterPaths\\\":[\\\"$.dp_{workerIndex}__ccl.column_ccl.keySet()\\\"],\\\"constraintRule\\\":\\\"EXIST_IN_DATASET_FIELD\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]},{\\\"constraintRule\\\":\\\"WORKER_NOT_SAME\\\",\\\"params\\\":{\\\"roleList\\\":[\\\"dp\\\"]}},{\\\"parameterPaths\\\":[\\\"$.dp_0__table_name\\\",\\\"$.dp_1__table_name\\\"],\\\"params\\\":\\\"^[A-Za-z0-9_$]*$\\\",\\\"constraintRule\\\":\\\"REG_EX\\\",\\\"ports\\\":[\\\"dp_input_file\\\"]}],\\\"moduleMapRule\\\":{\\\"mapRuleType\\\":\\\"WORKER_NUM\\\",\\\"role\\\":\\\"dp\\\",\\\"mapParams\\\":{\\\"1\\\":{\\\"module\\\":\\\"scql_single_dp\\\"}}}}\",\"dynamicParameter\":\"{\\\"dp_0__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"result_table_create_cmd\\\":\\\"CREATE table result_table (average_value double)\\\",\\\"query_cmd\\\":\\\"SELECT AVG(combined_values) AS average_value FROM ( SELECT value_0 AS combined_values FROM t1 UNION ALL SELECT value_0 AS combined_values FROM t2 ) AS combined_data\\\",\\\"dp_1__ccl\\\":{\\\"column_ccl\\\":{\\\"value_0\\\":\\\"ALL_DISCLOSURE\\\"}},\\\"dp_0__table_name\\\":\\\"t1\\\",\\\"dp_1__table_name\\\":\\\"t2\\\",\\\"_worker\\\":{\\\"receiver\\\":\\\"did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d\\\"}}\"}]}"
    // }).then(console.log).catch(console.error);
    const dynamicParam= {
        "dynamicParameter": "",
        "operatorList": [
          {
            "code": "dataset_reader",
            "id": "1af6c6a3-f40f-4c99-8d36-3f995e6ce816",
            "meta": {
              "analyzeRule": {
                "analyzerType": "PDS_DATASET_READER"
              },
              "checkRules": [],
              "moduleMapRule": {
                "mapRuleType": "ONLY_ONE",
                "mapParams": {
                  "openEngineModuleName": "open_engine_mod_v2",
                  "roleMap": {
                    "worker": "role1"
                  }
                }
              }
            },
            "dynamicParameter": {
              "custom_params": {
                "dataSetInternalID": "1",
                "id": "0352d09d-db26-4729-b207-2dcdf6c9a75b",
                "version": "00.00.001"
              },
              "co_dataset_id": "CO_DATASET_20250323164852_moyjsDA0",
              "requested_field_list": [
                "value_0"
              ]
            }
          },
          {
            "code": "dataset_reader",
            "id": "475f757e-beae-4b70-9e78-892bf5f59855",
            "meta": {
              "analyzeRule": {
                "analyzerType": "PDS_DATASET_READER"
              },
              "checkRules": [],
              "moduleMapRule": {
                "mapRuleType": "ONLY_ONE",
                "mapParams": {
                  "openEngineModuleName": "open_engine_mod_v2",
                  "roleMap": {
                    "worker": "role1"
                  }
                }
              }
            },
            "dynamicParameter": {
              "custom_params": {
                "dataSetInternalID": "0",
                "id": "04650d44-4eb5-4d29-b70c-ce86bfdff684",
                "version": "00.00.001"
              },
              "co_dataset_id": "CO_DATASET_20250323164711_44Uq3G97",
              "requested_field_list": [
                "value_0"
              ]
            }
          },
          {
            "code": "data_writer",
            "id": "c9706900-23d8-48a9-b1c3-30d70f7d9db1",
            "meta": {
              "analyzeRule": {
                "analyzerType": "PDS_DATA_WRITER",
                "params": {
                  "isCipherText": false
                }
              },
              "checkRules": [],
              "moduleMapRule": {
                "mapRuleType": "ONLY_ONE",
                "mapParams": {
                  "openEngineModuleName": "open_engine_mod_v2",
                  "roleMap": {
                    "worker": "role1"
                  }
                }
              }
            },
            "dynamicParameter": {
              "storage_type": "true",
              "owner_did": "did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d",
              "format_type": "CSV",
              "name": "result",
              "is_manage": true
            }
          },
          {
            "code": "scql",
            "id": "550a900b-58ea-4bb9-a976-cedd1c54b88e",
            "meta": {
              "analyzeRule": {
                "analyzerType": "SQL",
                "params": {
                  "receiverRoleName": "receiver"
                }
              },
              "enablePreConfig": true,
              "preset": "preset-shape-double-knife",
              "checkRules": [
                {
                  "parameterPaths": [
                    "$.dp_{workerIndex}__ccl.column_ccl.keySet()"
                  ],
                  "constraintRule": "EXIST_IN_DATASET_FIELD",
                  "ports": [
                    "dp_input_file"
                  ]
                },
                {
                  "constraintRule": "WORKER_NOT_SAME",
                  "params": {
                    "roleList": [
                      "dp"
                    ]
                  }
                },
                {
                  "parameterPaths": [
                    "$.dp_0__table_name",
                    "$.dp_1__table_name"
                  ],
                  "params": "^[A-Za-z0-9_$]*$",
                  "constraintRule": "REG_EX",
                  "ports": [
                    "dp_input_file"
                  ]
                }
              ],
              "moduleMapRule": {
                "mapRuleType": "WORKER_NUM",
                "role": "dp",
                "mapParams": {
                  "1": {
                    "module": "scql_single_dp"
                  }
                }
              }
            },
            "dynamicParameter": {
              "dp_0__ccl": {
                "column_ccl": {
                  "value_0": "ALL_DISCLOSURE"
                }
              },
              "result_table_create_cmd": "CREATE table result_table (average_value double)",
              "query_cmd": "SELECT AVG(combined_values) AS average_value FROM ( SELECT value_0 AS combined_values FROM t1 UNION ALL SELECT value_0 AS combined_values FROM t2 ) AS combined_data",
              "dp_1__ccl": {
                "column_ccl": {
                  "value_0": "ALL_DISCLOSURE"
                }
              },
              "dp_0__table_name": "t1",
              "dp_1__table_name": "t2",
              "_worker": {
                "receiver": "did:private:0000:698d9f20776b90eb5c1dac2f27074fcb55dee103426e6822d634127bc539ee7d"
              }
            }
          }
        ]
      }


    // const createInstance = await createCalculateInstance({
    //     "projectId": "PROJ_20250323163915_2nW3f7wz",
    //     "envId": "ENV_20250323163915_8EJkp60z",
    //     "appId": "APP_20250323164059_kHFeIqTg",
    //     "dynamicParam": JSON.stringify(dynamicParam)
    // });

    // const instanceId = createInstance.data.instanceId;
    // console.log('instanceId', instanceId);

    // queryInstanceExecStatus({
    //     "appId": "APP_20250323164059_kHFeIqTg",
    //     "envId": "ENV_20250323163915_8EJkp60z",
    //     "instanceId": "INSTANCE_20250325125333_THl8hLzC",
    //     "projectId": "PROJ_20250323163915_2nW3f7wz"
    // }).then(console.log).catch(console.error);

    const instanceInfo = await queryInstance({
      'appId': 'APP_20250323164059_kHFeIqTg',
      'envId': 'ENV_20250323163915_8EJkp60z',
      'instanceId': 'INSTANCE_20250325125333_THl8hLzC',
      'projectId': 'PROJ_20250323163915_2nW3f7wz',
    });

    // console.log('instanceInfo', instanceInfo);

    // const coDatasetId = await getCoDatasetId({"appId": "APP_20250323164059_kHFeIqTg",
    //     "envId": "ENV_20250323163915_8EJkp60z",
    //     "instanceId": "INSTANCE_20250325110405_OuCaPfgf",
    //     "projectId": "PROJ_20250323163915_2nW3f7wz"}
    // )
    
    // console.log('coDatasetId',coDatasetId)

    // const result = await sampleDataByCoDatasetId({
    //     "coDatasetId": coDatasetId,
    //     "sampleRule": {
    //       "type": "FORWARD_SAMPLE",
    //       "limit": 20
    //     }
    //   });
    // const vectorList = result.data.sampleData.vectorList
    // console.log(vectorList)
}
// deno run -A src/services/query.ts