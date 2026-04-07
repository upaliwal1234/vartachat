import { formatTime } from '../utils/helpers';

export default function MessageBubble({ message, isSelf }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <span className="message-bubble-system">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-2 animate-fade-in`}>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div className={isSelf ? 'message-bubble-self' : 'message-bubble-stranger'}>
          {message.type === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-xl max-w-full max-h-64 object-contain"
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <span className={`text-xs text-gray-400 dark:text-gray-500 ${isSelf ? 'text-right' : 'text-left'}`}>
          {message.timestamp ? formatTime(message.timestamp) : ''}
        </span>
      </div>
    </div>
  );
}
