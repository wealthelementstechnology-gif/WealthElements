import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Send, RefreshCw, ChevronRight, X, Check, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../../services/chat.service';
import eightEventsService from '../../services/eightEvents.service';
import voiceService from '../../services/voice.service';
import { fetchAccounts } from '../../store/slices/networthSlice';
import { fetchMonthlySummary, fetchSpendingTrend } from '../../store/slices/transactionSlice';
import { setAuthenticated, setOnboardingCompleted } from '../../store/slices/authSlice';
import { setCashFlowData } from '../../store/slices/cashFlowSlice';
import authService from '../../services/auth.service';
import profileService from '../../services/profile.service';

// Matches the marker whether it's bare or accidentally wrapped in backticks/code fences by the AI
const SAVE_MARKER_REGEX = /<!--SAVE_8_EVENTS:(\{[\s\S]*?\})-->/;
const PLAN_SUMMARY_REGEX = /<!--PLAN_SUMMARY:(\{[\s\S]*?\})-->/;
// Strip any code-fence lines that wrap these markers so the above regexes always find them
const stripCodeFenceMarkers = (text) =>
  text.replace(/```[^\n]*\n(<!--(?:PLAN_SUMMARY|SAVE_8_EVENTS):[\s\S]*?-->)\n```/g, '$1');

const SUGGESTED_QUESTIONS = [
  '🗂 Run 8 Events Plan',
  'Summarize my finances',
  'How is my emergency fund?',
  'Should I pay off debt or invest?',
  'What is my biggest risk?',
  'Which subscriptions to cut?',
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Ranchi',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan', 'Coimbatore', 'Kochi',
  'Chandigarh', 'Gurgaon', 'Noida', 'Mysuru', 'Bhubaneswar', 'Other',
];

