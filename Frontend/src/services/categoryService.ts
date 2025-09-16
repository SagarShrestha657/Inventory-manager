import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/categories`;

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  productCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  totalCategories: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  categories: Array<{
    _id: string;
    name: string;
    productCount: number;
    totalQuantity: number;
    totalValue: number;
  }>;
}

// Helper to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// Get all categories
export const getCategories = async (): Promise<ICategory[]> => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<ICategory> => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// Create new category
export const createCategory = async (categoryData: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICategory> => {
  const response = await axios.post(API_URL, categoryData, getAuthHeaders());
  return response.data;
};

// Update category
export const updateCategory = async (
  id: string,
  categoryData: Partial<ICategory>
): Promise<ICategory> => {
  const response = await axios.put(`${API_URL}/${id}`, categoryData, getAuthHeaders());
  return response.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// Get category statistics
export const getCategoryStats = async (): Promise<CategoryStats> => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
  return response.data;
};
