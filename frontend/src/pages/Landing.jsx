import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../context/authStore';
import { getOrCreateGuestId } from '../utils/helpers';

const features = [
  { icon: '⚡', title: 'Instant Connections', desc: 'Get matched with a random stranger in seconds.' },
  { icon: '🎭', title: 'Stay Anonymous', desc: 'Chat as a guest without creating an account.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Your conversations stay safe and private.' },
  { icon: '📱', title: 'Mobile First', desc: 'Perfectly designed for any device, anywhere.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGuestChat = async () => {
    await getOrCreateGuestId();
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Live Chat Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Connect with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">
              Strangers
            </span>
            <br />
            Worldwide
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            VartaChat pairs you with random people for real-time conversations.
            Anonymous, instant, and completely free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGuestChat}
              className="w-full sm:w-auto btn-primary text-base py-4 px-8 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              🚀 Start Chatting Now
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto btn-secondary text-base py-4 px-8"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Create Account →
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/chat')}
                className="w-full sm:w-auto btn-secondary text-base py-4 px-8"
              >
                Go to Chat
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-14">
          {[
            { label: 'Users Online', value: '1,200+' },
            { label: 'Chats Today', value: '8,500+' },
            { label: 'Countries', value: '120+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-gray-800/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            {[
              { step: '1', title: 'Click Start', desc: 'No sign-up required. Just click and go.' },
              { step: '2', title: 'Get Matched', desc: 'We pair you with a random user instantly.' },
              { step: '3', title: 'Start Chatting', desc: 'Have a conversation, or skip to the next one.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} VartaChat. Made with ❤️ for connection.
      </footer>
    </div>
  );
}
