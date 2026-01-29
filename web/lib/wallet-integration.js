// Stacks Wallet Integration using @stacks/connect
// Handles wallet connections and authentication

import { showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

export class StacksWalletIntegration {
  constructor() {
    this.network = new StacksTestnet();
    this.userAddress = null;
    this.isConnected = false;
    this.appDetails = {
      name: 'Daily Checkin',
      icon: '/logo.svg'
    };
  }

  async connectWallet() {
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: this.appDetails,
        onFinish: () => {
          this.isConnected = true;
          resolve({ success: true, message: 'Wallet connected' });
        },
        onCancel: () => {
          reject({ success: false, message: 'User cancelled' });
        }
      });
    });
  }

  setUserAddress(address) {
    this.userAddress = address;
  }

  getUserAddress() {
    return this.userAddress;
  }

  isWalletConnected() {
    return this.isConnected && this.userAddress !== null;
  }

  async disconnectWallet() {
    this.isConnected = false;
    this.userAddress = null;
    return { success: true, message: 'Wallet disconnected' };
  }

  getNetworkInfo() {
    return {
      name: this.network.name,
      chain_id: this.network.chainId,
      coreApiUrl: this.network.coreApiUrl
    };
  }

  getAppDetails() {
    return this.appDetails;
  }
}

export default StacksWalletIntegration;
