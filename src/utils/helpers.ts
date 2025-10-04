import { Response } from 'express';

// Standard API response format
export const sendSuccess = (res: Response, data: any, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const sendError = (res: Response, code: string, message: string, statusCode: number = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
};

// Pagination helper
export const getPaginationParams = (page?: string, limit?: string) => {
  const pageNum = parseInt(page || '1', 10);
  const limitNum = parseInt(limit || '20', 10);
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum)),
    skip: (Math.max(1, pageNum) - 1) * Math.min(100, Math.max(1, limitNum))
  };
};

// Generate unique slug
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim(); // Trim - from start and end
};

// Validate Solana wallet address format
export const isValidSolanaAddress = (address: string): boolean => {
  // Basic validation - Solana addresses are base58 encoded and typically 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};

// Format currency amount
export const formatCurrency = (amount: number | string, currency: string = 'SOL'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toFixed(4)} ${currency}`;
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? '+100.0%' : '0.0%';
  }
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Generate random string
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};