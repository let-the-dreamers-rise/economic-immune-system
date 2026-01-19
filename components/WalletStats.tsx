
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AgentWalletState } from '../types';
import { Wallet, TrendingDown, Target } from 'lucide-react';

interface WalletStatsProps {
  state: AgentWalletState;
}

const WalletStats: React.FC<WalletStatsProps> = ({ state }) => {
  const weeklyUtilization = (state.weeklySpend / state.weeklyBudget) * 100;
  
  // Create data for utilization chart
  const utilizationData = [
    { name: 'Spent', value: state.weeklySpend },
    { name: 'Remaining', value: Math.max(0, state.weeklyBudget - state.weeklySpend) }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Available Balance</p>
        </div>
        <p className="text-3xl font-mono font-bold">{state.balance.toLocaleString()} <span className="text-sm opacity-40">USDC</span></p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Weekly Budget</p>
        </div>
        <p className="text-3xl font-mono font-bold">{state.weeklyBudget.toLocaleString()} <span className="text-sm opacity-40">USDC</span></p>
        <div className="mt-2 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${weeklyUtilization > 90 ? 'bg-rose-500' : weeklyUtilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, weeklyUtilization)}%` }}
          />
        </div>
        <p className="text-[10px] mt-1 text-right opacity-40 font-mono">{weeklyUtilization.toFixed(1)}% USED</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Weekly Spend</p>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-mono font-bold">{state.weeklySpend.toLocaleString()} <span className="text-sm opacity-40">USDC</span></p>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStats;
