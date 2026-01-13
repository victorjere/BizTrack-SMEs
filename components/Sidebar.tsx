
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

  const handleFeedback = () => {
    const phoneNumber = '260973934183';
    const message = encodeURIComponent(`Hi, I am sending feedback regarding the BizTrack app (${user.businessName}).`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const showFeedback = user.role === 'OWNER' || user.role === 'MANAGER';

  return (
    <>
      <div className={overlayClass} onClick={onClose}></div>
      <div className={sidebarClass}>
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
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
          </div>

          {/* Bottom Section */}
          <div className="mt-auto space-y-4 pt-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Logged In</p>
              <p className="font-bold text-gray-800 truncate text-sm">{user.email}</p>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black mt-2 inline-block">
                {getRoleLabel(user.role)}
              </span>
            </div>

            {showFeedback && (
              <button 
                onClick={handleFeedback}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-green-700 bg-green-50 hover:bg-green-100 transition border border-green-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Send Feedback</span>
              </button>
            )}

            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>Sign Out</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Powered by NexDigital</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
