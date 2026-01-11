
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, isOpen, onClose, onLogout }) => {
  const NavItem = ({ view, label, icon, roles }: { view: string, label: string, icon: any, roles?: UserRole[] }) => {
    if (roles && !roles.includes(user.role)) return null;
    
    const active = currentView === view;
    return (
      <button
        onClick={() => { setView(view); onClose(); }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  const overlayClass = isOpen ? 'fixed inset-0 bg-black/50 z-50' : 'hidden';
  const sidebarClass = `fixed md:static inset-y-0 left-0 w-64 bg-white border-r p-6 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'Business Owner';
      case 'MANAGER': return 'Manager Portal';
      case 'SALES_PERSON': return 'Sales Portal';
      default: return role;
    }
  };

  return (
    <>
      <div className={overlayClass} onClick={onClose}></div>
      <div className={sidebarClass}>
        <div className="mb-10 px-2">
          <h1 className="text-3xl font-black text-blue-600 tracking-tighter">BizTrack</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">your business organized</p>
        </div>

        <nav className="space-y-2">
          <NavItem 
            view="DASHBOARD" 
            label="Dashboard" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} 
          />
          <NavItem 
            view="TRANSACTIONS" 
            label="Record Sale" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} 
          />
          <NavItem 
            view="STOCK" 
            label="Manage Stock" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>} 
            roles={['OWNER', 'MANAGER']}
          />
          <NavItem 
            view="REPORTS" 
            label="Profit Reports" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} 
            roles={['OWNER', 'MANAGER']}
          />
          <NavItem 
            view="STAFF" 
            label="Staff Approvals" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} 
            roles={['OWNER']}
          />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Logged In</p>
            <p className="font-bold text-gray-800 truncate text-sm">{user.email}</p>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black mt-2 inline-block">
              {getRoleLabel(user.role)}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
