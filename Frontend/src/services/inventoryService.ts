import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inventory';

// Helper to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

export interface IInventoryItem {
  _id?: string;
  name: string;
  sku: string; // Add SKU to the interface
  description?: string;
  price: number; // This will now represent the selling price
  buyingPrice?: number;
  quantity: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getInventory = async (): Promise<IInventoryItem[]> => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const searchInventory = async (query: string): Promise<IInventoryItem[]> => {
  const response = await axios.get(`${API_URL}?search=${query}`, getAuthHeaders());
  return response.data;
};

export const updateQuantity = async (id: string, change: number, type: 'add' | 'reduce', price?: number, buyingPrice?: number): Promise<IInventoryItem> => {
  const response = await axios.patch(`${API_URL}/${id}/quantity`, { change, type, price, buyingPrice }, getAuthHeaders());
  return response.data;
};

export const createItem = async (item: Omit<IInventoryItem, '_id'>): Promise<IInventoryItem> => {
  const response = await axios.post(API_URL, item, getAuthHeaders());
  return response.data;
};

export const updateItem = async (id: string, item: Partial<IInventoryItem>): Promise<IInventoryItem> => {
  const response = await axios.put(`${API_URL}/${id}`, item, getAuthHeaders());
  return response.data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};

// Removed deletion functions for history records as per user's decision.
// export const deleteHistoryRecord = async (id: string): Promise<void> => {
//   await axios.delete(`${API_URL}/history/${id}`, getAuthHeaders());
// };
//
// export const deleteMultipleHistoryRecords = async (ids: string[]): Promise<void> => {
//   await axios.post(`${API_URL}/history/delete-multiple`, { ids }, getAuthHeaders());
// };
//
// export const deleteAllHistoryRecords = async (): Promise<void> => {
//   await axios.delete(`${API_URL}/history/delete-all`, getAuthHeaders());
// };

export const fetchTopSellingProducts = async (period: string, startDate?: Date | null, endDate?: Date | null): Promise<any[]> => {
  let url = `${API_URL}/analytics/top-selling?period=${period}`;
  
  if (startDate && endDate && period === 'custom') {
    url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
  } else if (period === '3months') {
    // The backend will handle the 3-month logic for simplicity in frontend URL construction
    // No need to add explicit start/end dates here unless the backend expects them separately
  }

  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};
