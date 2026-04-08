import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😭','😡','👍','👎',
  '❤️','🔥','✨','🎉','🙏','💯','🤣','😊','😔','😤',
  '👀','💪','🤗','😴','🥺','😏','🤷','👏','🫡','💀',
];

export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl"
        aria-label="Emoji picker"
      >
        😊
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-3 w-64 animate-fade-in">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
