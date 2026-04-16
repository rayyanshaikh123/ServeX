import { API_BASE_URL } from '../api';
import { useAuthStore } from '../../store/useAuthStore';

export interface ChatRequest {
  query: string;
  session_id: string;
}

export const streamChat = async (
  payload: ChatRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Chat request failed.');
  }

  if (!response.body) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      onToken(decoder.decode(value, { stream: true }));
    }
  }
};
