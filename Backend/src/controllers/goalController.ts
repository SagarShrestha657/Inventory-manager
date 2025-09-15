import { Request, Response } from 'express';
import { IUser, IGoal } from '../models/User';
import User from '../models/User';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const setGoal = async (req: Request, res: Response) => {
  try {
    const { targetAmount, targetProfit, deadline, durationMonths, startDate } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!targetAmount || !deadline || durationMonths === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (Number(durationMonths) <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number of months' });
    }

    const goalData: IGoal = {
      targetAmount: Number(targetAmount),
      targetProfit: Number(targetProfit),
      deadline: new Date(deadline),
      durationMonths: Math.floor(Number(durationMonths)),
      startDate: new Date(startDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the new goal to the goals array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { goal: goalData } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Goal set successfully',
      goal: goalData
    });
  } catch (error) {
    console.error('Error setting goal:', error);
    res.status(500).json({ message: 'Server error while setting goal' });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find user and only return the goals field
    const user = await User.findById(req.user.id).select('goal');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      goal: user.goal || []
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error while fetching goals' });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { targetAmount, targetProfit, durationMonths } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!targetAmount || !targetProfit || durationMonths === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (Number(durationMonths) <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number of months' });
    }

    const user = await User.findById(req.user.id);

    if (user?.goal && user?.goal?.durationMonths != Number(durationMonths)) {

      const deadline = new Date(user.goal.startDate);
      deadline.setMonth(deadline.getMonth() + Number(durationMonths));
      deadline.setHours(23, 59, 59, 999);
      const updatedGoal = {
        targetAmount: Number(targetAmount),
        targetProfit: Number(targetProfit),
        durationMonths: Math.floor(Number(durationMonths)),
        startDate: new Date(user.goal.startDate),
        deadline: new Date(deadline),
        createdAt: new Date(user.goal.createdAt),
        updatedAt: new Date()
      }
      user.goal = updatedGoal;
      await user.save();
    }
    else if (user?.goal) {
      const updatedGoal = {
        targetAmount: Number(targetAmount),
        targetProfit: Number(targetProfit),
        durationMonths: Math.floor(Number(durationMonths)),
        startDate: user.goal.startDate,
        deadline: user.goal.deadline,
        createdAt: user.goal.createdAt,
        updatedAt: new Date()
      };
      user.goal = updatedGoal;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
    });

  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ message: 'Server error while updating goal progress' });
  }
};
