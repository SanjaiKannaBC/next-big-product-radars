export type TrendCategory = 'Supplement' | 'Skincare' | 'Food & Beverage' | 'Mental Wellness' | 'Fitness';

export type SignalSource = 'Google Trends' | 'Reddit' | 'Instagram' | 'YouTube' | 'Research' | 'Regulatory';

export interface TrendSignal {
  source: SignalSource;
  strength: number; // 0-100
  change: number; // Percentage change (e.g., 400 for 400%)
  context: string; // e.g., "r/SkincareAddictionIndia discussion volume"
  date: string;
}

export interface MarketData {
  marketSize: string; // e.g., "₹500Cr"
  competitionLevel: 'Low' | 'Medium' | 'High';
  currentPlayers: string[];
  pricePoint: string; // e.g., "₹400 - ₹800"
}

export interface Trend {
  id: string;
  name: string;
  category: TrendCategory;
  description: string;
  signals: TrendSignal[];
  market: MarketData;
  scores: {
    velocity: number; // 0-100
    marketPotential: number; // 0-100
    competition: number; // 0-100 (Lower is better for opportunity, but we'll store raw intensity)
    timeToMainstream: number; // Months
    overallScore: number; // 0-100
  };
  opportunityBrief: string; // The generated pitch
  status: 'Emerging' | 'Accelerating' | 'Peaking' | 'Mainstream';
  historicalInterest: { date: string; value: number }[]; // For charts
}
