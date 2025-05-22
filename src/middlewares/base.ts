import { ApiResponse } from '../deps.ts';

/**
 * Send HTTP POST request to the API
 * @param url API endpoint URL
 * @param headers HTTP headers
 * @param params Request body parameters
 * @returns Response text or null if failed
 */
export async function sendRequest(
  url: string, 
  headers: Record<string, string>, 
  params: Record<string, any>
): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    });
    
    if (response.ok) {
      const responseText = await response.text();
      console.log(`[API Response] [${responseText}]`);
      return responseText;
    } else {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error('Error sending POST request:', error);
    return null;
  }
}

/**
 * Parse API response
 * @param responseText Response text from API
 * @returns Parsed ApiResponse or null if failed
 */
export function parseResponse(responseText: string | null): ApiResponse | null {
  if (!responseText) return null;
  
  try {
    return JSON.parse(responseText) as ApiResponse;
  } catch (e) {
    console.error('Failed to parse response:', e);
    console.log('Raw response:', responseText);
    return null;
  }
}

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Log API request details
 * @param method API method
 * @param params Request parameters
 */
export function logRequest(method: string, params: Record<string, any>): void {
  console.log(`[${method}] Request parameters:`, JSON.stringify(params, null, 2));
}

/**
 * Log API response
 * @param method API method
 * @param response API response object
 */
export function logResponse(method: string, response: ApiResponse | null): void {
  if (response) {
    if (response.success) {
      console.log(`[${method}] Successful:`, response.data);
    } else {
      console.error(`[${method}] Failed with code:`, response.code);
    }
  } else {
    console.error(`[${method}] No response received`);
  }
}

/**
 * Default request headers
 */
export const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8'
}; 