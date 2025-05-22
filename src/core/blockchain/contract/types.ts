/**
 * Types for contract operations
 */

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
 * Contract deployment parameters
 */
export interface ContractDeployParams {
  contractName: string;
  contractCode: string;
  constructorParams?: any[];
  sourceCodeType?: 'SOLIDITY' | 'RUST' | 'GO';
} 