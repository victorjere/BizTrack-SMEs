
import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './services/mockDb';
import { User, Transaction, Product, UserRole } from './types';
import Dashboard from './components/Dashboard';
import TransactionEntry from './components/TransactionEntry';
import StockManager from './components/StockManager';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import StaffManagement from './components/StaffManagement';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'STOCK' | 'REPORTS' | 'STAFF'>('DASHBOARD');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize Data
  useEffect(() => {
    dbService.seedIfEmpty();
    const storedUser = dbService.getUser();
    if (storedUser) setUser(storedUser);
  }, []);

  // Fetch data specific to the user's business
  const refreshData = useCallback(() => {
    if (user && user.businessName) {
      setTransactions(dbService.getTransactions(user.businessName));
      setProducts(dbService.getProducts(user.businessName));
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogin = (u: User) => {
    dbService.setUser(u);
    setUser(u);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    dbService.setUser(null);
    setUser(null);
  };

  const handleTransaction = (tx: Transaction) => {
    dbService.addTransaction(tx);
    refreshData();
    setView('DASHBOARD');
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this record?")) {
      dbService.deleteTransaction(id);
      refreshData();
    }
  };

  const handleProductUpdate = (p: Product) => {
    dbService.saveProduct(p);
    refreshData();
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Blocking logic for pending/rejected accounts
  if (user.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Account {user.status === 'PENDING' ? 'Pending' : 'Rejected'}</h1>
          <p className="text-gray-500 mt-4 leading-relaxed">
            {user.status === 'PENDING' 
              ? `Hi ${user.fullName}, you have requested to join "${user.businessName}". Please ask the business OWNER to approve your account.`
              : `Hi ${user.fullName}, your access to "${user.businessName}" has been denied. Please contact the owner.`}
          </p>
          <button 
            onClick={handleLogout}
            className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg"
          >
            Go Back / Log Out
          </button>
          
          <button 
            onClick={() => {
              const refreshed = dbService.getAllUsers().find(u => u.uid === user.uid);
              if (refreshed && refreshed.status === 'APPROVED') {
                setUser(refreshed);
                dbService.setUser(refreshed);
              }
            }}
            className="mt-4 w-full text-blue-600 font-bold text-sm"
          >
            Check Status Again
          </button>
        </div>
        <div className="fixed bottom-6 text-blue-300 text-xs font-bold uppercase tracking-widest">
          Powered by NexDigital
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard 
          user={user} 
          transactions={transactions} 
          products={products} 
          onAddSale={() => setView('TRANSACTIONS')} 
        />;
      case 'TRANSACTIONS':
        return <TransactionEntry 
          user={user} 
          products={products} 
          onComplete={handleTransaction} 
          onCancel={() => setView('DASHBOARD')} 
        />;
      case 'STOCK':
        return <StockManager 
          user={user} 
          products={products} 
          onUpdate={handleProductUpdate} 
          onDelete={(id) => { dbService.deleteProduct(id); refreshData(); }}
        />;
      case 'REPORTS':
        return <Reports 
          transactions={transactions} 
          products={products} 
          user={user} 
          onDeleteTransaction={handleDeleteTransaction}
        />;
      case 'STAFF':
        return <StaffManagement currentUser={user} />;
      default:
        return <Dashboard user={user} transactions={transactions} products={products} onAddSale={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
        <h1 className="font-bold text-blue-600 text-xl tracking-tight">BizTrack</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      {/* Sidebar - Persistent on Desktop, Drawer on Mobile */}
      <Sidebar 
        currentView={view} 
        setView={setView} 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8 overflow-y-auto no-scrollbar flex flex-col">
        <div className="flex-1">
          {renderContent()}
        </div>
        <footer className="text-center py-8 text-[10px] text-gray-300 font-black uppercase tracking-widest mt-8">
          Powered by NexDigital
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-40 shadow-lg">
        <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center ${view === 'DASHBOARD' ? 'text-blue-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>
        <button onClick={() => setView('TRANSACTIONS')} className={`flex flex-col items-center ${view === 'TRANSACTIONS' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="bg-blue-600 text-white rounded-full p-2 -mt-6 border-4 border-gray-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <span className="text-[10px] mt-1 font-medium">Record</span>
        </button>
        {(user.role === 'OWNER' || user.role === 'MANAGER') && (
          <button onClick={() => setView('STOCK')} className={`flex flex-col items-center ${view === 'STOCK' ? 'text-blue-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            <span className="text-[10px] mt-1 font-medium">Stock</span>
          </button>
        )}
        {user.role === 'OWNER' && (
          <button onClick={() => setView('STAFF')} className={`flex flex-col items-center ${view === 'STAFF' ? 'text-blue-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="text-[10px] mt-1 font-medium">Staff</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default App;
