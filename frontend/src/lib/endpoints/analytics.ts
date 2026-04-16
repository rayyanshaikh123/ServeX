import api from '../api';

export interface AnalyticsTopItem {
  _id: string;
  name?: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsPeakHour {
  _id: number;
  count: number;
}

export interface AnalyticsSummary {
  window_days: number;
  revenue: number;
  orders: number;
  top_items: AnalyticsTopItem[];
  peak_hours: AnalyticsPeakHour[];
}

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const { data } = await api.get<AnalyticsSummary>('/api/analytics/summary');
  return data;
};
