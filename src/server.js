import express from 'express'
import dotenv from 'dotenv'
import { logger } from './utils/logger.js'
import { balanceRouter } from './routes/balance.js'
import { paymentRouter } from './routes/payment.js'
import { transactionRouter } from './routes/transaction.js'
import { logsRouter } from './routes/logs.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'arc-agentic-commerce-backend'
  })
})

// API Routes
app.use('/balance', balanceRouter)
app.use('/pay', paymentRouter)
app.use('/transaction', transactionRouter)
app.use('/logs', logsRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Arc Agentic Commerce Backend running on port ${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
  logger.info(`💰 Balance endpoint: http://localhost:${PORT}/balance`)
  logger.info(`💸 Payment endpoint: http://localhost:${PORT}/pay`)
  logger.info(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
