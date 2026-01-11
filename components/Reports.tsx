
import React, { useMemo } from 'react';
import { Transaction, Product, User } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ transactions, products, user }) => {
  const stats = useMemo(() => {
    const last30Days = transactions.filter(t => t.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sales = last30Days.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0);
    const expenses = last30Days.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    // Most popular products
    const productCounts: Record<string, number> = {};
    last30Days.forEach(t => {
      if (t.type === 'SALE' && t.itemName) {
        productCounts[t.itemName] = (productCounts[t.itemName] || 0) + 1;
      }
    });

    const popular = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { sales, expenses, popular, profit: sales - expenses };
  }, [transactions]);

  const handleExport = () => {
    alert("This would generate a PDF/Excel report of all transactions for your accountant or bank review. (Requires Pro Tier)");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <button 
          onClick={handleExport}
          className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg"
        >
          Export Report
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl">
        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Last 30 Days Performance</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-4xl font-black">K {stats.profit.toLocaleString()}</h2>
            <p className="text-blue-100 text-lg opacity-80 mt-1 font-medium">Clear Profit (Money Earned)</p>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-center border-b border-blue-500/30 pb-2">
              <span className="text-blue-200 text-sm">Money In</span>
              <span className="font-bold text-xl">K {stats.sales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200 text-sm">Money Out</span>
              <span className="font-bold text-xl text-red-300">K {stats.expenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Top 3 Sellers</h3>
          <div className="space-y-4">
            {stats.popular.length === 0 ? (
              <p className="text-sm text-gray-500">No sales recorded yet.</p>
            ) : (
              stats.popular.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</span>
                    <span className="font-bold text-gray-700">{name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-400">{count} times</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
          <div className="mb-4">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <h3 className="font-bold text-gray-800 text-lg">Business Health</h3>
             <p className="text-gray-500 text-sm mt-2">
               You are currently operating in <b>Profit</b>. Your sales cover your expenses and stock replacement costs comfortably.
             </p>
          </div>
          <button className="text-blue-600 font-bold border-t border-gray-100 pt-4 mt-2">
            View Advice For This Month
          </button>
        </section>
      </div>

      <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
        <h4 className="font-bold text-yellow-800 mb-2">Inventory Value</h4>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-yellow-700">Total value of all items currently on your shelves:</p>
            <p className="text-2xl font-black text-yellow-900 mt-1">K {products.reduce((s, p) => s + (p.buyPrice * p.stockCount), 0).toLocaleString()}</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
