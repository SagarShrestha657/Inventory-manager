
import { Schema, model, Document, Types, Model } from 'mongoose';
import Inventory from './inventory';

export interface ICategory extends Document {
  updateProductCount: () => Promise<void>;
  name: string;
  description?: string;
  icon?: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryModel extends Model<ICategory> {
  getCategoriesWithCounts(userId: Types.ObjectId): Promise<ICategory[]>;
}

const categorySchema = new Schema<ICategory, ICategoryModel>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  icon: {
    type: String,
    trim: true,
    default: 'CategoryIcon'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual for getting products in this category
categorySchema.virtual('products', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'categoryId'
});



export default model<ICategory, ICategoryModel>('Category', categorySchema);
