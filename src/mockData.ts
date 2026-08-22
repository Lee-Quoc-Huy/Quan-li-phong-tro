import {
  User,
  Room,
  Contract,
  Invoice,
  IssueTicket,
  AppNotification,
  LandlordSettings,
  RealtimeTelemetry,
  JoinRequest,
  SystemLicense,
  ComplaintReport,
  SecurityEventLog,
} from './types';

export const ADMIN_USER: User = {
  id: 'admin_root',
  name: 'Lê Quốc Huy (Admin)',
  email: '60.wuy.lii.06@gmail.com',
  phone: '0918889999',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  idCard: '079206008899',
  status: 'active',
  joinedAt: '2026-01-01',
  licenseTier: 'enterprise',
};

export const generateRandomHostCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRX${randomStr}`;
};

export const DEFAULT_FEATURE_FLAGS = {
  enableSmartDoorLock: true,
  enableAutoGate: true,
  enableIoTMeters: true,
  enableAutoBilling: true,
  enableVietQR: true,
  enableDigitalContracts: true,
  enableIssueTickets: true,
  enableGoogleSheetSync: true,
  enableComplaints: true,
  enableEmergencyAlarm: true,
};

export const INITIAL_USERS: User[] = [ADMIN_USER];

export const INITIAL_LANDLORD_SETTINGS: LandlordSettings = {
  landlordId: '',
  houseName: 'Dãy Trọ Của Tôi',
  houseAddress: '',
  hostCode: generateRandomHostCode(),
  featureFlags: DEFAULT_FEATURE_FLAGS,
  electricityRate: 3500, // 3,500 đ/kWh
  waterRate: 25000, // 25,000 đ/m3
  garbageFee: 40000, // 40,000 đ/phòng
  internetFee: 80000, // 80,000 đ/phòng
  serviceFee: 50000, // 50,000 đ/phòng
  defaultDepositMonths: 1,
  
  bankCode: 'TCB',
  bankName: 'Techcombank',
  accountNumber: '',
  accountName: '',
  
  mainGateState: 'locked',
  mainGatePasscode: '123456',
  autoLockEnabled: true,
  autoLockTime: '23:00',
  autoUnlockTime: '05:30',
  emergencyAlarmActive: false,
  
  aiAutoBillingEnabled: true,
  aiBillingDayOfMonth: 25,
  aiAnomalyDetection: true,
  
  googleSheetWebhookUrl: '',
  googleSheetSyncEnabled: false,
};

export const INITIAL_ROOMS: Room[] = [];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_ISSUES: IssueTicket[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_JOIN_REQUESTS: JoinRequest[] = [];

export const INITIAL_TELEMETRY: Record<string, RealtimeTelemetry> = {};

export const INITIAL_LICENSES: SystemLicense[] = [];

export const INITIAL_COMPLAINTS: ComplaintReport[] = [];

export const INITIAL_SECURITY_LOGS: SecurityEventLog[] = [];
