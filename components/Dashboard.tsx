
import React from 'react';
import { User, Transaction, Product, PaymentMethod } from '../types';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  products: Product[];
  onAddSale: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, transactions, products, onAddSale }) => {
  const isManagement = user.role === 'OWNER' || user.role === 'MANAGER';
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => new Date(t.timestamp).toISOString().split('T')[0] === today);

  // Sales and Profits (Only Managers/Owners see accurate Profit)
  const salesToday = todayTxs.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0);
  const expensesToday = todayTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  
  const estimatedProfit = todayTxs
    .filter(t => t.type === 'SALE' && t.itemId)
    .reduce((sum, t) => {
      const p = products.find(prod => prod.id === t.itemId);
      // Profit = (Sell - Buy) * Quantity
      // Fallback 20% if not product linked, though transaction usually has amount only
      if (!p) return sum + (t.amount * 0.2);
      const qty = t.quantity || 1;
      return sum + ((p.sellPrice - p.buyPrice) * qty);
    }, 0);

  const breakdown: Record<PaymentMethod, number> = {
    CASH: todayTxs.filter(t => t.method === 'CASH' && t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0),
    MTN_MOMO: todayTxs.filter(t => t.method === 'MTN_MOMO' && t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0),
    AIRTEL_MONEY: todayTxs.filter(t => t.method === 'AIRTEL_MONEY' && t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0),
  };

  const lowStock = products.filter(p => p.stockCount <= p.minStock);

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-ZM', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-gray-500 text-sm font-medium">{user.businessName}</h2>
          <h1 className="text-2xl font-black text-gray-900">
            {isManagement ? "Business Summary" : "Your Daily Target"}
          </h1>
        </div>
        <button 
          onClick={onAddSale}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg hover:bg-blue-700 transition transform active:scale-95"
        >
          + Record Sale
        </button>
      </div>

      {/* Main KPI Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="col-span-2 md:col-span-1">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1">
              {isManagement ? "Total Profit Today" : "Sales Recorded Today"}
            </p>
            <p className={`text-4xl font-black ${isManagement ? 'text-green-600' : 'text-blue-600'}`}>
              K {(isManagement ? estimatedProfit : salesToday).toLocaleString()}
            </p>
          </div>
          {isManagement && (
            <>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1">Total Sales</p>
                <p className="text-xl font-bold text-gray-800">K {salesToday.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1">Expenses</p>
                <p className="text-xl font-bold text-red-500">K {expensesToday.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Methods (Visible to all for reconciliation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'CASH', label: 'Cash Box', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2', color: 'bg-green-50 text-green-600' },
          { id: 'MTN_MOMO', label: 'MTN MoMo', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-yellow-50 text-yellow-600' },
          { id: 'AIRTEL_MONEY', label: 'Airtel Money', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'bg-red-50 text-red-600' }
        ].map(m => (
          <div key={m.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon}></path></svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{m.label}</p>
              <p className="font-black text-lg text-gray-800">K {breakdown[m.id as PaymentMethod].toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alerts - Only Management */}
        {isManagement && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider">Inventory Alerts</h3>
              <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">{lowStock.length} Items Low</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
              {lowStock.length === 0 ? (
                <p className="p-4 text-xs text-gray-500 italic">No inventory issues.</p>
              ) : (
                lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">Only {p.stockCount} remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-black">Refill Goal</p>
                      <p className="text-xs font-black text-gray-600">{p.minStock}+</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        <section className={!isManagement ? 'col-span-full' : ''}>
          <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider mb-3">Your Latest Logs</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
            {todayTxs.length === 0 ? (
              <p className="p-4 text-xs text-gray-500 italic">No sales found for today.</p>
            ) : (
              todayTxs.slice(0, 8).map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-1 h-6 rounded-full ${t.type === 'SALE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {t.itemName} 
                        {t.quantity && t.quantity > 1 && <span className="text-xs text-gray-500"> (x{t.quantity})</span>}
                      </p>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                        {t.method.replace('_', ' ')} • {formatDateTime(t.timestamp)}
                      </p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${t.type === 'SALE' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'SALE' ? '+' : '-'} K{t.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Owner Integrity Check */}
      {user.role === 'OWNER' && (
        <div className="bg-blue-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <h4 className="font-black text-lg">Daily Reconciliation</h4>
              <p className="text-blue-100 text-xs mt-1 leading-relaxed">
                Confirm your <b>MTN & Airtel</b> balances match the amounts above. If cash is missing, check your Sales Person logs immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
