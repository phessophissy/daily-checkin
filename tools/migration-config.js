// Migration Configuration for Daily Checkin
// Target Deployer: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
// Fee: 0.001 STX (1000 microSTX)

export const MIGRATION_CONFIG = {
  newDeployer: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
  feeInMicroStx: 1000,
  feeInStx: 0.001,
  contractName: 'daily-checkin',
  version: '2.0.0',
  migrationDate: new Date().toISOString(),
  previousDeployer: null
};

export const MIGRATION_STEPS = [
  'Verify new deployer address',
  'Deploy new contract version',
  'Initialize fee structure',
  'Migrate user data',
  'Update frontend connection',
  'Verify fee collection',
  'Monitor transaction costs'
];

export const FEE_STRUCTURE = {
  dailyCheckinFee: 1000, // microSTX
  minimumFee: 100, // microSTX
  maximumFee: 10000, // microSTX
  feePaymentTo: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09'
};

export const DEFAULT_PARAMETERS = {
  pointsPerCheckin: 100,
  streakBonus: 10,
  blocksPerDay: 144,
  maxStreakBonus: 200
};