const GOAL_PRESETS = [
  { label: '🏠 Home', name: 'Home Purchase' },
  { label: '🚗 Car', name: 'Car' },
  { label: '🎓 Education', name: 'Child Education' },
  { label: '✈️ Travel', name: 'Travel' },
  { label: '💍 Wedding', name: 'Wedding' },
  { label: '📱 Gadget', name: 'Gadget' },
  { label: '🏥 Medical', name: 'Medical Fund' },
  { label: '🏢 Business', name: 'Business' },
];

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString('en-IN')}`;

// ─── Step 1: Basic details ───────────────────────────────────────────────────────
const Step1Card = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    familyMode: 'individual',
    age: '', retirementAge: '60',
    husbandAge: '', husbandRetirementAge: '60',
    wifeAge: '', wifeRetirementAge: '58', wifeWorking: 'yes',
    city: '',
    termInsurance: '0', healthInsurance: '0',
    isUnmarried: false, marriageAge: '', weddingBudget: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isCouple = form.familyMode === 'couple';
  const canNext = isCouple ? (form.husbandAge && form.wifeAge && form.city) : (form.age && form.city);

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none text-gray-200 placeholder-gray-600";
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
  const labelCls = "text-xs font-medium text-gray-500 block mb-1.5";
  const toggleActive = { background: '#6366f1', color: '#fff', borderColor: '#6366f1' };
  const toggleInactive = { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' };

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-0.5">Step 1 of 3 — Basic Details</p>
      <p className="text-xs text-gray-500 mb-4">I'll use your WealthElements account for income & expenses</p>

      {/* Planning for */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Planning for</p>
        <div className="flex gap-2">
          {[{ val: 'individual', label: 'Just me' }, { val: 'couple', label: 'Me & spouse' }].map(({ val, label }) => (
            <button key={val} onClick={() => set('familyMode', val)}
              style={form.familyMode === val ? toggleActive : toggleInactive}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all">{label}</button>
          ))}
        </div>
      </div>

      {/* Age fields */}
      {!isCouple ? (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>Your age <span className="text-red-400">*</span></label>
            <input type="number" placeholder="e.g. 32" value={form.age} onChange={e => set('age', e.target.value)}
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls}>Retirement age</label>
            <input type="number" placeholder="e.g. 60" value={form.retirementAge} onChange={e => set('retirementAge', e.target.value)}
              className={inputCls} style={inputStyle} />
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Husband age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 34" value={form.husbandAge} onChange={e => set('husbandAge', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Husband retires at</label>
              <input type="number" placeholder="e.g. 60" value={form.husbandRetirementAge} onChange={e => set('husbandRetirementAge', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Wife age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 31" value={form.wifeAge} onChange={e => set('wifeAge', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Wife retires at</label>
              <input type="number" placeholder="e.g. 58" value={form.wifeRetirementAge} onChange={e => set('wifeRetirementAge', e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Wife's employment</p>
            <div className="flex gap-2">
              {[{ val: 'yes', label: 'Working' }, { val: 'no', label: 'Homemaker' }].map(opt => (
                <button key={opt.val} onClick={() => set('wifeWorking', opt.val)}
                  style={form.wifeWorking === opt.val ? toggleActive : toggleInactive}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all">{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unmarried toggle (individual only) */}
      {!isCouple && (
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set('isUnmarried', !form.isUnmarried)}
              style={{ background: form.isUnmarried ? '#6366f1' : 'rgba(255,255,255,0.15)' }}
              className="w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer flex-shrink-0 transition-colors">
              <div style={{ transform: form.isUnmarried ? 'translateX(16px)' : 'translateX(0)' }}
                className="w-4 h-4 rounded-full bg-white shadow transition-transform" />
            </div>
            <span className="text-sm text-gray-400">I'm unmarried — include marriage goal</span>
          </label>
          {form.isUnmarried && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={labelCls}>Planned marriage age</label>
                <input type="number" placeholder="e.g. 30" value={form.marriageAge} onChange={e => set('marriageAge', e.target.value)}
                  className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls}>Wedding budget today (₹)</label>
                <input type="number" placeholder="e.g. 800000" value={form.weddingBudget} onChange={e => set('weddingBudget', e.target.value)}
                  className={inputCls} style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* City dropdown */}
      <div className="mb-3">
        <label className={labelCls}>City <span className="text-red-400">*</span></label>
        <select value={form.city} onChange={e => set('city', e.target.value)}
          className={inputCls + " appearance-none"} style={{ ...inputStyle, color: form.city ? undefined : 'rgba(255,255,255,0.3)' }}>
          <option value="" style={{ background: '#1a1a2e' }}>Select your city</option>
          {INDIAN_CITIES.map(c => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
        </select>
      </div>

      {/* Insurance */}
      <div className="mb-4">
        <label className={labelCls}>
          Existing insurance <span className="font-normal text-gray-600">(enter 0 if none)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-gray-600 block mb-1">Term life sum assured (₹)</label>
            <input type="number" placeholder="0" value={form.termInsurance} onChange={e => set('termInsurance', e.target.value)}
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-[11px] text-gray-600 block mb-1">Health sum assured (₹)</label>
            <input type="number" placeholder="0" value={form.healthInsurance} onChange={e => set('healthInsurance', e.target.value)}
              className={inputCls} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          Cancel
        </button>
        <button onClick={() => onSubmit(form)} disabled={!canNext}
          style={canNext ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Budget slider (shown after surplus calc) ───────────────────────────
const Step2Card = ({ monthlyIncome, monthlyExpenses, monthlyEMIs, onSubmit, onBack }) => {
  const surplus = monthlyIncome - monthlyExpenses - monthlyEMIs;
  // Default slider to surplus %, rounded to nearest 5, clamped to [10, 60]
  const surplusPct = monthlyIncome > 0
    ? Math.min(60, Math.max(10, Math.round(surplus / monthlyIncome * 100 / 5) * 5))
    : 30;
  const [pct, setPct] = useState(surplusPct);
  const budget = Math.round(monthlyIncome * pct / 100);
  const surplusColor = surplus >= budget ? '#16a34a' : surplus > 0 ? '#d97706' : '#dc2626';

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-1">Step 2 of 3 — Investment Budget</p>

      {/* Surplus summary */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-medium text-gray-500 mb-2">Your monthly snapshot</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Income</span>
            <span className="font-semibold text-white">{fmt(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Expenses</span>
            <span className="font-semibold text-gray-300">− {fmt(monthlyExpenses)}</span>
          </div>
          {monthlyEMIs > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">EMIs</span>
              <span className="font-semibold text-gray-300">− {fmt(monthlyEMIs)}</span>
            </div>
          )}
          <div className="pt-1.5 flex justify-between text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="font-semibold text-gray-300">Monthly surplus</span>
            <span className="font-bold" style={{ color: surplusColor }}>{fmt(surplus)}</span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">How much to invest monthly?</label>
          <span className="text-sm font-bold text-indigo-400">{pct}% = {fmt(budget)}/mo</span>
        </div>
        <input type="range" min={10} max={60} step={5} value={pct}
          onChange={e => setPct(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#6366f1' }} />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-gray-600">10% — conservative</span>
          <span className="text-[11px] text-gray-600">60% — aggressive</span>
        </div>
        {budget > surplus && surplus > 0 && (
          <p className="text-[11px] mt-2 text-amber-400">
            ⚠ {fmt(budget)}/mo exceeds your surplus of {fmt(surplus)}. The AI will flag this and suggest optimization.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          Back
        </button>
        <button onClick={() => onSubmit(pct)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: Goals ───────────────────────────────────────────────────────────────
const Step3Card = ({ onSubmit, onBack }) => {
  const [goals, setGoals] = useState([]);

  const addPreset = (preset) => {
    if (goals.find(g => g.name === preset.name)) return;
    setGoals(p => [...p, { name: preset.name, cost: '', year: '' }]);
  };
  const removeGoal = (i) => setGoals(p => p.filter((_, idx) => idx !== i));
  const updateGoal = (i, field, val) => setGoals(p => p.map((g, idx) => idx === i ? { ...g, [field]: val } : g));
  const addCustom = () => setGoals(p => [...p, { name: '', cost: '', year: '' }]);

  const inputCls = "px-3 py-2 rounded-xl text-sm focus:outline-none text-gray-200 placeholder-gray-600 min-w-0";
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-0.5">Step 3 of 3 — Financial Goals</p>
      <p className="text-xs text-gray-500 mb-4">Select goals to plan SIPs for. Skip to use only Emergency Fund + Retirement.</p>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {GOAL_PRESETS.map(preset => {
          const added = goals.find(g => g.name === preset.name);
          return (
            <button key={preset.name}
              onClick={() => added ? removeGoal(goals.findIndex(g => g.name === preset.name)) : addPreset(preset)}
              style={added
                ? { background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', borderColor: '#6366f1' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}
              className="text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1">
              {added && <Check className="w-3 h-3" />}
              {preset.label}
            </button>
          );
        })}
        <button onClick={addCustom}
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}
          className="text-xs px-3 py-1.5 rounded-xl border font-medium transition-all">
          + Custom
        </button>
      </div>

      {/* Goal rows */}
      {goals.length > 0 && (
        <div className="space-y-2 mb-4">
          {goals.map((goal, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" placeholder="Goal name" value={goal.name} onChange={e => updateGoal(i, 'name', e.target.value)}
                className={inputCls + " flex-1"} style={inputStyle} />
              <input type="number" placeholder="₹ cost" value={goal.cost} onChange={e => updateGoal(i, 'cost', e.target.value)}
                className={inputCls + " w-24"} style={inputStyle} />
              <input type="number" placeholder="Year" value={goal.year} onChange={e => updateGoal(i, 'year', e.target.value)}
                className={inputCls + " w-20"} style={inputStyle} />
              <button onClick={() => removeGoal(i)} className="p-1.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-gray-600">Today's cost in ₹ · Target year (e.g. 2029)</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          Back
        </button>
        <button onClick={() => onSubmit(goals)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          Calculate My Plan <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


// ─── 8 Events intro card (shown instantly while AI computes) ─────────────────────
const EightEventsIntroCard = ({ name }) => (
  <div className="flex gap-3 mb-5">
    <AIAvatar />
    <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-4"
      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <p className="text-base font-bold text-white leading-snug mb-2">
        Building your plan, {name || 'there'}…
      </p>
      <p className="text-sm text-gray-400 leading-relaxed">
        The <span className="font-semibold text-indigo-300">8 Events framework</span> maps out the eight financial moments every Indian household faces — insurance gaps, emergency fund, retirement corpus, and your personal goals.
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: '300ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse" style={{ animationDelay: '600ms' }} />
        <span className="ml-1">Calculating insurance gaps, retirement corpus, SIPs…</span>
      </div>
    </div>
  </div>
);

// ─── AI Avatar ───────────────────────────────────────────────────────────────────
const AIAvatar = ({ size = 'sm' }) => (
  <div
    className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}
    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
  >
    ✦
  </div>
);

// ─── Message bubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ role, content, type, name }) => {
  const isAI = role === 'assistant';

  if (!isAI) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
          {content}
        </div>
      </div>
    );
  }

  // 8 Events intro card — shown while AI is calculating
  if (type === '8events-intro') {
    return <EightEventsIntroCard name={name} />;
  }

  // Intro / greeting style — larger, no border box
  if (type === 'intro') {
    return (
      <div className="mb-6 flex gap-3">
        <AIAvatar />
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-100 leading-snug">{content.split('\n\n')[0]}</p>
          {content.split('\n\n').slice(1).map((line, i) => (
            <p key={i} className="text-sm text-gray-400 mt-2 leading-relaxed">{line}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5">
      <AIAvatar />
      <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3 leading-relaxed text-sm text-gray-200"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => <p className="font-bold text-sm mt-3 mb-1 text-white">{children}</p>,
            h3: ({ children }) => <p className="font-semibold text-sm mt-2 mb-0.5 text-gray-200">{children}</p>,
            strong: ({ children }) => <span className="font-semibold text-white">{children}</span>,
            p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed text-gray-200">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-300 text-sm">{children}</li>,
            code: ({ children }) => <code className="px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>{children}</code>,
            pre: ({ children }) => <pre className="rounded-xl p-3 mt-2 mb-2 overflow-x-auto text-xs font-mono text-gray-300" style={{ background: 'rgba(0,0,0,0.3)' }}>{children}</pre>,
            hr: () => <hr className="my-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead style={{ background: 'rgba(99,102,241,0.2)' }}>{children}</thead>,
            tbody: ({ children }) => <tbody style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>{children}</tbody>,
            tr: ({ children }) => <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</tr>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-indigo-300 whitespace-nowrap text-xs">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 text-gray-300 text-xs">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// ─── Step card wrapper (appears as a chat bubble) ────────────────────────────────
const StepCard = ({ children }) => (
  <div className="mb-5">
    <div className="w-full rounded-2xl px-5 py-5"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.25)' }}>
      {children}
    </div>
  </div>
);

const ThinkingBubble = () => (
  <div className="flex gap-3 mb-5">
    <AIAvatar />
    <div className="rounded-2xl rounded-tl-sm px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex gap-1.5 items-center h-4">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────────────
const AIChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.auth);
  const { totalNetWorth, accounts } = useSelector(state => state.networth);
  const { currentMonthSummary, monthlyHistory } = useSelector(state => state.cashFlow);

  // 8 events multi-step state: null | 'step1' | 'step2' | 'step3'
  const [eightEventsStep, setEightEventsStep] = useState(null);
  const [step1Data, setStep1Data] = useState(null);
  const [investmentPct, setInvestmentPct] = useState(30);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // TTS on/off toggle
  const [detectedLang, setDetectedLang] = useState(null); // language from last STT
  const voiceEnabledRef = useRef(true); // ref mirror to avoid stale closure in speakText
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null); // currently playing Audio object

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const assistantHistoryRef = useRef([]);
  const initialSentRef = useRef(false);

  // ─── Voice: stop any playing audio ──────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // ─── Voice: play base64 mp3 from Sarvam TTS ──────────────────────────────────
  const speakText = useCallback(async (text, langCode) => {
    if (!voiceEnabledRef.current) return;
    stopSpeaking();
    try {
      const result = await voiceService.textToSpeech(text, langCode);
      if (!result?.audio) return;
      // Guard again — user may have muted while TTS was fetching
      if (!voiceEnabledRef.current) return;
      const audio = new Audio(`data:audio/mp3;base64,${result.audio}`);
      currentAudioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      audio.play().catch(() => setIsSpeaking(false));
    } catch {
      setIsSpeaking(false);
    }
  }, [stopSpeaking]);

  // ─── Voice: start recording ───────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      // Prefer webm/opus; fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (blob.size < 1000) return; // too short — ignore
        setIsTranscribing(true);
        try {
          const result = await voiceService.speechToText(blob);
          if (result?.transcript?.trim()) {
            setDetectedLang(result.language_code || null);
            setInput(result.transcript.trim());
            inputRef.current?.focus();
          }
        } catch {
          setError('Could not understand audio. Please try again.');
          setTimeout(() => setError(''), 4000);
        } finally {
          setIsTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone access denied. Please allow mic permissions.');
      setTimeout(() => setError(''), 5000);
    }
  }, [stopSpeaking]);

  // ─── Voice: stop recording ────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const userName = profile?.name?.split(' ')[0] || 'there';
  const monthlyIncome = currentMonthSummary?.totalIncome || 0;

  // Use 6-month average expenses to avoid start-of-month distortion
  const monthlyExpenses = (() => {
    const history = monthlyHistory || [];
    const recent = history.slice(-6).filter(m => (m.totalExpenses || 0) > 0);
    if (recent.length >= 2) {
      return Math.round(recent.reduce((s, m) => s + m.totalExpenses, 0) / recent.length);
    }
    return currentMonthSummary?.totalExpenses || 0;
  })();

  // Rough EMI estimate from loan liabilities in networth slice
  const monthlyEMIs = (accounts || [])
    .filter(a => a.assetOrLiability === 'LIABILITY' && a.accountType === 'LOAN')
    .reduce((s, a) => s + Math.round((a.balance || 0) * 0.02), 0);

  // Refresh all data on mount so persona changes are always reflected
  useEffect(() => {
    const now = new Date();
    Promise.all([
      dispatch(fetchAccounts()).unwrap(),
      dispatch(fetchMonthlySummary({ month: now.getMonth() + 1, year: now.getFullYear() })).unwrap(),
      dispatch(fetchSpendingTrend()).unwrap(),
      profileService.getProfile(),
      authService.getMe(),
    ]).then(([, monthlySummaryResult, spendingTrendResult, profileData, user]) => {
      // Update auth profile (name, etc.)
      dispatch(setAuthenticated({ isAuthenticated: true, userId: user._id || user.id, phone: user.phone, profile: user.profile }));
      dispatch(setOnboardingCompleted(user.profile?.onboardingCompleted || false));

      // Build cashFlow slice exactly as Dashboard does
      const monthlyIncome = profileData?.monthlyIncome || 0;
      const monthlyExpenses = monthlySummaryResult?.totalSpend || 0;
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
      const monthlyHistory = (spendingTrendResult || []).map(item => ({
        totalExpenses: item.total || 0,
        totalIncome: monthlyIncome,
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      }));
      dispatch(setCashFlowData({
        totalMonthlyIncome: monthlyIncome,
        monthlyHistory,
        currentMonthSummary: {
          totalIncome: monthlyIncome,
          totalExpenses: monthlyExpenses,
          surplus: monthlyIncome - monthlyExpenses,
          savingsRate: parseFloat(savingsRate.toFixed(1)),
          month: now.toISOString().slice(0, 7),
        },
      }));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, eightEventsStep]);

  useEffect(() => {
    const initial = location.state?.initialMessage;
    if (initial && !initialSentRef.current) {
      initialSentRef.current = true;
      window.history.replaceState({}, '');
      sendMessage(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect language from typed text (Devanagari script check)
  const detectTypedLang = (text) => {
    const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
    if (devanagari > 2) return 'hi-IN'; // covers Hindi + Marathi typed text
    return null; // English or unknown — let backend decide
  };

  const sendMessage = async (text) => {
    let messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    // If no detectedLang from mic, try to detect from typed text
    const effectiveLang = detectedLang || detectTypedLang(messageText);

    // 8 Events chip → show greeting + step 1
    if (messageText === '🗂 Run 8 Events Plan') {
      setMessages(prev => [...prev,
        { role: 'user', content: '🗂 Run 8 Events Plan' },
        { role: 'assistant', type: 'intro', content: "Let's build your complete 8 Events financial plan.\n\nI'll use your WealthElements data for income and expenses — just fill in a few details below." },
      ]);
      setEightEventsStep('step1');
      return;
    }

    setInput('');
    setError('');
    setEightEventsStep(null);

    const displayText = messageText.startsWith('Run my complete 8 events financial plan.')
      ? '🗂 Run 8 Events Plan — Calculating...'
      : messageText;

    setMessages(prev => [...prev, { role: 'user', content: displayText }]);
    setIsLoading(true);

    try {
      const { message: rawReply, language_code: replyLang } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
        language_code: effectiveLang,
      });

      // Normalise: unwrap markers that the AI may have put inside code fences
      const normalised = stripCodeFenceMarkers(rawReply);

      // Extract SAVE_8_EVENTS marker — save to DB only
      const saveMatch = normalised.match(SAVE_MARKER_REGEX);
      if (saveMatch) {
        try {
          const planData = JSON.parse(saveMatch[1]);
          await eightEventsService.savePlan(planData);
        } catch { /* silent */ }
      }

      // Strip all markers from displayed content
      const aiReply = normalised
        .replace(PLAN_SUMMARY_REGEX, '')
        .replace(SAVE_MARKER_REGEX, '')
        .trim();

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
      assistantHistoryRef.current = [
        ...assistantHistoryRef.current,
        { role: 'assistant', content: aiReply },
      ];
      // Use the language the API confirmed (or detected from AI reply text)
      speakText(aiReply.slice(0, 600), replyLang || effectiveLang);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setTimeout(() => setError(''), 6000);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1 → Step 2
  const handleStep1Submit = (data) => {
    setStep1Data(data);
    setEightEventsStep('step2');
  };

  // Step 2 → Step 3
  const handleStep2Submit = (pct) => {
    setInvestmentPct(pct);
    setEightEventsStep('step3');
  };

  // Step 3 → Send to AI (inject intro immediately, then fire API)
  const handleStep3Submit = async (goals) => {
    const d = step1Data;
    const isCouple = d.familyMode === 'couple';

    const lines = [
      'Run my complete 8 events financial plan. All required details are below — do NOT ask any more questions, compute the full plan immediately.',
      '',
      `Family Mode: ${isCouple ? 'Couple' : 'Individual'}`,
      isCouple
        ? `Husband Age: ${d.husbandAge}, Husband Retirement Age: ${d.husbandRetirementAge}\nWife Age: ${d.wifeAge}, Wife Retirement Age: ${d.wifeRetirementAge}, Wife Working: ${d.wifeWorking === 'yes' ? 'Yes' : 'No (housewife)'}`
        : `Current Age: ${d.age}, Target Retirement Age: ${d.retirementAge}`,
      `City: ${d.city}`,
      `Existing Term Life Insurance Sum Assured: ₹${d.termInsurance || '0'}`,
      `Existing Health Insurance Sum Assured: ₹${d.healthInsurance || '0'}`,
      `Investment Budget: ${investmentPct}% of monthly income (use this as the SIP budget for Step 5)`,
    ];

    if (!isCouple && d.isUnmarried && d.marriageAge) {
      lines.push(`Marital Status: Unmarried, Planned Marriage Age: ${d.marriageAge}, Estimated Wedding Budget Today: ₹${d.weddingBudget || '0'}`);
    }

    const validGoals = goals.filter(g => g.name && g.year);
    if (validGoals.length > 0) {
      lines.push('');
      lines.push('Financial Goals (use ONLY these — do NOT add goals from my account snapshot):');
      validGoals.forEach(g => lines.push(`  • ${g.name}: Current cost ₹${g.cost || '0'}, Target year ${g.year}`));
    } else {
      lines.push('');
      lines.push('Financial Goals: None specified — use only Emergency Fund and Retirement.');
    }

    lines.push('', 'Use my WealthElements account data for income, expenses, assets, and liabilities. Run all steps: insurance gap, emergency fund, retirement corpus, goals SIPs, budget review with optimization if needed. Show the complete formatted plan.');

    const messageText = lines.join('\n');

    // Immediately show the intro card + close the step form
    setEightEventsStep(null);
    setMessages(prev => [...prev,
      { role: 'assistant', type: '8events-intro', content: '', name: userName },
    ]);
    setIsLoading(true);
    setError('');

    try {
      const { message: rawReply, language_code: replyLang } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
        language_code: detectedLang,
      });

      const normalised = stripCodeFenceMarkers(rawReply);

      const saveMatch = normalised.match(SAVE_MARKER_REGEX);
      if (saveMatch) {
        try {
          const planData = JSON.parse(saveMatch[1]);
          await eightEventsService.savePlan(planData);
        } catch { /* silent */ }
      }

      const aiReply = normalised
        .replace(PLAN_SUMMARY_REGEX, '')
        .replace(SAVE_MARKER_REGEX, '')
        .trim();

      // Replace the intro card with the real result
      setMessages(prev => [
        ...prev.filter(m => m.type !== '8events-intro'),
        { role: 'assistant', content: aiReply },
      ]);
      assistantHistoryRef.current = [
        ...assistantHistoryRef.current,
        { role: 'assistant', content: aiReply },
      ];
      speakText(aiReply.slice(0, 600), replyLang || detectedLang);
    } catch (err) {
      // Remove intro card on error
      setMessages(prev => prev.filter(m => m.type !== '8events-intro'));
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setTimeout(() => setError(''), 6000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stopSpeaking();
    stopRecording();
    setMessages([]);
    setError('');
    setEightEventsStep(null);
    setStep1Data(null);
    setDetectedLang(null);
    assistantHistoryRef.current = [];
    inputRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !isLoading && !eightEventsStep;

  return (
    <div className="flex flex-col" style={{ background: '#0f0f14', height: '100svh' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-center gap-2.5">
          <AIAvatar size="sm" />
          <div>
            <p className="text-sm font-semibold text-white leading-none">WealthElements AI</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] text-gray-500">Your AI advisor</p>
            </div>
          </div>
        </div>

        {(messages.length > 0 || eightEventsStep) ? (
          <button onClick={handleReset}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            title="New conversation">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Messages / Welcome */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Welcome */}
        {showWelcome && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center pb-6">
              {/* Avatar + greeting */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  ✦
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Your AI advisor</p>
                  <p className="text-white font-semibold">WealthElements AI</p>
                </div>
              </div>

              <p className="text-3xl font-bold text-white mb-1">
                Hello, {userName} 👋
              </p>
              <p className="text-xl font-medium leading-snug mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                What can I help<br />you with today?
              </p>
              {(monthlyIncome > 0 || totalNetWorth !== 0) && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  {monthlyIncome > 0 && (
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                      ₹{(monthlyIncome / 100000).toFixed(1)}L/mo
                    </span>
                  )}
                  {totalNetWorth !== 0 && (
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}>
                      ₹{Math.abs(totalNetWorth / 100000).toFixed(1)}L net worth
                    </span>
                  )}
                  <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                    Live data
                  </span>
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            <div className="pb-2">
              <p className="text-[11px] text-gray-600 mb-2.5 uppercase tracking-wider">Suggested</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} disabled={isLoading}
                    className="flex-shrink-0 text-xs px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50 text-left"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                      maxWidth: '160px',
                    }}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message history */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} type={msg.type} name={msg.name} />
        ))}

        {/* Step cards — appear after messages */}
        {eightEventsStep === 'step1' && (
          <StepCard>
            <Step1Card
              onSubmit={handleStep1Submit}
              onCancel={handleReset}
            />
          </StepCard>
        )}

        {eightEventsStep === 'step2' && (
          <StepCard>
            <Step2Card
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              monthlyEMIs={monthlyEMIs}
              onSubmit={handleStep2Submit}
              onBack={() => setEightEventsStep('step1')}
            />
          </StepCard>
        )}

        {eightEventsStep === 'step3' && (
          <StepCard>
            <Step3Card
              onSubmit={handleStep3Submit}
              onBack={() => setEightEventsStep('step2')}
            />
          </StepCard>
        )}

        {isLoading && <ThinkingBubble />}

        {error && (
          <div className="mt-2 mb-3 px-4 py-3 rounded-2xl text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {error}
            <button onClick={() => setError('')} className="ml-2 underline opacity-70">Dismiss</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — hidden during step flow */}
      {!eightEventsStep && (
        <div className="px-4 pt-2 flex-shrink-0" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Mic button */}
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              disabled={isLoading || isTranscribing}
              title={isRecording ? 'Release to transcribe' : 'Hold to speak'}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: isRecording ? 'rgba(239,68,68,0.25)' : isTranscribing ? 'rgba(245,158,11,0.2)' : 'transparent',
              }}
            >
              {isRecording
                ? <MicOff className="w-4 h-4" style={{ color: '#f87171' }} />
                : isTranscribing
                  ? <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  : <Mic className="w-4 h-4 text-gray-500" />
              }
            </button>

            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isRecording ? '🎙 Listening…' : isTranscribing ? 'Transcribing…' : 'Ask anything…'}
              rows={1} disabled={isLoading || isRecording || isTranscribing}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
              style={{ minHeight: '24px', maxHeight: '120px', color: 'rgba(255,255,255,0.85)', caretColor: '#6366f1' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />

            {/* TTS toggle */}
            <button
              onClick={() => { voiceEnabledRef.current = !voiceEnabledRef.current; setVoiceEnabled(v => !v); stopSpeaking(); }}
              title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: isSpeaking ? 'rgba(99,102,241,0.25)' : 'transparent' }}
            >
              {voiceEnabled
                ? <Volume2 className="w-4 h-4" style={{ color: isSpeaking ? '#818cf8' : '#4b5563' }} />
                : <VolumeX className="w-4 h-4" style={{ color: '#4b5563' }} />
              }
            </button>

            {/* Send button */}
            <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: input.trim() && !isLoading ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.06)',
              }}>
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {isRecording ? (
            <p className="text-xs text-center mt-2 animate-pulse" style={{ color: '#f87171' }}>
              Recording… release to send
            </p>
          ) : (
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Not professional financial advice
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default AIChat;
