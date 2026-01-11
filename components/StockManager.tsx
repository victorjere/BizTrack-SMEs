
import React, { useState } from 'react';
import { User, Product } from '../types';

interface StockManagerProps {
  user: User;
  products: Product[];
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
}

const StockManager: React.FC<StockManagerProps> = ({ user, products, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    buyPrice: 0,
    sellPrice: 0,
    stockCount: 0,
    minStock: 5
  });

  const canEdit = user.role === 'OWNER' || user.role === 'MANAGER';

  const resetForm = () => {
    setFormData({ name: '', buyPrice: 0, sellPrice: 0, stockCount: 0, minStock: 5 });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.buyPrice || !formData.sellPrice) return;

    onUpdate({
      id: editingId || Date.now().toString(),
      businessName: user.businessName, // Ensure product belongs to the current business
      name: formData.name!,
      buyPrice: Number(formData.buyPrice),
      sellPrice: Number(formData.sellPrice),
      stockCount: Number(formData.stockCount),
      minStock: Number(formData.minStock)
    } as Product);

    resetForm();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Stock</h1>
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>Add Item</span>
          </button>
        )}
      </div>

      {isAdding && canEdit && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Item Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Coca Cola 300ml"
                className="w-full p-3 bg-gray-50 border rounded-xl"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price You Buy (K)</label>
              <input
                required
                type="number"
                placeholder="10.00"
                className="w-full p-3 bg-gray-50 border rounded-xl"
                value={formData.buyPrice}
                onChange={e => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price You Sell (K)</label>
              <input
                required
                type="number"
                placeholder="15.00"
                className={`w-full p-3 bg-gray-50 border rounded-xl ${formData.sellPrice! < formData.buyPrice! ? 'border-red-500' : ''}`}
                value={formData.sellPrice}
                onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
              />
              {formData.sellPrice! < formData.buyPrice! && (
                <p className="text-[10px] text-red-500 font-bold mt-1">Warning: Selling below cost!</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Stock Count</label>
              <input
                required
                type="number"
                className="w-full p-3 bg-gray-50 border rounded-xl"
                value={formData.stockCount}
                onChange={e => setFormData({ ...formData, stockCount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alert Me At (Stock Low)</label>
              <input
                required
                type="number"
                className="w-full p-3 bg-gray-50 border rounded-xl"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 flex space-x-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">
                {editingId ? 'Save Changes' : 'Add to Stock'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-3 border rounded-xl font-bold text-gray-500">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-400 italic">No items in stock yet.</div>
        ) : (
          products.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{p.name}</h3>
                  <p className="text-xs text-blue-500 font-bold mt-1">Expected Profit: K{(p.sellPrice - p.buyPrice).toLocaleString()} / item</p>
                </div>
                {canEdit && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => startEdit(p)} className="p-2 text-gray-400 hover:text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Buying Price</p>
                  <p className="font-bold text-gray-700">K {p.buyPrice}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Selling Price</p>
                  <p className="font-bold text-green-600">K {p.sellPrice}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs mb-1">
                  <span className="font-bold text-gray-500">Current Stock</span>
                  <span className={`font-black ${p.stockCount <= p.minStock ? 'text-red-500' : 'text-gray-800'}`}>{p.stockCount} Units</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${p.stockCount <= p.minStock ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((p.stockCount / (p.minStock * 4)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockManager;
