import { useTranslation } from 'react-i18next';
import { SUBSCRIPTION_BRANDS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const BRAND_TILE = {
  Netflix:           { tile: 'bg-rose-100/60',    icon: '#E50914', text: 'text-rose-800' },
  'Amazon Prime':    { tile: 'bg-sky-100/60',      icon: '#00A8E1', text: 'text-sky-800' },
  Amazon:            { tile: 'bg-orange-100/60',   icon: '#FF9900', text: 'text-orange-800' },
  Spotify:           { tile: 'bg-emerald-100/60',  icon: '#1DB954', text: 'text-emerald-800' },
  'Spotify Premium': { tile: 'bg-emerald-100/60',  icon: '#1DB954', text: 'text-emerald-800' },
  YouTube:           { tile: 'bg-red-100/60',      icon: '#FF0000', text: 'text-red-800' },
  'YouTube Premium': { tile: 'bg-red-100/60',      icon: '#FF0000', text: 'text-red-800' },
  'Disney+ Hotstar': { tile: 'bg-blue-100/60',     icon: '#113CCF', text: 'text-blue-800' },
  Hotstar:           { tile: 'bg-blue-100/60',     icon: '#113CCF', text: 'text-blue-800' },
  LinkedIn:          { tile: 'bg-slate-200/50',    icon: '#0A66C2', text: 'text-slate-700' },
  'Apple Music':     { tile: 'bg-pink-100/60',     icon: '#FA243C', text: 'text-pink-800' },
  iCloud:            { tile: 'bg-sky-100/60',      icon: '#3693F3', text: 'text-sky-800' },
  'Google One':      { tile: 'bg-blue-100/60',     icon: '#4285F4', text: 'text-blue-800' },
  Microsoft:         { tile: 'bg-cyan-100/60',     icon: '#00A4EF', text: 'text-cyan-800' },
  Dropbox:           { tile: 'bg-blue-100/60',     icon: '#0061FF', text: 'text-blue-800' },
  Notion:            { tile: 'bg-gray-200/50',     icon: '#000000', text: 'text-gray-700' },
  Figma:             { tile: 'bg-orange-100/60',   icon: '#F24E1E', text: 'text-orange-800' },
  ChatGPT:           { tile: 'bg-teal-100/60',     icon: '#10A37F', text: 'text-teal-800' },
  OpenAI:            { tile: 'bg-teal-100/60',     icon: '#10A37F', text: 'text-teal-800' },
};

const DEFAULT_TILE = { tile: 'bg-gray-200/50', icon: '#6B7280', text: 'text-gray-700' };

function toMonthly(sub) {
  if (sub.frequency === 'YEARLY' || sub.frequency === 'ANNUAL') return sub.amount / 12;
  if (sub.frequency === 'QUARTERLY') return sub.amount / 3;
  return sub.amount;
}

// Large tile — height driven by explicit style, NOT h-full
const LargeTile = ({ sub, pct, monthly, height, perMonth, perMo }) => {
  const name = sub.brandName || sub.merchantName || 'Unknown';
  const brand = BRAND_TILE[name] || DEFAULT_TILE;
  const initial = name.charAt(0).toUpperCase();
  const isYearly = sub.frequency === 'YEARLY' || sub.frequency === 'ANNUAL';

  return (
    <div
      className={`${brand.tile} backdrop-blur-md rounded-[20px] p-5 flex flex-col justify-between border border-white/40 shadow-sm active:scale-95 transition-transform duration-200`}
      style={{ height }}
    >
      <div className="flex justify-between items-start">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
          style={{ backgroundColor: brand.icon }}
        >
          <span className="font-bold text-lg">{initial}</span>
        </div>
        <div className={`bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold ${brand.text}`}>
          {pct}%
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 truncate mb-1">{name}</h3>
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(sub.amount)}</span>
        <p className="text-xs text-gray-500 mt-1">
          {isYearly ? `~${formatCurrency(monthly)}${perMo}` : perMonth}
        </p>
      </div>
    </div>
  );
};

