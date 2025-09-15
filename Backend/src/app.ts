import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import inventoryRoutes from './routes/inventoryRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import goalRoutes from './routes/goalRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'https://inventory-manager-eight-fawn.vercel.app'] }));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mo';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goal', goalRoutes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Inventory Manager API' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

export default app;