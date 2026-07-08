import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  initialCampaigns,
  initialCustomers,
  initialEmployees,
  initialLoyaltyCards,
  initialStoreProfile,
  initialTransactions,
} from '../data/mockData';
import {
  Customer,
  Employee,
  LoyaltyCard,
  PushCampaign,
  StoreProfile,
  Transaction,
} from '../types';

export const getRolePresetPermissions = (role: Employee['role']): Employee['permissions'] => {
  if (role === 'مدير فرع') {
    return {
      canAddPoints: true,
      canRedeemRewards: true,
      canViewAnalytics: true,
      canManageCards: true,
      canManageTeam: true,
      canBroadcastPush: true,
    };
  }
  if (role === 'موظف') {
    return {
      canAddPoints: true,
      canRedeemRewards: false,
      canViewAnalytics: false,
      canManageCards: false,
      canManageTeam: false,
      canBroadcastPush: false,
    };
  }
  return {
    canAddPoints: true,
    canRedeemRewards: true,
    canViewAnalytics: false,
    canManageCards: false,
    canManageTeam: false,
    canBroadcastPush: false,
  };
};

export type NavTab = 'home' | 'customers' | 'scanner' | 'analytics' | 'management';

export interface LoyaltyActionResult {
  success: boolean;
  error?: string;
  requiresPin?: boolean;
  nextAllowedAt?: number;
  transaction?: Transaction;
}

interface StoreContextType {
  storeProfile: StoreProfile;
  setStoreProfile: React.Dispatch<React.SetStateAction<StoreProfile>>;
  loyaltyCards: LoyaltyCard[];
  setLoyaltyCards: React.Dispatch<React.SetStateAction<LoyaltyCard[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  transactions: Transaction[];
  campaigns: PushCampaign[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  // Actions
  addLoyaltyCard: (card: Omit<LoyaltyCard, 'id' | 'createdAt' | 'customersCount'>) => LoyaltyCard;
  updateLoyaltyCard: (card: LoyaltyCard) => void;
  deleteLoyaltyCard: (id: string) => void;
  addPointsToCustomer: (customerId: string, amount: number, note?: string) => LoyaltyActionResult;
  redeemCustomerReward: (customerId: string, rewardId: string, pointsCost: number, rewardTitle: string, pin?: string) => LoyaltyActionResult;
  addCustomer: (name: string, phone: string, cardId: string) => Customer;
  addEmployee: (name: string, role: Employee['role'], phone: string) => Employee;
  resendEmployeeCode: (id: string) => Employee | undefined;
  regenerateEmployeeCode: (id: string) => Employee | undefined;
  approveEmployee: (id: string) => void;
  simulateNewJoinRequest: (role?: Employee['role']) => void;
  updateEmployeeStatus: (id: string, status: Employee['status']) => void;
  currentEmployeeSession: Employee | null;
  loginAsEmployee: (phone: string, code: string) => { success: boolean; error?: string; employee?: Employee };
  logoutEmployee: () => void;
  updateEmployeePermissions: (id: string, permissions: Partial<Employee['permissions']>) => void;
  deleteEmployee: (id: string) => void;
  sendPushNotification: (title: string, message: string, targetCardId: string) => void;
  resetToDemoData: () => void;
  activeCardForPreview: LoyaltyCard | null;
  setActiveCardForPreview: (card: LoyaltyCard | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'loya_app_data_v1';
const DEFAULT_CARD_SECURITY = {
  cashierPinEnabled: true,
  cashierPin: '1234',
  duplicateScanWindowSeconds: 60,
  staffAuditEnabled: true,
};

const withDefaultCardSecurity = (card: LoyaltyCard): LoyaltyCard => ({
  ...card,
  security: {
    ...DEFAULT_CARD_SECURITY,
    ...(card.security || {}),
  },
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(initialStoreProfile);
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>(initialLoyaltyCards);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [campaigns, setCampaigns] = useState<PushCampaign[]>(initialCampaigns);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const savedLang = localStorage.getItem('loya_lang');
    return savedLang === 'en' ? 'en' : 'ar';
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [activeCardForPreview, setActiveCardForPreview] = useState<LoyaltyCard | null>(null);
  const [currentEmployeeSession, setCurrentEmployeeSession] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('loya_emp_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.storeProfile) setStoreProfile(parsed.storeProfile);
        if (parsed.loyaltyCards) setLoyaltyCards(parsed.loyaltyCards.map(withDefaultCardSecurity));
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.campaigns) setCampaigns(parsed.campaigns);
        if (parsed.lang === 'ar' || parsed.lang === 'en') setLang(parsed.lang);
        if (parsed.showOnboarding !== undefined) setShowOnboarding(parsed.showOnboarding);
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        storeProfile,
        loyaltyCards,
        customers,
        employees,
        transactions,
        campaigns,
        lang,
        showOnboarding,
      })
    );
    localStorage.setItem('loya_lang', lang);
  }, [storeProfile, loyaltyCards, customers, employees, transactions, campaigns, lang, showOnboarding]);

