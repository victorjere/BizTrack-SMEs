
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { dbService } from '../services/mockDb';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  // Login State
  const [loginRole, setLoginRole] = useState<UserRole>('OWNER');
  const [loginBusiness, setLoginBusiness] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SALES_PERSON');
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = dbService.loginUser(loginBusiness, loginEmail, loginPassword, loginRole);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName || !phoneNumber || !email || !businessName || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const newUser: User = {
      uid: Math.random().toString(36).substr(2, 9),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      businessName: businessName.trim(),
      role: isNewBusiness ? 'OWNER' : role,
      tier: 'FREE',
      status: 'PENDING'
    };

    try {
      const registeredUser = dbService.registerUser(newUser, isNewBusiness);
      onLogin(registeredUser);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const roles: { id: UserRole; label: string }[] = [
    { id: 'OWNER', label: 'Owner' },
    { id: 'MANAGER', label: 'Manager' },
    { id: 'SALES_PERSON', label: 'Sales Person' }
  ];

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-blue-600 tracking-tight">BizTrack</h1>
          <p className="text-gray-500 font-medium mt-1 italic">your business organized</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => { setMode('LOGIN'); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${mode === 'LOGIN' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('REGISTER'); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${mode === 'REGISTER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold mb-6">
            {error}
          </div>
        )}

        {mode === 'LOGIN' ? (
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Login As</label>
               <div className="grid grid-cols-3 gap-2">
                 {roles.map(r => (
                   <button
                     key={r.id}
                     type="button"
                     onClick={() => setLoginRole(r.id)}
                     className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition border-2 ${loginRole === r.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                   >
                     {r.label}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Business Name</label>
               <input
                 required
                 type="text"
                 placeholder="e.g. Lusaka Central Mart"
                 className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition"
                 value={loginBusiness}
                 onChange={e => setLoginBusiness(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
               <input
                 required
                 type="email"
                 placeholder="user@gmail.com"
                 className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition"
                 value={loginEmail}
                 onChange={e => setLoginEmail(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password</label>
               <input
                 required
                 type="password"
                 placeholder="••••••••"
                 className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition"
                 value={loginPassword}
                 onChange={e => setLoginPassword(e.target.value)}
               />
             </div>
             
             <button
               type="submit"
               className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 transition transform active:scale-95 mt-2"
             >
               Sign In
             </button>
             <p className="text-center text-xs text-gray-400 mt-2">
               Verify your business details to continue.
             </p>
           </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-2">
              <button
                type="button"
                onClick={() => { setIsNewBusiness(false); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${!isNewBusiness ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                Join Team
              </button>
              <button
                type="button"
                onClick={() => { setIsNewBusiness(true); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${isNewBusiness ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                New Business
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Business Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Lusaka Mini-Mart"
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Phiri"
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                <input
                  required
                  type="tel"
                  placeholder="097..."
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email (Gmail)</label>
              <input
                required
                type="email"
                placeholder="user@gmail.com"
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Create Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {!isNewBusiness && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Which Portal?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'MANAGER', label: 'Manager' },
                    { id: 'SALES_PERSON', label: 'Sales Person' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      className={`py-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition border-2 ${role === r.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 transition transform active:scale-95 mt-2"
            >
              {isNewBusiness ? 'Register Owner' : 'Request Access'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
