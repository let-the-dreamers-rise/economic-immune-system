/**
 * Express API Server for the Agentic Finance Dashboard
 * Exposes REST endpoints for the frontend to consume
 */

import express, { Request, Response, NextFunction } from 'express';
// @ts-ignore - cors types may not be installed
import cors from 'cors';
import { getBalanceResponse } from './services/balanceService';
import { evaluateProposal, validateProposal } from './services/evaluateService';
import { executePayment, getTransactionStatus, retryTransaction } from './services/paymentService';
import { getTransactions } from './services/transactionService';
import { getInsightsResponse } from './services/insightsService';
import { immuneMemoryService } from './services/immuneMemoryService';
import type { EvaluateRequest, PayRequest, ApiError } from '../types/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);
  
  const statusCode = (err as any).statusCode || 500;
  const response: ApiError = {
    error: err.message || 'Internal server error',
  };
  
  res.status(statusCode).json(response);
}

// GET /api/balance - Get wallet balance and budget status
app.get('/api/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await getBalanceResponse();
    res.json(balance);
  } catch (error) {
    next(error);
  }
});

// POST /api/evaluate - Evaluate a payment proposal
app.post('/api/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request: EvaluateRequest = req.body;
    
    // Validate request
    const validation = validateProposal(request);
    if (!validation.valid) {
      const error = new Error(validation.error) as any;
      error.statusCode = 400;
      throw error;
    }
    
    const result = await evaluateProposal(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/pay - Execute an authorized payment
app.post('/api/pay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request: PayRequest = req.body;
    
    if (!request.requestId || !request.recipient || !request.amount) {
      const error = new Error('Missing required fields: requestId, recipient, amount') as any;
      error.statusCode = 400;
      throw error;
    }
    
    const result = await executePayment(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions - Get transaction history
app.get('/api/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = getTransactions(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/:id/status - Get transaction status
app.get('/api/transactions/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = getTransactionStatus(req.params.id);
    
    if (!transaction) {
      const error = new Error('Transaction not found') as any;
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      transactionId: transaction.id,
      status: transaction.status,
      txHash: transaction.txHash,
      explorerUrl: transaction.explorerUrl,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions/:id/retry - Retry a failed transaction
app.post('/api/transactions/:id/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await retryTransaction(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/insights - Get AI-generated spending insights
app.get('/api/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const insights = getInsightsResponse();
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

// GET /api/immune-status - Get Economic Immune System status
app.get('/api/immune-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resilienceScore = await immuneMemoryService.calculateResilienceScore();
    const activeRiskSignals = await immuneMemoryService.getActiveRiskSignals();
    const patterns = immuneMemoryService.getPatterns();
    const memory = immuneMemoryService.getMemory();
    
    res.json({
      resilienceScore,
      activeRiskSignals,
      learnedPatternsCount: patterns.length,
      adaptationRate: memory.adaptations.length > 0 ? 
        memory.adaptations.filter(a => a.outcome === 'success').length / memory.adaptations.length : 0.5,
      lastUpdated: memory.lastUpdated
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/patterns - Get detected economic patterns
app.get('/api/patterns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patterns = immuneMemoryService.getPatterns();
    res.json({
      patterns: patterns.filter(p => p.isActive),
      total: patterns.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/resilience - Get resilience score history
app.get('/api/resilience', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentScore = await immuneMemoryService.calculateResilienceScore();
    // TODO: Implement resilience history tracking
    res.json({
      currentScore,
      history: [], // Placeholder for resilience score history
      trend: 'stable'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memory - Get immune memory inspection (for debugging)
app.get('/api/memory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memory = immuneMemoryService.getMemory();
    const recipients = immuneMemoryService.getRecipients();
    
    res.json({
      memory: {
        ...memory,
        patterns: Array.from(memory.patterns.values()),
        recipients: Array.from(memory.recipients.values())
      },
      stats: {
        totalPatterns: memory.patterns.size,
        activePatterns: Array.from(memory.patterns.values()).filter(p => p.isActive).length,
        totalRecipients: memory.recipients.size,
        totalSignals: memory.signals.length,
        activeSignals: memory.signals.filter(s => !s.isResolved).length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply error handler
app.use(errorHandler);

// Start server
export function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Agentic Finance API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

export { app };
