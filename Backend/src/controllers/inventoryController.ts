// Update all InventoryHistory records for a productId with new name/SKU
export const updateProductHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }
    const { id } = req.params;
    const { name, sku } = req.body;
    if (!id || (!name && !sku)) {
      res.status(400).json({ message: 'Product ID and at least one of name or sku are required.' });
      return;
    }
    const update: any = {};
    if (name) update.productName = name;
    if (sku) update.sku = sku;
    await InventoryHistory.updateMany({ productId: id, userId }, { $set: update });
    res.status(200).json({ message: 'Inventory history updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory history', error });
  }
};
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Inventory, { IInventory } from '../models/inventory';
import InventoryHistory, { IInventoryHistory } from '../models/InventoryHistory'; // Import InventoryHistory model

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string }; // Extend Request to include user property
  }
}

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error });
  }
};

export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const { name, sku } = req.body; // Extract name and sku from request body

    // Check if a product with the same name and SKU already exists for this user
    const existingItem = await Inventory.findOne({ name, sku, userId });
    if (existingItem) {
      res.status(400).json({ message: 'Product with this name and SKU already exists.' });
      return;
    }

    const newItem: IInventory = new Inventory({ ...req.body, userId }); // Associate item with user
    const savedItem = await newItem.save();

    // Create inventory history entry for new item
    const historyEntry: IInventoryHistory = new InventoryHistory({
      productId: savedItem._id,
      productName: savedItem.name,
      sku: savedItem.sku,
      changeQuantity: savedItem.quantity,
      currentQuantity: savedItem.quantity,
      type: 'new_item',
      buyingPriceAtTransaction: savedItem.buyingPrice,
      priceAtTransaction: savedItem.price,
      userId: userId,
    });
    await historyEntry.save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating inventory item', error });
  }
};

export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const originalItem = await Inventory.findById(req.params.id); // Fetch original item
    if (!originalItem) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Create inventory history entry for item update
    const historyEntry: IInventoryHistory = new InventoryHistory({
      productId: updatedItem._id,
      productName: updatedItem.name,
      sku: updatedItem.sku,
      changeQuantity: 0, // No quantity change for detail edit
      currentQuantity: updatedItem.quantity,
      type: 'edit_item', // New type for detail edit
      buyingPriceAtTransaction: updatedItem.buyingPrice,
      priceAtTransaction: updatedItem.price,
      userId: userId,
    });
    await historyEntry.save();

    res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    res.status(400).json({ message: 'Error updating inventory item', error: error.message });
  }
};

