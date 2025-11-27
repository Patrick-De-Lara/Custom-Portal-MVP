import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer';

export const authController = {
  // Login with email and phone
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, password } = req.body;

      // Validate input
      if (!email || !phone || !password) {
        res.status(400).json({
          success: false,
          message: 'Email, phone, and password are required',
        });
        return;
      }

      // Find customer by email AND phone
      const customer = await Customer.findOne({
        where: { email, phone },
      });

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Check password
      const isPasswordValid = await customer.comparePassword(password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      const token = jwt.sign(
        { id: customer.id, email: customer.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          customer: {
            id: customer.id,
            email: customer.email,
            phone: customer.phone,
            name: customer.name,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
      });
    }
  },

  // Register new customer
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, password, name, servicem8_company_uuid } = req.body;

      // Validate input
      if (!email || !phone || !password || !name) {
        res.status(400).json({
          success: false,
          message: 'Email, phone, password, and name are required',
        });
        return;
      }

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({
        where: { email },
      });

      if (existingCustomer) {
        res.status(400).json({
          success: false,
          message: 'Customer with this email already exists',
        });
        return;
      }

      // Create customer
      const customer = await Customer.create({
        email,
        phone,
        password,
        name,
        servicem8_company_uuid,
      });

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      const token = jwt.sign(
        { id: customer.id, email: customer.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          customer: {
            id: customer.id,
            email: customer.email,
            phone: customer.phone,
            name: customer.name,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
      });
    }
  },

  // Get current customer profile
  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: customer.id,
          email: customer.email,
          phone: customer.phone,
          name: customer.name,
          servicem8_company_uuid: customer.servicem8_company_uuid,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
};
