// Fee Management System
// Handles 0.001 STX fee collection and verification

export class FeeManager {
  constructor() {
    this.feeInMicroStx = 1000;
    this.feeInStx = 0.001;
    this.totalFeesCollected = 0;
    this.feeTransactions = [];
  }

  calculateFeeInMicroStx(amountInStx) {
    return Math.floor(amountInStx * 1000000);
  }

  calculateFeeInStx(amountInMicroStx) {
    return amountInMicroStx / 1000000;
  }

  validateFeeAmount(amount, unit = 'microStx') {
    if (unit === 'microStx') {
      return amount >= this.feeInMicroStx;
    } else if (unit === 'stx') {
      return amount >= this.feeInStx;
    }
    return false;
  }

  async recordFeeTransaction(userId, amount, txHash) {
    const transaction = {
      userId,
      amount,
      txHash,
      timestamp: Date.now(),
      verified: false
    };
    this.feeTransactions.push(transaction);
    this.totalFeesCollected += amount;
    return transaction;
  }

  async verifyFeeTransaction(txHash) {
    const tx = this.feeTransactions.find(t => t.txHash === txHash);
    if (tx) {
      tx.verified = true;
      return tx;
    }
    return null;
  }

  getTotalFeesCollected() {
    return {
      microStx: this.totalFeesCollected,
      stx: this.calculateFeeInStx(this.totalFeesCollected)
    };
  }

  getTransactionCount() {
    return this.feeTransactions.length;
  }

  getVerifiedTransactions() {
    return this.feeTransactions.filter(t => t.verified);
  }

  getFeeStatistics() {
    return {
      totalCollected: this.getTotalFeesCollected(),
      transactionCount: this.getTransactionCount(),
      verifiedCount: this.getVerifiedTransactions().length,
      averageFee: this.calculateFeeInStx(this.feeInMicroStx)
    };
  }
}

export default FeeManager;