export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const { id } = req.params;
    const { change, type, price, buyingPrice } = req.body; // Added type, price, buyingPrice

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid item ID' });
      return;
    }

    const item = await Inventory.findById(id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    let newQuantity = item.quantity;
    let historyType: 'add' | 'reduce';
    let priceForHistory: number | undefined;
    let buyingPriceForHistory: number | undefined;

    if (type === 'add') {
      const incomingBuyingPrice = Number(buyingPrice);

      if (item.buyingPrice !== incomingBuyingPrice) {
        // Create a new inventory item with the new buying price
        const newSku = await generateUniqueSku(item.sku);
        const newProduct: IInventory = new Inventory({
          name: item.name,
          sku: newSku,
          description: item.description,
          price: item.price, // Keep the same selling price
          buyingPrice: incomingBuyingPrice,
          quantity: Number(change),
          category: item.category,
          userId: userId, // Associate with the user
        });
        const savedNewProduct = await newProduct.save();

        // Record history for the new item
        const historyEntry: IInventoryHistory = new InventoryHistory({
          productId: savedNewProduct._id,
          productName: savedNewProduct.name,
          sku: savedNewProduct.sku,
          changeQuantity: savedNewProduct.quantity,
          currentQuantity: savedNewProduct.quantity,
          type: 'new_item',
          buyingPriceAtTransaction: savedNewProduct.buyingPrice,
          priceAtTransaction: savedNewProduct.price, // Include selling price for new item
          userId: userId,
        });
        await historyEntry.save();

        res.status(201).json(savedNewProduct); // Return the newly created product
        return;

      } else {
        // If buying price is the same, update the existing item
        newQuantity += Number(change);
        historyType = 'add';
        buyingPriceForHistory = incomingBuyingPrice;
        priceForHistory = item.price; // Capture current selling price for history
        if (buyingPrice !== undefined) {
          item.buyingPrice = incomingBuyingPrice;
        }
      }
    } else if (type === 'reduce') {
      newQuantity -= Number(change);
      historyType = 'reduce';
      priceForHistory = Number(price); // Selling price for this transaction
      buyingPriceForHistory = item.buyingPrice; // Capture current buying price for history
      // Removed the line below to prevent updating the actual item.price
      // if (price !== undefined) {
      //   item.price = Number(price);
      // }
    } else {
      res.status(400).json({ message: 'Invalid operation type. Must be \'add\' or \'reduce\'.' });
      return;
    }

    if (newQuantity < 0) {
      res.status(400).json({ message: 'Quantity cannot be negative' });
      return;
    }

    item.quantity = newQuantity;
    const updatedItem = await item.save();
    
    // Create inventory history entry for quantity adjustment
    const historyEntry: IInventoryHistory = new InventoryHistory({
      productId: updatedItem._id,
      productName: updatedItem.name,
      sku: updatedItem.sku,
      changeQuantity: Number(change),
      currentQuantity: updatedItem.quantity,
      type: historyType,
      buyingPriceAtTransaction: buyingPriceForHistory,
      priceAtTransaction: priceForHistory,
      userId: userId,
    });
    await historyEntry.save();

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ message: 'Error updating item quantity', error });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const itemToDelete = await Inventory.findById(req.params.id); // Fetch item before deleting for history
    if (!itemToDelete) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Create inventory history entry for item deletion
    const historyEntry: IInventoryHistory = new InventoryHistory({
      productId: itemToDelete._id,
      productName: itemToDelete.name,
      sku: itemToDelete.sku,
      changeQuantity: -itemToDelete.quantity, // Negative quantity for deletion
      currentQuantity: 0, // Quantity becomes 0 after deletion
      type: 'delete_item',
      buyingPriceAtTransaction: itemToDelete.buyingPrice,
      priceAtTransaction: itemToDelete.price,
      userId: userId,
    });
    await historyEntry.save();

    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inventory item', error });
  }
};

export const getInventoryHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    // Date filtering logic
    const { period, startDate, endDate } = req.query;
    let dateFilter: any = {};
    const now = new Date();
    if (period) {
      switch (period) {
        case 'day':
          dateFilter = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
            $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
          };
          break;
        case '10days':
          dateFilter = {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 0, 0, 0, 0),
            $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
          };
          break;
        case 'thisMonth':
          dateFilter = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
          };
          break;
        case 'lastMonth':
          dateFilter = {
            $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
            $lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
          };
          break;
        case 'last3Months':
          dateFilter = {
            $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0),
            $lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
          };
          break;
        case 'custom':
          if (startDate && endDate) {
            const parsedStart = new Date(startDate as string);
            const parsedEnd = new Date(endDate as string);
            if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
              dateFilter = { $gte: parsedStart, $lte: parsedEnd };
            }
          }
          break;
        case 'all':
        default:
          dateFilter = {};
      }
    }

    const query: any = { userId };
    if (dateFilter && Object.keys(dateFilter).length > 0) {
      query.timestamp = dateFilter;
    }

    const history = await InventoryHistory.find(query).sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    res.status(500).json({ message: 'Error fetching inventory history', error });
  }
};

// Helper function to generate a unique SKU
async function generateUniqueSku(baseSku: string): Promise<string> {
  let newSku = baseSku;
  let counter = 1;
  while (await Inventory.findOne({ sku: newSku })) {
    counter++;
    newSku = `${baseSku}(${counter})`;
  }
  return newSku;
}

