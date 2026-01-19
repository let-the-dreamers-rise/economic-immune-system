/**
 * ExplainabilityDrawer - Slide-out panel for detailed decision reasoning
 * Shows full AI explanation, constraints, and transaction details
 */

import React, { useEffect } from 'react';
import {
  X,
  Brain,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  Shield,
  Activity,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { GlowText } from './GlowText';
import { Badge } from '../ui/badge';
import {
  formatCurrency,
  formatTimestamp,
  formatValueScore,
  getRecommendationColor,
  getBudgetImpactColor,
  truncateAddress,
} from '../../utils/formatters';
import type { TimelineEntry, ImmuneDecisionResponse } from '../../types/dashboard';

interface ExplainabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimelineEntry | null;
}

function getRecommendationIcon(recommendation: ImmuneDecisionResponse['recommendation']) {
  switch (recommendation) {
    case 'approve':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'modify':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'reject':
      return <XCircle className="w-5 h-5 text-rose-400" />;
  }
}

function getThreatLevelColor(threatLevel: string) {
  switch (threatLevel) {
    case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'LOW': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-400">{icon}</span>
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ExplainabilityDrawer({
  isOpen,
  onClose,
  entry,
}: ExplainabilityDrawerProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !entry) return null;

  const { request, decision, execution } = entry;
  const immuneDecision = decision as ImmuneDecisionResponse;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-[400px] max-w-full
          bg-dashboard-dark border-l border-dashboard-border
          z-50 overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dashboard-dark border-b border-dashboard-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Decision Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Request Details */}
          <Section title="Request Details" icon={<ArrowRight className="w-4 h-4" />}>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Recipient</span>
                <span className="text-sm font-mono text-white">
                  {truncateAddress(request.recipient, 10, 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Amount</span>
                <GlowText variant="white" size="lg" mono>
                  {formatCurrency(request.amount)}
                </GlowText>
              </div>
              {request.purpose && (
                <div>
                  <span className="text-sm text-slate-400 block mb-1">Purpose</span>
                  <p className="text-sm text-slate-300">{request.purpose}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Timestamp</span>
                <span className="text-sm text-slate-300">
                  {formatTimestamp(new Date(entry.timestamp))}
                </span>
              </div>
            </div>
          </Section>

          {/* AI Reasoning */}
          {decision && (
            <Section title="AI Reasoning" icon={<Brain className="w-4 h-4" />}>
              {/* Recommendation */}
              <div className="flex items-center gap-3 mb-4">
                {getRecommendationIcon(decision.recommendation)}
                <div>
                  <span className={`text-lg font-semibold capitalize ${getRecommendationColor(decision.recommendation)}`}>
                    {decision.recommendation}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-slate-400">
                      Score: <span className="font-mono text-slate-300">{formatValueScore(decision.value_score)}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Impact: <span className={getBudgetImpactColor(decision.budget_impact)}>{decision.budget_impact}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {decision.explanation}
                </p>
              </div>

              {/* Learning Note */}
              {decision.learning_note && (
                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-emerald-400 block mb-1">
                        Learning Note
                      </span>
                      <p className="text-sm text-slate-300">
                        {decision.learning_note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Economic Immune System Analysis */}
          {immuneDecision && (
            <Section title="Economic Immune System" icon={<Shield className="w-4 h-4" />}>
              {/* Threat Level and Confidence */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Threat Level</span>
                  <Badge 
                    variant="outline" 
                    className={`${getThreatLevelColor(immuneDecision.threat_level || 'LOW')}`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {immuneDecision.threat_level || 'LOW'}
                  </Badge>
                </div>
                
                {immuneDecision.confidence_in_decision !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">AI Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${immuneDecision.confidence_in_decision * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-slate-300">
                        {Math.round(immuneDecision.confidence_in_decision * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {immuneDecision.resilience_impact !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Resilience Impact</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span className={`text-sm font-mono ${immuneDecision.resilience_impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {immuneDecision.resilience_impact > 0 ? '+' : ''}{immuneDecision.resilience_impact}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detected Patterns */}
              {immuneDecision.patterns_detected && immuneDecision.patterns_detected.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Detected Patterns</span>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {immuneDecision.patterns_detected.map((pattern, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-1 text-amber-400 bg-amber-500/10 border-amber-500/30"
                        >
                          {pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Memory References */}
              {immuneDecision.immune_memory_references && immuneDecision.immune_memory_references.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Memory Context</span>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                    {immuneDecision.immune_memory_references.map((reference, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-xs text-slate-300">{reference}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Future Behavior Recommendation */}
              {immuneDecision.recommended_future_behavior && (
                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-emerald-400 block mb-1">
                        Adaptive Guidance
                      </span>
                      <p className="text-sm text-slate-300">
                        {immuneDecision.recommended_future_behavior}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Suggested Constraints */}
          {decision?.suggested_constraints && (
            Object.values(decision.suggested_constraints).some(v => v !== undefined) && (
              <Section title="Suggested Constraints" icon={<Shield className="w-4 h-4" />}>
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  {decision.suggested_constraints.max_amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Max Amount</span>
                      <span className="text-sm font-mono text-amber-400">
                        {formatCurrency(decision.suggested_constraints.max_amount)}
                      </span>
                    </div>
                  )}
                  {decision.suggested_constraints.frequency_limit && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Frequency Limit</span>
                      <span className="text-sm text-amber-400">
                        {decision.suggested_constraints.frequency_limit}
                      </span>
                    </div>
                  )}
                  {decision.suggested_constraints.notes && (
                    <div>
                      <span className="text-sm text-slate-400 block mb-1">Notes</span>
                      <p className="text-sm text-slate-300">
                        {decision.suggested_constraints.notes}
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            )
          )}

          {/* Transaction Info */}
          {execution && (
            <Section title="Transaction Info" icon={<Clock className="w-4 h-4" />}>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Status</span>
                  <StatusBadge
                    variant={
                      execution.status === 'completed' ? 'success' :
                      execution.status === 'failed' ? 'error' :
                      'info'
                    }
                    size="sm"
                    dot
                    pulse={execution.status === 'pending' || execution.status === 'confirming'}
                  >
                    {execution.status}
                  </StatusBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Transaction ID</span>
                  <span className="text-xs font-mono text-slate-300">
                    {execution.transactionId}
                  </span>
                </div>
                {execution.txHash && (
                  <>
                    <div>
                      <span className="text-sm text-slate-400 block mb-1">Transaction Hash</span>
                      <span className="text-xs font-mono text-slate-300 break-all">
                        {execution.txHash}
                      </span>
                    </div>
                    <a
                      href={execution.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Arc Explorer
                    </a>
                  </>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

export default ExplainabilityDrawer;
