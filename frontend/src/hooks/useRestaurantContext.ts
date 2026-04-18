import { useCartStore } from '../store/useCartStore';

/**
 * Returns the restaurantId and tableId that were set when the customer
 * scanned a QR code (stored via QRLanding → useCartStore).
 *
 * Falls back to empty strings so pages don't crash if accessed directly.
 */
export function useRestaurantContext() {
  const restaurantId = useCartStore((s) => s.restaurantId) ?? '';
  const tableId = useCartStore((s) => s.tableId) ?? '';
  return { restaurantId, tableId };
}
