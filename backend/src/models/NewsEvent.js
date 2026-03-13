const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    summary: { type: String, default: '' },
    source: { type: String, default: '' },
    url: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
    fetchedAt: { type: Date, default: Date.now },
    headlineHash: { type: String, unique: true }, // SHA-256 of headline for dedup
    eventCategory: {
      type: String,
      enum: [
        'GEOPOLITICAL',
        'RBI_POLICY',
        'INFLATION',
        'MARKET_CRASH',
        'SECTOR_NEWS',
        'CURRENCY',
        'COMMODITY',
        'EARNINGS',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    impactScore: { type: Number, min: 1, max: 10, default: 3 },
    affectedAssets: { type: [String], default: [] }, // ['GOLD','EQUITY','DEBT','OIL']
    isIndiaRelevant: { type: Boolean, default: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

newsEventSchema.index({ publishedAt: -1 });
newsEventSchema.index({ processed: 1, impactScore: -1 });

module.exports = mongoose.model('NewsEvent', newsEventSchema);
