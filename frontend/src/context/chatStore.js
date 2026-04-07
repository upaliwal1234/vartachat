import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  messages: [],
  roomId: null,
  status: 'idle', // idle | waiting | connected | disconnected
  isTyping: false,
  strangerTyping: false,

  setStatus: (status) => set({ status }),
  setRoomId: (roomId) => set({ roomId }),

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, { ...message, id: message._id || Date.now().toString() }],
    }));
  },

  addSystemMessage: (content) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          content,
          type: 'system',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  },

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setStrangerTyping: (isTyping) => set({ strangerTyping: isTyping }),

  resetChat: () =>
    set({
      messages: [],
      roomId: null,
      status: 'idle',
      strangerTyping: false,
    }),
}));

export default useChatStore;
