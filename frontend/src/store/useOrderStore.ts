import { create } from 'zustand';
import { Order } from '../types';

interface OrderStore {
  activeOrder: Order | null;
  socket: WebSocket | null;
  isLoading: boolean;
  error: string | null;
  setActiveOrder: (order: Order | null) => void;
  connect: (restaurantId: string, token?: string) => void;
  disconnect: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  activeOrder: null,
  socket: null,
  isLoading: false,
  error: null,

  setActiveOrder: (order) => set({ activeOrder: order }),

  connect: (restaurantId, token) => {
    // If already connected, do nothing
    if (get().socket?.readyState === WebSocket.OPEN) return;

    // We can use a public token or the user's token
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/restaurant/${restaurantId}${token ? `?token=${token}` : ''}`;
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to order updates');
      set({ socket, error: null });
    };

    socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      const currentOrder = get().activeOrder;

      if (type === 'order.updated' && currentOrder && data.id === currentOrder.id) {
        set({ activeOrder: data });
      }
      
      // For staff, they might want to listen to all updates, 
      // but this store is primarily for the Guest/Customer tracker right now.
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      set({ error: 'Failed to connect to real-time updates' });
    };

    socket.onclose = () => {
      console.log('Disconnected from order updates');
      set({ socket: null });
    };
  },

  disconnect: () => {
    get().socket?.close();
    set({ socket: null });
  },
}));
