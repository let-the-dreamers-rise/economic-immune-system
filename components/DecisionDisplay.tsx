
import React from 'react';
import { EconomicDecision, RecommendationType, BudgetImpact } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Zap, Info } from 'lucide-react';

interface DecisionDisplayProps {
  decision: EconomicDecision;
  onExecute?: () => void;
  onReject?: () => void;
}

const DecisionDisplay: React.FC<DecisionDisplayProps> = ({ decision, onExecute, onReject }) => {
  const isApprove = decision.recommendation === RecommendationType.APPROVE;
  const isModify = decision.recommendation === RecommendationType.MODIFY;
  const isReject = decision.recommendation === RecommendationType.REJECT;

  const getStatusColor = () => {
    if (isApprove) return 'text-emerald-400 border-emerald-900/50 bg-emerald-500/5';
    if (isModify) return 'text-amber-400 border-amber-900/50 bg-amber-500/5';
    return 'text-rose-400 border-rose-900/50 bg-rose-500/5';
  };

  const getStatusIcon = () => {
    if (isApprove) return <CheckCircle className="w-6 h-6" />;
    if (isModify) return <AlertTriangle className="w-6 h-6" />;
    return <XCircle className="w-6 h-6" />;
  };

  return (
    <div className={`border rounded-xl p-6 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="text-xl font-bold uppercase tracking-wider">
            {decision.recommendation}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs opacity-60 uppercase">Value Score</p>
            <p className="font-mono text-lg font-bold">{(decision.value_score * 100).toFixed(0)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60 uppercase">Impact</p>
            <p className={`font-mono text-lg font-bold uppercase ${
              decision.budget_impact === BudgetImpact.HIGH ? 'text-rose-500' : 
              decision.budget_impact === BudgetImpact.MEDIUM ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {decision.budget_impact}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="flex items-center gap-1 text-sm font-semibold mb-1 opacity-80 uppercase">
            <Zap className="w-4 h-4" /> Reasoning
          </h4>
          <p className="text-slate-300 leading-relaxed italic">"{decision.explanation}"</p>
        </div>

        {decision.learning_note && (
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h4 className="flex items-center gap-1 text-xs font-semibold mb-1 opacity-70 uppercase tracking-tight">
              <Info className="w-3 h-3" /> System Learning
            </h4>
            <p className="text-sm text-slate-400">{decision.learning_note}</p>
          </div>
        )}

        {Object.keys(decision.suggested_constraints).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {decision.suggested_constraints.max_amount && (
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] uppercase opacity-50">Max Cap</p>
                <p className="font-mono text-emerald-400">{decision.suggested_constraints.max_amount} USDC</p>
              </div>
            )}
            {decision.suggested_constraints.frequency_limit && (
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] uppercase opacity-50">Frequency Limit</p>
                <p className="text-sm">{decision.suggested_constraints.frequency_limit}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {onExecute && (isApprove || isModify) && (
          <button 
            onClick={onExecute}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-sm"
          >
            Authorize Payment
          </button>
        )}
        {onReject && (
          <button 
            onClick={onReject}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm"
          >
            Acknowledge & Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default DecisionDisplay;
