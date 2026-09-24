import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isMe }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <span className="text-[10px] font-bold text-slate-500">{message.senderName}</span>
        <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
          message.senderRole === 'therapist'
            ? 'bg-amber-100 text-orange-600'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {message.senderRole}
        </span>
      </div>

      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
          isMe
            ? 'bg-orange-500 text-white rounded-br-xs'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
            isMe ? 'text-amber-200' : 'text-slate-400'
          }`}
        >
          <span>{time}</span>
          {isMe && (
            message.status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-amber-200" />
            ) : (
              <Check className="w-3 h-3 text-amber-300" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
