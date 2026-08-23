import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
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
  UserRole,
  SystemFeatureFlags,
} from '../types';
import {
  ADMIN_USER,
  DEFAULT_FEATURE_FLAGS,
  INITIAL_USERS,
  INITIAL_LANDLORD_SETTINGS,
  INITIAL_ROOMS,
  INITIAL_CONTRACTS,
  INITIAL_INVOICES,
  INITIAL_ISSUES,
  INITIAL_NOTIFICATIONS,
  INITIAL_JOIN_REQUESTS,
  INITIAL_TELEMETRY,
  INITIAL_LICENSES,
  INITIAL_COMPLAINTS,
  INITIAL_SECURITY_LOGS,
  generateRandomHostCode,
} from '../mockData';

interface RentalContextType {
  // Current active session & auth
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, role?: UserRole) => { success: boolean; message: string; user?: User };
  loginAsDemoUser: (userId: string) => void;
  registerUser: (userData: {
    name: string;
    phone: string;
    email?: string;
    idCard?: string;
    role: UserRole;
    houseName?: string;
    houseAddress?: string;
  }) => { success: boolean; message: string; user?: User };
  logout: () => void;
  
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  switchUserById: (userId: string) => void;
  switchRoleQuick: (role: UserRole) => void;
  
  // Data Collections
  currentHouseName: string;
  settings: LandlordSettings;
  rooms: Room[];
  contracts: Contract[];
  invoices: Invoice[];
  issues: IssueTicket[];
  notifications: AppNotification[];
  joinRequests: JoinRequest[];
  telemetry: Record<string, RealtimeTelemetry>;
  licenses: SystemLicense[];
  complaints: ComplaintReport[];
  securityLogs: SecurityEventLog[];
  
  // Quick unread notif counter
  unreadNotifsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Actions - Tenant / Landlord Connection
  submitHostCode: (code: string, tenantId: string, requestedRoomId?: string) => { success: boolean; message: string };
  approveJoinRequest: (requestId: string, roomId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  removeTenantFromRoom: (roomId: string, tenantId: string) => void;
  checkoutTenant: (tenantId: string) => void;
  
  // Actions - Google Sheet & Apps Script Webhook Sync
  syncToGoogleSheet: (
    action: 'ADD' | 'DELETE' | 'UPDATE',
    tenantData: {
      id: string;
      roomNumber?: string;
      name?: string;
      phone?: string;
      idCard?: string;
      startDate?: string;
      monthlyRent?: number;
      depositAmount?: number;
    }
  ) => Promise<{ success: boolean; message: string }>;
  syncAllTenantsToGoogleSheet: () => Promise<{ success: boolean; count: number; message: string }>;
  testGoogleSheetConnection: (testUrl?: string) => Promise<{ success: boolean; message: string }>;
  updateGoogleSheetSettings: (webhookUrl: string, enabled: boolean) => void;
  
  // Actions - Room Management
  addRoom: (roomData: Omit<Room, 'id' | 'landlordId' | 'doorLockState' | 'securityStatus'>) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  
  // Actions - Pricing & Broadcast
  updatePricing: (updates: Partial<LandlordSettings>, sendBroadcastNotice?: boolean) => void;
  broadcastNotice: (title: string, message: string, priority?: 'normal' | 'high' | 'urgent') => void;
  
  // Actions - Contract Management
  updateContract: (contractId: string, updates: Partial<Contract>) => void;
  createContractCustom: (contract: Omit<Contract, 'id' | 'contractCode' | 'signedAt'>) => void;
  deleteContract: (contractId: string) => void;
  
  // Actions - Invoices & Payments
  createManualInvoice: (data: {
    roomId: string;
    monthYear: string;
    extraFee: number;
    extraFeeReason: string;
    applyToAllRooms?: boolean;
  }) => void;
  generateAIInvoicesBatch: () => { count: number; totalSum: number };
  payInvoice: (invoiceId: string, prepaidMonths?: number) => void;
  confirmInvoicePayment: (invoiceId: string) => void;
  verifyPaymentByHost: (invoiceId: string) => void;
  
  // Actions - Smart Security & Locks
  toggleMainGate: (targetState?: 'locked' | 'unlocked') => void;
  updateMainGateSchedule: (enabled: boolean, lockTime: string, unlockTime: string) => void;
  changeMainGatePIN: (newPin: string) => void;
  toggleRoomDoor: (roomId: string) => void;
  changeRoomDoorPIN: (roomId: string, newPin: string) => void;
  triggerEmergencyAlarm: (reason: string) => void;
  dismissEmergencyAlarm: () => void;
  
  // Actions - Issues & Tickets
  createIssue: (data: {
    category: IssueTicket['category'];
    title: string;
    description: string;
    urgency: IssueTicket['urgency'];
    photos?: string[];
  }) => void;
  updateIssueStatus: (issueId: string, status: IssueTicket['status'], landlordNote?: string) => void;
  
  // Actions - Admin
  updateFeatureFlags: (flags: Partial<SystemFeatureFlags>, targetLandlordId?: string) => void;
  getFeatureFlagsForLandlord: (landlordId?: string) => SystemFeatureFlags;
  toggleUserLock: (userId: string) => void;
  deleteUser: (userId: string) => void;
  deleteAllNonAdminUsers: () => void;
  regenerateHostCode: (landlordId?: string) => string;
  submitComplaint: (type: ComplaintReport['type'], title: string, content: string) => void;
  resolveComplaint: (complaintId: string, response: string) => void;
  issueLicense: (landlordId: string, plan: SystemLicense['plan'], maxRooms: number) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Reset demo data
  resetAllData: () => void;
}

const STORAGE_KEY = 'TRO_XANH_LIVE_PROD_V1';

