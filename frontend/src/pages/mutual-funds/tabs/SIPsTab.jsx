import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const SIP_KEYWORDS = ['sip', 'groww', 'zerodha', 'mutual fund', 'nifty 50', 'index fund'];

// Derive a readable fund/source name from a transaction description
const parseSipName = (description = '') => {
  const lower = description.toLowerCase();
  if (lower.includes('groww')) return 'Groww MF';
  if (lower.includes('zerodha') || lower.includes('coin')) return 'Zerodha Coin';
  if (lower.includes('nifty 50') || lower.includes('index')) return 'Nifty 50 Index';
  if (lower.includes('mutual fund')) return 'Mutual Fund SIP';
  if (lower.includes('sip')) return 'SIP Investment';
  return description;
};

// Estimate next SIP date: same date next month from the latest transaction
const nextSipDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
};

const SIPsTab = () => {
  const { t } = useTranslation();
  const { transactions } = useSelector((state) => state.transactions);

  // Detect SIP transactions: debit + keyword match
  const sipTxns = useMemo(() => {
    return (transactions || []).filter((tx) => {
      if (tx.type !== 'DEBIT') return false;
      const desc = tx.description?.toLowerCase() || '';
      return SIP_KEYWORDS.some((kw) => desc.includes(kw));
    });
  }, [transactions]);

  // Group by parseSipName to find unique SIPs and their latest transaction
  const sipGroups = useMemo(() => {
    const groups = {};
    sipTxns.forEach((tx) => {
      const name = parseSipName(tx.description);
      if (!groups[name]) {
        groups[name] = { name, amount: tx.amount, lastDate: tx.date, txns: [] };
      } else {
        // Keep the latest transaction date and latest amount
        if (new Date(tx.date) > new Date(groups[name].lastDate)) {
          groups[name].lastDate = tx.date;
          groups[name].amount = tx.amount;
        }
      }
      groups[name].txns.push(tx);
    });
    return Object.values(groups);
  }, [sipTxns]);

  const totalMonthly = useMemo(
    () => sipGroups.reduce((s, g) => s + g.amount, 0),
    [sipGroups]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('mutualFunds.sips.title')}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('mutualFunds.sips.subtitle')}</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-white/70" />
          <span className="text-white/70 text-sm">{t('mutualFunds.sips.activeSips')}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">{sipGroups.length}</p>
            <p className="text-white/60 text-xs mt-1">
              {sipGroups.length === 1 ? t('mutualFunds.sips.planActive') : t('mutualFunds.sips.plansActive')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">{t('mutualFunds.sips.monthlyInvestment')}</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalMonthly)}</p>
          </div>
        </div>
      </div>

      {/* SIP List */}
      {sipGroups.length > 0 ? (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.sips.yourSips')}</h2>
          <div className="space-y-3">
            {sipGroups.map((sip, i) => {
              const next = nextSipDate(sip.lastDate);
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-emerald-500"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{sip.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {t('mutualFunds.sips.last')} {formatDate(sip.lastDate)}
                      </span>
                      {next && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Calendar className="w-3 h-3" />
                          {t('mutualFunds.sips.next')}{formatDate(next)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{formatCurrency(sip.amount)}</p>
                    <p className="text-xs text-gray-400">{t('mutualFunds.sips.perMonth')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">{t('mutualFunds.sips.noSipsTitle')}</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('mutualFunds.sips.noSipsDesc')}
          </p>
        </div>
      )}

      {/* Recent SIP Transactions */}
      {sipTxns.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">{t('mutualFunds.sips.sipHistory')}</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {sipTxns.slice(0, 10).map((txn) => (
              <div key={txn._id || txn.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {txn.cleanDescription || parseSipName(txn.description)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-gray-900">
                  -{formatCurrency(txn.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SIPsTab;
