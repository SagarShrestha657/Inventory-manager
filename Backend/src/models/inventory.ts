import { Schema, model, Document, Types } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  sku: string; // Add SKU to the interface
  description?: string;
  price: number; // This will now represent the default selling price if sellingPrice is not provided
  buyingPrice?: number; // New field for buying price
  quantity: number;
  category: string; // Keep for backward compatibility
  userId: Types.ObjectId; // User reference (if not already present)
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  price: { // This will now represent the default selling price if sellingPrice is not provided
    type: Number,
    min: 0,
    default: 0 // Default to 0, or consider making it required based on business logic  
  },
  buyingPrice: {
    type: Number,
    min: 0,
    default: 0 // Default to 0, or consider making it required based on business logic
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default model<IInventory>('Inventory', inventorySchema);
