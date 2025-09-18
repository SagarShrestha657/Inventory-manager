import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGoal {
  targetAmount: number;
  targetProfit: number;
  durationMonths: number;
  startDate: Date;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document<Types.ObjectId> {
  username: string;
  email: string;
  password?: string; // Stored as hash, optional if using social login
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  goal?: IGoal;
}

const GoalSchema: Schema = new Schema({
  targetAmount: { type: Number, required: true },
  targetProfit: { type: Number, required: true },
  durationMonths: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  isVerified: { type: Boolean, default: false },
  goal: { type: GoalSchema },
}, { timestamps: true });

// Create the User model with proper typing
const User = mongoose.model<IUser>('User', UserSchema);

export default User;