const DEFAULT_EMPTY_USER: User = {
  id: '',
  name: 'Chưa đăng nhập',
  phone: '',
  email: '',
  role: 'tenant',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  status: 'active',
  joinedAt: new Date().toISOString().split('T')[0],
};

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const RentalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize from mock
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure brand new tenant accounts don't retain pre-assigned rooms
        if (parsed.role === 'tenant' && parsed.roomId === 'room_101') {
          return DEFAULT_EMPTY_USER;
        }
        return parsed;
      } catch {
        return DEFAULT_EMPTY_USER;
      }
    }
    return DEFAULT_EMPTY_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_authenticated`);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [settings, setSettings] = useState<LandlordSettings>(() => {
    const savedUserStr = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    let targetLandlordId = 'main';
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role === 'landlord') {
          targetLandlordId = u.id;
        } else if (u.role === 'tenant' && u.landlordId) {
          targetLandlordId = u.landlordId;
        }
      } catch (e) {}
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings_${targetLandlordId}`) || localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_LANDLORD_SETTINGS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rooms`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ROOMS;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [issues, setIssues] = useState<IssueTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_issues`);
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_join_requests`);
    return saved ? JSON.parse(saved) : INITIAL_JOIN_REQUESTS;
  });

  const [telemetry, setTelemetry] = useState<Record<string, RealtimeTelemetry>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_telemetry`);
    return saved ? JSON.parse(saved) : INITIAL_TELEMETRY;
  });

  const [licenses, setLicenses] = useState<SystemLicense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_licenses`);
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [complaints, setComplaints] = useState<ComplaintReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_complaints`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_security_logs`);
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);
  useEffect(() => {
    if (!currentUser) return;
    let targetLandlordId = 'main';
    if (currentUser.role === 'landlord') {
      targetLandlordId = currentUser.id;
    } else if (currentUser.role === 'tenant' && currentUser.landlordId) {
      targetLandlordId = currentUser.landlordId;
    }
    localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(settings));
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings, currentUser]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
  }, [contracts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify(issues));
  }, [issues]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_join_requests`, JSON.stringify(joinRequests));
  }, [joinRequests]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_telemetry`, JSON.stringify(telemetry));
  }, [telemetry]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_licenses`, JSON.stringify(licenses));
  }, [licenses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_complaints`, JSON.stringify(complaints));
  }, [complaints]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_security_logs`, JSON.stringify(securityLogs));
  }, [securityLogs]);

  // Firestore Persistence Sync Helpers
  const saveUserToFirestore = async (user: User) => {
    try { await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user), { merge: true }); } catch (err) { console.error('Firestore saveUser error:', err); }
  };
  const deleteUserFromFirestore = async (userId: string) => {
    try { await deleteDoc(doc(db, 'users', userId)); } catch (err) { console.error('Firestore deleteUser error:', err); }
  };
  const saveRoomToFirestore = async (room: Room) => {
    try { await setDoc(doc(db, 'rooms', room.id), sanitizeForFirestore(room), { merge: true }); } catch (err) { console.error('Firestore saveRoom error:', err); }
  };
  const deleteRoomFromFirestore = async (roomId: string) => {
    try { await deleteDoc(doc(db, 'rooms', roomId)); } catch (err) { console.error('Firestore deleteRoom error:', err); }
  };
  const saveContractToFirestore = async (contract: Contract) => {
    try { await setDoc(doc(db, 'contracts', contract.id), sanitizeForFirestore(contract), { merge: true }); } catch (err) { console.error('Firestore saveContract error:', err); }
  };
  const deleteContractFromFirestore = async (contractId: string) => {
    try { await deleteDoc(doc(db, 'contracts', contractId)); } catch (err) { console.error('Firestore deleteContract error:', err); }
  };
  const saveInvoiceToFirestore = async (invoice: Invoice) => {
    try { await setDoc(doc(db, 'invoices', invoice.id), sanitizeForFirestore(invoice), { merge: true }); } catch (err) { console.error('Firestore saveInvoice error:', err); }
  };
  const deleteInvoiceFromFirestore = async (invoiceId: string) => {
    try { await deleteDoc(doc(db, 'invoices', invoiceId)); } catch (err) { console.error('Firestore deleteInvoice error:', err); }
  };
  const saveIssueToFirestore = async (issue: IssueTicket) => {
    try { await setDoc(doc(db, 'issues', issue.id), sanitizeForFirestore(issue), { merge: true }); } catch (err) { console.error('Firestore saveIssue error:', err); }
  };
  const saveNotificationToFirestore = async (notif: AppNotification) => {
    try { await setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif), { merge: true }); } catch (err) { console.error('Firestore saveNotification error:', err); }
  };
  const saveJoinRequestToFirestore = async (req: JoinRequest) => {
    try { await setDoc(doc(db, 'joinRequests', req.id), sanitizeForFirestore(req), { merge: true }); } catch (err) { console.error('Firestore saveJoinRequest error:', err); }
  };
  const saveSettingsToFirestore = async (st: LandlordSettings) => {
    let targetLandlordId = st.landlordId || 'main';
    if (!targetLandlordId && currentUser) {
      targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (currentUser.landlordId || 'main');
    }
    try {
      await setDoc(doc(db, 'settings', targetLandlordId), sanitizeForFirestore(st), { merge: true });
    } catch (err) {
      console.error('Firestore saveSettings error:', err);
    }
  };
  const saveTelemetryToFirestore = async (tel: Record<string, RealtimeTelemetry>) => {
    try { await setDoc(doc(db, 'telemetry', 'main'), sanitizeForFirestore(tel), { merge: true }); } catch (err) { console.error('Firestore saveTelemetry error:', err); }
  };
  const saveComplaintToFirestore = async (comp: ComplaintReport) => {
    try { await setDoc(doc(db, 'complaints', comp.id), sanitizeForFirestore(comp), { merge: true }); } catch (err) { console.error('Firestore saveComplaint error:', err); }
  };
  const saveLicenseToFirestore = async (license: SystemLicense) => {
    try { await setDoc(doc(db, 'licenses', license.id), sanitizeForFirestore(license), { merge: true }); } catch (err) { console.error('Firestore saveLicense error:', err); }
  };
  const saveSecurityLogToFirestore = async (log: SecurityEventLog) => {
    try { await setDoc(doc(db, 'securityLogs', log.id), sanitizeForFirestore(log), { merge: true }); } catch (err) { console.error('Firestore saveSecurityLog error:', err); }
  };

  // Subscribe to cloud Firestore collections on mount
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      if (snap.empty) {
        INITIAL_USERS.forEach((u) => setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u)));
      } else {
        const fetched = snap.docs.map((d) => d.data() as User);
        setUsers(fetched);
        setCurrentUser((curr) => {
          if (!curr || !curr.id) return curr;
          if (curr.role === 'admin' || curr.id === 'admin_root') {
            const match = fetched.find((u) => u.id === curr.id);
            return match ? { ...curr, ...match } : curr;
          }
          const match = fetched.find((u) => u.id === curr.id);
          if (!match) {
            // Tài khoản đã bị Admin xóa hoàn toàn khỏi hệ thống -> Lập tức đăng xuất
            setIsAuthenticated(false);
            localStorage.removeItem(`${STORAGE_KEY}_current_user`);
            localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'false');
            setTimeout(() => {
              window.alert('Tài khoản của bạn đã bị Quản trị viên xóa khỏi hệ thống. Phiên đăng nhập đã kết thúc.');
            }, 100);
            return DEFAULT_EMPTY_USER;
          }
          return { ...curr, ...match };
        });
      }
    }, (err) => console.error('Firestore users listener error:', err));

    const unsubRooms = onSnapshot(collection(db, 'rooms'), (snap) => {
      if (snap.empty) {
        setRooms([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as Room);
        setRooms(fetched);
      }
    }, (err) => console.error('Firestore rooms listener error:', err));

    const unsubContracts = onSnapshot(collection(db, 'contracts'), (snap) => {
      if (snap.empty) {
        setContracts([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as Contract);
        setContracts(fetched);
      }
    }, (err) => console.error('Firestore contracts listener error:', err));

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      if (snap.empty) {
        setInvoices([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as Invoice);
        setInvoices(fetched);
      }
    }, (err) => console.error('Firestore invoices listener error:', err));

    const unsubIssues = onSnapshot(collection(db, 'issues'), (snap) => {
      if (snap.empty) {
        setIssues([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as IssueTicket);
        setIssues(fetched);
      }
    }, (err) => console.error('Firestore issues listener error:', err));

    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      if (snap.empty) {
        setNotifications([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as AppNotification);
        setNotifications(fetched);
      }
    }, (err) => console.error('Firestore notifications listener error:', err));

    const unsubJoinReqs = onSnapshot(collection(db, 'joinRequests'), (snap) => {
      if (snap.empty) {
        setJoinRequests([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as JoinRequest);
        setJoinRequests(fetched);
      }
    }, (err) => console.error('Firestore joinRequests listener error:', err));

    const unsubLicenses = onSnapshot(collection(db, 'licenses'), (snap) => {
      if (snap.empty) {
        setLicenses([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as SystemLicense);
        setLicenses(fetched);
      }
    }, (err) => console.error('Firestore licenses listener error:', err));

    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snap) => {
      if (snap.empty) {
        setComplaints([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as ComplaintReport);
        setComplaints(fetched);
      }
    }, (err) => console.error('Firestore complaints listener error:', err));

    const unsubLogs = onSnapshot(collection(db, 'securityLogs'), (snap) => {
      if (snap.empty) {
        setSecurityLogs([]);
      } else {
        const fetched = snap.docs.map((d) => d.data() as SecurityEventLog);
        setSecurityLogs(fetched);
      }
    }, (err) => console.error('Firestore securityLogs listener error:', err));

    const unsubTelemetry = onSnapshot(doc(db, 'telemetry', 'main'), (dSnap) => {
      if (!dSnap.exists()) {
        setDoc(doc(db, 'telemetry', 'main'), sanitizeForFirestore(INITIAL_TELEMETRY));
      } else {
        setTelemetry(dSnap.data() as Record<string, RealtimeTelemetry>);
      }
    }, (err) => console.error('Firestore telemetry listener error:', err));

    return () => {
      unsubUsers();
      unsubRooms();
      unsubContracts();
      unsubInvoices();
      unsubIssues();
      unsubNotifs();
      unsubJoinReqs();
      unsubLicenses();
      unsubComplaints();
      unsubLogs();
      unsubTelemetry();
    };
  }, []);

  // Dynamic settings subscription based on current user (splits settings for separate landlords)
  useEffect(() => {
    let targetLandlordId = 'main';
    if (currentUser.role === 'landlord') {
      targetLandlordId = currentUser.id;
    } else if (currentUser.role === 'tenant') {
      if (currentUser.landlordId) {
        targetLandlordId = currentUser.landlordId;
      } else {
        const pendingReq = joinRequests.find(
          (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'pending'
        );
        if (pendingReq && pendingReq.landlordId) {
          targetLandlordId = pendingReq.landlordId;
        }
      }
    }

    const cached = localStorage.getItem(`${STORAGE_KEY}_settings_${targetLandlordId}`);
    
    // Resolve dynamic default house name for this landlord
    const getDefaultHouseName = () => {
      if (currentUser.role === 'landlord') {
        return currentUser.houseName || (currentUser.name ? `Dãy Trọ ${currentUser.name}` : 'Dãy Trọ');
      }
      if (currentUser.role === 'tenant') {
        const targetLandlord = users.find((u) => u.id === targetLandlordId);
        return targetLandlord?.houseName || (targetLandlord?.name ? `Dãy Trọ ${targetLandlord.name}` : 'Dãy Trọ');
      }
      return 'Dãy Trọ';
    };

    const defaultHouseName = getDefaultHouseName();

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.houseName === 'Dãy Trọ Của Tôi' && defaultHouseName !== 'Dãy Trọ Của Tôi') {
          parsed.houseName = defaultHouseName;
        }
        setSettings(parsed);
      } catch (e) {}
    } else {
      setSettings({
        ...INITIAL_LANDLORD_SETTINGS,
        landlordId: targetLandlordId === 'main' ? '' : targetLandlordId,
        houseName: defaultHouseName,
      });
    }

    const docRef = doc(db, 'settings', targetLandlordId);
    const unsub = onSnapshot(docRef, (dSnap) => {
      if (!dSnap.exists()) {
        const initialWithId = {
          ...INITIAL_LANDLORD_SETTINGS,
          landlordId: targetLandlordId === 'main' ? '' : targetLandlordId,
          houseName: defaultHouseName,
        };
        setDoc(docRef, sanitizeForFirestore(initialWithId));
      } else {
        const data = dSnap.data() as LandlordSettings;
        if (data.houseName === 'Dãy Trọ Của Tôi' && defaultHouseName !== 'Dãy Trọ Của Tôi') {
          data.houseName = defaultHouseName;
          updateDoc(docRef, { houseName: defaultHouseName }).catch(() => {});
        }
        setSettings(data);
        localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(data));
      }
    }, (err) => console.error('Firestore settings listener error:', err));

    return () => unsub();
  }, [currentUser.id, currentUser.landlordId, currentUser.role, joinRequests]);

  // Auto-heal/sync currentUser if tenant request was accepted by landlord or room assigned
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'tenant') return;

    const hasJoinRequestAccepted = joinRequests.some(
      (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'accepted'
    );
    if (!currentUser.landlordId && !hasJoinRequestAccepted) {
      return;
    }

    const acceptedReq = joinRequests.find(
      (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'accepted'
    );
    const activeContract = contracts.find(
      (c) => (c.tenantId === currentUser.id || (currentUser.phone && c.tenantPhone === currentUser.phone)) && c.status === 'active'
    );
    const tenantRoom = rooms.find(
      (r) => r.currentTenantId === currentUser.id ||
             (currentUser.phone && r.currentTenantName && currentUser.name && r.currentTenantName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
             (activeContract && (r.id === activeContract.roomId || r.roomNumber === activeContract.roomNumber)) ||
             (currentUser.roomId && currentUser.roomId !== 'Chưa chọn phòng' && currentUser.roomId !== 'Chưa gán phòng' && (r.id === currentUser.roomId || r.roomNumber === currentUser.roomId))
    );

    const hasValidRoomId = currentUser.roomId && currentUser.roomId !== 'Chưa chọn phòng' && currentUser.roomId !== 'Chưa gán phòng';

    if ((acceptedReq || activeContract || tenantRoom) && (!hasValidRoomId || !currentUser.landlordId || currentUser.status !== 'active')) {
      const rawRoomId = tenantRoom?.id || activeContract?.roomId || (acceptedReq?.roomIdRequested && acceptedReq.roomIdRequested !== 'Chưa chọn phòng' && acceptedReq.roomIdRequested !== 'Chưa gán phòng' ? acceptedReq.roomIdRequested : undefined);
      const targetRoomId = rawRoomId && rawRoomId !== 'Chưa chọn phòng' && rawRoomId !== 'Chưa gán phòng' ? rawRoomId : undefined;
      const targetLandlordId = tenantRoom?.landlordId || activeContract?.landlordId || acceptedReq?.landlordId || settings.landlordId || currentUser.landlordId;

      if (targetRoomId || targetLandlordId) {
        const updated: User = {
          ...currentUser,
          status: 'active',
          landlordId: targetLandlordId || currentUser.landlordId,
          roomId: targetRoomId || currentUser.roomId,
        };
        setCurrentUser(updated);
        saveUserToFirestore(updated);
      }
    }
  }, [joinRequests, contracts, rooms, currentUser, settings.landlordId]);

  // Real-time IoT simulator: slight power and flow fluctuation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((roomId) => {
          const item = next[roomId];
          if (item) {
            const randomPowerDelta = (Math.random() - 0.48) * 15;
            const newPower = Math.max(50, Math.min(2800, item.powerWatts + randomPowerDelta));
            const newKwh = +(item.currentKwh + (newPower / 1000 / 3600)).toFixed(3);
            const newVolts = +(220 + (Math.random() - 0.5) * 3).toFixed(1);
            const newAmps = +(newPower / newVolts).toFixed(2);
            
            next[roomId] = {
              ...item,
              powerWatts: +newPower.toFixed(1),
              currentKwh: newKwh,
              voltage: newVolts,
              currentAmps: newAmps,
              lastTelemetryPing: 'Vừa xong',
            };
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Notifications filtering for current user
  const userNotifications = notifications.filter((n) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'landlord') {
      return n.receiverId === currentUser.id || n.receiverId === 'all' || n.landlordId === currentUser.id;
    }
    if (currentUser.role === 'tenant') {
      return (
        n.receiverId === currentUser.id ||
        (n.receiverId === 'all_tenants' && n.landlordId === currentUser.landlordId) ||
        n.receiverId === 'all'
      );
    }
    return n.receiverId === currentUser.id || n.receiverId === 'all';
  });

  const unreadNotifsCount = userNotifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, isRead: true };
          saveNotificationToFirestore(updated);
          return updated;
        }
        return n;
      })
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        const updated = { ...n, isRead: true };
        saveNotificationToFirestore(updated);
        return updated;
      })
    );
  };

  const login = (identifier: string, password?: string, role?: UserRole) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');
    const enteredPassword = (password || '').trim();

    // Check if this is the dedicated Root Admin account (Email: 60.wuy.lii.06@gmail.com, Pass: LEQUOCHUY03022006YEU*)
    const isAdminIdentifier = (
      cleanId === '60.wuy.lii.06@gmail.com' ||
      cleanId === 'admin' ||
      cleanPhone === '0918889999'
    );

    if (isAdminIdentifier) {
      if (enteredPassword && enteredPassword !== 'LEQUOCHUY03022006YEU*') {
        return {
          success: false,
          message: 'Mật khẩu Quản trị viên không chính xác! Vui lòng nhập đúng mật khẩu Quản trị.',
        };
      }

      // Find or create root admin user
      let adminAccount = users.find((u) => u.role === 'admin' || u.email.toLowerCase() === '60.wuy.lii.06@gmail.com');
      if (!adminAccount) {
        adminAccount = ADMIN_USER;
        setUsers((prev) => [ADMIN_USER, ...prev.filter(u => u.id !== 'admin_root')]);
      }

      setCurrentUser(adminAccount);
      setIsAuthenticated(true);

      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      return {
        success: true,
        message: `Đăng nhập quyền Quản Trị Viên thành công! Chào mừng ${adminAccount.name}.`,
        user: adminAccount,
      };
    }
    
    // Find user by phone, email, name, or hostCode
    const found = users.find((u) => {
      const uPhone = u.phone.replace(/\s+/g, '');
      const uEmail = u.email.toLowerCase();
      const uName = u.name.toLowerCase();
      const uHostCode = u.hostCode?.toLowerCase();
      
      const matchesIdentifier = (
        uPhone === cleanPhone ||
        uEmail === cleanId ||
        uName === cleanId ||
        uName.includes(cleanId) ||
        (uHostCode && uHostCode === cleanId)
      );

      if (role) {
        return matchesIdentifier && u.role === role;
      }
      return matchesIdentifier;
    });

    if (!found) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống! Vui lòng kiểm tra lại Số điện thoại / Email hoặc chọn Đăng ký mới.'
      };
    }

    if (found.status === 'locked') {
      return {
        success: false,
        message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên hệ thống! Vui lòng liên hệ hỗ trợ.'
      };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    
    // Fire celebratory confetti on successful login
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${found.name}.`,
      user: found
    };
  };

  const loginAsDemoUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }
    }
  };

  const registerUser = (userData: {
    name: string;
    phone: string;
    email?: string;
    idCard?: string;
    role: UserRole;
    houseName?: string;
    houseAddress?: string;
  }) => {
    const cleanPhone = userData.phone.trim().replace(/\s+/g, '');
    
    // Check if phone already registered
    const existing = users.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);
    if (existing) {
      return {
        success: false,
        message: 'Số điện thoại này đã được đăng ký tài khoản! Vui lòng đăng nhập.'
      };
    }

    const newId = `user_${userData.role}_${Date.now()}`;
    const generatedHostCode = userData.role === 'landlord' 
      ? `TRX${Math.floor(100000 + Math.random() * 900000)}` 
      : undefined;

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      email: userData.email?.trim() || `${cleanPhone}@troxanh.vn`,
      idCard: userData.idCard?.trim() || '079' + Math.floor(100000000 + Math.random() * 900000000),
      role: userData.role,
      avatar: userData.role === 'landlord' 
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      hostCode: generatedHostCode,
      licenseTier: userData.role === 'landlord' ? 'pro' : undefined,
    };

    // If landlord, update or create building settings
    if (userData.role === 'landlord') {
      const landlordHouseName = userData.houseName?.trim() || `Dãy Trọ ${userData.name.trim()}`;
      const newSettings = {
        ...settings,
        landlordId: newId,
        houseName: landlordHouseName,
        houseAddress: userData.houseAddress || 'Số 123 Đường Số 1, TP. Hồ Chí Minh',
        hostCode: generatedHostCode || settings.hostCode,
      };
      setSettings(newSettings);
      localStorage.setItem(`${STORAGE_KEY}_settings_${newId}`, JSON.stringify(newSettings));
      saveSettingsToFirestore(newSettings);
    }

    setUsers((prev) => [newUser, ...prev]);
    saveUserToFirestore(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công! Bạn đã được đăng nhập tự động.',
      user: newUser
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_EMPTY_USER);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'false');
  };

  // Watcher: Tự động ngắt phiên đăng nhập nếu tài khoản người dùng bị Admin xóa khỏi hệ thống
  useEffect(() => {
    if (isAuthenticated && currentUser.id && currentUser.role !== 'admin' && currentUser.id !== 'admin_root') {
      if (users.length > 0) {
        const stillExists = users.some((u) => u.id === currentUser.id);
        if (!stillExists) {
          setIsAuthenticated(false);
          setCurrentUser(DEFAULT_EMPTY_USER);
          localStorage.removeItem(`${STORAGE_KEY}_current_user`);
          localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'false');
          window.alert('Tài khoản của bạn đã bị Quản trị viên xóa khỏi hệ thống. Bạn đã bị đăng xuất.');
        }
      }
    }
  }, [users, currentUser.id, currentUser.role, isAuthenticated]);

  // Bộ đếm tự động đồng bộ Google Sheet mỗi 5 phút (300 giây) nếu chủ trọ bật đồng bộ
  useEffect(() => {
    if (!isAuthenticated || currentUser.role !== 'landlord') return;
    if (!settings.googleSheetWebhookUrl || settings.googleSheetSyncEnabled === false) return;

    const interval = setInterval(() => {
      syncAllTenantsToGoogleSheet();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser.role, settings.googleSheetWebhookUrl, settings.googleSheetSyncEnabled]);

  const switchUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const switchRoleQuick = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  // 1. Submit host code (Tenant -> Landlord)
  const submitHostCode = (code: string, tenantId: string, requestedRoomId?: string) => {
    const cleanCode = code.trim().toUpperCase();
    
    // Find matching landlord across users or current settings
    const targetLandlord = users.find(
      (u) => u.role === 'landlord' && u.hostCode && u.hostCode.trim().toUpperCase() === cleanCode
    ) || (settings.hostCode && settings.hostCode.trim().toUpperCase() === cleanCode ? users.find((u) => u.id === settings.landlordId) || (currentUser.role === 'landlord' ? currentUser : undefined) : undefined);

    if (!targetLandlord) {
      return { 
        success: false, 
        message: 'Mã chủ trọ không tồn tại hoặc không hợp lệ! Vui lòng kiểm tra lại mã do chủ nhà trọ cung cấp.' 
      };
    }

    const tenant = users.find((u) => u.id === tenantId);
    if (!tenant) return { success: false, message: 'Không tìm thấy người dùng' };

    const targetLandlordId = targetLandlord.id;
    const targetLandlordName = targetLandlord.name;

    // Check if already requested
    const existing = joinRequests.find(
      (r) => r.tenantId === tenantId && r.landlordId === targetLandlordId && r.status === 'pending'
    );
    if (existing) {
      return { success: true, message: 'Bạn đã gửi yêu cầu gia nhập trước đó. Vui lòng chờ chủ trọ duyệt!' };
    }

    const newRequest: JoinRequest = {
      id: `join_${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantPhone: tenant.phone,
      tenantIdCard: tenant.idCard || '038200019283',
      tenantEmail: tenant.email,
      hostCodeInput: cleanCode,
      landlordId: targetLandlordId,
      roomIdRequested: requestedRoomId || 'Chưa chọn phòng',
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setJoinRequests((prev) => [newRequest, ...prev]);
    saveJoinRequestToFirestore(newRequest);

    // Send notification to landlord
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      senderId: tenant.id,
      senderName: tenant.name,
      receiverId: targetLandlordId,
      landlordId: targetLandlordId,
      type: 'tenant_join_request',
      title: 'Đơn xin thuê trọ mới',
      message: `Khách thuê ${tenant.name} (${tenant.phone}) vừa nhập đúng mã chủ trọ và gửi yêu cầu thuê phòng.`,
      timestamp: 'Vừa xong',
      isRead: false,
      priority: 'high',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveNotificationToFirestore(newNotif);

    return {
      success: true,
      message: `Đã gửi yêu cầu kết nối tới Chủ trọ ${targetLandlordName}. Đang chờ chủ nhà xác nhận duyệt.`,
    };
  };

  // Google Sheet Webhook Sync Dispatcher
  const syncToGoogleSheet = async (
    action: 'ADD' | 'DELETE' | 'UPDATE' | 'sync_all' | 'new_contract',
    tenantData?: {
      id?: string;
      roomNumber?: string;
      tenantName?: string;
      name?: string;
      phone?: string;
      identityCard?: string;
      idCard?: string;
      startDate?: string;
      endDate?: string;
      monthlyRent?: number;
      price?: number;
      depositAmount?: number;
      deposit?: number;
      status?: string;
    },
    allTenantsData?: Array<{
      roomNumber: string;
      tenantName: string;
      phone: string;
      identityCard: string;
      startDate: string;
      endDate: string;
      price: number;
      deposit: number;
      status: string;
    }>
  ): Promise<{ success: boolean; message: string }> => {
    const webhookUrl = settings.googleSheetWebhookUrl;
    if (!webhookUrl || !webhookUrl.trim()) {
      return { success: false, message: 'Chưa cấu hình Google Apps Script Webhook URL trong Cài đặt' };
    }
    
    if (settings.googleSheetSyncEnabled === false && action !== 'UPDATE' && action !== 'sync_all') {
      return { success: false, message: 'Tính năng đồng bộ Google Sheet đang tắt trong cài đặt' };
    }

    try {
      const payload: Record<string, unknown> = {
        action,
        timestamp: new Date().toISOString(),
      };

      if (action === 'sync_all' && allTenantsData) {
        payload.data = allTenantsData;
        payload.tenants = allTenantsData;
      } else if (tenantData) {
        // Support standard Apps Script payload structures
        payload.tenant = tenantData;
        payload.data = {
          roomNumber: tenantData.roomNumber || '',
          tenantName: tenantData.tenantName || tenantData.name || '',
          phone: tenantData.phone || '',
          identityCard: tenantData.identityCard || tenantData.idCard || '',
          startDate: tenantData.startDate || '',
          endDate: tenantData.endDate || 'Vô thời hạn',
          price: tenantData.price || tenantData.monthlyRent || 0,
          deposit: tenantData.deposit || tenantData.depositAmount || 0,
          status: tenantData.status || 'Đang thuê',
        };
      }

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const nowTime = new Date().toLocaleString('vi-VN');
      const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
      const updatedSettings = {
        ...settings,
        googleSheetLastSync: nowTime,
      };
      setSettings(updatedSettings);
      localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(updatedSettings));
      saveSettingsToFirestore(updatedSettings);

      return {
        success: true,
        message: action === 'ADD' || action === 'new_contract'
          ? `Đã đồng bộ thông tin khách ${tenantData?.name || tenantData?.tenantName || tenantData?.id} sang Google Sheet`
          : action === 'sync_all'
          ? `Đã đồng bộ toàn bộ danh sách sang Google Sheet`
          : `Đã gửi lệnh xóa khách ${tenantData?.id} khỏi Google Sheet`,
      };
    } catch (error) {
      console.error('Lỗi khi gửi webhook sang Google Sheet:', error);
      return {
        success: false,
        message: 'Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại URL.',
      };
    }
  };

  // Sync all active tenants to Google Sheet in batch
  const syncAllTenantsToGoogleSheet = async (): Promise<{ success: boolean; count: number; message: string }> => {
    const activeTenants = users.filter((u) => u.role === 'tenant' && u.roomId);
    if (activeTenants.length === 0) {
      return { success: true, count: 0, message: 'Hiện không có khách thuê nào để đồng bộ' };
    }

    const tenantsDataList = activeTenants.map((tenant) => {
      const room = rooms.find((r) => r.id === tenant.roomId);
      const contract = contracts.find((c) => c.roomId === tenant.roomId && c.status === 'active');
      return {
        roomNumber: room?.roomNumber || 'Phòng ?',
        tenantName: tenant.name,
        phone: tenant.phone,
        identityCard: tenant.idCard || '',
        startDate: contract?.startDate || new Date().toISOString().split('T')[0],
        endDate: contract?.endDate || 'Vô thời hạn',
        price: room?.basePrice || 3500000,
        deposit: contract?.depositAmount || room?.basePrice || 3500000,
        status: 'Đang thuê',
      };
    });

    // 1. Send batch payload (action: sync_all)
    await syncToGoogleSheet('sync_all', undefined, tenantsDataList);

    // 2. Also send individual rows (action: ADD) for scripts that listen to single add actions
    for (const item of tenantsDataList) {
      await syncToGoogleSheet('ADD', {
        id: item.phone,
        roomNumber: item.roomNumber,
        name: item.tenantName,
        tenantName: item.tenantName,
        phone: item.phone,
        idCard: item.identityCard,
        identityCard: item.identityCard,
        startDate: item.startDate,
        endDate: item.endDate,
        monthlyRent: item.price,
        price: item.price,
        depositAmount: item.deposit,
        deposit: item.deposit,
        status: 'Đang thuê',
      });
    }

    const nowTime = new Date().toLocaleString('vi-VN');
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const updatedSettings = {
      ...settings,
      googleSheetLastSync: nowTime,
    };
    setSettings(updatedSettings);
    localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(updatedSettings));
    saveSettingsToFirestore(updatedSettings);

    return {
      success: true,
      count: activeTenants.length,
      message: `Đã đồng bộ thành công ${activeTenants.length} khách thuê sang Google Sheet!`,
    };
  };

  // Test Webhook connection with sample data
  const testGoogleSheetConnection = async (testUrl?: string): Promise<{ success: boolean; message: string }> => {
    const url = testUrl || settings.googleSheetWebhookUrl;
    if (!url || !url.trim()) {
      return {
        success: false,
        message: 'Chưa cấu hình URL Webhook. Vui lòng nhập link Apps Script trước khi kiểm tra.',
      };
    }
    try {
      await fetch(url.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ADD',
          tenant: {
            id: `test_${Date.now()}`,
            roomNumber: 'Phòng TEST',
            name: 'Khách Thử Nghiệm (Quản lí nhà trọ)',
            phone: '0909 000 888',
            idCard: '079201009182',
            startDate: new Date().toISOString().split('T')[0],
            monthlyRent: 3500000,
            depositAmount: 3500000,
          },
          data: {
            roomNumber: 'Phòng TEST',
            tenantName: 'Khách Thử Nghiệm (Quản lí nhà trọ)',
            phone: '0909 000 888',
            identityCard: '079201009182',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '12 tháng',
            price: 3500000,
            deposit: 3500000,
            status: 'Đang thuê',
          },
          timestamp: new Date().toISOString(),
        }),
      });

      const nowTime = new Date().toLocaleString('vi-VN');
      const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
      const updatedSettings = {
        ...settings,
        googleSheetLastSync: nowTime,
      };
      setSettings(updatedSettings);
      localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(updatedSettings));
      saveSettingsToFirestore(updatedSettings);

      return {
        success: true,
        message: 'Gửi dữ liệu kiểm tra thành công! Vui lòng kiểm tra Google Sheet của bạn xem đã nhận được dòng mới chưa.',
      };
    } catch (err) {
      return {
        success: false,
        message: `Lỗi kết nối: ${String(err)}`,
      };
    }
  };

  // Update Google Sheet URL & sync status (persist to Firestore & localStorage)
  const updateGoogleSheetSettings = (webhookUrl: string, enabled: boolean) => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const updatedSettings: LandlordSettings = {
      ...settings,
      googleSheetWebhookUrl: webhookUrl.trim(),
      googleSheetSyncEnabled: enabled,
      landlordId: targetLandlordId,
    };
    setSettings(updatedSettings);
    localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(updatedSettings));
    saveSettingsToFirestore(updatedSettings);
  };

  const getLandlordName = () => {
    if (currentUser.role === 'landlord' && currentUser.name) {
      return currentUser.name;
    }
    const landlordUser = users.find(
      (u) => u.role === 'landlord' || u.id === settings.landlordId
    );
    if (landlordUser?.name) {
      return landlordUser.name;
    }
    if (settings.accountName) {
      return settings.accountName;
    }
    return 'Chủ trọ';
  };

  const updateContract = (contractId: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const updated = { ...c, ...updates };
          saveContractToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const createContractCustom = (contract: Omit<Contract, 'id' | 'contractCode' | 'signedAt'>) => {
    const newContract: Contract = {
      ...contract,
      id: `contract_${Date.now()}`,
      contractCode: `HĐ-${new Date().getFullYear()}/${contract.roomNumber.replace(/\s+/g, '')}`,
      signedAt: new Date().toLocaleString('vi-VN'),
    };
    setContracts((prev) => [newContract, ...prev]);
    saveContractToFirestore(newContract);

    // Tự động đồng bộ ngay khi tạo hợp đồng mới
    syncToGoogleSheet('new_contract', {
      id: contract.tenantId || contract.tenantPhone,
      roomNumber: contract.roomNumber,
      name: contract.tenantName,
      tenantName: contract.tenantName,
      phone: contract.tenantPhone,
      idCard: contract.tenantIdCard,
      identityCard: contract.tenantIdCard,
      startDate: contract.startDate,
      endDate: contract.endDate,
      monthlyRent: contract.monthlyRent,
      price: contract.monthlyRent,
      depositAmount: contract.depositAmount,
      deposit: contract.depositAmount,
      status: 'Đang thuê',
    });
  };

  const deleteContract = (contractId: string) => {
    const targetContract = contracts.find((c) => c.id === contractId);
    if (targetContract) {
      const { tenantId, roomId } = targetContract;

      // 1. If there's an associated tenant, reset their link status so they are completely removed from the boarding house
      if (tenantId) {
        const tenant = users.find((u) => u.id === tenantId);
        if (tenant) {
          saveUserToFirestore({
            ...tenant,
            roomId: undefined,
            landlordId: undefined,
            status: 'pending_approval',
          });
          setUsers((prev) =>
            prev.map((u) =>
              u.id === tenantId
                ? { ...u, roomId: undefined, landlordId: undefined, status: 'pending_approval' }
                : u
            )
          );
          // Sync with landlord's Google Sheet
          syncToGoogleSheet('DELETE', { id: tenantId });
        }
      }

      // 2. If there's an associated room, make sure it is vacant if it was occupied by this tenant
      if (roomId) {
        const targetRoom = rooms.find((r) => r.id === roomId);
        if (targetRoom && targetRoom.currentTenantId === tenantId) {
          saveRoomToFirestore({
            ...targetRoom,
            status: 'available',
            currentTenantId: undefined,
            currentTenantName: undefined,
          });
          setRooms((prev) =>
            prev.map((r) =>
              r.id === roomId
                ? {
                    ...r,
                    status: 'available',
                    currentTenantId: undefined,
                    currentTenantName: undefined,
                  }
                : r
            )
          );
        }
      }

      // 3. Add security logs
      addSecurityLog({
        targetType: 'room_door',
        targetLabel: roomId ? `Phòng ${roomId}` : 'Hợp đồng',
        action: 'admin_override',
        performedBy: currentUser ? currentUser.name : 'Chủ trọ',
        role: currentUser ? currentUser.role : 'landlord',
        success: true,
        note: `Đã hủy liên kết khách thuê và giải phóng phòng do chủ trọ xóa hợp đồng điện tử.`,
      });
    }

    setContracts((prev) => prev.filter((c) => c.id !== contractId));
    deleteContractFromFirestore(contractId);
  };

  // 2. Landlord approves join request
  const approveJoinRequest = (requestId: string, targetRoomId: string) => {
    const req = joinRequests.find((r) => r.id === requestId);
    if (!req) return;

    let targetRoom = rooms.find(
      (r) => r.id === targetRoomId || r.roomNumber === targetRoomId || r.roomNumber === `Phòng ${targetRoomId}`
    );

    // Guard: Do not allow assigning a room if it is already occupied by another tenant
    if (targetRoom && targetRoom.status === 'occupied' && targetRoom.currentTenantId && targetRoom.currentTenantId !== req.tenantId) {
      alert(`Phòng ${targetRoom.roomNumber} hiện đã có người ở (${targetRoom.currentTenantName || 'Khách thuê'}). Không thể cho thuê phòng trùng!`);
      return;
    }

    // If specified room does not exist in state, dynamically create it!
    if (!targetRoom) {
      const displayNum = targetRoomId.startsWith('Phòng')
        ? targetRoomId
        : `Phòng ${targetRoomId.replace(/^room_/, '')}`;

      targetRoom = {
        id: `room_${Date.now()}`,
        landlordId: settings.landlordId || currentUser.id,
        roomNumber: displayNum.trim() || 'Phòng 101',
        floor: 1,
        areaM2: 25,
        basePrice: 2500000,
        amenities: ['Điều hòa', 'Wifi'],
        status: 'occupied',
        doorLockState: 'locked',
        doorPasscode: '123456',
        securityStatus: 'secure',
        electricityMeterStart: 100,
        waterMeterStart: 30,
        currentTenantId: req.tenantId,
        currentTenantName: req.tenantName,
      };

      setRooms((prev) => [...prev, targetRoom!]);
    } else {
      targetRoom = {
        ...targetRoom,
        status: 'occupied',
        currentTenantId: req.tenantId,
        currentTenantName: req.tenantName,
      };
      setRooms((prev) =>
        prev.map((rm) => (rm.id === targetRoom!.id ? targetRoom! : rm))
      );
    }
    // Save updated/created room to Firestore
    saveRoomToFirestore(targetRoom);

    // Update request status in state & Firestore
    const updatedRequest: JoinRequest = { ...req, status: 'accepted' };
    saveJoinRequestToFirestore(updatedRequest);
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updatedRequest : r))
    );

    // Update user link in state & Firestore
    const existingTenantUser = users.find((u) => u.id === req.tenantId);
    const updatedTenantUser: User = existingTenantUser
      ? {
          ...existingTenantUser,
          status: 'active',
          landlordId: settings.landlordId || currentUser.id,
          roomId: targetRoom.id,
        }
      : {
          id: req.tenantId,
          name: req.tenantName,
          phone: req.tenantPhone,
          email: req.tenantEmail,
          role: 'tenant',
          status: 'active',
          landlordId: settings.landlordId || currentUser.id,
          roomId: targetRoom.id,
          createdAt: new Date().toLocaleDateString('vi-VN'),
        };

    saveUserToFirestore(updatedTenantUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === req.tenantId ? updatedTenantUser : u))
    );

    // Create Contract with dynamic Landlord Name & save to Firestore
    const landlordDisplayName = getLandlordName();
    const newContract: Contract = {
      id: `contract_${Date.now()}`,
      contractCode: `HĐ-${new Date().getFullYear()}/${targetRoom.roomNumber.replace(/\s+/g, '')}`,
      tenantId: req.tenantId,
      tenantName: req.tenantName,
      tenantPhone: req.tenantPhone,
      tenantIdCard: req.tenantIdCard,
      landlordId: settings.landlordId || currentUser.id,
      landlordName: landlordDisplayName,
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      depositAmount: targetRoom.basePrice,
      monthlyRent: targetRoom.basePrice,
      prepaidMonthsRemaining: 0,
      terms: [
        'Người thuê đóng tiền phòng đúng hạn từ mùng 1 đến mùng 5 hàng tháng.',
        'Sử dụng điện nước an toàn, tuân thủ an ninh trật tự dãy trọ.',
        'Mọi hỏng hóc thiết bị báo ngay trên hệ thống để được hỗ trợ sửa chữa.',
      ],
      status: 'active',
      signedAt: new Date().toLocaleString('vi-VN'),
    };
    saveContractToFirestore(newContract);
    setContracts((prev) => [newContract, ...prev]);

    // Automatically sync new tenant to Landlord's Google Sheet
    syncToGoogleSheet('ADD', {
      id: req.tenantId,
      roomNumber: targetRoom.roomNumber,
      name: req.tenantName,
      phone: req.tenantPhone,
      idCard: req.tenantIdCard,
      startDate: new Date().toISOString().split('T')[0],
      monthlyRent: targetRoom.basePrice,
      depositAmount: targetRoom.basePrice,
    });

    // Initialize telemetry for new room if missing
    let newTelemDict = { ...telemetry };
    if (!newTelemDict[targetRoom.id]) {
      const roomTelem = {
        roomId: targetRoom.id,
        currentKwh: targetRoom.electricityMeterStart || 100,
        currentWaterM3: targetRoom.waterMeterStart || 10,
        voltage: 220.5,
        currentAmps: 2.1,
        powerWatts: 463,
        waterFlowRateLpm: 0,
        lastTelemetryPing: 'Vừa xong',
        dailyKwhTrend: [
          { hour: '00:00', kwh: 0.2 },
          { hour: '08:00', kwh: 0.8 },
          { hour: '16:00', kwh: 1.1 },
          { hour: '20:00', kwh: 1.8 },
        ],
        dailyWaterTrend: [
          { hour: '08:00', liters: 20 },
          { hour: '20:00', liters: 35 },
        ],
        aiAnomalyFlag: false,
      };
      newTelemDict = { ...newTelemDict, [targetRoom.id]: roomTelem };
      setTelemetry(newTelemDict);
      saveTelemetryToFirestore(newTelemDict);
    }

    // Send welcome notification to tenant
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      senderId: settings.landlordId,
      senderName: `Chủ trọ ${landlordDisplayName}`,
      receiverId: req.tenantId,
      landlordId: settings.landlordId,
      type: 'general',
      title: 'Chào mừng gia nhập dãy trọ!',
      message: `Chủ trọ đã phê duyệt đơn thuê phòng. Bạn hiện là khách thuê chính thức tại ${targetRoom.roomNumber} - ${settings.houseName}. Mã khóa cửa phòng của bạn là: ${targetRoom.doorPasscode}.`,
      timestamp: 'Vừa xong',
      isRead: false,
      priority: 'high',
    };
    saveNotificationToFirestore(welcomeNotif);
    setNotifications((prev) => [welcomeNotif, ...prev]);

    // If current user is this tenant, sync active state
    if (currentUser.id === req.tenantId) {
      setCurrentUser(updatedTenantUser);
    }
  };

  const rejectJoinRequest = (requestId: string) => {
    const req = joinRequests.find((r) => r.id === requestId);
    if (req) {
      saveJoinRequestToFirestore({ ...req, status: 'rejected' });
    }
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  // 3. Remove/Checkout tenant
  const removeTenantFromRoom = (roomId: string, tenantId: string) => {
    // Vacate room
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom) {
      saveRoomToFirestore({
        ...targetRoom,
        status: 'available',
        currentTenantId: undefined,
        currentTenantName: undefined,
      });
    }

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: 'available',
              currentTenantId: undefined,
              currentTenantName: undefined,
            }
          : r
      )
    );

    // Terminate contracts
    const targetContract = contracts.find((c) => c.roomId === roomId && c.tenantId === tenantId);
    if (targetContract) {
      saveContractToFirestore({ ...targetContract, status: 'terminated' });
    }

    setContracts((prev) =>
      prev.map((c) =>
        c.roomId === roomId && c.tenantId === tenantId
          ? { ...c, status: 'terminated' }
          : c
      )
    );

    // Update user
    const targetUser = users.find((u) => u.id === tenantId);
    if (targetUser) {
      saveUserToFirestore({
        ...targetUser,
        roomId: undefined,
        landlordId: undefined,
        status: 'pending_approval',
      });
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === tenantId
          ? { ...u, roomId: undefined, landlordId: undefined, status: 'pending_approval' }
          : u
      )
    );

    // Automatically remove tenant from Landlord's Google Sheet
    syncToGoogleSheet('DELETE', {
      id: tenantId,
    });

    // Add security log
    addSecurityLog({
      targetType: 'room_door',
      targetLabel: `Phòng ${roomId}`,
      action: 'admin_override',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `Chủ trọ đã thanh lý hợp đồng và bàn giao lại phòng.`,
    });
  };

  // Checkout tenant alias
  const checkoutTenant = (tenantId: string) => {
    const tenant = users.find((u) => u.id === tenantId);
    if (tenant && tenant.roomId) {
      removeTenantFromRoom(tenant.roomId, tenantId);
    } else {
      if (tenant) {
        saveUserToFirestore({
          ...tenant,
          roomId: undefined,
          landlordId: undefined,
          status: 'pending_approval',
        });
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === tenantId
            ? { ...u, roomId: undefined, landlordId: undefined, status: 'pending_approval' }
            : u
        )
      );
      syncToGoogleSheet('DELETE', { id: tenantId });
    }
  };

  // 4. Room operations
  const addRoom = (roomData: Omit<Room, 'id' | 'landlordId' | 'doorLockState' | 'securityStatus'>) => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const newRoomId = `room_${Date.now()}`;
    const newRoom: Room = {
      ...roomData,
      id: newRoomId,
      landlordId: targetLandlordId,
      doorLockState: 'locked',
      securityStatus: 'secure',
      doorPasscode: Math.floor(100000 + Math.random() * 900000).toString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    saveRoomToFirestore(newRoom);

    const newTelem = {
      ...telemetry,
      [newRoomId]: {
        roomId: newRoomId,
        currentKwh: roomData.electricityMeterStart || 100,
        currentWaterM3: roomData.waterMeterStart || 5,
        voltage: 221.0,
        currentAmps: 0,
        powerWatts: 0,
        waterFlowRateLpm: 0,
        lastTelemetryPing: 'Vừa xong',
        dailyKwhTrend: [],
        dailyWaterTrend: [],
        aiAnomalyFlag: false,
      },
    };
    setTelemetry(newTelem);
    saveTelemetryToFirestore(newTelem);
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    const rm = rooms.find((r) => r.id === roomId);
    if (rm) {
      saveRoomToFirestore({ ...rm, ...updates });
    }
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...updates } : r)));
  };

  const deleteRoom = (roomId: string) => {
    deleteRoomFromFirestore(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setUsers((prev) =>
      prev.map((u) => {
        if (u.roomId === roomId) {
          const updatedUser = {
            ...u,
            roomId: undefined,
            status: 'pending_approval' as const,
          };
          saveUserToFirestore(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  // 5. Pricing Update & Automatic Broadcast
  const updatePricing = (updates: Partial<LandlordSettings>, sendBroadcastNotice = true) => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const oldSettings = { ...settings };
    const newSettings = { ...settings, ...updates, landlordId: targetLandlordId };
    setSettings(newSettings);
    localStorage.setItem(`${STORAGE_KEY}_settings_${targetLandlordId}`, JSON.stringify(newSettings));
    saveSettingsToFirestore(newSettings);

    if (sendBroadcastNotice) {
      const priceChanges: string[] = [];
      if (updates.electricityRate && updates.electricityRate !== oldSettings.electricityRate) {
        priceChanges.push(`Điện: ${updates.electricityRate.toLocaleString('vi-VN')} đ/kWh`);
      }
      if (updates.waterRate && updates.waterRate !== oldSettings.waterRate) {
        priceChanges.push(`Nước: ${updates.waterRate.toLocaleString('vi-VN')} đ/m³`);
      }
      if (updates.internetFee && updates.internetFee !== oldSettings.internetFee) {
        priceChanges.push(`Wifi: ${updates.internetFee.toLocaleString('vi-VN')} đ/phòng`);
      }
      if (updates.garbageFee && updates.garbageFee !== oldSettings.garbageFee) {
        priceChanges.push(`Rác: ${updates.garbageFee.toLocaleString('vi-VN')} đ/phòng`);
      }
      if (updates.serviceFee && updates.serviceFee !== oldSettings.serviceFee) {
        priceChanges.push(`Dịch vụ: ${updates.serviceFee.toLocaleString('vi-VN')} đ/phòng`);
      }

      const desc = priceChanges.length > 0
        ? `Chủ nhà đã cập nhật biểu giá mới: ${priceChanges.join(', ')}. Biểu giá này được hệ thống tự động ghi nhận và áp dụng cho toàn bộ dãy trọ từ kỳ tiếp theo.`
        : 'Chủ nhà đã cập nhật thông tin cài đặt dãy trọ.';

      broadcastNotice('Thông báo: Cập nhật biểu giá & dịch vụ dãy trọ', desc, 'high');
    }
  };

  const broadcastNotice = (title: string, message: string, priority: 'normal' | 'high' | 'urgent' = 'normal') => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: 'all_tenants',
      landlordId: targetLandlordId,
      type: 'general',
      title,
      message,
      timestamp: 'Vừa xong',
      isRead: false,
      priority,
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToFirestore(notif);
  };

  // 6. Invoices Management
  const createManualInvoice = ({
    roomId,
    monthYear,
    extraFee,
    extraFeeReason,
    applyToAllRooms,
  }: {
    roomId: string;
    monthYear: string;
    extraFee: number;
    extraFeeReason: string;
    applyToAllRooms?: boolean;
  }) => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const targetRooms = applyToAllRooms ? rooms.filter((r) => r.status === 'occupied') : rooms.filter((r) => r.id === roomId);

    targetRooms.forEach((rm) => {
      const tenant = users.find((u) => u.id === rm.currentTenantId);
      const contract = contracts.find((c) => c.roomId === rm.id && c.status === 'active');
      const tel = telemetry[rm.id];

      const isPrepaid = (contract?.prepaidMonthsRemaining || 0) > 0;
      const rent = isPrepaid ? 0 : rm.basePrice;

      const elecUsed = 120;
      const waterUsed = 8;
      const elecTotal = elecUsed * settings.electricityRate;
      const waterTotal = waterUsed * settings.waterRate;
      const total = rent + elecTotal + waterTotal + settings.garbageFee + settings.internetFee + settings.serviceFee + extraFee;

      const newInv: Invoice = {
        id: `inv_${Date.now()}_${rm.id}`,
        invoiceCode: `HD-${monthYear.replace('/', '')}-${rm.roomNumber.replace(/\D/g, '')}`,
        landlordId: targetLandlordId,
        tenantId: tenant?.id || 'user_tenant_1',
        tenantName: tenant?.name || 'Khách thuê',
        roomId: rm.id,
        roomNumber: rm.roomNumber,
        monthYear,
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rentAmount: rent,
        isRentPrepaid: isPrepaid,
        electricityStart: Math.round((tel?.currentKwh || 1000) - elecUsed),
        electricityEnd: Math.round(tel?.currentKwh || 1000),
        electricityUsed: elecUsed,
        electricityRate: settings.electricityRate,
        electricityTotal: elecTotal,
        waterStart: Math.round((tel?.currentWaterM3 || 50) - waterUsed),
        waterEnd: Math.round(tel?.currentWaterM3 || 50),
        waterUsed: waterUsed,
        waterRate: settings.waterRate,
        waterTotal: waterTotal,
        garbageFee: settings.garbageFee,
        internetFee: settings.internetFee,
        serviceFee: settings.serviceFee,
        extraFee,
        extraFeeReason: extraFeeReason || (extraFee > 0 ? 'Phí phát sinh chung' : undefined),
        totalAmount: total,
        status: 'pending',
        bankInfo: {
          bankCode: settings.bankCode,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          accountName: settings.accountName,
          transferContent: `HG ${rm.roomNumber.replace(/\s+/g, '')} T${monthYear.replace('/', '')}`,
        },
        aiGenerated: false,
      };

      setInvoices((prev) => [newInv, ...prev]);
      saveInvoiceToFirestore(newInv);

      // Notify tenant
      if (tenant) {
        const notif: AppNotification = {
          id: `notif_${Date.now()}_${rm.id}`,
          senderId: targetLandlordId,
          senderName: `Chủ trọ ${getLandlordName()}`,
          receiverId: tenant.id,
          landlordId: targetLandlordId,
          type: 'invoice_ready',
          title: `Hóa đơn mới: Kỳ ${monthYear} - ${rm.roomNumber}`,
          message: `Hóa đơn đã được phát hành với tổng tiền ${total.toLocaleString('vi-VN')} đ. ${extraFee > 0 ? `(Gồm phí phát sinh: ${extraFeeReason} - ${extraFee.toLocaleString('vi-VN')} đ)` : ''}`,
          timestamp: 'Vừa xong',
          isRead: false,
          priority: 'high',
        };
        setNotifications((prev) => [notif, ...prev]);
        saveNotificationToFirestore(notif);
      }
    });
  };

  // 7. AI Batch Invoices Generator
  const generateAIInvoicesBatch = () => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (settings.landlordId || 'main');
    const monthYear = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied');
    let totalSum = 0;

    const newInvoices: Invoice[] = occupiedRooms.map((rm) => {
      const tenant = users.find((u) => u.id === rm.currentTenantId);
      const contract = contracts.find((c) => c.roomId === rm.id && c.status === 'active');
      const tel = telemetry[rm.id];

      const isPrepaid = (contract?.prepaidMonthsRemaining || 0) > 0;
      const rent = isPrepaid ? 0 : rm.basePrice;

      const elecUsed = Math.floor(110 + Math.random() * 45);
      const waterUsed = Math.floor(6 + Math.random() * 5);
      const elecTotal = elecUsed * settings.electricityRate;
      const waterTotal = waterUsed * settings.waterRate;
      const total = rent + elecTotal + waterTotal + settings.garbageFee + settings.internetFee + settings.serviceFee;

      totalSum += total;

      return {
        id: `inv_ai_${Date.now()}_${rm.id}`,
        invoiceCode: `AI-${monthYear.replace('/', '')}-${rm.roomNumber.replace(/\D/g, '')}`,
        landlordId: targetLandlordId,
        tenantId: tenant?.id || 'user_tenant_1',
        tenantName: tenant?.name || 'Khách thuê',
        roomId: rm.id,
        roomNumber: rm.roomNumber,
        monthYear,
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rentAmount: rent,
        isRentPrepaid: isPrepaid,
        electricityStart: Math.round((tel?.currentKwh || 2000) - elecUsed),
        electricityEnd: Math.round(tel?.currentKwh || 2000),
        electricityUsed: elecUsed,
        electricityRate: settings.electricityRate,
        electricityTotal: elecTotal,
        waterStart: Math.round((tel?.currentWaterM3 || 100) - waterUsed),
        waterEnd: Math.round(tel?.currentWaterM3 || 100),
        waterUsed: waterUsed,
        waterRate: settings.waterRate,
        waterTotal: waterTotal,
        garbageFee: settings.garbageFee,
        internetFee: settings.internetFee,
        serviceFee: settings.serviceFee,
        extraFee: 0,
        totalAmount: total,
        status: 'pending',
        bankInfo: {
          bankCode: settings.bankCode,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          accountName: settings.accountName,
          transferContent: `HG ${rm.roomNumber.replace(/\s+/g, '')} T${monthYear.replace('/', '')}`,
        },
        aiGenerated: true,
        aiNote: `AI đã tổng hợp từ đồng hồ đo IoT: Điện ${elecUsed} kWh, Nước ${waterUsed} m³. ${isPrepaid ? 'Khách đã trả trước tiền phòng.' : ''}`,
      };
    });

    setInvoices((prev) => [...newInvoices, ...prev]);
    newInvoices.forEach((inv) => saveInvoiceToFirestore(inv));

    // Send broadcast to landlord and tenants
    broadcastNotice(
      `Hệ thống AI vừa lập ${occupiedRooms.length} hóa đơn kỳ ${monthYear}`,
      `Tổng giá trị hóa đơn xuất là ${totalSum.toLocaleString('vi-VN')} đ. Đã gửi thông báo thanh toán và mã VietQR tới từng phòng.`,
      'normal'
    );

    return { count: occupiedRooms.length, totalSum };
  };

  // 8. Pay Invoice (Single month or Multi-month Prepayment)
  const payInvoice = (invoiceId: string, prepaidMonths = 1) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const isMultiMonth = prepaidMonths > 1;
    const targetLandlordId = inv.landlordId || (currentUser.role === 'tenant' ? currentUser.landlordId : undefined) || settings.landlordId;

    const updatedInv: Invoice = {
      ...inv,
      status: 'paid',
      paidAt: new Date().toLocaleString('vi-VN'),
      paymentMethod: 'vietqr',
      transactionRef: `FT${Date.now().toString().slice(-10)}`,
      prepaidMonthsPaidCount: prepaidMonths,
    };

    setInvoices((prev) =>
      prev.map((item) => (item.id === invoiceId ? updatedInv : item))
    );
    saveInvoiceToFirestore(updatedInv);

    // If multi-month prepaid, update contract prepaid months
    if (isMultiMonth) {
      const activeContract = contracts.find((c) => c.roomId === inv.roomId && c.status === 'active');
      if (activeContract) {
        const updatedContract: Contract = {
          ...activeContract,
          prepaidMonthsRemaining: (activeContract.prepaidMonthsRemaining || 0) + (prepaidMonths - 1),
          prepaidUntil: new Date(Date.now() + prepaidMonths * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        };
        saveContractToFirestore(updatedContract);
      }

      setContracts((prev) =>
        prev.map((c) =>
          c.roomId === inv.roomId && c.status === 'active'
            ? {
                ...c,
                prepaidMonthsRemaining: (c.prepaidMonthsRemaining || 0) + (prepaidMonths - 1),
                prepaidUntil: new Date(Date.now() + prepaidMonths * 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
              }
            : c
        )
      );

      // Notify Landlord about multi-month prepayment
      const prepayNotice: AppNotification = {
        id: `notif_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: targetLandlordId,
        landlordId: targetLandlordId,
        type: 'prepayment_notice',
        title: 'Khách thanh toán trước tiền phòng nhiều tháng',
        message: `Người thuê ${inv.tenantName} (${inv.roomNumber}) đã đóng tiền phòng trước ${prepaidMonths} tháng. Hệ thống đã ghi nhận và sẽ tự động miễn tính tiền phòng trong các kỳ tới (chỉ xuất hóa đơn điện/nước/sinh hoạt).`,
        timestamp: 'Vừa xong',
        isRead: false,
        priority: 'high',
      };
      setNotifications((prev) => [prepayNotice, ...prev]);
      saveNotificationToFirestore(prepayNotice);
    } else {
      // Regular payment notice to landlord
      const payNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: targetLandlordId,
        landlordId: targetLandlordId,
        type: 'payment_received',
        title: 'Khách thuê đã chuyển khoản thanh toán',
        message: `Khách thuê ${inv.tenantName} (${inv.roomNumber}) đã thanh toán thành công hóa đơn ${inv.invoiceCode} số tiền ${inv.totalAmount.toLocaleString('vi-VN')} đ qua VietQR. Vui lòng bấm xác nhận.`,
        timestamp: 'Vừa xong',
        isRead: false,
        priority: 'normal',
      };
      setNotifications((prev) => [payNotif, ...prev]);
      saveNotificationToFirestore(payNotif);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch (e) {
      // ignore in test env
    }
  };

  const confirmInvoicePayment = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      saveInvoiceToFirestore({ ...inv, status: 'verified_by_host' });
    }
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'verified_by_host' } : i))
    );
  };

  // 9. Smart Security & Remote Locks
  const addSecurityLog = (log: Omit<SecurityEventLog, 'id' | 'timestamp' | 'landlordId'>) => {
    const targetLandlordId = currentUser.role === 'landlord' ? currentUser.id : (currentUser.landlordId || settings.landlordId || 'main');
    const newLog: SecurityEventLog = {
      ...log,
      id: `sec_${Date.now()}`,
      landlordId: targetLandlordId,
      timestamp: new Date().toLocaleString('vi-VN'),
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    saveSecurityLogToFirestore(newLog);
  };

  const toggleMainGate = (targetState?: 'locked' | 'unlocked') => {
    const nextState = targetState || (settings.mainGateState === 'locked' ? 'unlocked' : 'locked');
    const updatedSettings = { ...settings, mainGateState: nextState };
    setSettings(updatedSettings);
    saveSettingsToFirestore(updatedSettings);

    addSecurityLog({
      targetType: 'main_gate',
      targetLabel: 'Cổng chính dãy trọ',
      action: nextState === 'unlocked' ? 'unlock_remote' : 'lock_remote',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `Điều khiển ${nextState === 'unlocked' ? 'Mở cổng' : 'Khóa cổng'} từ xa qua Smart Hub.`,
    });
  };

  const updateMainGateSchedule = (enabled: boolean, lockTime: string, unlockTime: string) => {
    const updatedSettings = {
      ...settings,
      autoLockEnabled: enabled,
      autoLockTime: lockTime,
      autoUnlockTime: unlockTime,
    };
    setSettings(updatedSettings);
    saveSettingsToFirestore(updatedSettings);

    addSecurityLog({
      targetType: 'main_gate',
      targetLabel: 'Cổng chính dãy trọ',
      action: 'auto_schedule',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `Cài đặt lịch tự động khóa cổng: ${enabled ? `Khóa lúc ${lockTime} - Mở lúc ${unlockTime}` : 'Tắt tự động khóa'}.`,
    });
  };

  const changeMainGatePIN = (newPin: string) => {
    const updatedSettings = { ...settings, mainGatePasscode: newPin };
    setSettings(updatedSettings);
    saveSettingsToFirestore(updatedSettings);

    addSecurityLog({
      targetType: 'main_gate',
      targetLabel: 'Cổng chính dãy trọ',
      action: 'pin_change',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `Đã đổi mật khẩu cổng chính thành [${newPin}].`,
    });

    broadcastNotice(
      'Thông báo: Cập nhật mật khẩu cổng chính',
      `Chủ nhà đã cập nhật mật khẩu mới cho cổng chính dãy trọ. Mật khẩu mới: ${newPin}. Quý khách vui lòng ghi nhớ bảo mật.`,
      'high'
    );
  };

  const toggleRoomDoor = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom) {
      const nextState = targetRoom.doorLockState === 'locked' ? 'unlocked' : 'locked';
      saveRoomToFirestore({ ...targetRoom, doorLockState: nextState });
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const nextState = r.doorLockState === 'locked' ? 'unlocked' : 'locked';
          addSecurityLog({
            targetType: 'room_door',
            targetLabel: r.roomNumber,
            action: nextState === 'unlocked' ? 'unlock_remote' : 'lock_remote',
            performedBy: currentUser.name,
            role: currentUser.role,
            success: true,
            note: `${currentUser.name} điều khiển ${nextState === 'unlocked' ? 'Mở' : 'Khóa'} cửa phòng.`,
          });
          return { ...r, doorLockState: nextState };
        }
        return r;
      })
    );
  };

  const changeRoomDoorPIN = (roomId: string, newPin: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      saveRoomToFirestore({ ...room, doorPasscode: newPin });
    }

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, doorPasscode: newPin } : r))
    );

    addSecurityLog({
      targetType: 'room_door',
      targetLabel: room?.roomNumber || `Phòng ${roomId}`,
      action: 'pin_change',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `Đã thay đổi mã PIN khóa cửa phòng thành [${newPin}].`,
    });
  };

  const triggerEmergencyAlarm = (reason: string) => {
    setSettings((prev) => ({
      ...prev,
      emergencyAlarmActive: true,
      emergencyAlarmReason: reason,
    }));

    addSecurityLog({
      targetType: 'main_gate',
      targetLabel: 'Toàn bộ dãy trọ',
      action: 'emergency_alarm',
      performedBy: currentUser.name,
      role: currentUser.role,
      success: true,
      note: `KÍCH HOẠT BÁO ĐỘNG KHẨN CẤP: ${reason}`,
    });

    broadcastNotice(
      '🚨 BÁO ĐỘNG AN NINH KHẨN CẤP TỪ XA!',
      `Cảnh báo khẩn từ Chủ nhà: ${reason}. Đề nghị toàn thể quý khách ở trong phòng an toàn, kiểm tra cửa nẻo hoặc liên hệ quản lý ngay.`,
      'urgent'
    );
  };

  const dismissEmergencyAlarm = () => {
    setSettings((prev) => ({
      ...prev,
      emergencyAlarmActive: false,
      emergencyAlarmReason: undefined,
    }));
  };

  // 10. Issues / Maintenance Tickets
  const createIssue = (data: {
    category: IssueTicket['category'];
    title: string;
    description: string;
    urgency: IssueTicket['urgency'];
    photos?: string[];
  }) => {
    const room = rooms.find((r) => r.id === currentUser.roomId) || rooms[0] || { id: 'room_custom', roomNumber: 'Phòng thuê' };
    const targetLandlordId = currentUser.landlordId || (room as Room).landlordId || settings.landlordId || 'main';
    const newIssue: IssueTicket = {
      id: `issue_${Date.now()}`,
      ticketCode: `SC-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      landlordId: targetLandlordId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      category: data.category,
      title: data.title,
      description: data.description,
      urgency: data.urgency,
      photos: data.photos || ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80'],
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setIssues((prev) => [newIssue, ...prev]);
    saveIssueToFirestore(newIssue);

    // Send notification to landlord
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: targetLandlordId,
      landlordId: targetLandlordId,
      type: 'maintenance',
      title: `Báo cáo sự cố mới: ${room.roomNumber}`,
      message: `${currentUser.name} báo cáo: ${data.title} (Mức độ: ${data.urgency === 'critical' ? 'Khẩn cấp' : data.urgency === 'high' ? 'Cao' : 'Bình thường'}).`,
      timestamp: 'Vừa xong',
      isRead: false,
      priority: data.urgency === 'critical' || data.urgency === 'high' ? 'high' : 'normal',
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToFirestore(notif);
  };

  const updateIssueStatus = (issueId: string, status: IssueTicket['status'], landlordNote?: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      const updatedIssue = {
        ...issue,
        status,
        landlordNote: landlordNote || issue.landlordNote,
        resolvedAt: status === 'resolved' ? new Date().toLocaleString('vi-VN') : undefined,
      };
      saveIssueToFirestore(updatedIssue);
    }

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status,
              landlordNote: landlordNote || i.landlordNote,
              resolvedAt: status === 'resolved' ? new Date().toLocaleString('vi-VN') : undefined,
            }
          : i
      )
    );

    if (issue) {
      const targetLandlordId = issue.landlordId || (currentUser.role === 'landlord' ? currentUser.id : settings.landlordId);
      const statusText = status === 'resolved' ? 'Đã xử lý khắc phục xong' : status === 'in_progress' ? 'Đang tiến hành sửa chữa' : 'Đã tiếp nhận';
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        senderId: targetLandlordId,
        senderName: `Chủ trọ ${getLandlordName()}`,
        receiverId: issue.tenantId,
        landlordId: targetLandlordId,
        type: 'maintenance',
        title: `Cập nhật xử lý sự cố [${issue.ticketCode}]`,
        message: `Chủ nhà đã cập nhật trạng thái: ${statusText}. ${landlordNote ? `Ghi chú: ${landlordNote}` : ''}`,
        timestamp: 'Vừa xong',
        isRead: false,
        priority: 'normal',
      };
      setNotifications((prev) => [notif, ...prev]);
      saveNotificationToFirestore(notif);
    }
  };

  // 11. Admin & System Management
  const toggleUserLock = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      saveUserToFirestore({ ...targetUser, status: targetUser.status === 'locked' ? 'active' : 'locked' });
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'locked' ? 'active' : 'locked' }
          : u
      )
    );
  };

  const deleteUser = (userId: string) => {
    if (userId === 'admin_root') return;

    const targetUser = users.find((u) => u.id === userId);

    // 1. Delete user from Firestore
    deleteUserFromFirestore(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // 2. If the deleted user is the current active session, kick out immediately
    if (currentUser.id === userId) {
      setIsAuthenticated(false);
      setCurrentUser(DEFAULT_EMPTY_USER);
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
      localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'false');
    }

    // 3. Complete cleanup if user is a Landlord
    if (!targetUser || targetUser.role === 'landlord') {
      // Clean up landlord settings & features
      deleteDoc(doc(db, 'settings', userId)).catch(() => {});
      deleteDoc(doc(db, 'features', userId)).catch(() => {});
      localStorage.removeItem(`${STORAGE_KEY}_settings_${userId}`);
      localStorage.removeItem(`${STORAGE_KEY}_features_${userId}`);

      // Delete all rooms owned by this landlord
      rooms.filter((r) => r.landlordId === userId).forEach((r) => {
        deleteDoc(doc(db, 'rooms', r.id)).catch(() => {});
      });
      setRooms((prev) => prev.filter((r) => r.landlordId !== userId));

      // Delete all contracts of this landlord
      contracts.filter((c) => c.landlordId === userId).forEach((c) => {
        deleteDoc(doc(db, 'contracts', c.id)).catch(() => {});
      });
      setContracts((prev) => prev.filter((c) => c.landlordId !== userId));

      // Delete all invoices of this landlord
      invoices.filter((inv) => inv.landlordId === userId).forEach((inv) => {
        deleteDoc(doc(db, 'invoices', inv.id)).catch(() => {});
      });
      setInvoices((prev) => prev.filter((inv) => inv.landlordId !== userId));

      // Delete all issues of this landlord
      issues.filter((issue) => issue.landlordId === userId).forEach((issue) => {
        deleteDoc(doc(db, 'issues', issue.id)).catch(() => {});
      });
      setIssues((prev) => prev.filter((issue) => issue.landlordId !== userId));

      // Delete all join requests of this landlord
      joinRequests.filter((j) => j.landlordId === userId).forEach((j) => {
        deleteDoc(doc(db, 'joinRequests', j.id)).catch(() => {});
      });
      setJoinRequests((prev) => prev.filter((j) => j.landlordId !== userId));

      // Delete all notifications belonging to this landlord
      notifications.filter((n) => n.landlordId === userId || n.senderId === userId || n.receiverId === userId).forEach((n) => {
        deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
      });
      setNotifications((prev) => prev.filter((n) => n.landlordId !== userId && n.senderId !== userId && n.receiverId !== userId));

      // Delete all security logs of this landlord
      securityLogs.filter((s) => s.landlordId === userId).forEach((s) => {
        deleteDoc(doc(db, 'securityLogs', s.id)).catch(() => {});
      });
      setSecurityLogs((prev) => prev.filter((s) => s.landlordId !== userId));

      // Unassign any tenants linked to this landlord
      setUsers((prev) =>
        prev.map((u) => {
          if (u.landlordId === userId) {
            const updated = { ...u, landlordId: undefined, roomId: undefined, roomName: undefined };
            saveUserToFirestore(updated);
            return updated;
          }
          return u;
        })
      );
    }

    // 4. Complete cleanup if user is a Tenant
    if (!targetUser || targetUser.role === 'tenant') {
      const userPhone = targetUser?.phone;

      // Free up any rooms occupied by this tenant
      setRooms((prev) =>
        prev.map((r) => {
          if (r.currentTenantId === userId || (userPhone && r.currentTenantPhone === userPhone)) {
            const updated: Room = {
              ...r,
              currentTenantId: undefined,
              currentTenantName: undefined,
              currentTenantPhone: undefined,
              status: 'available',
            };
            saveRoomToFirestore(updated);
            return updated;
          }
          return r;
        })
      );

      // Delete all contracts of this tenant
      contracts.filter((c) => c.tenantId === userId || (userPhone && c.tenantPhone === userPhone)).forEach((c) => {
        deleteDoc(doc(db, 'contracts', c.id)).catch(() => {});
      });
      setContracts((prev) => prev.filter((c) => c.tenantId !== userId && (!userPhone || c.tenantPhone !== userPhone)));

      // Delete all invoices of this tenant
      invoices.filter((inv) => inv.tenantId === userId).forEach((inv) => {
        deleteDoc(doc(db, 'invoices', inv.id)).catch(() => {});
      });
      setInvoices((prev) => prev.filter((inv) => inv.tenantId !== userId));

      // Delete all issues created by this tenant
      issues.filter((issue) => issue.tenantId === userId).forEach((issue) => {
        deleteDoc(doc(db, 'issues', issue.id)).catch(() => {});
      });
      setIssues((prev) => prev.filter((issue) => issue.tenantId !== userId));

      // Delete all join requests by this tenant
      joinRequests.filter((j) => j.tenantId === userId).forEach((j) => {
        deleteDoc(doc(db, 'joinRequests', j.id)).catch(() => {});
      });
      setJoinRequests((prev) => prev.filter((j) => j.tenantId !== userId));

      // Delete all notifications for/from this tenant
      notifications.filter((n) => n.receiverId === userId || n.senderId === userId).forEach((n) => {
        deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
      });
      setNotifications((prev) => prev.filter((n) => n.receiverId !== userId && n.senderId !== userId));

      // Delete all complaints created by this tenant
      complaints.filter((cp) => cp.tenantId === userId).forEach((cp) => {
        deleteDoc(doc(db, 'complaints', cp.id)).catch(() => {});
      });
      setComplaints((prev) => prev.filter((cp) => cp.tenantId !== userId));
    }
  };

  const deleteAllNonAdminUsers = () => {
    users.forEach((u) => {
      if (u.role !== 'admin' && u.id !== 'admin_root') {
        deleteUserFromFirestore(u.id);
      }
    });

    rooms.forEach((r) => {
      deleteDoc(doc(db, 'rooms', r.id)).catch(() => {});
    });

    joinRequests.forEach((j) => {
      deleteDoc(doc(db, 'joinRequests', j.id)).catch(() => {});
    });

    contracts.forEach((c) => {
      deleteDoc(doc(db, 'contracts', c.id)).catch(() => {});
    });

    invoices.forEach((inv) => {
      deleteDoc(doc(db, 'invoices', inv.id)).catch(() => {});
    });

    const adminOnlyUsers = users.filter((u) => u.role === 'admin' || u.id === 'admin_root');
    const finalUsers = adminOnlyUsers.length > 0 ? adminOnlyUsers : [ADMIN_USER];

    setUsers(finalUsers);
    setRooms([]);
    setContracts([]);
    setInvoices([]);
    setIssues([]);
    setJoinRequests([]);
    setNotifications([]);

    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(finalUsers));
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_join_requests`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify([]));
  };

  const regenerateHostCode = (targetLandlordId?: string) => {
    const newCode = generateRandomHostCode();
    const targetId = targetLandlordId || (currentUser.role === 'landlord' ? currentUser.id : settings.landlordId);

    setSettings((prev) => {
      const updated = { ...prev, hostCode: newCode };
      saveSettingsToFirestore(updated);
      return updated;
    });

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetId || (u.role === 'landlord' && (targetLandlordId ? u.id === targetLandlordId : u.id === currentUser.id))) {
          const updatedUser = { ...u, hostCode: newCode };
          saveUserToFirestore(updatedUser);
          if (currentUser.id === u.id) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );

    return newCode;
  };

  const submitComplaint = (type: ComplaintReport['type'], title: string, content: string) => {
    const newComp: ComplaintReport = {
      id: `comp_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      targetLandlordId: currentUser.landlordId || settings.landlordId,
      type,
      title,
      content,
      status: 'open',
      createdAt: new Date().toLocaleString('vi-VN'),
    };
    setComplaints((prev) => [newComp, ...prev]);
    saveComplaintToFirestore(newComp);

    // Notify Admin
    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: 'admin',
      type: 'general',
      title: 'Khiếu nại / Góp ý mới từ người dùng',
      message: `${currentUser.name} (${currentUser.role === 'tenant' ? 'Khách thuê' : 'Chủ trọ'}) gửi phản ánh: ${title}`,
      timestamp: 'Vừa xong',
      isRead: false,
      priority: 'high',
    };
    setNotifications((prev) => [adminNotif, ...prev]);
    saveNotificationToFirestore(adminNotif);
  };

  const updateFeatureFlags = (flags: Partial<SystemFeatureFlags>, targetLandlordId?: string) => {
    setSettings((prev) => {
      const landlordKey = targetLandlordId || prev.landlordId || 'global';
      const existingMap = prev.landlordFeatureFlags || {};
      const currentLandlordFlags = existingMap[landlordKey] || prev.featureFlags || DEFAULT_FEATURE_FLAGS;
      
      const updatedLandlordFlags: SystemFeatureFlags = {
        ...currentLandlordFlags,
        ...flags,
      };

      const updatedMap = {
        ...existingMap,
        [landlordKey]: updatedLandlordFlags,
      };

      const isCurrentLandlord = !targetLandlordId || targetLandlordId === prev.landlordId || targetLandlordId === currentUser.id;

      const updatedSettings: LandlordSettings = {
        ...prev,
        featureFlags: isCurrentLandlord ? updatedLandlordFlags : (prev.featureFlags || updatedLandlordFlags),
        landlordFeatureFlags: updatedMap,
      };

      saveSettingsToFirestore(updatedSettings);
      return updatedSettings;
    });
  };

  const getFeatureFlagsForLandlord = (landlordId?: string): SystemFeatureFlags => {
    if (!landlordId) {
      return settings.featureFlags || DEFAULT_FEATURE_FLAGS;
    }
    return settings.landlordFeatureFlags?.[landlordId] || settings.featureFlags || DEFAULT_FEATURE_FLAGS;
  };

  const resolveComplaint = (complaintId: string, response: string) => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (comp) {
      saveComplaintToFirestore({ ...comp, status: 'resolved', adminResponse: response });
    }
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status: 'resolved', adminResponse: response }
          : c
      )
    );
  };

  const issueLicense = (landlordId: string, plan: SystemLicense['plan'], maxRooms: number) => {
    const landlord = users.find((u) => u.id === landlordId);
    const newLic: SystemLicense = {
      id: `lic_${Date.now()}`,
      landlordId,
      landlordName: landlord?.name || 'Chủ trọ',
      plan,
      maxRooms,
      status: 'active',
      activationKey: `SMART-RENT-${plan.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricePaid: plan === 'Đại đô thị (Enterprise)' ? 4900000 : plan === 'Chuyên nghiệp (Pro)' ? 2400000 : 990000,
    };
    setLicenses((prev) => [newLic, ...prev]);
    saveLicenseToFirestore(newLic);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      setUsers((uList) => uList.map((u) => (u.id === prev.id ? updated : u)));
      saveUserToFirestore(updated);

      if (prev.role === 'landlord' && (updates.houseName || updates.houseAddress)) {
        const newSettings = {
          ...settings,
          ...(updates.houseName ? { houseName: updates.houseName.trim() } : {}),
          ...(updates.houseAddress ? { houseAddress: updates.houseAddress.trim() } : {}),
        };
        setSettings(newSettings);
        localStorage.setItem(`${STORAGE_KEY}_settings_${prev.id}`, JSON.stringify(newSettings));
        saveSettingsToFirestore(newSettings);
      }

      return updated;
    });
  };

  // Reset to initial clean state
  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(DEFAULT_EMPTY_USER);
    setIsAuthenticated(false);
    setSettings(INITIAL_LANDLORD_SETTINGS);
    setRooms(INITIAL_ROOMS);
    setContracts(INITIAL_CONTRACTS);
    setInvoices(INITIAL_INVOICES);
    setIssues(INITIAL_ISSUES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setJoinRequests(INITIAL_JOIN_REQUESTS);
    setTelemetry(INITIAL_TELEMETRY);
    setLicenses(INITIAL_LICENSES);
    setComplaints(INITIAL_COMPLAINTS);
    setSecurityLogs(INITIAL_SECURITY_LOGS);

    INITIAL_USERS.forEach((u) => setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u)));
    INITIAL_ROOMS.forEach((r) => setDoc(doc(db, 'rooms', r.id), sanitizeForFirestore(r)));
    INITIAL_CONTRACTS.forEach((c) => setDoc(doc(db, 'contracts', c.id), sanitizeForFirestore(c)));
    INITIAL_INVOICES.forEach((i) => setDoc(doc(db, 'invoices', i.id), sanitizeForFirestore(i)));
    INITIAL_ISSUES.forEach((i) => setDoc(doc(db, 'issues', i.id), sanitizeForFirestore(i)));
    INITIAL_NOTIFICATIONS.forEach((n) => setDoc(doc(db, 'notifications', n.id), sanitizeForFirestore(n)));
    INITIAL_JOIN_REQUESTS.forEach((j) => setDoc(doc(db, 'joinRequests', j.id), sanitizeForFirestore(j)));
    INITIAL_LICENSES.forEach((l) => setDoc(doc(db, 'licenses', l.id), sanitizeForFirestore(l)));
    INITIAL_COMPLAINTS.forEach((c) => setDoc(doc(db, 'complaints', c.id), sanitizeForFirestore(c)));
    INITIAL_SECURITY_LOGS.forEach((s) => setDoc(doc(db, 'securityLogs', s.id), sanitizeForFirestore(s)));
    setDoc(doc(db, 'settings', 'main'), sanitizeForFirestore(INITIAL_LANDLORD_SETTINGS));
    setDoc(doc(db, 'telemetry', 'main'), sanitizeForFirestore(INITIAL_TELEMETRY));
  };

  // Dynamic visual/data isolation per landlord / tenant role to keep views clean and perfect
  const filteredUsers = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return users.filter((u) => u.role === 'admin' || u.id === currentUser.id || u.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return users.filter((u) => u.role === 'admin' || u.id === currentUser.id || u.id === currentUser.landlordId || u.landlordId === currentUser.landlordId);
    }
    return users;
  }, [users, currentUser]);

  const filteredRooms = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return rooms.filter((r) => r.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return rooms.filter((r) => r.landlordId === currentUser.landlordId);
    }
    return rooms;
  }, [rooms, currentUser]);

  const filteredContracts = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return contracts.filter((c) => c.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return contracts.filter((c) => c.tenantId === currentUser.id);
    }
    return contracts;
  }, [contracts, currentUser]);

  const filteredInvoices = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return invoices.filter((i) => i.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return invoices.filter((i) => i.roomId === currentUser.roomId);
    }
    return invoices;
  }, [invoices, currentUser]);

  const filteredIssues = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return issues.filter((i) => i.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return issues.filter((i) => i.tenantId === currentUser.id);
    }
    return issues;
  }, [issues, currentUser]);

  const filteredJoinRequests = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return joinRequests.filter((j) => j.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return joinRequests.filter((j) => j.tenantId === currentUser.id);
    }
    return joinRequests;
  }, [joinRequests, currentUser]);

  const filteredComplaints = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return complaints.filter((c) => c.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return complaints.filter((c) => c.tenantId === currentUser.id);
    }
    return complaints;
  }, [complaints, currentUser]);

  const filteredSecurityLogs = React.useMemo(() => {
    if (currentUser.role === 'landlord') {
      return securityLogs.filter((s) => s.landlordId === currentUser.id);
    }
    if (currentUser.role === 'tenant') {
      return securityLogs.filter((s) => s.roomId === currentUser.roomId);
    }
    return securityLogs;
  }, [securityLogs, currentUser]);

  const currentHouseName = React.useMemo(() => {
    if (currentUser.role === 'admin') {
      return 'Quản Trị Hệ Thống';
    }
    if (currentUser.role === 'landlord') {
      if (settings.houseName && settings.houseName !== 'Dãy Trọ Của Tôi') {
        return settings.houseName;
      }
      return currentUser.houseName || (currentUser.name ? `Dãy Trọ ${currentUser.name}` : 'Dãy Trọ');
    }
    if (currentUser.role === 'tenant') {
      if (!currentUser.landlordId) {
        const pendingReq = joinRequests.find(
          (r) => (r.tenantId === currentUser.id || (currentUser.phone && r.tenantPhone === currentUser.phone)) && r.status === 'pending'
        );
        if (pendingReq && pendingReq.landlordId) {
          const l = users.find((u) => u.id === pendingReq.landlordId);
          if (settings.houseName && settings.houseName !== 'Dãy Trọ Của Tôi') {
            return settings.houseName;
          }
          return l?.houseName || (l?.name ? `Dãy Trọ ${l.name}` : 'Dãy Trọ Đang Chờ Duyệt');
        }
        return 'Chưa kết nối trọ';
      }
      if (settings.houseName && settings.houseName !== 'Dãy Trọ Của Tôi') {
        return settings.houseName;
      }
      const landlord = users.find((u) => u.id === currentUser.landlordId);
      return landlord?.houseName || (landlord?.name ? `Dãy Trọ ${landlord.name}` : 'Dãy Trọ');
    }
    return settings.houseName || 'Dãy Trọ';
  }, [currentUser, settings.houseName, joinRequests, users]);

  return (
    <RentalContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAsDemoUser,
        registerUser,
        logout,
        currentUser,
        setCurrentUser,
        users: filteredUsers,
        switchUserById,
        switchRoleQuick,
        currentHouseName,
        settings,
        rooms: filteredRooms,
        contracts: filteredContracts,
        invoices: filteredInvoices,
        issues: filteredIssues,
        notifications: userNotifications,
        joinRequests: filteredJoinRequests,
        telemetry,
        licenses,
        complaints: filteredComplaints,
        securityLogs: filteredSecurityLogs,
        unreadNotifsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitHostCode,
        approveJoinRequest,
        rejectJoinRequest,
        removeTenantFromRoom,
        checkoutTenant,
        syncToGoogleSheet,
        syncAllTenantsToGoogleSheet,
        testGoogleSheetConnection,
        updateGoogleSheetSettings,
        addRoom,
        updateRoom,
        deleteRoom,
        updatePricing,
        broadcastNotice,
        updateContract,
        createContractCustom,
        deleteContract,
        createManualInvoice,
        generateAIInvoicesBatch,
        payInvoice,
        confirmInvoicePayment,
        verifyPaymentByHost: confirmInvoicePayment,
        toggleMainGate,
        updateMainGateSchedule,
        changeMainGatePIN,
        toggleRoomDoor,
        changeRoomDoorPIN,
        triggerEmergencyAlarm,
        dismissEmergencyAlarm,
        createIssue,
        updateIssueStatus,
        updateFeatureFlags,
        getFeatureFlagsForLandlord,
        toggleUserLock,
        deleteUser,
        deleteAllNonAdminUsers,
        regenerateHostCode,
        submitComplaint,
        resolveComplaint,
        issueLicense,
        updateUserProfile,
        resetAllData,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};
