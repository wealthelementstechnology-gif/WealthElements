import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, RefreshCw, ChevronRight, X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../../services/chat.service';
import eightEventsService from '../../services/eightEvents.service';

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

  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Step 1 of 3 — Basic Details</p>
      <p className="text-xs text-gray-400 mb-4">I'll use your WealthElements account for income & expenses</p>

      {/* Planning for */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Planning for</p>
        <div className="flex gap-2">
          {[{ val: 'individual', label: 'Just me' }, { val: 'couple', label: 'Me & spouse' }].map(({ val, label }) => (
            <button key={val} onClick={() => set('familyMode', val)}
              style={form.familyMode === val ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' } : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all">{label}</button>
          ))}
        </div>
      </div>

      {/* Age fields */}
      {!isCouple ? (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Your age <span className="text-red-400">*</span></label>
            <input type="number" placeholder="e.g. 32" value={form.age} onChange={e => set('age', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Retirement age</label>
            <input type="number" placeholder="e.g. 60" value={form.retirementAge} onChange={e => set('retirementAge', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Husband age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 34" value={form.husbandAge} onChange={e => set('husbandAge', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Husband retires at</label>
              <input type="number" placeholder="e.g. 60" value={form.husbandRetirementAge} onChange={e => set('husbandRetirementAge', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Wife age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 31" value={form.wifeAge} onChange={e => set('wifeAge', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Wife retires at</label>
              <input type="number" placeholder="e.g. 58" value={form.wifeRetirementAge} onChange={e => set('wifeRetirementAge', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Wife's employment</p>
            <div className="flex gap-2">
              {[{ val: 'yes', label: 'Working' }, { val: 'no', label: 'Homemaker' }].map(opt => (
                <button key={opt.val} onClick={() => set('wifeWorking', opt.val)}
                  style={form.wifeWorking === opt.val ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' } : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }}
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
              style={{ background: form.isUnmarried ? '#4f46e5' : '#d1d5db' }}
              className="w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer flex-shrink-0 transition-colors">
              <div style={{ transform: form.isUnmarried ? 'translateX(16px)' : 'translateX(0)' }}
                className="w-4 h-4 rounded-full bg-white shadow transition-transform" />
            </div>
            <span className="text-sm text-gray-600">I'm unmarried — include marriage goal</span>
          </label>
          {form.isUnmarried && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Planned marriage age</label>
                <input type="number" placeholder="e.g. 30" value={form.marriageAge} onChange={e => set('marriageAge', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Wedding budget today (₹)</label>
                <input type="number" placeholder="e.g. 800000" value={form.weddingBudget} onChange={e => set('weddingBudget', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* City dropdown */}
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 block mb-1.5">City <span className="text-red-400">*</span></label>
        <select value={form.city} onChange={e => set('city', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white text-gray-700 appearance-none">
          <option value="">Select your city</option>
          {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Insurance */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 block mb-2">
          Existing insurance <span className="font-normal text-gray-400">(enter 0 if none)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Term life sum assured (₹)</label>
            <input type="number" placeholder="0" value={form.termInsurance} onChange={e => set('termInsurance', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Health sum assured (₹)</label>
            <input type="number" placeholder="0" value={form.healthInsurance} onChange={e => set('healthInsurance', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={() => onSubmit(form)} disabled={!canNext}
          style={canNext ? { background: '#4f46e5', color: '#fff' } : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Budget slider (shown after surplus calc) ───────────────────────────
const Step2Card = ({ monthlyIncome, monthlyExpenses, monthlyEMIs, onSubmit, onBack }) => {
  const [pct, setPct] = useState(30);
  const surplus = monthlyIncome - monthlyExpenses - monthlyEMIs;
  const budget = Math.round(monthlyIncome * pct / 100);
  const surplusColor = surplus >= budget ? '#16a34a' : surplus > 0 ? '#d97706' : '#dc2626';

  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Step 2 of 3 — Investment Budget</p>

      {/* Surplus summary */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p className="text-xs font-medium text-gray-500 mb-2">Your monthly snapshot</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Income</span>
            <span className="font-semibold text-gray-900">{fmt(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expenses</span>
            <span className="font-semibold text-gray-700">− {fmt(monthlyExpenses)}</span>
          </div>
          {monthlyEMIs > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">EMIs</span>
              <span className="font-semibold text-gray-700">− {fmt(monthlyEMIs)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm">
            <span className="font-semibold text-gray-700">Monthly surplus</span>
            <span className="font-bold" style={{ color: surplusColor }}>{fmt(surplus)}</span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">How much to invest monthly?</label>
          <span className="text-sm font-bold" style={{ color: '#4f46e5' }}>{pct}% = {fmt(budget)}/mo</span>
        </div>
        <input type="range" min={10} max={60} step={5} value={pct}
          onChange={e => setPct(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#4f46e5' }} />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-gray-400">10% — conservative</span>
          <span className="text-[11px] text-gray-400">60% — aggressive</span>
        </div>
        {budget > surplus && surplus > 0 && (
          <p className="text-[11px] mt-2" style={{ color: '#d97706' }}>
            ⚠ {fmt(budget)}/mo exceeds your surplus of {fmt(surplus)}. The AI will flag this and suggest optimization.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={() => onSubmit(pct)}
          style={{ background: '#4f46e5', color: '#fff' }}
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

  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Step 3 of 3 — Financial Goals</p>
      <p className="text-xs text-gray-400 mb-4">Select goals to plan SIPs for. Skip to use only Emergency Fund + Retirement.</p>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {GOAL_PRESETS.map(preset => {
          const added = goals.find(g => g.name === preset.name);
          return (
            <button key={preset.name}
              onClick={() => added ? removeGoal(goals.findIndex(g => g.name === preset.name)) : addPreset(preset)}
              style={added ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' } : { background: '#f9fafb', color: '#374151', borderColor: '#e5e7eb' }}
              className="text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1">
              {added && <Check className="w-3 h-3" />}
              {preset.label}
            </button>
          );
        })}
        <button onClick={addCustom}
          style={{ background: '#f9fafb', color: '#4f46e5', borderColor: '#c7d2fe' }}
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
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white min-w-0" />
              <input type="number" placeholder="₹ cost" value={goal.cost} onChange={e => updateGoal(i, 'cost', e.target.value)}
                className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
              <input type="number" placeholder="Year" value={goal.year} onChange={e => updateGoal(i, 'year', e.target.value)}
                className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
              <button onClick={() => removeGoal(i)} className="p-1.5 rounded-full hover:bg-red-50 flex-shrink-0">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-gray-400">Today's cost in ₹ · Target year (e.g. 2029)</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={() => onSubmit(goals)}
          style={{ background: '#4f46e5', color: '#fff' }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          Calculate My Plan <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


// ─── 8 Events intro card (shown instantly while AI computes) ─────────────────────
const EightEventsIntroCard = ({ name }) => (
  <div className="mb-5 px-1">
    <p className="text-2xl font-bold text-gray-900 leading-snug mb-2">
      Building your plan, {name || 'there'}…
    </p>
    <p className="text-base text-gray-500 leading-relaxed">
      The <strong className="text-gray-700">8 Events framework</strong> maps out the eight financial moments every Indian household faces — insurance gaps, emergency fund, retirement corpus, and your personal goals. I'm crunching your numbers now. Results will appear below.
    </p>
    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: '300ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse" style={{ animationDelay: '600ms' }} />
      <span className="ml-1">Calculating insurance gaps, retirement corpus, SIPs…</span>
    </div>
  </div>
);

// ─── Message bubble ─────────────────────────────────────────────────────────────
const MessageBubble = ({ role, content, type, name }) => {
  const isAI = role === 'assistant';

  if (!isAI) {
    return (
      <div className="mb-6 px-1">
        <p className="text-2xl font-semibold text-gray-900 leading-snug">
          {'\u201C'}{content}{'\u201D'}
        </p>
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
      <div className="mb-6 px-1">
        <p className="text-2xl font-semibold text-gray-800 leading-snug">{content.split('\n\n')[0]}</p>
        {content.split('\n\n').slice(1).map((line, i) => (
          <p key={i} className="text-base text-gray-400 mt-2 leading-relaxed">{line}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5">
      <div className="w-full rounded-3xl px-5 py-4 leading-relaxed bg-white border border-gray-100 shadow-sm text-gray-800 text-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => <p className="font-bold text-base mt-3 mb-1 text-gray-900">{children}</p>,
            h3: ({ children }) => <p className="font-semibold text-sm mt-2 mb-0.5 text-gray-800">{children}</p>,
            strong: ({ children }) => <span className="font-semibold text-gray-900">{children}</span>,
            p: ({ children }) => <p className="mb-2 last:mb-0 text-base leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700 text-base">{children}</li>,
            code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 mb-2 overflow-x-auto text-sm font-mono">{children}</pre>,
            hr: () => <hr className="border-gray-200 my-3" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-xl border border-gray-200">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-indigo-50">{children}</thead>,
            tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
            tr: ({ children }) => <tr className="divide-x divide-gray-100">{children}</tr>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-indigo-700 whitespace-nowrap">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 text-gray-700">{children}</td>,
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
    <div className="w-full rounded-3xl px-5 py-5 bg-white border border-indigo-100 shadow-sm">
      {children}
    </div>
  </div>
);

const ThinkingBubble = () => (
  <div className="flex justify-start mb-5">
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl px-5 py-4">
      <div className="flex gap-1.5 items-center h-5">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────────────
const AIChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSelector(state => state.auth);
  const { totalNetWorth, accounts } = useSelector(state => state.networth);
  const { currentMonthSummary } = useSelector(state => state.cashFlow);

  // 8 events multi-step state: null | 'step1' | 'step2' | 'step3'
  const [eightEventsStep, setEightEventsStep] = useState(null);
  const [step1Data, setStep1Data] = useState(null);
  const [investmentPct, setInvestmentPct] = useState(30);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const assistantHistoryRef = useRef([]);
  const initialSentRef = useRef(false);

  const userName = profile?.name?.split(' ')[0] || 'there';
  const monthlyIncome = currentMonthSummary?.totalIncome || 0;
  const monthlyExpenses = currentMonthSummary?.totalExpenses || 0;

  // Rough EMI estimate from loan liabilities in networth slice
  const monthlyEMIs = (accounts || [])
    .filter(a => a.assetOrLiability === 'LIABILITY' && a.accountType === 'LOAN')
    .reduce((s, a) => s + Math.round((a.balance || 0) * 0.02), 0);

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

  const sendMessage = async (text) => {
    let messageText = (text || input).trim();
    if (!messageText || isLoading) return;

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
      const { message: rawReply } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
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
      const { message: rawReply } = await chatService.sendMessage({
        message: messageText,
        history: assistantHistoryRef.current,
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
    setMessages([]);
    setError('');
    setEightEventsStep(null);
    setStep1Data(null);
    assistantHistoryRef.current = [];
    inputRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !isLoading && !eightEventsStep;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-50 px-4 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-sm text-gray-500">WealthElements AI</p>
        </div>
        {(messages.length > 0 || eightEventsStep) ? (
          <button onClick={handleReset} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="New conversation">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Messages / Welcome */}
      <div className="flex-1 overflow-y-auto px-5 py-2">

        {/* Welcome */}
        {showWelcome && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center pb-4">
              <p className="text-4xl font-bold mb-1">
                <span className="text-indigo-500">Hello,</span>{' '}
                <span className="text-gray-900">{userName}</span>
              </p>
              <p className="text-3xl font-semibold text-gray-300 leading-snug mt-1">
                What can I help<br />you with?
              </p>
              {(monthlyIncome > 0 || totalNetWorth !== 0) && (
                <p className="text-xs text-gray-400 mt-4">
                  {monthlyIncome > 0 && `₹${(monthlyIncome / 100000).toFixed(1)}L/mo · `}
                  {totalNetWorth !== 0 && `₹${Math.abs(totalNetWorth / 100000).toFixed(1)}L net worth · `}
                  Live data loaded
                </p>
              )}
            </div>
            <div className="pb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} disabled={isLoading}
                    className="flex-shrink-0 text-sm px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-gray-700 disabled:opacity-50 text-left"
                    style={{ maxWidth: '180px' }}>{q}</button>
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
          <div className="mx-auto max-w-sm mt-2 mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 text-center">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline text-red-500">Dismiss</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — hidden during step flow */}
      {!eightEventsStep && (
        <div className="bg-gray-50 px-4 pb-6 pt-2 flex-shrink-0">
          <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-3xl px-4 py-3 shadow-sm">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything" rows={1} disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-base text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
              style={{ minHeight: '28px', maxHeight: '120px' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-gray-300 text-center mt-2">
            WealthElements AI · Not professional financial advice
          </p>
        </div>
      )}

    </div>
  );
};

export default AIChat;
