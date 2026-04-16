import api from '../api';

export interface PaymentOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResponse {
  id: string;
  restaurant_id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  status: string;
  amount: number;
  currency: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export const createPaymentOrder = async (orderId: string): Promise<PaymentOrderResponse> => {
  const { data } = await api.post<PaymentOrderResponse>('/api/payments/order', {
    order_id: orderId,
  });
  return data;
};

export const verifyPayment = async (payload: PaymentVerifyRequest): Promise<PaymentResponse> => {
  const { data } = await api.post<PaymentResponse>('/api/payments/verify', payload);
  return data;
};