export const getDailyAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyHistory = await InventoryHistory.find({
      userId: new Types.ObjectId(userId), // Ensure userId is ObjectId
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    let totalBuyValue = 0;
    let totalSellValue = 0;
    let dailyProfit = 0;

    dailyHistory.forEach(record => {
      if (record.type === 'add' || record.type === 'new_item') {
        totalBuyValue += (record.buyingPriceAtTransaction || 0) * record.changeQuantity;
      } else if (record.type === 'reduce') {
        totalSellValue += (record.priceAtTransaction || 0) * record.changeQuantity;
        dailyProfit += (record.priceAtTransaction || 0) * record.changeQuantity - (record.buyingPriceAtTransaction || 0) * record.changeQuantity;
      } else if (record.type === 'delete_item') {
        // Subtract the value of deleted stock from buy value
        totalBuyValue -= (record.buyingPriceAtTransaction || 0) * Math.abs(record.changeQuantity);
      }
    });

    res.status(200).json({
      totalBuyValue: parseFloat(totalBuyValue.toFixed(2)),
      totalSellValue: parseFloat(totalSellValue.toFixed(2)),
      dailyProfit: parseFloat(dailyProfit.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    res.status(500).json({ message: 'Error fetching daily analytics', error });
  }
};

export const getMonthlyAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const endOfMonth = new Date();
    endOfMonth.setHours(23, 59, 59, 999);
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to the first day of the current month
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyHistory = await InventoryHistory.find({
      userId: new Types.ObjectId(userId), // Ensure userId is ObjectId
      timestamp: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let totalBuyValue = 0;
    let totalSellValue = 0;
    let monthlyProfit = 0;

    monthlyHistory.forEach(record => {
      if (record.type === 'add' || record.type === 'new_item') {
        totalBuyValue += (record.buyingPriceAtTransaction || 0) * record.changeQuantity;
      } else if (record.type === 'reduce') {
        totalSellValue += (record.priceAtTransaction || 0) * record.changeQuantity;
        monthlyProfit += (record.priceAtTransaction || 0) * record.changeQuantity - (record.buyingPriceAtTransaction || 0) * record.changeQuantity;
      } else if (record.type === 'delete_item') {
        // Subtract the value of deleted stock from buy value
        totalBuyValue -= (record.buyingPriceAtTransaction || 0) * Math.abs(record.changeQuantity);
      }
    });

    res.status(200).json({
      totalBuyValue: parseFloat(totalBuyValue.toFixed(2)),
      totalSellValue: parseFloat(totalSellValue.toFixed(2)),
      monthlyProfit: parseFloat(monthlyProfit.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    res.status(500).json({ message: 'Error fetching monthly analytics', error });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      return;
    }

    const { period, startDate, endDate } = req.query; // Add 'period' filter

    const matchConditions: any = { userId: new Types.ObjectId(userId), type: 'reduce' }; // Ensure userId is ObjectId

    const now = new Date();
    let dateFilter: any;

    switch (period) {
      case 'day':
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) };
        break;
      case '10days':
        // Adjust for 'Last 10 Days' including today
        now.setDate(now.getDate() - 9); 
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date() };
        break;
      case 'month':
        // Set to the first day of the current month
        now.setDate(1);
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date() };
        break;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2); // Go back 2 months to include current month
        threeMonthsAgo.setDate(1); // Set to the first day of that month
        dateFilter = { $gte: new Date(threeMonthsAgo.setHours(0, 0, 0, 0)), $lte: new Date() };
        break;
      case 'custom':
        if (startDate && endDate) {
          const parsedStartDate = new Date(startDate as string);
          const parsedEndDate = new Date(endDate as string);
          if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            res.status(400).json({ message: 'Invalid custom date range provided.' });
            return;
          }
          dateFilter = { $gte: parsedStartDate, $lte: parsedEndDate };
        } else {
          res.status(400).json({ message: 'Custom date range requires both startDate and endDate.' });
          return;
        }
        break;
      case 'all':
      default: // All time
        break;
    }

    if (dateFilter) {
      matchConditions.timestamp = dateFilter;
    }

    const topSellingProducts = await InventoryHistory.aggregate([
      { $match: matchConditions },
      { $group: {
          _id: '$productName',
          totalSoldQuantity: { $sum: '$changeQuantity' },
          totalRevenue: { $sum: { $multiply: ['$priceAtTransaction', '$changeQuantity'] } },
          totalCostOfGoodsSold: { $sum: { $multiply: ['$buyingPriceAtTransaction', '$changeQuantity'] } },
        }},
      { $addFields: {
          averageSellingPrice: { $divide: ['$totalRevenue', '$totalSoldQuantity'] },
          averageBuyingPrice: { $divide: ['$totalCostOfGoodsSold', '$totalSoldQuantity'] },
        }},
      { $addFields: {
          profitPerUnit: { $subtract: ['$averageSellingPrice', '$averageBuyingPrice'] },
          totalProfit: { $subtract: ['$totalRevenue', '$totalCostOfGoodsSold'] },
        }},
      { $sort: { totalSoldQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json(topSellingProducts);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ message: 'Error fetching top selling products', error });
  }
};
