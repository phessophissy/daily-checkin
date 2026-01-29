// Transaction Handler using @stacks/transactions
// Manages daily checkin transactions on Stacks blockchain

import {
  makeContractCall,
  broadcastTransaction,
  StacksTransaction
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

export class DailyCheckinTransaction {
  constructor(userAddress, contractAddress) {
    this.userAddress = userAddress;
    this.contractAddress = contractAddress;
    this.network = new StacksTestnet();
    this.contractName = 'daily-checkin';
    this.functionName = 'check-in';
    this.fee = 1000; // microSTX for daily checkin fee
  }

  async createCheckInTransaction(nonce, feeRate = 2000) {
    const txOptions = {
      contractAddress: this.contractAddress.split('.')[0],
      contractName: this.contractName,
      functionName: this.functionName,
      functionArgs: [],
      senderKey: null, // Will be signed by wallet
      nonce: nonce,
      fee: feeRate,
      network: this.network,
      anchorMode: 'any'
    };

    return makeContractCall(txOptions);
  }

  async broadcastCheckInTransaction(signedTx) {
    try {
      const result = await broadcastTransaction(signedTx, this.network);
      return {
        success: true,
        txId: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async submitCheckIn(signedTx) {
    const result = await this.broadcastCheckInTransaction(signedTx);
    return result;
  }

  getTransactionDetails() {
    return {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: this.functionName,
      network: this.network.name,
      userAddress: this.userAddress
    };
  }

  estimateTransactionFee(feeRate = 2000) {
    return feeRate;
  }

  validateTransactionResponse(response) {
    return response.success && response.txId !== undefined;
  }
}

export default DailyCheckinTransaction;
