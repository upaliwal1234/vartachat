import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  authenticated: false,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return existing;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      set({ connected: true });
    });

    socket.on('disconnect', () => {
      set({ connected: false, authenticated: false });
    });

    socket.on('authenticated', (data) => {
      set({ authenticated: data.success });
    });

    set({ socket });
    return socket;
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false, authenticated: false });
    }
  },

  authenticate: (token, guestId, guestName) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('authenticate', { token, guestId, guestName });
  },
}));

export default useSocketStore;
