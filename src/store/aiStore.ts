import { create } from 'zustand';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addMessage: (msg: Omit<ChatMessage, 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  clearHistory: () => void;
}

const defaultMessage: ChatMessage = {
  sender: 'ai',
  text: "Hello! I am your GrivetyGlobal AI copilot. I can help you draft overdue payment reminders, review your billing statistics, analyze your outstanding cash flow, or answer questions about your clients. Try one of the quick suggestions below!",
  timestamp: new Date().toISOString()
};

export const useAIStore = create<AIState>((set) => ({
  isOpen: false,
  messages: [defaultMessage],
  isTyping: false,
  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, timestamp: new Date().toISOString() }]
  })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearHistory: () => set({ messages: [defaultMessage] })
}));
