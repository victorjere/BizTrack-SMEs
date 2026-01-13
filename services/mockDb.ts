
import { Product, Transaction, User, UserRole, UserStatus } from '../types';

/**
 * A robust Mock DB that simulates Firebase behavior while providing 
 * immediate offline-first functionality via LocalStorage.
 */
const STORAGE_KEYS = {
  PRODUCTS: 'sme_pro_products',
  TRANSACTIONS: 'sme_pro_transactions',
  SESSION_USER: 'sme_pro_user',
  ALL_USERS: 'sme_pro_all_users'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // Products - Filtered by Business
  getProducts: (businessName: string): Product[] => {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return all.filter(p => p.businessName === businessName);
  },
  
  saveProduct: (product: Product) => {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = all.findIndex(p => p.id === product.id);
    if (index > -1) all[index] = product;
    else all.push(product);
    saveToStorage(STORAGE_KEYS.PRODUCTS, all);
  },
  
  deleteProduct: (id: string) => {
    const all = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = all.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
  },

  // Transactions - Filtered by Business
  getTransactions: (businessName: string): Transaction[] => {
    const all = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return all.filter(t => t.businessName === businessName);
  },
  
  addTransaction: (tx: Transaction) => {
    const all = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    all.unshift(tx);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, all);

    // Update stock if it's a sale with an itemId
    if (tx.type === 'SALE' && tx.itemId) {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
      const pIdx = products.findIndex(p => p.id === tx.itemId);
      if (pIdx > -1) {
        const qty = tx.quantity || 1;
        products[pIdx].stockCount -= qty;
        saveToStorage(STORAGE_KEYS.PRODUCTS, products);
      }
    }
  },

  deleteTransaction: (id: string) => {
    const all = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const filtered = all.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, filtered);
  },

  // User Management
  getUser: (): User | null => getFromStorage(STORAGE_KEYS.SESSION_USER, null),
  
  setUser: (user: User | null) => {
    if (user) {
      // Security: Don't store the password in the session storage
      const { password, ...safeUser } = user;
      saveToStorage(STORAGE_KEYS.SESSION_USER, safeUser);
    } else {
      saveToStorage(STORAGE_KEYS.SESSION_USER, null);
    }
  },
  
  getAllUsers: (): User[] => getFromStorage(STORAGE_KEYS.ALL_USERS, []),
  
  loginUser: (businessName: string, email: string, password: string, role: UserRole) => {
    const allUsers = dbService.getAllUsers();
    
    // Find user by Email first
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    
    if (!user) {
      throw new Error("Account not found. Please register first.");
    }

    // Verify Business Name
    if (user.businessName.toLowerCase() !== businessName.toLowerCase().trim()) {
       throw new Error(`This email does not belong to "${businessName}". Please check your Business Name.`);
    }

    // Verify Password
    if (user.password !== password) {
      throw new Error("Incorrect password.");
    }

    // Verify Role
    if (user.role !== role) {
      throw new Error(`Invalid role selected. This account is registered as ${user.role.replace('_', ' ')}.`);
    }

    return user;
  },

  registerUser: (newUser: User, isNewBusiness: boolean) => {
    const allUsers = dbService.getAllUsers();
    
    // Check if user already exists
    const existing = allUsers.find(u => u.email === newUser.email);
    if (existing) {
      throw new Error("Email already registered. Please Log In.");
    }

    const businessOwner = allUsers.find(u => 
      u.businessName.toLowerCase() === newUser.businessName.toLowerCase() && 
      u.role === 'OWNER'
    );

    if (isNewBusiness) {
      if (businessOwner) {
        throw new Error("This business name is already registered. Please 'Join Existing' instead.");
      }
      // First person to register this business name becomes the OWNER
      const userToSave: User = {
        ...newUser,
        role: 'OWNER',
        status: 'APPROVED'
      };
      allUsers.push(userToSave);
      saveToStorage(STORAGE_KEYS.ALL_USERS, allUsers);
      return userToSave;
    } else {
      if (!businessOwner) {
        throw new Error("Business not found. Please register it as a new business first.");
      }
      // Joining an existing business as Manager or Sales Person
      const userToSave: User = {
        ...newUser,
        status: 'PENDING'
      };
      allUsers.push(userToSave);
      saveToStorage(STORAGE_KEYS.ALL_USERS, allUsers);
      return userToSave;
    }
  },

  updateUserStatus: (uid: string, status: UserStatus) => {
    const allUsers = dbService.getAllUsers();
    const idx = allUsers.findIndex(u => u.uid === uid);
    if (idx > -1) {
      allUsers[idx].status = status;
      saveToStorage(STORAGE_KEYS.ALL_USERS, allUsers);
      
      const sessionUser = dbService.getUser();
      if (sessionUser && sessionUser.uid === uid) {
        dbService.setUser(allUsers[idx]);
      }
    }
  },

  seedIfEmpty: () => {
    const allProducts = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const allUsers = getFromStorage<User[]>(STORAGE_KEYS.ALL_USERS, []);

    if (allUsers.length === 0) {
      const defaultOwner: User = {
        uid: 'owner-123',
        fullName: 'Jane Doe',
        phoneNumber: '0970000000',
        email: 'owner@lusakamart.com',
        password: 'password123', // Default password for demo
        businessName: 'Lusaka Central Mart',
        role: 'OWNER',
        tier: 'PAID',
        status: 'APPROVED'
      };
      saveToStorage(STORAGE_KEYS.ALL_USERS, [defaultOwner]);
    }

    if (allProducts.length === 0) {
      const demoProducts: Product[] = [
        { id: '1', businessName: 'Lusaka Central Mart', name: 'Mosi Lager 375ml', buyPrice: 15, sellPrice: 20, stockCount: 48, minStock: 12 },
        { id: '2', businessName: 'Lusaka Central Mart', name: 'Mealile Mealie Meal 10kg', buyPrice: 180, sellPrice: 210, stockCount: 5, minStock: 10 },
        { id: '3', businessName: 'Lusaka Central Mart', name: 'Cooking Oil 2L', buyPrice: 65, sellPrice: 85, stockCount: 20, minStock: 5 },
      ];
      saveToStorage(STORAGE_KEYS.PRODUCTS, demoProducts);
    }
  }
};
