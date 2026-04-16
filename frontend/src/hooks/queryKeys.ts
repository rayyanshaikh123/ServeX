export const queryKeys = {
  analyticsSummary: ['analytics', 'summary'] as const,
  menu: (params?: Record<string, unknown>) => ['inventory', 'menu', params ?? {}] as const,
  tables: (params?: Record<string, unknown>) => ['tables', params ?? {}] as const,
  bookings: (params?: Record<string, unknown>) => ['bookings', params ?? {}] as const,
  orders: (params?: Record<string, unknown>) => ['orders', params ?? {}] as const,
  restaurants: ['restaurants'] as const,
};
