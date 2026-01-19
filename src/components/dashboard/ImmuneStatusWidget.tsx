/**
 * Economic Immune Status Widget
 * Displays the current state of the Economic Immune System
 */

import React from 'react';
import { Shield, AlertTriangle, Brain, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { ProgressBar } from './ProgressBar';

interface RiskSignal {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: string;
}

interface ImmuneStatusProps {
  resilienceScore: number; // 0-100
  activeRiskSignals: RiskSignal[];
  learnedPatternsCount: number;
  adaptationRate: number; // 0-1
  isLoading?: boolean;
}

const ImmuneStatusWidget: React.FC<ImmuneStatusProps> = ({
  resilienceScore,
  activeRiskSignals,
  learnedPatternsCount,
  adaptationRate,
  isLoading = false
}) => {
  const getResilienceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getResilienceStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getAdaptationRateStatus = (rate: number) => {
    if (rate >= 0.8) return { status: 'Rapid', color: 'text-emerald-400' };
    if (rate >= 0.6) return { status: 'Active', color: 'text-green-400' };
    if (rate >= 0.4) return { status: 'Moderate', color: 'text-yellow-400' };
    if (rate >= 0.2) return { status: 'Slow', color: 'text-orange-400' };
    return { status: 'Minimal', color: 'text-red-400' };
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-emerald-400 font-semibold">Economic Immune Status</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const adaptationInfo = getAdaptationRateStatus(adaptationRate);

  return (
    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-500/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-emerald-400 font-semibold">Economic Immune Status</h3>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Active</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resilience Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Resilience Score</span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${getResilienceColor(resilienceScore)}`}>
                {resilienceScore}
              </span>
              <span className="text-xs text-slate-400 ml-1">
                / 100
              </span>
            </div>
          </div>
          <ProgressBar 
            value={resilienceScore} 
            max={100}
            className="h-2"
            color={resilienceScore >= 80 ? 'emerald' : resilienceScore >= 60 ? 'yellow' : resilienceScore >= 40 ? 'orange' : 'red'}
          />
          <div className="text-xs text-slate-400 text-center">
            Status: <span className={getResilienceColor(resilienceScore)}>
              {getResilienceStatus(resilienceScore)}
            </span>
          </div>
        </div>

        {/* Active Risk Signals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Active Risk Signals</span>
            </div>
            <span className="text-sm font-medium text-slate-300">
              {activeRiskSignals.length}
            </span>
          </div>
          
          {activeRiskSignals.length > 0 ? (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {activeRiskSignals.slice(0, 3).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate flex-1 mr-2">
                    {signal.description}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1 py-0 ${getSeverityColor(signal.severity)}`}
                  >
                    {signal.severity}
                  </Badge>
                </div>
              ))}
              {activeRiskSignals.length > 3 && (
                <div className="text-xs text-slate-500 text-center">
                  +{activeRiskSignals.length - 3} more signals
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-2">
              No active risk signals detected
            </div>
          )}
        </div>

        {/* Learned Patterns */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Learned Patterns</span>
          </div>
          <span className="text-sm font-medium text-emerald-400">
            {learnedPatternsCount}
          </span>
        </div>

        {/* Adaptation Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Adaptation Rate</span>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${adaptationInfo.color}`}>
              {adaptationInfo.status}
            </span>
            <div className="text-xs text-slate-400">
              {Math.round(adaptationRate * 100)}%
            </div>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400">
              Economic Immune System Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImmuneStatusWidget;