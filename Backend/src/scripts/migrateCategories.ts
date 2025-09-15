import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Category, { ICategory } from '../models/Category';
import Inventory from '../models/inventory';
import { createDefaultCategories } from '../controllers/categoryController';

dotenv.config();

interface MigrationResult {
  success: boolean;
  message: string;
  stats?: {
    usersProcessed: number;
    categoriesCreated: number;
    productsUpdated: number;
  };
}

// Connect to MongoDB
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-manager';
  await mongoose.connect(mongoURI);
  console.log('MongoDB connected for migration');
};

// Migration function
const migrateCategories = async (): Promise<MigrationResult> => {
  try {
    await connectDB();

    // Get all unique user IDs from inventory
    const userIds = await Inventory.distinct('userId');
    console.log(`Found ${userIds.length} users to process`);

    let totalCategoriesCreated = 0;
    let totalProductsUpdated = 0;

    for (const userId of userIds) {
      console.log(`Processing user: ${userId}`);

      // Check if user already has categories
      const existingCategories = await Category.find({ userId, isActive: true });
      
      if (existingCategories.length === 0) {
        // Create default categories for this user
        const defaultCategories = await createDefaultCategories(userId.toString());
        totalCategoriesCreated += defaultCategories.length;
        console.log(`Created ${defaultCategories.length} default categories for user ${userId}`);
      }

      // Get all categories for this user
      const userCategories = await Category.find({ userId, isActive: true });
      
      // Get all products for this user that don't have categoryId
      const products = await Inventory.find({ 
        userId, 
        $or: [
          { categoryId: { $exists: false } },
          { categoryId: null }
        ]
      });

      console.log(`Found ${products.length} products to update for user ${userId}`);

      // Update products with categoryId based on category name
      for (const product of products) {
        let matchingCategory = userCategories.find(
          cat => cat.name.toLowerCase() === product.category.toLowerCase()
        );

        // If no exact match, create a new category
        if (!matchingCategory) {
          try {
            matchingCategory = new Category({
              name: product.category,
              description: `Auto-created from existing product category`,
              color: '#1976D2',
              icon: 'CategoryIcon',
              userId: userId,
              productCount: 0,
              isActive: true
            });
            await matchingCategory.save();
            userCategories.push(matchingCategory);
            totalCategoriesCreated++;
            console.log(`Created new category: ${product.category} for user ${userId}`);
          } catch (error) {
            console.error(`Error creating category ${product.category}:`, error);
            // Use "Other" category as fallback
            matchingCategory = userCategories.find(cat => cat.name === 'Other');
          }
        }

        if (matchingCategory) {
          product.categoryId = matchingCategory._id;
          await product.save();
          totalProductsUpdated++;
        }
      }

      // Update product counts for all categories
      for (const category of userCategories) {
        await category.updateProductCount();
      }

      console.log(`Completed processing user ${userId}`);
    }

    await mongoose.disconnect();

    return {
      success: true,
      message: 'Migration completed successfully',
      stats: {
        usersProcessed: userIds.length,
        categoriesCreated: totalCategoriesCreated,
        productsUpdated: totalProductsUpdated
      }
    };

  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCategories()
    .then((result) => {
      console.log('\n=== MIGRATION RESULT ===');
      console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Message: ${result.message}`);
      if (result.stats) {
        console.log(`Users processed: ${result.stats.usersProcessed}`);
        console.log(`Categories created: ${result.stats.categoriesCreated}`);
        console.log(`Products updated: ${result.stats.productsUpdated}`);
      }
      console.log('========================\n');
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Migration script error:', error);
      process.exit(1);
    });
}

export { migrateCategories };
