import React from 'react';
import { Home, Users, QrCode, BarChart3, Settings } from 'lucide-react';
import { NavTab, useStore } from '../context/StoreContext';

export const Navbar: React.FC<{ onOpenScanner: () => void }> = ({ onOpenScanner }) => {
  const { activeTab, setActiveTab, lang, employees } = useStore();
  const pendingCount = employees.filter((e) => e.status === 'معلق').length;

  const navItems: { id: NavTab; labelAr: string; labelEn: string; icon: React.ReactNode; isScanner?: boolean }[] = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'customers', labelAr: 'العملاء', labelEn: 'Customers', icon: <Users className="w-5 h-5" /> },
    {
      id: 'scanner',
      labelAr: 'مسح QR',
      labelEn: 'Scan QR',
      icon: <QrCode className="w-6 h-6 text-white" />,
      isScanner: true,
    },
    { id: 'analytics', labelAr: 'إحصائيات', labelEn: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'management', labelAr: 'الإدارة', labelEn: 'Manage', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E4E4E7] backdrop-blur-xl pb-safe">
      <div className="max-w-xl xl:max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-around xl:justify-center xl:gap-9">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          if (item.isScanner) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab('scanner');
                  onOpenScanner();
                }}
                className="flex flex-col items-center -mt-5 group px-1 shrink-0 cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 min-w-[52px] min-h-[52px] rounded-lg bg-[#0D9488] shadow-md flex items-center justify-center transform transition-all duration-200 group-active:scale-95 group-hover:scale-105 border-4 border-white">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0D9488] mt-1 whitespace-nowrap">
                  {lang === 'ar' ? item.labelAr : item.labelEn}
                </span>
              </button>
            );
          }

          const isManageWithPending = item.id === 'management' && pendingCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center py-1 px-1.5 sm:px-2.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive ? 'text-[#0D9488] font-bold' : 'text-[#71717A] hover:text-[#3F4A5A] font-medium'
              }`}
            >
              <div className={`relative p-1 rounded-lg transition-colors ${isActive ? 'bg-[#ECFDF9]' : ''}`}>
                {item.icon}
                {isManageWithPending && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-xs">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 whitespace-nowrap">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
