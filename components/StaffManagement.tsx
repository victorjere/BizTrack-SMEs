
import React, { useState, useEffect } from 'react';
import { User, UserStatus } from '../types';
import { dbService } from '../services/mockDb';

interface StaffManagementProps {
  currentUser: User;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const all = dbService.getAllUsers();
    setUsers(all.filter(u => u.businessName === currentUser.businessName && u.uid !== currentUser.uid));
  }, [currentUser]);

  const handleStatusChange = (uid: string, status: UserStatus) => {
    dbService.updateUserStatus(uid, status);
    setUsers(dbService.getAllUsers().filter(u => u.businessName === currentUser.businessName && u.uid !== currentUser.uid));
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const approvedUsers = users.filter(u => u.status === 'APPROVED');

  const getRoleLabel = (role: string) => {
    return role === 'MANAGER' ? 'Manager Portal' : 'Sales Person Portal';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff Management</h1>
        <p className="text-gray-500 text-sm mt-1">As OWNER, you must approve all other portal accounts.</p>
      </div>

      {/* Pending Section */}
      <section>
        <h2 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          Pending Requests ({pendingUsers.length})
        </h2>
        
        {pendingUsers.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 text-xs font-bold">
            All portal requests have been handled.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.uid} className="bg-white p-4 rounded-2xl border border-yellow-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center font-black">
                    {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{user.fullName || user.email}</p>
                    <p className="text-[10px] text-gray-400">{user.phoneNumber}</p>
                    <p className="text-[10px] text-yellow-600 font-black uppercase tracking-tighter mt-1">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleStatusChange(user.uid, 'APPROVED')}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange(user.uid, 'REJECTED')}
                    className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Staff */}
      <section>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Authorized Personnel</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
          {approvedUsers.length === 0 ? (
            <p className="p-10 text-center text-gray-400 italic text-xs font-medium">You are the only person with access to {currentUser.businessName}.</p>
          ) : (
            approvedUsers.map(user => (
              <div key={user.uid} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
                    {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{user.fullName || user.email}</p>
                    <p className="text-[10px] text-gray-400">{user.phoneNumber}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter mt-1 inline-block">{getRoleLabel(user.role)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStatusChange(user.uid, 'REJECTED')}
                  className="text-gray-300 hover:text-red-500 p-2 transition"
                  title="Revoke Access"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default StaffManagement;