  const addLoyaltyCard = (cardData: Omit<LoyaltyCard, 'id' | 'createdAt' | 'customersCount'>) => {
    const newCard: LoyaltyCard = {
      ...cardData,
      id: `card-${Date.now()}`,
      customersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLoyaltyCards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const updateLoyaltyCard = (updatedCard: LoyaltyCard) => {
    setLoyaltyCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  const deleteLoyaltyCard = (id: string) => {
    setLoyaltyCards((prev) => prev.filter((c) => c.id !== id));
  };

  const getActingEmployee = () => currentEmployeeSession || employees.find((e) => e.status === 'نشط') || null;

  const addPointsToCustomer = (customerId: string, amount: number, note?: string): LoyaltyActionResult => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) {
      return {
        success: false,
        error: lang === 'ar' ? 'لم يتم العثور على العميل.' : 'Customer was not found.',
      };
    }

    const targetCard = loyaltyCards.find((card) => card.id === targetCustomer.cardId);
    const security = targetCard?.security;
    const now = Date.now();
    const cooldownMs = (security?.duplicateScanWindowSeconds || 0) * 1000;

    if (amount > 0 && cooldownMs > 0) {
      const recentEarn = transactions.find(
        (tx) =>
          tx.customerId === customerId &&
          tx.cardId === targetCustomer.cardId &&
          (tx.type === 'earn' || tx.type === 'stamp') &&
          tx.createdAtMs &&
          now - tx.createdAtMs < cooldownMs
      );

      if (recentEarn?.createdAtMs) {
        const remainingSeconds = Math.max(1, Math.ceil((recentEarn.createdAtMs + cooldownMs - now) / 1000));
        return {
          success: false,
          nextAllowedAt: recentEarn.createdAtMs + cooldownMs,
          error:
            lang === 'ar'
              ? `تم منع المسح المكرر. انتظر ${remainingSeconds} ثانية قبل الإضافة مرة أخرى.`
              : `Duplicate scan blocked. Wait ${remainingSeconds} seconds before adding again.`,
        };
      }
    }

    const actingEmployee = getActingEmployee();

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const isStamp = c.stampsBalance !== undefined;
          return {
            ...c,
            pointsBalance: Math.max(0, c.pointsBalance + amount),
            stampsBalance: isStamp ? Math.max(0, (c.stampsBalance || 0) + amount) : undefined,
            totalEarned: c.totalEarned + Math.max(amount, 0),
            visits: amount > 0 ? c.visits + 1 : c.visits,
            lastVisit: 'الآن',
          };
        }
        return c;
      })
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      customerId,
      customerName: targetCustomer.name,
      cardId: targetCustomer.cardId,
      date: 'الآن',
      type: targetCustomer.stampsBalance !== undefined ? 'stamp' : 'earn',
      amount,
      note: note || `إضافة ${amount} ${targetCustomer.stampsBalance !== undefined ? 'طابع ختمي' : 'نقطة'}`,
      cashierName: actingEmployee?.name || (lang === 'ar' ? 'مدير النظام' : 'System admin'),
      staffId: security?.staffAuditEnabled ? actingEmployee?.id : undefined,
      staffCode: security?.staffAuditEnabled ? actingEmployee?.authCode : undefined,
      createdAtMs: now,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Trigger confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    return { success: true, transaction: newTx };
  };

  const redeemCustomerReward = (
    customerId: string,
    rewardId: string,
    pointsCost: number,
    rewardTitle: string,
    pin?: string
  ): LoyaltyActionResult => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer || targetCustomer.pointsBalance < pointsCost) {
      return {
        success: false,
        error: lang === 'ar' ? 'رصيد العميل غير كافٍ لصرف هذه المكافأة.' : 'Customer balance is not enough for this reward.',
      };
    }

    const targetCard = loyaltyCards.find((card) => card.id === targetCustomer.cardId);
    const security = targetCard?.security;

    if (security?.cashierPinEnabled && (pin || '').trim() !== security.cashierPin) {
      return {
        success: false,
        requiresPin: true,
        error: lang === 'ar' ? 'رمز الكاشير غير صحيح. أدخل الرمز قبل صرف المكافأة.' : 'Cashier PIN is incorrect. Enter the PIN before redeeming.',
      };
    }

    const actingEmployee = getActingEmployee();
    const now = Date.now();

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const isStamp = c.stampsBalance !== undefined;
          return {
            ...c,
            pointsBalance: c.pointsBalance - pointsCost,
            stampsBalance: isStamp ? Math.max(0, (c.stampsBalance || 0) - pointsCost) : undefined,
            lastVisit: 'الآن',
          };
        }
        return c;
      })
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      customerId,
      customerName: targetCustomer.name,
      cardId: targetCustomer.cardId,
      date: 'الآن',
      type: 'redeem',
      amount: -pointsCost,
      note: `صرف مكافأة: ${rewardTitle}`,
      cashierName: actingEmployee?.name || (lang === 'ar' ? 'مدير النظام' : 'System admin'),
      staffId: security?.staffAuditEnabled ? actingEmployee?.id : undefined,
      staffCode: security?.staffAuditEnabled ? actingEmployee?.authCode : undefined,
      createdAtMs: now,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Big confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FF6B35', '#10B981', '#F59E0B', '#3B82F6'],
    });

    return { success: true, transaction: newTx };
  };

  const addCustomer = (name: string, phone: string, cardId: string) => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      cardId,
      pointsBalance: 10, // welcome points
      totalEarned: 10,
      visits: 1,
      lastVisit: 'الآن',
      walletStatus: 'apple',
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // Update card customers count
    setLoyaltyCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, customersCount: c.customersCount + 1 } : c))
    );

    return newCustomer;
  };

  const addEmployee = (name: string, role: Employee['role'], phone: string): Employee => {
    const randomCode = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      status: 'بانتظار أول تسجيل دخول',
      phone,
      authCode: randomCode,
      failedLoginCount: 0,
      permissions: getRolePresetPermissions(role),
    };
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  };

  const resendEmployeeCode = (id: string): Employee | undefined => {
    return employees.find((e) => e.id === id);
  };

  const regenerateEmployeeCode = (id: string): Employee | undefined => {
    const newCode = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    let targetEmp: Employee | undefined;
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          targetEmp = {
            ...e,
            authCode: newCode,
            failedLoginCount: 0,
            isLocked: false,
          };
          return targetEmp;
        }
        return e;
      })
    );
    if (currentEmployeeSession?.id === id) {
      setCurrentEmployeeSession(null);
      localStorage.removeItem('loya_emp_session');
    }
    return targetEmp || employees.find((e) => e.id === id);
  };

  const approveEmployee = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'نشط',
              permissions: getRolePresetPermissions(e.role),
            }
          : e
      )
    );
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  const simulateNewJoinRequest = (role: Employee['role'] = 'كاشير') => {
    const sampleNames = ['عبدالله المطيري', 'نورة الدوسري', 'ياسر القحطاني', 'ريما الشمري'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomCode = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRequest: Employee = {
      id: `emp-${Date.now()}`,
      name: randomName,
      role,
      status: 'معلق',
      phone: randomPhone,
      authCode: randomCode,
      failedLoginCount: 0,
      permissions: getRolePresetPermissions(role),
    };
    setEmployees((prev) => [newRequest, ...prev]);
  };

  const updateEmployeeStatus = (id: string, status: Employee['status']) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (status === 'معلق' && currentEmployeeSession?.id === id) {
      setCurrentEmployeeSession(null);
      localStorage.removeItem('loya_emp_session');
    }
  };

  const loginAsEmployee = (phone: string, code: string) => {
    const cleanPhone = phone.trim();
    const cleanCode = code.trim().toUpperCase();

    const empIndex = employees.findIndex((e) => (e.phone || '').trim() === cleanPhone);
    if (empIndex === -1) {
      return {
        success: false,
        error: lang === 'ar' ? 'رقم الجوال هذا غير مسجل لأي موظف في النظام' : 'Phone number not registered to any staff member',
      };
    }

    const emp = employees[empIndex];

    if (emp.isLocked || (emp.failedLoginCount && emp.failedLoginCount >= 5)) {
      return {
        success: false,
        error: lang === 'ar' ? 'تم قفل الحساب مؤقتاً لتجاوز 5 محاولات خاطئة. يرجى مراجعة إدارة المنشأة لإصدار كود جديد.' : 'Account locked due to 5 failed code attempts. Contact admin to generate a new code.',
      };
    }

    if ((emp.authCode || '').trim().toUpperCase() !== cleanCode) {
      const newFailCount = (emp.failedLoginCount || 0) + 1;
      const isNowLocked = newFailCount >= 5;
      const failTimestamp = lang === 'ar' ? `الآن (${new Date().toLocaleTimeString('ar-SA')})` : `Now (${new Date().toLocaleTimeString('en-US')})`;

      setEmployees((prev) =>
        prev.map((e) =>
          e.id === emp.id
            ? {
                ...e,
                failedLoginCount: newFailCount,
                lastFailedLogin: failTimestamp,
                isLocked: isNowLocked,
              }
            : e
        )
      );

      return {
        success: false,
        error: isNowLocked
          ? (lang === 'ar' ? 'تم قفل الحساب لتجاوز 5 محاولات خاطئة لكود الدخول.' : 'Account locked after 5 failed code attempts.')
          : (lang === 'ar' ? `كود الدخول غير صحيح. (محاولة فاشلة رقم ${newFailCount} من 5)` : `Invalid access code. (Failed attempt ${newFailCount} of 5)`),
      };
    }

    if (emp.status === 'معلق') {
      return {
        success: false,
        error: lang === 'ar' ? 'تم تعليق وصول هذا الموظف من قِبل إدارة المنشأة' : 'Staff access suspended by store administrator',
      };
    }

    const loginTime = lang === 'ar' ? `الآن (${new Date().toLocaleTimeString('ar-SA')})` : `Now (${new Date().toLocaleTimeString('en-US')})`;
    const newStatus = emp.status === 'بانتظار أول تسجيل دخول' ? 'نشط' : emp.status;

    const loggedInEmp = {
      ...emp,
      status: newStatus as Employee['status'],
      failedLoginCount: 0,
      isLocked: false,
      lastLogin: loginTime,
    };

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id ? loggedInEmp : e
      )
    );

    setCurrentEmployeeSession(loggedInEmp);
    localStorage.setItem('loya_emp_session', JSON.stringify(loggedInEmp));

    return { success: true, employee: loggedInEmp };
  };

  const logoutEmployee = () => {
    setCurrentEmployeeSession(null);
    localStorage.removeItem('loya_emp_session');
  };

  const updateEmployeePermissions = (id: string, permissions: Partial<Employee['permissions']>) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              permissions: { ...e.permissions, ...permissions },
            }
          : e
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const sendPushNotification = (title: string, message: string, targetCardId: string) => {
    const targetCard = loyaltyCards.find((c) => c.id === targetCardId);
    const count = targetCard ? targetCard.customersCount : customers.length;

    const newCamp: PushCampaign = {
      id: `camp-${Date.now()}`,
      title,
      message,
      targetCardId,
      sentAt: 'الآن',
      recipientsCount: count,
    };
    setCampaigns((prev) => [newCamp, ...prev]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.3 },
    });
  };

  const resetToDemoData = () => {
    setStoreProfile(initialStoreProfile);
    setLoyaltyCards(initialLoyaltyCards);
    setCustomers(initialCustomers);
    setEmployees(initialEmployees);
    setTransactions(initialTransactions);
    setCampaigns(initialCampaigns);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StoreContext.Provider
      value={{
        storeProfile,
        setStoreProfile,
        loyaltyCards,
        setLoyaltyCards,
        customers,
        setCustomers,
        employees,
        setEmployees,
        transactions,
        campaigns,
        activeTab,
        setActiveTab,
        lang,
        setLang,
        showOnboarding,
        setShowOnboarding,
        addLoyaltyCard,
        updateLoyaltyCard,
        deleteLoyaltyCard,
        addPointsToCustomer,
        redeemCustomerReward,
        addCustomer,
        addEmployee,
        resendEmployeeCode,
        regenerateEmployeeCode,
        approveEmployee,
        simulateNewJoinRequest,
        updateEmployeeStatus,
        currentEmployeeSession,
        loginAsEmployee,
        logoutEmployee,
        updateEmployeePermissions,
        deleteEmployee,
        sendPushNotification,
        resetToDemoData,
        activeCardForPreview,
        setActiveCardForPreview,
      }}
    >
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`font-sans ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        {children}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
