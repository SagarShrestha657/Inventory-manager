import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';
import Inventory from '../models/inventory';
import { Types } from 'mongoose';

// Get all categories for a user
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }
    const categories = await Category.find({ userId: new Types.ObjectId(userId) });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Get a specific category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const category = await Category.findOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

  // ...existing code...

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

  const { name, description, icon } = req.body;

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({ 
      name: name.trim(), 
      userId: new Types.ObjectId(userId)
    });

    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists.' });
      return;
    }

    const newCategory: ICategory = new Category({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || 'CategoryIcon',
      userId: new Types.ObjectId(userId)
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ message: 'Error creating category', error });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description, icon } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    // Check if new name conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: name.trim(), 
        userId: new Types.ObjectId(userId),
        _id: { $ne: id }
      });
      if (existingCategory) {
        res.status(400).json({ message: 'Category with this name already exists.' });
        return;
      }
    }

    // Store old name before updating
    const oldName = category.name;

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (icon) category.icon = icon;
 
  // ...existing code...

    const updatedCategory = await category.save();

    // If the name was changed, update all Inventory documents with this categoryId or old category name
    if (name && name.trim() !== oldName) {
      await Inventory.updateMany(
        {
          $or: [
            { categoryId: category._id },
            { category: oldName }
          ]
        },
        { $set: { category: name.trim() } }
      );
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ message: 'Error updating category', error });
  }
};

// Delete a category (hard delete)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const category = await Category.findOneAndDelete({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error });
  }
};



// Create default categories for a new user
export const createDefaultCategories = async (userId: string): Promise<ICategory[]> => {
  const defaultCategories = [
    {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      color: '#1976D2',
      icon: 'ElectronicsIcon'
    },
    {
      name: 'Clothing',
      description: 'Apparel and fashion items',
      color: '#388E3C',
      icon: 'CheckroomIcon'
    },
    {
      name: 'Home & Garden',
      description: 'Home improvement and gardening items',
      color: '#F57C00',
      icon: 'HomeIcon'
    },
    {
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      color: '#D32F2F',
      icon: 'SportsIcon'
    },
    {
      name: 'Books & Media',
      description: 'Books, magazines, and media items',
      color: '#7B1FA2',
      icon: 'MenuBookIcon'
    },
    {
      name: 'Other',
      description: 'Miscellaneous items',
      color: '#616161',
      icon: 'CategoryIcon'
    }
  ];

  const createdCategories: ICategory[] = [];
  
  for (const categoryData of defaultCategories) {
    try {
      const category = new Category({
        ...categoryData,
        userId: new Types.ObjectId(userId),
        productCount: 0,
        isActive: true
      });
      
      const savedCategory = await category.save();
      createdCategories.push(savedCategory);
    } catch (error) {
      console.error(`Error creating default category ${categoryData.name}:`, error);
    }
  }

  return createdCategories;
};
