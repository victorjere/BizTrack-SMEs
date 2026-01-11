
import React, { useState, useEffect } from 'react';
import { User, Product, Transaction, PaymentMethod, TransactionType } from '../types';

interface TransactionEntryProps {
  user: User;
  products: Product[];
  onComplete: (tx: Transaction) => void;
  onCancel: () => void;
}

const TransactionEntry: React.FC<TransactionEntryProps> = ({ user, products, onComplete, onCancel }) => {
  const [type, setType] = useState<TransactionType>('SALE');
  const [amount, setAmount] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [note, setNote] = useState('');

  // Update total amount when product or quantity changes
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        setAmount((prod.sellPrice * quantity).toString());
      }
    }
  }, [selectedProductId, quantity, products]);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setQuantity(1); // Reset quantity on product switch
    // Amount update handled by useEffect
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const tx: Transaction = {
      id: Date.now().toString(),
      businessName: user.businessName,
      type,
      amount: parseFloat(amount),
      quantity: type === 'SALE' && selectedProductId ? quantity : 1,
      method,
      itemId: selectedProductId || undefined,
      itemName: selectedProduct?.name || (type === 'SALE' ? 'Sale' : 'Expense'),
      timestamp: Date.now(),
      note,
      recordedBy: user.uid
    };

    onComplete(tx);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Record Money</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Sale/Expense */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setType('SALE'); setSelectedProductId(''); setAmount(''); }}
            className={`flex-1 py-3 rounded-lg font-bold transition ${type === 'SALE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Money In (Sale)
          </button>
          <button
            type="button"
            onClick={() => { setType('EXPENSE'); setSelectedProductId(''); setAmount(''); }}
            className={`flex-1 py-3 rounded-lg font-bold transition ${type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
          >
            Money Out (Cost)
          </button>
        </div>

        {/* Product Selection (Only for Sales) */}
        {type === 'SALE' && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Item (Optional)</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Manual Entry / General --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (K{p.sellPrice})</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex space-x-4">
          {/* Quantity Input (Only if product selected) */}
          {type === 'SALE' && selectedProductId && (
             <div className="w-1/3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
          
          {/* Amount */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Total Amount (K)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xl">K</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                readOnly={!!selectedProductId} // Read only if auto-calculated from product
                className={`w-full p-4 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-3xl font-extrabold focus:ring-2 focus:ring-blue-500 focus:outline-none ${selectedProductId ? 'bg-gray-100' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-3">How was it paid?</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'CASH', label: 'Cash', color: 'border-green-500 text-green-700 bg-green-50' },
              { id: 'MTN_MOMO', label: 'MTN', color: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
              { id: 'AIRTEL_MONEY', label: 'Airtel', color: 'border-red-500 text-red-700 bg-red-50' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id as PaymentMethod)}
                className={`py-3 px-1 border-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${method === m.id ? m.color : 'border-gray-100 bg-gray-50 text-gray-400'}`}
              >
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Broken screen fix, bread..."
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-5 rounded-xl text-white font-black text-lg shadow-lg transform active:scale-95 transition ${type === 'SALE' ? 'bg-blue-600' : 'bg-red-500'}`}
        >
          {type === 'SALE' ? 'Confirm Sale' : 'Record Expense'}
        </button>
      </form>
    </div>
  );
};

export default TransactionEntry;
