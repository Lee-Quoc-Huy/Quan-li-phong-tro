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
  hostCode: 'TRX888999',
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
  
  googleSheetWebhookUrl: 'https://script.google.com/macros/s/AKfycbyi1xXWGQy3nEBzEuO-essoeids5-5Uecz9TuTeSclxc6rRPO_foQ78BT1lpsxeO6Ig/exec',
  googleSheetSyncEnabled: true,
  googleSheetLastSync: undefined,
};

export const INITIAL_ROOMS: Room[] = [
  { id: 'room_101', landlordId: 'landlord_demo', roomNumber: 'Phòng 101', floor: 1, areaM2: 25, basePrice: 2500000, amenities: ['Điều hòa', 'Tủ lạnh', 'Wifi'], status: 'available', doorLockState: 'locked', doorPasscode: '101101', securityStatus: 'secure', electricityMeterStart: 120, waterMeterStart: 45 },
  { id: 'room_102', landlordId: 'landlord_demo', roomNumber: 'Phòng 102', floor: 1, areaM2: 25, basePrice: 2500000, amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi'], status: 'available', doorLockState: 'locked', doorPasscode: '102102', securityStatus: 'secure', electricityMeterStart: 180, waterMeterStart: 52 },
  { id: 'room_103', landlordId: 'landlord_demo', roomNumber: 'Phòng 103', floor: 1, areaM2: 28, basePrice: 2800000, amenities: ['Điều hòa', 'Nóng lạnh', 'Ban công'], status: 'available', doorLockState: 'locked', doorPasscode: '103103', securityStatus: 'secure', electricityMeterStart: 210, waterMeterStart: 60 },
  { id: 'room_201', landlordId: 'landlord_demo', roomNumber: 'Phòng 201', floor: 2, areaM2: 25, basePrice: 2600000, amenities: ['Điều hòa', 'Wifi'], status: 'available', doorLockState: 'locked', doorPasscode: '201201', securityStatus: 'secure', electricityMeterStart: 140, waterMeterStart: 48 },
  { id: 'room_202', landlordId: 'landlord_demo', roomNumber: 'Phòng 202', floor: 2, areaM2: 25, basePrice: 2600000, amenities: ['Điều hòa', 'Wifi'], status: 'available', doorLockState: 'locked', doorPasscode: '202202', securityStatus: 'secure', electricityMeterStart: 160, waterMeterStart: 50 },
  { id: 'room_203', landlordId: 'landlord_demo', roomNumber: 'Phòng 203', floor: 2, areaM2: 30, basePrice: 2900000, amenities: ['Điều hòa', 'Ban công', 'Tủ lạnh'], status: 'available', doorLockState: 'locked', doorPasscode: '203203', securityStatus: 'secure', electricityMeterStart: 190, waterMeterStart: 58 },
];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_ISSUES: IssueTicket[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_JOIN_REQUESTS: JoinRequest[] = [];

export const INITIAL_TELEMETRY: Record<string, RealtimeTelemetry> = {};

export const INITIAL_LICENSES: SystemLicense[] = [];

export const INITIAL_COMPLAINTS: ComplaintReport[] = [];

export const INITIAL_SECURITY_LOGS: SecurityEventLog[] = [];
