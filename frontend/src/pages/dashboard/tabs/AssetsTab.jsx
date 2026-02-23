import { useSelector } from 'react-redux';
import {
  AssetsSummaryCard,
  LiabilitiesSummaryCard,
  NetWorthSummaryCard,
} from '../../../components/cards';

const AssetsTab = () => {
  const {
    totalAssets,
    totalLiabilities,
    assetAccounts,
    liabilityAccounts,
  } = useSelector((state) => state.networth);

  return (
    <div className="space-y-6">
      {/* Assets Section */}
      <AssetsSummaryCard
        accounts={assetAccounts}
        totalAssets={totalAssets}
      />

      {/* Liabilities Section */}
      <LiabilitiesSummaryCard
        accounts={liabilityAccounts}
        totalLiabilities={totalLiabilities}
      />

      {/* Net Worth Summary */}
      <NetWorthSummaryCard
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
      />
    </div>
  );
};

export default AssetsTab;
