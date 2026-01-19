/**
 * Main Dashboard Component
 * Assembles all dashboard panels into a responsive grid layout
 */

import React, { useState, useCallback } from 'react';
import { AgentOverviewPanel } from './AgentOverviewPanel';
import { DecisionTimeline } from './DecisionTimeline';
import { BudgetCognitionPanel } from './BudgetCognitionPanel';
import { ExplainabilityDrawer } from './ExplainabilityDrawer';
import { PaymentProposalForm } from './PaymentProposalForm';
import ImmuneStatusWidget from './ImmuneStatusWidget';
import { useBalance, useTransactions, useInsights, useTransactionStatus, useImmuneStatus } from '../../hooks';
import { evaluateProposal, executePayment } from '../../services/api';
import type { TimelineEntry, EconomicDecision, PaymentProposal } from '../../types/dashboard';

interface ConnectionStatusProps {
  isConnected: boolean;
}

function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-lg">
      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
      <span className="text-sm text-rose-400">Connection lost. Retrying...</span>
    </div>
  );
}

export function Dashboard() {
  // State
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<EconomicDecision | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentProposal, setCurrentProposal] = useState<PaymentProposal | null>(null);
  
  // Hooks
  const { data: balanceData, isLoading: balanceLoading, error: balanceError, refresh: refreshBalance } = useBalance();
  const { transactions, isLoading: txLoading, error: txError, refresh: refreshTransactions } = useTransactions();
  const { insights, topCategories, isLoading: insightsLoading, error: insightsError } = useInsights();
  const { data: immuneData, isLoading: immuneLoading, error: immuneError, refresh: refreshImmune } = useImmuneStatus();
  const { status: txStatus, startPolling, txHash, explorerUrl } = useTransactionStatus(
    // On complete
    () => {
      refreshBalance();
      refreshTransactions();
      refreshImmune(); // Refresh immune status when transactions complete
    }
  );
  
  // Connection status
  const isConnected = !balanceError || balanceError.includes('fetch');
  
  // Handlers
  const handleEntryClick = useCallback((entry: TimelineEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  }, []);
  
  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  }, []);
  
  const handleProposalSubmit = useCallback(async (proposal: PaymentProposal) => {
    setIsEvaluating(true);
    setCurrentProposal(proposal);
    setCurrentDecision(null);
    
    try {
      const response = await evaluateProposal(proposal);
      setCurrentDecision(response.decision);
      setCurrentRequestId(response.requestId);
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  }, []);
  
  const handleAuthorize = useCallback(async () => {
    if (!currentRequestId || !currentProposal) return;
    
    try {
      const response = await executePayment({
        requestId: currentRequestId,
        recipient: currentProposal.recipient,
        amount: currentProposal.amount,
      });
      
      // Start polling for status
      startPolling(response.transactionId);
      
      // Refresh data
      refreshTransactions();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }, [currentRequestId, currentProposal, startPolling, refreshTransactions]);
  
  const handleDismiss = useCallback(() => {
    setCurrentDecision(null);
    setCurrentRequestId(null);
    setCurrentProposal(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ConnectionStatus isConnected={isConnected} />
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-100">Agentic Finance</h1>
                <p className="text-xs text-slate-500">AI-Powered Economic Control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm text-slate-400">Arc Testnet</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Agent Overview - Full Width Top */}
          <div className="col-span-12">
            {balanceLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse">
                <div className="h-8 bg-slate-800 rounded w-1/4 mb-4" />
                <div className="h-12 bg-slate-800 rounded w-1/3 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-slate-800 rounded" />
                  <div className="h-20 bg-slate-800 rounded" />
                </div>
              </div>
            ) : (
              <AgentOverviewPanel
                balance={balanceData?.balance ?? 0}
                todaySpend={balanceData?.todaySpend ?? 0}
                predictedSpend={balanceData?.predictedSpend ?? 0}
                weeklyBudget={balanceData?.weeklyBudget ?? 1000}
                weeklySpend={balanceData?.weeklySpend ?? 0}
                monthlyBudget={balanceData?.monthlyBudget ?? 5000}
                monthlySpend={balanceData?.monthlySpend ?? 0}
                lastUpdated={balanceData?.lastUpdated ? new Date(balanceData.lastUpdated) : new Date()}
              />
            )}
          </div>
          
          {/* Left Column - Timeline */}
          <div className="col-span-12 lg:col-span-5">
            <DecisionTimeline
              entries={transactions}
              onEntryClick={handleEntryClick}
              isLoading={txLoading}
            />
          </div>
          
          {/* Center Column - Payment Form */}
          <div className="col-span-12 lg:col-span-4">
            <PaymentProposalForm
              onSubmit={handleProposalSubmit}
              isEvaluating={isEvaluating}
              currentDecision={currentDecision}
              onAuthorize={handleAuthorize}
              onDismiss={handleDismiss}
            />
          </div>
          
          {/* Right Column - Immune Status & Budget Cognition */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Economic Immune Status Widget */}
            <ImmuneStatusWidget
              resilienceScore={immuneData?.resilienceScore ?? 75}
              activeRiskSignals={immuneData?.activeRiskSignals ?? []}
              learnedPatternsCount={immuneData?.learnedPatternsCount ?? 0}
              adaptationRate={immuneData?.adaptationRate ?? 0.6}
              isLoading={immuneLoading}
            />
            
            {/* Budget Cognition Panel */}
            <BudgetCognitionPanel
              insights={insights}
              topCategories={topCategories}
              isLoading={insightsLoading}
            />
          </div>
        </div>
      </main>
      
      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        entry={selectedEntry}
      />
    </div>
  );
}
