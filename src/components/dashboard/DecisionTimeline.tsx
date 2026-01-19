/**
 * DecisionTimeline - Vertical chronological display of all spending decisions
 * Shows requests, AI decisions, and transaction outcomes with color-coded indicators
 */

import React from 'react';
import { ArrowRight, CheckCircle, XCircle, AlertCircle, Clock, ExternalLink, Shield, Brain, TrendingUp } from 'lucide-react';
import { Card } from './Card';
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

interface DecisionTimelineProps {
  entries: TimelineEntry[];
  onEntryClick: (entry: TimelineEntry) => void;
  isLoading?: boolean;
}

function getRecommendationIcon(recommendation: ImmuneDecisionResponse['recommendation']) {
  switch (recommendation) {
    case 'approve':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'modify':
      return <AlertCircle className="w-4 h-4 text-amber-400" />;
    case 'reject':
      return <XCircle className="w-4 h-4 text-rose-400" />;
  }
}

function getStatusIcon(status?: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-rose-400" />;
    case 'pending':
    case 'confirming':
      return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
    default:
      return null;
  }
}

function getDotColor(entry: TimelineEntry): string {
  if (entry.execution?.status === 'completed') return 'bg-emerald-400';
  if (entry.execution?.status === 'failed') return 'bg-rose-400';
  
  // Enhanced with immune system threat levels
  const decision = entry.decision as ImmuneDecisionResponse;
  if (decision?.threat_level === 'CRITICAL') return 'bg-red-500';
  if (decision?.threat_level === 'HIGH') return 'bg-orange-500';
  if (decision?.threat_level === 'MEDIUM') return 'bg-yellow-500';
  
  if (decision?.recommendation === 'approve') return 'bg-emerald-400';
  if (decision?.recommendation === 'modify') return 'bg-amber-400';
  if (decision?.recommendation === 'reject') return 'bg-rose-400';
  return 'bg-slate-400';
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

function TimelineEntryCard({
  entry,
  onClick,
}: {
  entry: TimelineEntry;
  onClick: () => void;
}) {
  const { request, decision, execution } = entry;
  const immuneDecision = decision as ImmuneDecisionResponse;

  return (
    <div
      onClick={onClick}
      className="relative pl-8 pb-6 cursor-pointer group"
    >
      {/* Timeline dot */}
      <div
        className={`
          absolute left-0 top-1 w-3 h-3 rounded-full
          ${getDotColor(entry)}
          ring-4 ring-dashboard-dark
          group-hover:ring-slate-700 transition-all
        `}
      />

      {/* Card content */}
      <Card
        padding="sm"
        hover
        className="ml-2"
      >
        {/* Header with timestamp and status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">
            {formatTimestamp(new Date(entry.timestamp))}
          </span>
          <div className="flex items-center gap-2">
            {/* Immune System Threat Level */}
            {immuneDecision?.threat_level && (
              <Badge 
                variant="outline" 
                className={`text-xs px-1 py-0 ${getThreatLevelColor(immuneDecision.threat_level)}`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {immuneDecision.threat_level}
              </Badge>
            )}
            {execution && (
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
            )}
            {decision && !execution && (
              <StatusBadge
                variant={
                  decision.recommendation === 'approve' ? 'success' :
                  decision.recommendation === 'modify' ? 'warning' :
                  'error'
                }
                size="sm"
              >
                {decision.recommendation}
              </StatusBadge>
            )}
          </div>
        </div>

        {/* Request details */}
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-300">
            {truncateAddress(request.recipient)}
          </span>
          <span className="text-sm font-mono text-white">
            {formatCurrency(request.amount)}
          </span>
        </div>

        {/* Purpose if available */}
        {request.purpose && (
          <p className="text-xs text-slate-400 mb-2 truncate">
            {request.purpose}
          </p>
        )}

        {/* Decision metrics */}
        {decision && (
          <div className="flex items-center gap-4 text-xs mb-2">
            <div className="flex items-center gap-1">
              {getRecommendationIcon(decision.recommendation)}
              <span className={getRecommendationColor(decision.recommendation)}>
                {decision.recommendation}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Score:</span>
              <span className="font-mono text-slate-300">
                {formatValueScore(decision.value_score)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Impact:</span>
              <span className={getBudgetImpactColor(decision.budget_impact)}>
                {decision.budget_impact}
              </span>
            </div>
          </div>
        )}

        {/* Immune System Information */}
        {immuneDecision && (
          <div className="space-y-2 text-xs">
            {/* Confidence and Resilience Impact */}
            <div className="flex items-center gap-4">
              {immuneDecision.confidence_in_decision !== undefined && (
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500">Confidence:</span>
                  <span className="font-mono text-slate-300">
                    {Math.round(immuneDecision.confidence_in_decision * 100)}%
                  </span>
                </div>
              )}
              {immuneDecision.resilience_impact !== undefined && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500">Resilience:</span>
                  <span className={`font-mono ${immuneDecision.resilience_impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {immuneDecision.resilience_impact > 0 ? '+' : ''}{immuneDecision.resilience_impact}
                  </span>
                </div>
              )}
            </div>

            {/* Detected Patterns */}
            {immuneDecision.patterns_detected && immuneDecision.patterns_detected.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-500">Patterns Detected:</span>
                <div className="flex flex-wrap gap-1">
                  {immuneDecision.patterns_detected.slice(0, 3).map((pattern, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-xs px-1 py-0 text-amber-400 bg-amber-500/10 border-amber-500/30"
                    >
                      {pattern.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {immuneDecision.patterns_detected.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1 py-0 text-slate-400 bg-slate-500/10 border-slate-500/30"
                    >
                      +{immuneDecision.patterns_detected.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Future Behavior Recommendation */}
            {immuneDecision.recommended_future_behavior && (
              <div className="pt-1 border-t border-slate-700">
                <p className="text-slate-400 italic text-xs">
                  "{immuneDecision.recommended_future_behavior}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transaction hash link */}
        {execution?.txHash && (
          <div className="mt-2 pt-2 border-t border-dashboard-border">
            <a
              href={execution.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}

export function DecisionTimeline({
  entries,
  onEntryClick,
  isLoading = false,
}: DecisionTimelineProps) {
  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No transactions yet
          </h3>
          <p className="text-sm text-slate-500">
            Submit a payment proposal to see your decision timeline
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-1.5 top-4 bottom-4 w-px bg-slate-700" />

      {/* Timeline entries */}
      <div className="space-y-0">
        {entries.map((entry) => (
          <TimelineEntryCard
            key={entry.id}
            entry={entry}
            onClick={() => onEntryClick(entry)}
          />
        ))}
      </div>
    </div>
  );
}

export default DecisionTimeline;
