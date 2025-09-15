import { Schema, model, Document, Types } from 'mongoose';

export interface IInventoryHistory extends Document {
  productId: Types.ObjectId; // Reference to the Inventory item
  productName: string;
  sku: string;
  changeQuantity: number;
  currentQuantity: number; // Quantity after the transaction
  type: 'add' | 'reduce' | 'new_item' | 'delete_item' | 'edit_item'; // Type of inventory movement
  priceAtTransaction?: number; // Selling price at the time of transaction (for reduce)
  buyingPriceAtTransaction?: number; // Buying price at the time of transaction (for add/new_item)
  userId: Types.ObjectId; // Reference to the User who performed the action
  timestamp: Date;
}

const InventoryHistorySchema = new Schema<IInventoryHistory>({
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Inventory',
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  changeQuantity: {
    type: Number,
    required: true,
  },
  currentQuantity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['add', 'reduce', 'new_item', 'delete_item', 'edit_item'],
  },
  priceAtTransaction: {
    type: Number,
  },
  buyingPriceAtTransaction: {
    type: Number,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default model<IInventoryHistory>('InventoryHistory', InventoryHistorySchema);
