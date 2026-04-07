import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import useSocketStore from '../context/socketStore';
import useChatStore from '../context/chatStore';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import EmojiPicker from '../components/EmojiPicker';
import { getOrCreateGuestId, GUEST_ID_KEY } from '../utils/helpers';

export default function Chat() {
  const { user, isAuthenticated, token } = useAuthStore();
  const { socket, connect, authenticate } = useSocketStore();
  const {
    messages, status, strangerTyping,
    setStatus, setRoomId, addMessage, addSystemMessage,
    clearMessages, resetChat,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState('');
  const typingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, strangerTyping]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      let gid = null;
      let gname = '';

      if (!isAuthenticated) {
        gid = await getOrCreateGuestId();
        gname = `Guest_${gid.slice(0, 6)}`;
        setGuestId(gid);
        setGuestName(gname);
      }

      const s = connect();

      // Auth event
      s.on('authenticated', (data) => {
        if (data.success) {
          s.emit('find_partner');
          setStatus('waiting');
        }
      });

      s.on('waiting', () => setStatus('waiting'));

      s.on('partner_found', ({ roomId }) => {
        setRoomId(roomId);
        setStatus('connected');
        clearMessages();
      });

      s.on('new_message', (msg) => {
        addMessage(msg);
      });

      s.on('system_message', (msg) => {
        addSystemMessage(msg.content);
      });

      s.on('stranger_typing', (isTyping) => {
        useChatStore.getState().setStrangerTyping(isTyping);
      });

      s.on('partner_disconnected', () => {
        setStatus('disconnected');
        useChatStore.getState().setStrangerTyping(false);
      });

      // Wait for connect then authenticate
      if (s.connected) {
        authenticate(isAuthenticated ? token : null, gid, gname);
      } else {
        s.on('connect', () => {
          authenticate(isAuthenticated ? token : null, gid, gname);
        });
      }
    };

    init();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content || status !== 'connected' || !socket) return;

    socket.emit('send_message', { content });

    // Optimistically add own message
    addMessage({
      id: Date.now().toString(),
      senderId: isAuthenticated ? user._id : guestId,
      senderName: isAuthenticated ? user.name : guestName,
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
      _self: true,
    });

    setInputValue('');
    socket.emit('typing', false);
  }, [inputValue, status, socket, isAuthenticated, user, guestId, guestName, addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (!socket || status !== 'connected') return;

    socket.emit('typing', true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing', false);
    }, 1500);
  };

  const handleSkip = () => {
    if (!socket) return;
    resetChat();
    socket.emit('skip');
  };

  const handleFindNew = () => {
    if (!socket) return;
    resetChat();
    socket.emit('find_partner');
    setStatus('waiting');
  };

  const handleEmojiSelect = (emoji) => {
    setInputValue((v) => v + emoji);
    inputRef.current?.focus();
  };

  const myId = isAuthenticated ? user?._id : guestId;

  const statusBar = {
    idle: null,
    waiting: (
      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-sm">Finding someone to chat with...</span>
      </div>
    ),
    connected: (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm">Stranger connected</span>
      </div>
    ),
    disconnected: (
      <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
        <span className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-sm">Stranger disconnected</span>
      </div>
    ),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Chat header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
            🎭
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {status === 'connected' ? 'Stranger' : 'VartaChat'}
            </p>
            <div className="flex items-center">
              {statusBar[status]}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'connected' && (
            <button
              onClick={handleSkip}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              ⏭ Skip
            </button>
          )}
          {(status === 'disconnected' || status === 'idle') && (
            <button
              onClick={handleFindNew}
              className="btn-primary text-sm py-1.5 px-3"
            >
              🔍 Find Partner
            </button>
          )}
          {status === 'waiting' && (
            <button
              onClick={() => {
                socket?.emit('cancel_search');
                resetChat();
              }}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900 space-y-1">
        {status === 'idle' && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-fade-in">
            <div className="text-6xl">💬</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Ready to chat?
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
              Click "Find Partner" to be matched with a random stranger and start chatting.
            </p>
            <button onClick={handleFindNew} className="btn-primary">
              🔍 Find a Stranger
            </button>
          </div>
        )}

        {status === 'waiting' && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-fade-in">
            <div className="text-5xl animate-bounce">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">Looking for someone to chat with...</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id || msg._id}
            message={msg}
            isSelf={msg.senderId === myId || msg._self}
          />
        ))}

        {strangerTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="flex items-end gap-2">
          <EmojiPicker onSelect={handleEmojiSelect} />

          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={status !== 'connected'}
            placeholder={status === 'connected' ? 'Type a message...' : 'Find a partner to start chatting'}
            rows={1}
            className="flex-1 input-field resize-none min-h-[44px] max-h-32 py-2.5 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || status !== 'connected'}
            className="btn-primary py-2.5 px-4 disabled:opacity-40"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
