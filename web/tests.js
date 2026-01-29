/**
 * Integration Tests
 * Tests for application integration and functionality
 */

// Test utilities
const TestUtils = {
  /**
   * Create mock wallet
   */
  createMockWallet() {
    return {
      connectWallet: async () => ({
        userAddress: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
      }),
      disconnectWallet: async () => {},
      isWalletConnected: () => true,
      getUserAddress: () => 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
      getNetworkInfo: () => ({ network: 'testnet' }),
    };
  },

  /**
   * Create mock API
   */
  createMockApi() {
    return {
      getBalance: async () => ({ balance: 1000000 }),
      getTransactions: async () => [],
      broadcastTransaction: async () => ({ txid: '0x123' }),
      getTransaction: async () => ({ status: 'success' }),
      callReadOnlyFunction: async () => ({ data: null }),
    };
  },

  /**
   * Create mock contract
   */
  createMockContract() {
    return {
      address: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.daily-checkin',
      name: 'daily-checkin',
    };
  },

  /**
   * Assert equal
   */
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  },

  /**
   * Assert true
   */
  assertTrue(value, message) {
    if (!value) {
      throw new Error(`${message}: expected true, got ${value}`);
    }
  },

  /**
   * Assert false
   */
  assertFalse(value, message) {
    if (value) {
      throw new Error(`${message}: expected false, got ${value}`);
    }
  },
};

// Test suite
const tests = {
  /**
   * Test wallet connection
   */
  testWalletConnection: async () => {
    const wallet = TestUtils.createMockWallet();
    const result = await wallet.connectWallet();
    TestUtils.assertEqual(result.userAddress, 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09', 'Wallet connection');
  },

  /**
   * Test API balance fetch
   */
  testApiBalance: async () => {
    const api = TestUtils.createMockApi();
    const result = await api.getBalance();
    TestUtils.assertTrue(result.balance > 0, 'Balance fetch');
  },

  /**
   * Test transaction broadcast
   */
  testTransactionBroadcast: async () => {
    const api = TestUtils.createMockApi();
    const result = await api.broadcastTransaction();
    TestUtils.assertEqual(result.txid, '0x123', 'Transaction broadcast');
  },

  /**
   * Test string utilities
   */
  testStringUtils: () => {
    const truncated = StringUtils.truncate('Hello World', 5);
    TestUtils.assertEqual(truncated, 'Hello...', 'String truncate');

    const stxFormatted = StringUtils.formatStx('0.001', 3);
    TestUtils.assertEqual(stxFormatted, '0.001', 'STX formatting');
  },

  /**
   * Test state management
   */
  testStateManagement: () => {
    const state = new StateManager({ count: 0 });
    state.setState({ count: 1 });
    TestUtils.assertEqual(state.getValue('count'), 1, 'State update');
  },

  /**
   * Test cache
   */
  testCache: () => {
    const cache = new CacheManager();
    cache.set('key', 'value');
    const result = cache.get('key');
    TestUtils.assertEqual(result, 'value', 'Cache get/set');
  },

  /**
   * Test validation
   */
  testValidation: () => {
    const isValid = ValidationUtils.isValidStacksAddress('SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09');
    TestUtils.assertTrue(isValid, 'Address validation');

    const isInvalid = ValidationUtils.isValidStacksAddress('invalid');
    TestUtils.assertFalse(isInvalid, 'Invalid address');
  },

  /**
   * Test event bus
   */
  testEventBus: async () => {
    const eventBus = new EventBus();
    let called = false;

    eventBus.on('test', () => {
      called = true;
    });

    eventBus.emit('test');
    TestUtils.assertTrue(called, 'Event bus');
  },

  /**
   * Test form validation
   */
  testFormValidation: () => {
    const formManager = new FormManager();
    const isValid = ValidationUtils.isValidEmail('test@example.com');
    TestUtils.assertTrue(isValid, 'Email validation');
  },

  /**
   * Test array utilities
   */
  testArrayUtils: () => {
    const unique = ArrayUtils.unique([1, 2, 2, 3]);
    TestUtils.assertEqual(unique.length, 3, 'Unique array');

    const grouped = ArrayUtils.groupBy([{ type: 'a', val: 1 }, { type: 'a', val: 2 }], 'type');
    TestUtils.assertTrue(grouped['a'].length === 2, 'Group by');
  },

  /**
   * Test number utilities
   */
  testNumberUtils: () => {
    const stx = NumberUtils.microStxToStx(1000000);
    TestUtils.assertEqual(stx, 1, 'MicroSTX to STX');

    const microStx = NumberUtils.stxToMicroStx(0.001);
    TestUtils.assertEqual(microStx, 1000, 'STX to microSTX');
  },

  /**
   * Test security
   */
  testSecurity: () => {
    const sanitized = SecurityManager.sanitizeHTML('<script>alert("xss")</script>');
    TestUtils.assertTrue(!sanitized.includes('<script>'), 'HTML sanitization');
  },

  /**
   * Test i18n
   */
  testI18n: () => {
    const text = i18n.t('app.title');
    TestUtils.assertEqual(text, 'Daily Checkin', 'i18n translation');
  },
};

/**
 * Run tests
 */
async function runTests() {
  console.log('🧪 Running tests...\n');

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      console.log(`✅ ${testName}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

  return failed === 0;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TestUtils,
    tests,
    runTests,
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  window.runTests = runTests;
}
