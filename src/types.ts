export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  idCard?: string; // CCCD
  hometown?: string;
  status: 'active' | 'locked' | 'pending_approval';
  joinedAt: string;
  hostCode?: string; // 10-character code for landlord (e.g., HOST98AB12)
  landlordId?: string; // for tenant, points to their landlord
  roomId?: string; // for tenant, points to the rented room
  licenseTier?: 'standard' | 'pro' | 'enterprise';
  token?: string;
}

export interface Room {
  id: string;
  landlordId: string;
  roomNumber: string; // e.g. "Phòng 201"
  floor: number;
  areaM2: number;
  basePrice: number; // monthly rent (VNĐ)
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  currentTenantId?: string;
  currentTenantName?: string;
  doorLockState: 'locked' | 'unlocked';
  doorPasscode: string; // PIN for smart door
  securityStatus: 'secure' | 'warning' | 'tampered';
  electricityMeterStart: number;
  waterMeterStart: number;
  description?: string;
}

export interface Contract {
  id: string;
  contractCode: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantIdCard: string;
  landlordId: string;
  landlordName: string;
  roomId: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  monthlyRent: number;
  prepaidMonthsRemaining: number; // Prepaid room rent
  prepaidUntil?: string;
  terms: string[];
  status: 'active' | 'pending' | 'expired' | 'terminated';
  signedAt: string;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  landlordId: string;
  tenantId: string;
  tenantName: string;
  roomId: string;
  roomNumber: string;
  monthYear: string; // e.g., "08/2026"
  createdAt: string;
  dueDate: string;
  
  // Breakdown
  rentAmount: number;
  isRentPrepaid: boolean; // if true, rentAmount charged is 0 VNĐ
  prepaidMonthsPaidCount?: number; // if user paid e.g. 3 months upfront
  
  electricityStart: number;
  electricityEnd: number;
  electricityUsed: number;
  electricityRate: number;
  electricityTotal: number;
  
  waterStart: number;
  waterEnd: number;
  waterUsed: number;
  waterRate: number;
  waterTotal: number;
  
  garbageFee: number;
  internetFee: number;
  serviceFee: number;
  
  extraFee: number;
  extraFeeReason?: string;
  
  totalAmount: number;
  status: 'pending' | 'paid' | 'verified_by_host';
  paidAt?: string;
  paymentMethod?: 'vietqr' | 'cash' | 'banking';
  transactionRef?: string;
  
  bankInfo: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
  };
  
  aiGenerated?: boolean;
  aiNote?: string;
}

export interface IssueTicket {
  id: string;
  ticketCode: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  roomId: string;
  roomNumber: string;
  category: 'dien' | 'nuoc' | 'khoa_cua' | 'dieu_hoa' | 'thiet_bi' | 'khac';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  photos: string[];
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  landlordNote?: string;
}

export interface AppNotification {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // tenant id or 'all_tenants' or 'admin'
  landlordId?: string;
  type: 'price_update' | 'invoice_ready' | 'payment_received' | 'security_alert' | 'maintenance' | 'tenant_join_request' | 'prepayment_notice' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'high' | 'urgent';
  actionUrl?: string;
}

export interface LandlordSettings {
  landlordId: string;
  houseName: string;
  houseAddress: string;
  hostCode: string; // 10-char alphanumeric code (e.g., LUX89K209A)
  
  // Pricing configuration
  electricityRate: number; // VNĐ per kWh
  waterRate: number; // VNĐ per m3
  garbageFee: number; // VNĐ per room
  internetFee: number; // VNĐ per room
  serviceFee: number; // VNĐ per room
  defaultDepositMonths: number;
  
  // Bank details for VietQR
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  
  // Smart Main Gate Security
  mainGateState: 'locked' | 'unlocked';
  mainGatePasscode: string;
  autoLockEnabled: boolean;
  autoLockTime: string; // e.g. "23:00"
  autoUnlockTime: string; // e.g. "05:30"
  emergencyAlarmActive: boolean;
  emergencyAlarmReason?: string;
  
  // AI Automation settings
  aiAutoBillingEnabled: boolean;
  aiBillingDayOfMonth: number; // Day to generate invoices (e.g. 25th)
  aiAnomalyDetection: boolean;

  // Google Sheet & Apps Script Webhook Sync
  googleSheetWebhookUrl?: string;
  googleSheetSyncEnabled?: boolean;
  googleSheetLastSync?: string;
}

export interface RealtimeTelemetry {
  roomId: string;
  currentKwh: number;
  currentWaterM3: number;
  voltage: number; // Volts (e.g. 222V)
  currentAmps: number; // Amperes
  powerWatts: number; // Watts
  waterFlowRateLpm: number; // Liters per min
  lastTelemetryPing: string;
  dailyKwhTrend: Array<{ hour: string; kwh: number }>;
  dailyWaterTrend: Array<{ hour: string; liters: number }>;
  aiAnomalyFlag?: boolean;
  aiAnomalyReason?: string;
}

export interface JoinRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantIdCard: string;
  tenantEmail: string;
  hostCodeInput: string;
  landlordId: string;
  roomIdRequested?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface SystemLicense {
  id: string;
  landlordId: string;
  landlordName: string;
  plan: 'Cơ bản (Starter)' | 'Chuyên nghiệp (Pro)' | 'Đại đô thị (Enterprise)';
  maxRooms: number;
  status: 'active' | 'expiring_soon' | 'expired';
  activationKey: string;
  issuedDate: string;
  expiryDate: string;
  pricePaid: number;
}

export interface ComplaintReport {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetLandlordId?: string;
  type: 'tranh_chap' | 'loi_he_thong' | 'gop_y' | 'to_cao_vi_pham';
  title: string;
  content: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  adminResponse?: string;
}

export interface SecurityEventLog {
  id: string;
  landlordId: string;
  targetType: 'main_gate' | 'room_door';
  targetLabel: string;
  action: 'unlock_remote' | 'lock_remote' | 'pin_change' | 'emergency_alarm' | 'admin_override' | 'auto_schedule';
  performedBy: string;
  role: UserRole;
  timestamp: string;
  success: boolean;
  note?: string;
}
