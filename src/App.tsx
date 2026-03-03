/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  ClipboardList, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Account, ForecastInputs, WeeklyData, AccountStatus } from './types';
import { DEFAULT_INPUTS, SOP_CONTENT, CLIENT_SCRIPT } from './constants';

export default function App() {
  // --- State ---
  const [inputs, setInputs] = useState<ForecastInputs>(() => {
    const saved = localStorage.getItem('reddit_ops_inputs');
    return saved ? JSON.parse(saved) : DEFAULT_INPUTS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('reddit_ops_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'sop'>('dashboard');
  const [copySuccess, setCopySuccess] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('reddit_ops_inputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem('reddit_ops_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // --- Calculations ---
  const forecast = useMemo(() => {
    const weeklyCapacity = inputs.numVAs * inputs.accountsPerVA;
    const riskAdjustedWeekly = weeklyCapacity * (1 - inputs.failureRate);
    const totalOutput = Math.floor(riskAdjustedWeekly * inputs.weeksUntilDeadline);
    const finalInventory = inputs.startingSpareInventory + totalOutput;
    const surplusDeficit = finalInventory - inputs.targetNewCampaigns;
    const isSuccess = finalInventory >= inputs.targetNewCampaigns;

    return {
      weeklyCapacity,
      riskAdjustedWeekly,
      totalOutput,
      finalInventory,
      surplusDeficit,
      isSuccess
    };
  }, [inputs]);

  const weeklyProjections = useMemo(() => {
    const projections: WeeklyData[] = [];
    let currentSpare = inputs.startingSpareInventory;
    
    for (let i = 1; i <= inputs.weeksUntilDeadline; i++) {
      const newProduced = Math.floor(inputs.numVAs * inputs.accountsPerVA * (1 - inputs.failureRate));
      currentSpare += newProduced;
      
      let health: 'Green' | 'Yellow' | 'Red' = 'Red';
      if (currentSpare >= inputs.bufferTarget) health = 'Green';
      else if (currentSpare > 0) health = 'Yellow';

      projections.push({
        weekNum: i,
        date: `Week of ${new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
        newAccounts: newProduced,
        readyInventory: currentSpare, // Simplified for projection
        campaignsRunning: 7, // Base from context
        spareAccounts: currentSpare,
        health
      });
    }
    return projections;
  }, [inputs]);

  // --- Handlers ---
  const handleAddAccount = () => {
    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      accountName: `u/reddit_user_${accounts.length + 1}`,
      vaOwner: 'VA 1',
      weekStarted: new Date().toISOString().split('T')[0],
      currentKarma: 0,
      status: 'Warming',
      campaignAssigned: '',
      notes: ''
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleUpdateAccount = (id: string, field: keyof Account, value: any) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Delete this account record?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredAccounts = accounts.filter(acc => 
    statusFilter === 'All' ? true : acc.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-indigo-100">
      {/* Sidebar / Nav */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-50 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">RedditOps</h1>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tracker' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Account Tracker
          </button>
          <button 
            onClick={() => setActiveTab('sop')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sop' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ClipboardList size={20} /> SOP & Cadence
          </button>
        </div>

        <div className="absolute bottom-10 left-6 right-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Active Campaigns</p>
            <p className="text-2xl font-bold">7</p>
            <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[35%]"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-10 pb-24">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === 'dashboard' && 'Operations Dashboard'}
              {activeTab === 'tracker' && 'Account Pipeline'}
              {activeTab === 'sop' && 'Standard Operating Procedures'}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeTab === 'dashboard' && 'Forecasting and weekly capacity projections.'}
              {activeTab === 'tracker' && 'Manage and monitor individual account warming.'}
              {activeTab === 'sop' && 'Guidelines and checklists for VAs and leadership.'}
            </p>
          </div>
          
          {activeTab === 'tracker' && (
            <button 
              onClick={handleAddAccount}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Plus size={20} /> Add Account
            </button>
          )}
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Top Stats & Inputs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Panel */}
                <section className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-indigo-600">
                    <TrendingUp size={20} />
                    <h3 className="font-bold text-lg">Forecast Inputs</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Weeks until May 1</label>
                      <input 
                        type="number" 
                        value={inputs.weeksUntilDeadline}
                        onChange={(e) => setInputs({...inputs, weeksUntilDeadline: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Number of VAs</label>
                        <input 
                          type="number" 
                          value={inputs.numVAs}
                          onChange={(e) => setInputs({...inputs, numVAs: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Acc / VA / Wk</label>
                        <input 
                          type="number" 
                          value={inputs.accountsPerVA}
                          onChange={(e) => setInputs({...inputs, accountsPerVA: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Ban/Failure Rate (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={inputs.failureRate * 100}
                          onChange={(e) => setInputs({...inputs, failureRate: (parseInt(e.target.value) || 0) / 100})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Buffer Target</label>
                        <input 
                          type="number" 
                          value={inputs.bufferTarget}
                          onChange={(e) => setInputs({...inputs, bufferTarget: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Start Inventory</label>
                        <input 
                          type="number" 
                          value={inputs.startingSpareInventory}
                          onChange={(e) => setInputs({...inputs, startingSpareInventory: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Forecast Summary */}
                <section className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Weekly Capacity</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{forecast.weeklyCapacity}</span>
                        <span className="text-gray-400">accounts</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Info size={12} /> Risk-adjusted: {forecast.riskAdjustedWeekly.toFixed(1)}/wk
                      </p>
                    </div>
                    <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${forecast.isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${forecast.isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>Target Status</p>
                      <div className="flex items-center gap-3">
                        {forecast.isSuccess ? <CheckCircle2 className="text-emerald-500" size={32} /> : <AlertCircle className="text-rose-500" size={32} />}
                        <span className={`text-3xl font-black ${forecast.isSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {forecast.isSuccess ? 'ON TRACK' : 'AT RISK'}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 font-medium ${forecast.isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {forecast.surplusDeficit >= 0 ? `+${forecast.surplusDeficit} Surplus` : `${forecast.surplusDeficit} Deficit`} vs 20 target
                      </p>
                    </div>
                  </div>

                  {/* Math Breakdown */}
                  <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                      <TrendingUp size={120} />
                    </div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ShieldCheck size={24} className="text-indigo-300" />
                      The Math
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-indigo-100">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Formula</p>
                        <p className="text-sm leading-relaxed">
                          (VAs × Acc/Wk) × (1 - Ban%) × Weeks
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Calculation</p>
                        <p className="text-sm leading-relaxed">
                          ({inputs.numVAs} × {inputs.accountsPerVA}) × {1 - inputs.failureRate} × {inputs.weeksUntilDeadline}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Result</p>
                        <p className="text-2xl font-black text-white">{forecast.totalOutput} New Accounts</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Weekly Projection Table */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Weekly Capacity Projection</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Green: Healthy</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Yellow: Low Buffer</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Red: Critical</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Week #</th>
                        <th className="px-6 py-4">New Produced</th>
                        <th className="px-6 py-4">Spare Accounts</th>
                        <th className="px-6 py-4">Campaigns Running</th>
                        <th className="px-6 py-4">Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {weeklyProjections.map((week) => (
                        <tr key={week.weekNum} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold">Week {week.weekNum}</p>
                            <p className="text-xs text-gray-400">{week.date}</p>
                          </td>
                          <td className="px-6 py-4 font-medium">{week.newAccounts}</td>
                          <td className="px-6 py-4 font-bold text-indigo-600">{week.spareAccounts}</td>
                          <td className="px-6 py-4 text-gray-500">{week.campaignsRunning}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              week.health === 'Green' ? 'bg-emerald-100 text-emerald-700' :
                              week.health === 'Yellow' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {week.health}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Client Response Section */}
              <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{CLIENT_SCRIPT.title}</h3>
                      <p className="text-sm text-gray-500">Use this to manage expectations for the $10k/mo client.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(CLIENT_SCRIPT.body)}
                    className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                  >
                    {copySuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copySuccess ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {CLIENT_SCRIPT.body}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'tracker' && (
            <motion.div 
              key="tracker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <Filter size={18} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-500">Filter Status:</span>
                  <div className="flex gap-2">
                    {['All', 'Warming', 'Ready', 'Assigned', 'Banned'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </div>
              </div>

              {/* Accounts Table */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Account ID</th>
                        <th className="px-6 py-4">VA Owner</th>
                        <th className="px-6 py-4">Week Started</th>
                        <th className="px-6 py-4">Karma</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Campaign</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <Users size={40} className="opacity-20" />
                              <p>No accounts found. Add your first account to start tracking.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                value={acc.accountName}
                                onChange={(e) => handleUpdateAccount(acc.id, 'accountName', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 font-bold text-gray-900 w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={acc.vaOwner}
                                onChange={(e) => handleUpdateAccount(acc.id, 'vaOwner', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm text-gray-600"
                              >
                                <option>VA 1</option>
                                <option>VA 2</option>
                                <option>VA 3</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="date" 
                                value={acc.weekStarted}
                                onChange={(e) => handleUpdateAccount(acc.id, 'weekStarted', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm text-gray-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="number" 
                                value={acc.currentKarma}
                                onChange={(e) => handleUpdateAccount(acc.id, 'currentKarma', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-indigo-600 w-16"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={acc.status}
                                onChange={(e) => handleUpdateAccount(acc.id, 'status', e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border-none focus:ring-0 cursor-pointer ${
                                  acc.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                                  acc.status === 'Warming' ? 'bg-amber-100 text-amber-700' :
                                  acc.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-rose-100 text-rose-700'
                                }`}
                              >
                                <option value="Warming">Warming</option>
                                <option value="Ready">Ready</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Banned">Banned</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                placeholder="None"
                                value={acc.campaignAssigned}
                                onChange={(e) => handleUpdateAccount(acc.id, 'campaignAssigned', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm text-gray-500 w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleDeleteAccount(acc.id)}
                                className="text-gray-300 hover:text-rose-500 transition-colors p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sop' && (
            <motion.div 
              key="sop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* VA Checklist */}
              <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ClipboardList className="text-indigo-600" />
                  Daily VA Checklist
                </h3>
                <div className="space-y-6">
                  {SOP_CONTENT.vaChecklist.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm border border-gray-100 shrink-0">
                        {item.time}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.task}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold mt-10 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" />
                  Anti-Ban Rules
                </h3>
                <ul className="space-y-3">
                  {SOP_CONTENT.postingRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <ChevronRight size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Leadership Section */}
              <section className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="text-indigo-600" />
                    Weekly Ops Review
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Agenda Items</p>
                      <ul className="space-y-2">
                        {SOP_CONTENT.opsReview.agenda.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-indigo-900">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3">Critical Thresholds</p>
                      <ul className="space-y-2">
                        {SOP_CONTENT.opsReview.thresholds.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-rose-900 font-medium">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="text-indigo-300" />
                    Leadership KPIs
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {SOP_CONTENT.leadershipKPIs.map((kpi, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm font-medium text-indigo-100">{kpi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around md:hidden z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase">Dash</span>
        </button>
        <button onClick={() => setActiveTab('tracker')} className={`flex flex-col items-center gap-1 ${activeTab === 'tracker' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Users size={20} />
          <span className="text-[10px] font-bold uppercase">Tracker</span>
        </button>
        <button onClick={() => setActiveTab('sop')} className={`flex flex-col items-center gap-1 ${activeTab === 'sop' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <ClipboardList size={20} />
          <span className="text-[10px] font-bold uppercase">SOP</span>
        </button>
      </div>
    </div>
  );
}
