/**
 * Action Logger - Tracks all agent actions for observability
 * 
 * Logs include:
 * - Timestamp
 * - Action type (balance_check, payment, etc.)
 * - Requested amount
 * - Wallet balance at time of request
 * - Whether action was executed or blocked
 * - Transaction hash (if executed)
 * - Policy decision reason
 */

class ActionLogger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000 // Keep last 1000 logs in memory
  }

  /**
   * Log an action
   * @param {Object} entry - Log entry
   */
  log(entry) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    }

    this.logs.push(logEntry)

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Also log to console for debugging
    console.log('[ACTION LOG]', JSON.stringify(logEntry, null, 2))
  }

  /**
   * Get all logs
   * @param {number} limit - Maximum number of logs to return
   * @returns {Array} Log entries
   */
  getLogs(limit = 100) {
    return this.logs.slice(-limit).reverse()
  }

  /**
   * Get logs by action type
   * @param {string} action - Action type to filter
   * @param {number} limit - Maximum number of logs to return
   * @returns {Array} Filtered log entries
   */
  getLogsByAction(action, limit = 100) {
    return this.logs
      .filter(log => log.action === action)
      .slice(-limit)
      .reverse()
  }

  /**
   * Get logs by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered log entries
   */
  getLogsByDateRange(startDate, endDate) {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = []
  }
}

export const actionLogger = new ActionLogger()
