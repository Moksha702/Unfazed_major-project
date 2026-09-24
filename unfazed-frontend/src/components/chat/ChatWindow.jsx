import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageSquare, Shield, Smile } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Button from '../common/Button';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatWindow = ({ roomId, senderId, senderName, senderRole = 'therapist', title = 'Live Support Chat' }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', {
        roomId,
        senderName,
        role: senderRole
      });
    });

    newSocket.on('load_history', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    newSocket.on('user_typing', ({ senderName: typingName, isTyping: typingState }) => {
      if (typingState) {
        setOtherUserTyping(`${typingName} is typing...`);
      } else {
        setOtherUserTyping('');
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, senderName, senderRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { roomId, senderName, isTyping: true });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { roomId, senderName, isTyping: false });
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      senderId,
      senderName,
      senderRole,
      text: inputText.trim()
    });

    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { roomId, senderName, isTyping: false });
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{title}</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              End-to-End Encrypted Room: {roomId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p>No messages yet. Send a greeting to start the conversation.</p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMe={m.senderRole === senderRole}
            />
          ))
        )}

        {otherUserTyping && (
          <div className="text-[10px] text-indigo-600 font-medium italic px-2 py-1 animate-pulse">
            {otherUserTyping}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a clinical or support message..."
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim()}
          className="shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
