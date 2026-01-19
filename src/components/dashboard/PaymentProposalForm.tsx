/**
 * PaymentProposalForm - Form for submitting new spending requests
 * Handles proposal submission, AI evaluation display, and payment authorization
 */

import React, { useState } from 'react';
import {
  Send,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader } from './Card';
import { StatusBadge } from './StatusBadge';
import { GlowText } from './GlowText';
import {
  formatCurrency,
  formatValueScore,
  getRecommendationColor,
  getBudgetImpactColor,
} from '../../utils/formatters';
import type { EconomicDecision, PaymentProposal } from '../../types/dashboard';

interface PaymentProposalFormProps {
  onSubmit: (proposal: PaymentProposal) => Promise<void>;
  isEvaluating: boolean;
  currentDecision: EconomicDecision | null;
  onAuthorize: () => Promise<void>;
  onDismiss: () => void;
  isAuthorizing?: boolean;
  transactionResult?: {
    txHash: string;
    explorerUrl: string;
  } | null;
}

function getRecommendationIcon(recommendation: EconomicDecision['recommendation']) {
  switch (recommendation) {
    case 'approve':
      return <CheckCircle className="w-6 h-6 text-emerald-400" />;
    case 'modify':
      return <AlertTriangle className="w-6 h-6 text-amber-400" />;
    case 'reject':
      return <XCircle className="w-6 h-6 text-rose-400" />;
  }
}

export function PaymentProposalForm({
  onSubmit,
  isEvaluating,
  currentDecision,
  onAuthorize,
  onDismiss,
  isAuthorizing = false,
  transactionResult = null,
}: PaymentProposalFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!recipient.startsWith('0x') || recipient.length !== 42) {
      newErrors.recipient = 'Invalid address format (must be 0x...)';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      recipient: recipient.trim(),
      amount: parseFloat(amount),
      purpose: purpose.trim() || undefined,
    });
  };

  const handleReset = () => {
    setRecipient('');
    setAmount('');
    setPurpose('');
    setErrors({});
    onDismiss();
  };

  const canAuthorize = currentDecision && 
    (currentDecision.recommendation === 'approve' || currentDecision.recommendation === 'modify');

  // Show transaction result
  if (transactionResult) {
    return (
      <Card padding="lg" glow="emerald">
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Transaction Submitted
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Your payment is being processed on the Arc blockchain
          </p>
          <a
            href={transactionResult.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors mb-4"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </a>
          <button
            onClick={handleReset}
            className="block w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            New Proposal
          </button>
        </div>
      </Card>
    );
  }

  // Show decision result
  if (currentDecision) {
    return (
      <Card padding="lg">
        <CardHeader
          title="AI Decision"
          subtitle="Economic reasoning result"
          action={
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          }
        />

        {/* Decision Summary */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
          {getRecommendationIcon(currentDecision.recommendation)}
          <div className="flex-1">
            <span className={`text-xl font-semibold capitalize ${getRecommendationColor(currentDecision.recommendation)}`}>
              {currentDecision.recommendation}
            </span>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-400">
                Score: <span className="font-mono text-slate-300">{formatValueScore(currentDecision.value_score)}</span>
              </span>
              <span className="text-xs text-slate-400">
                Impact: <span className={getBudgetImpactColor(currentDecision.budget_impact)}>{currentDecision.budget_impact}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentDecision.explanation}
          </p>
        </div>

        {/* Suggested constraints */}
        {currentDecision.suggested_constraints?.max_amount && (
          <div className="mb-4 p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg">
            <span className="text-xs text-amber-400">
              Suggested max: {formatCurrency(currentDecision.suggested_constraints.max_amount)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {canAuthorize ? (
            <button
              onClick={onAuthorize}
              disabled={isAuthorizing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 rounded-lg text-white text-sm font-medium transition-colors"
            >
              {isAuthorizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Authorize Payment
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              <XCircle className="w-4 h-4" />
              Payment Rejected
            </div>
          )}
          <button
            onClick={handleReset}
            className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </Card>
    );
  }

  // Show form
  return (
    <Card padding="lg">
      <CardHeader
        title="New Payment Proposal"
        subtitle="Submit a spending request for AI evaluation"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isEvaluating}
            className={`
              w-full px-3 py-2.5 bg-slate-800 border rounded-lg
              text-white placeholder-slate-500 font-mono text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.recipient ? 'border-rose-500' : 'border-slate-600'}
            `}
          />
          {errors.recipient && (
            <p className="text-xs text-rose-400 mt-1">{errors.recipient}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isEvaluating}
            className={`
              w-full px-3 py-2.5 bg-slate-800 border rounded-lg
              text-white placeholder-slate-500 font-mono text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.amount ? 'border-rose-500' : 'border-slate-600'}
            `}
          />
          {errors.amount && (
            <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Purpose (optional) */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Purpose <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="What is this payment for?"
            disabled={isEvaluating}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isEvaluating}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 rounded-lg text-white font-medium transition-colors"
        >
          {isEvaluating ? (
            <>
              <Brain className="w-5 h-5 animate-pulse" />
              Analyzing economic impact...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit for Evaluation
            </>
          )}
        </button>
      </form>
    </Card>
  );
}

export default PaymentProposalForm;
