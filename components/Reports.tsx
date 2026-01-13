
import React, { useMemo, useState } from 'react';
import { Transaction, Product, User } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  user: User;
  onDeleteTransaction: (id: string) => void;
}

type TimeFrame = 'DAY' | 'WEEK' | 'MONTH' | 'ALL';

const Reports: React.FC<ReportsProps> = ({ transactions, products, user, onDeleteTransaction }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('DAY');

  // Filter transactions based on selected timeframe
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Calculate start of week (Sunday)
    const dayOfWeek = now.getDay(); 
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      if (timeframe === 'ALL') return true;
      if (timeframe === 'DAY') return t.timestamp >= startOfDay;
      if (timeframe === 'WEEK') return t.timestamp >= startOfWeek;
      if (timeframe === 'MONTH') return t.timestamp >= startOfMonth;
      return true;
    });
  }, [transactions, timeframe]);

  // Calculate Statistics
  const stats = useMemo(() => {
    const sales = filteredData.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredData.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    // Estimated Profit Calculation
    const estimatedProfit = filteredData
      .filter(t => t.type === 'SALE')
      .reduce((sum, t) => {
        // If linked to a product, calculate based on margin
        if (t.itemId) {
          const p = products.find(prod => prod.id === t.itemId);
          if (p) {
            const qty = t.quantity || 1;
            return sum + ((p.sellPrice - p.buyPrice) * qty);
          }
        }
        // Fallback: If generic sale, assume 100% is revenue (minus global expenses later)
        // or simplistic logic: just take the sale amount. 
        // Real profit = (Sales Margin) - Expenses
        // Here we sum up margins from products, then subtract expenses.
        return sum + (t.amount * 0.2); // Fallback margin estimate if no product link
      }, 0);
    
    // Net Profit = (Sum of Product Margins) - (Total Expenses)
    // Note: This is a simplified logic. In strict accounting: Profit = Revenue - COGS - Expenses.
    // Our 'estimatedProfit' accumulator above essentially does Revenue - COGS for tracked items.
    const netProfit = estimatedProfit - expenses;

    return { sales, expenses, netProfit };
  }, [filteredData, products]);

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-ZM', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = user.role === 'OWNER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-900">Financial Reports</h1>
           <p className="text-gray-500 text-sm">Review your business performance over time.</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
          {(['DAY', 'WEEK', 'MONTH', 'ALL'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${timeframe === tf ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tf === 'DAY' ? 'Today' : tf === 'WEEK' ? 'This Week' : tf === 'MONTH' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
          <h2 className="text-3xl font-black">K {stats.sales.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</p>
          <h2 className="text-3xl font-black text-red-500">K {stats.expenses.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Profit</p>
          <h2 className={`text-3xl font-black ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            K {stats.netProfit.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
          <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">{filteredData.length} Records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                {isOwner && <th className="px-6 py-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                     No records found for this time period.
                   </td>
                 </tr>
              ) : (
                filteredData.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {formatDateTime(t.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{t.itemName}</p>
                      {t.note && <p className="text-xs text-gray-400 italic">{t.note}</p>}
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5">{t.method.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${t.type === 'SALE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-black text-sm ${t.type === 'SALE' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'SALE' ? '+' : '-'} K{t.amount.toLocaleString()}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="text-gray-300 hover:text-red-600 transition p-2"
                          title="Delete Record"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