// Small horizontal tile — fixed height, no h-full
const SmallTile = ({ sub, pct, height }) => {
  const name = sub.brandName || sub.merchantName || 'Unknown';
  const brand = BRAND_TILE[name] || DEFAULT_TILE;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`${brand.tile} backdrop-blur-md rounded-[20px] p-4 flex flex-row items-center justify-between border border-white/40 shadow-sm active:scale-95 transition-transform duration-200`}
      style={{ height }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
          style={{ backgroundColor: brand.icon }}
        >
          <span className="font-bold text-lg">{initial}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm leading-tight">{name}</span>
          <span className="text-xs text-gray-500">{formatCurrency(sub.amount)}</span>
        </div>
      </div>
      <div className={`bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold ${brand.text} ml-2 flex-shrink-0`}>
        {pct}%
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const SubscriptionTreemap = ({ subscriptions = [], compact = false }) => {
  const { t } = useTranslation();
  if (!subscriptions.length) return null;

  const items = subscriptions
    .map((sub) => ({ ...sub, _monthly: toMonthly(sub) }))
    .sort((a, b) => b._monthly - a._monthly);

  const totalMonthly = items.reduce((s, i) => s + i._monthly, 0);
  const yearlyProjection = totalMonthly * 12;
  const pct = (item) => Math.round((item._monthly / totalMonthly) * 100);

  const [first, ...rest] = items;

  const GAP = 12; // gap-3 = 12px
  const MIN_TILE_H = 68;

  // Step 1: calculate right column tile heights proportionally
  const rightTotal = rest.reduce((s, i) => s + i._monthly, 0);
  const rightCount = rest.length;
  const rightGapsTotal = Math.max(0, rightCount - 1) * GAP;

  // Total right column height budget (compact vs full)
  const totalH = compact ? 320 : 500;

  const rightItems = rest.map((item, i) => {
    const share = rightTotal > 0 ? item._monthly / rightTotal : 1 / rightCount;
    // distribute totalH among right tiles (gaps subtracted)
    const h = Math.max(Math.round(share * (totalH - rightGapsTotal)), MIN_TILE_H);
    return { item, large: i === 0 && h > 120, height: h };
  });

  // Step 2: left tile height = sum of right tile heights + gaps between them
  // so both columns end at exactly the same point
  const rightColHeight = rightItems.reduce((s, r) => s + r.height, 0) + rightGapsTotal;
  const leftH = rightColHeight;

  return (
    <div className="space-y-4">
      {/* Grid — heights are dynamic per tile, no fixed grid height */}
      <div className="grid grid-cols-2 gap-3 items-start">
        {/* Left column */}
        <div>
          <LargeTile
            sub={first}
            pct={pct(first)}
            monthly={first._monthly}
            height={leftH}
            perMonth={t('subscriptions.perMonth')}
            perMo={t('subscriptions.perMonth')}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {rightItems.map(({ item, large, height }, idx) =>
            large ? (
              <LargeTile
                key={item._id || item.brandName || idx}
                sub={item}
                pct={pct(item)}
                monthly={item._monthly}
                height={height}
                perMonth={t('subscriptions.perMonth')}
                perMo={t('subscriptions.perMonth')}
              />
            ) : (
              <SmallTile
                key={item._id || item.brandName || idx}
                sub={item}
                pct={pct(item)}
                height={height}
              />
            )
          )}
        </div>
      </div>

      {/* Totals footer — always below the grid, never behind tiles */}
      <div className="flex justify-between items-end px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t('subscriptions.totalPerMonth')}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalMonthly)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t('subscriptions.yearlyProjection')}
          </p>
          <p className="text-lg font-bold text-indigo-600">
            {formatCurrency(yearlyProjection)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTreemap;
