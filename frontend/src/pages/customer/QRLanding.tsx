import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

/**
 * QR Landing page.
 *
 * The physical QR code on each table points to:
 *   /menu/:restaurantId/:tableId
 *
 * This component:
 *  1. Reads the URL params
 *  2. Stores restaurantId + tableId in the Zustand cart store
 *  3. Redirects to /customer/menu
 *
 * This keeps the Customer_Final pages (which use /customer/* routes)
 * free of URL-level restaurant context while still being scannable.
 */
export const QRLanding = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const navigate = useNavigate();
  const { setRestaurantId, setTableId } = useCartStore();

  useEffect(() => {
    if (restaurantId) {
      setRestaurantId(restaurantId);
      setTableId(tableId ?? null);
    }
    // Redirect to the new customer-facing menu
    navigate('/customer/menu', { replace: true });
  }, [restaurantId, tableId]);

  return null;
};
