import { create } from 'zustand';
import { type IInventoryItem, getInventory, createItem, updateItem, deleteItem, updateQuantity } from '../services/inventoryService';

export interface InventoryState {
  products: IInventoryItem[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<IInventoryItem, '_id'>) => Promise<void>;
  editProduct: (id: string, product: Partial<IInventoryItem>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, change: number, type: 'add' | 'reduce', price?: number, buyingPrice?: number) => Promise<void>;
}

const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedProducts = await getInventory();
      set({ products: fetchedProducts, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', loading: false });
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await createItem(product);
      set((state) => ({ products: [...state.products, newProduct], loading: false }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add product', loading: false });
    }
  },

  editProduct: async (id, product) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await updateItem(id, product);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to edit product', loading: false });
    }
  },

  removeProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteItem(id);
      set((state) => ({ products: state.products.filter((p) => p._id !== id), loading: false }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete product', loading: false });
    }
  },

  adjustStock: async (id, change, type, price, buyingPrice) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await updateQuantity(id, change, type, price, buyingPrice);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to adjust stock', loading: false });
    }
  },
}));

export default useInventoryStore;
