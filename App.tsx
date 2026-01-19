
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Send, History, BrainCircuit, Info, AlertCircle } from 'lucide-react';
import { AgentWalletState, Transaction, EconomicDecision, RecommendationType, BudgetImpact } from './types';
import { getEconomicDecision } from './services/geminiService';
import WalletStats from './components/WalletStats';
import DecisionDisplay from './components/DecisionDisplay';

const INITIAL_WALLET: AgentWalletState = {
  balance: 4250.75,
  weeklyBudget: 500.00,
  weeklySpend: 145.20,
  history: [
    {
      id: 'tx_1',
      timestamp: Date.now() - 86400000,
      amount: 120.00,
      recipient: 'CloudInfrastructure',
      purpose: 'Monthly server hosting & GPU cluster',
      status: 'completed',
      decision: {
        value_score: 0.95,
        budget_impact: BudgetImpact.MEDIUM,
        recommendation: RecommendationType.APPROVE,
        explanation: "Infrastructure maintenance is mission-critical for agent uptime.",
        suggested_constraints: {}
      }
    },
    {
      id: 'tx_2',
      timestamp: Date.now() - 43200000,
      amount: 25.20,
      recipient: 'GeminiAPI',
      purpose: 'Token credits for reasoning tasks',
      status: 'completed',
      decision: {
        value_score: 0.88,
        budget_impact: BudgetImpact.LOW,
        recommendation: RecommendationType.APPROVE,
        explanation: "API credits are necessary operational raw materials.",
        suggested_constraints: {}
      }
    }
  ]
};

const App: React.FC = () => {
  const [wallet, setWallet] = useState<AgentWalletState>(INITIAL_WALLET);
  const [proposal, setProposal] = useState({ target: '', amount: '' });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<EconomicDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal.target || !proposal.amount) return;
    
    setError(null);
    setIsEvaluating(true);
    setCurrentDecision(null);

    try {
      const amount = parseFloat(proposal.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

      const decision = await getEconomicDecision(
        proposal.target,
        amount,
        {
          balance: wallet.balance,
          weeklyBudget: wallet.weeklyBudget,
          weeklySpend: wallet.weeklySpend
        }
      );
      setCurrentDecision(decision);
    } catch (err: any) {
      setError(err.message || "Failed to contact Economic Soul.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExecute = () => {
    if (!currentDecision) return;
    
    const amount = parseFloat(proposal.amount);
    
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      timestamp: Date.now(),
      amount,
      recipient: proposal.target,
      purpose: `Advisory Recommendation: ${currentDecision.recommendation}`,
      status: 'completed',
      decision: currentDecision
    };

    setWallet(prev => ({
      ...prev,
      balance: prev.balance - amount,
      weeklySpend: prev.weeklySpend + amount,
      history: [newTx, ...prev.history]
    }));

    // Reset flow
    setCurrentDecision(null);
    setProposal({ target: '', amount: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <BrainCircuit className="text-slate-950 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Economic Reasoning Engine</h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Authorized Decision Advisor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          ENGINE STATUS: OPERATIONAL
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Request */}
        <div className="lg:col-span-2 space-y-6">
          <WalletStats state={wallet} />

          {/* Proposal Form */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Send className="w-32 h-32" />
             </div>
             
             <h2 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
               <Send className="w-5 h-5 text-blue-500" /> New Payment Proposal
             </h2>
             
             <form onSubmit={handleEvaluate} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recipient / Resource</label>
                   <input 
                     type="text" 
                     placeholder="e.g. AWS Credits, Domain Renewal..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                     value={proposal.target}
                     onChange={e => setProposal({...proposal, target: e.target.value})}
                     required
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Requested Amount (USDC)</label>
                   <div className="relative">
                     <input 
                       type="number" 
                       placeholder="0.00"
                       className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pl-12 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                       value={proposal.amount}
                       onChange={e => setProposal({...proposal, amount: e.target.value})}
                       required
                       min="0.01"
                       step="0.01"
                     />
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                   </div>
                 </div>
               </div>

               <button 
                 disabled={isEvaluating}
                 className={`w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl shadow-blue-900/20`}
               >
                 {isEvaluating ? (
                   <>
                     <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                     Simulating Economic Impact...
                   </>
                 ) : (
                   <>
                     Request Financial Analysis
                   </>
                 )}
               </button>
             </form>

             {error && (
               <div className="mt-4 p-4 bg-rose-500/10 border border-rose-900/50 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 {error}
               </div>
             )}
          </section>

          {/* Decision Results (Conditional) */}
          {currentDecision && (
            <DecisionDisplay 
              decision={currentDecision} 
              onExecute={handleExecute}
              onReject={() => setCurrentDecision(null)}
            />
          )}

          {/* History */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-wide opacity-80">
              <History className="w-5 h-5" /> Recent Ledger
            </h2>
            <div className="space-y-3">
              {wallet.history.map(tx => (
                <div key={tx.id} className="group flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${
                      tx.decision.recommendation === RecommendationType.APPROVE ? 'bg-emerald-500' : 
                      tx.decision.recommendation === RecommendationType.MODIFY ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <div>
                      <h4 className="font-bold text-slate-200">{tx.recipient}</h4>
                      <p className="text-xs text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold">-{tx.amount} <span className="text-[10px] opacity-40">USDC</span></p>
                    <div className="flex items-center justify-end gap-1 opacity-60">
                      <div className={`w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span className="text-[10px] uppercase font-mono">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Context & Knowledge Base */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase text-slate-400">
              <Info className="w-4 h-4" /> Reasoning Model
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Architecture</p>
                <p className="text-sm font-mono text-emerald-400">Gemini-3-Pro-Preview</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ethical Framework</p>
                <p className="text-sm italic text-slate-300">"Prudential Sustainabilty"</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk Tolerance</p>
                <p className="text-sm text-slate-300">CONSERVATIVE (0.25)</p>
              </div>
            </div>
            
            <hr className="my-6 border-slate-800" />
            
            <h3 className="text-[10px] font-bold mb-4 uppercase text-slate-500 tracking-widest">Global Constraints</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1 bg-emerald-500 rounded-full shrink-0" />
                <span>Maintain 2,000 USDC minimum reserve for gas and critical ops.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1 bg-emerald-500 rounded-full shrink-0" />
                <span>Automatically reject non-utility subscription proposals.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1 bg-emerald-500 rounded-full shrink-0" />
                <span>Optimize for long-term API efficiency over speed.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/10 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
            <h4 className="font-bold text-white mb-2 uppercase">Self-Custodial Safety</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decisions made by the engine are non-custodial advice. Execution requires multi-sig or programmed smart-contract verification.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Navigation (Mock) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 h-16 flex items-center justify-around px-4">
        <button className="flex flex-col items-center gap-1 text-emerald-500">
          <BrainCircuit className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Engine</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Wallet</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-600">
          <History className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Logs</span>
        </button>
      </nav>
    </div>
  );
};

// Re-importing Wallet as generic icon for footer
const Wallet: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><path d="M7 10h10"/><path d="M7 14h10"/></svg>
);

export default App;
